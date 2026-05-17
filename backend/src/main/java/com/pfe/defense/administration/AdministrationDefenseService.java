package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.DefenseResponse;
import com.pfe.defense.administration.dto.PublishResponse;
import com.pfe.defense.administration.dto.RoomResponse;
import com.pfe.defense.administration.dto.ScheduleDefenseRequest;
import com.pfe.defense.administration.dto.UserSummary;
import com.pfe.defense.administration.exception.ConflictException;
import com.pfe.defense.administration.repository.AdminDefenseQueryRepository;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.administration.repository.AdminRoomQueryRepository;
import com.pfe.defense.admin.notification.Notification;
import com.pfe.defense.admin.notification.NotificationRepository;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseStatus;
import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.project.Project;
import com.pfe.defense.room.Room;
import com.pfe.defense.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AdministrationDefenseService {

    private final AdminDefenseQueryRepository defenseRepo;
    private final AdminProjectQueryRepository projectRepo;
    private final AdminRoomQueryRepository    roomRepo;
    private final AdministrationDashboardService dashboardService;
    private final AdministrationAuditService auditService;
    private final NotificationRepository notificationRepo;

    public AdministrationDefenseService(AdminDefenseQueryRepository defenseRepo,
                                        AdminProjectQueryRepository projectRepo,
                                        AdminRoomQueryRepository roomRepo,
                                        AdministrationDashboardService dashboardService,
                                        AdministrationAuditService auditService,
                                        NotificationRepository notificationRepo) {
        this.defenseRepo = defenseRepo;
        this.projectRepo = projectRepo;
        this.roomRepo    = roomRepo;
        this.dashboardService = dashboardService;
        this.auditService = auditService;
        this.notificationRepo = notificationRepo;
    }

    @Transactional(readOnly = true)
    public List<DefenseResponse> getAllDefenses() {
        return defenseRepo.findAllWithDetails().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DefenseResponse getDefense(Long id) {
        Defense defense = defenseRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soutenance introuvable : " + id));
        return toResponse(defense);
    }

    @Transactional
    public DefenseResponse scheduleDefense(ScheduleDefenseRequest request) {
        Project project = projectRepo.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + request.projectId()));
        Room room = roomRepo.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + request.roomId()));
        validatePlanningRequest(project, room, request.startTime(), request.endTime());

        List<ConflictException.ConflictDetail> conflicts = detectConflicts(
                request.projectId(), request.defenseDate(),
                request.startTime(), request.endTime(), request.roomId());

        if (!conflicts.isEmpty()) throw new ConflictException(conflicts);

        // Chercher une Defense existante pour ce projet
        Defense defense = defenseRepo.findByProjectId(request.projectId())
                .orElse(new Defense());
        if (defense.getId() != null && defense.getStatus() != DefenseStatus.NOT_SCHEDULED) {
            throw new BadRequestException("Une soutenance existe déjà pour ce projet. Utilisez la modification.");
        }
        defense.setProject(project);
        defense.setRoom(room);
        defense.setDefenseDate(request.defenseDate());
        defense.setStartTime(request.startTime());
        defense.setEndTime(request.endTime());
        defense.setJuryAssignment(project.getJuryAssignment());
        defense.setStatus(DefenseStatus.SCHEDULED);

        Defense saved = defenseRepo.save(defense);
        auditService.log("SCHEDULE_DEFENSE",
                "Planification de la soutenance du projet \"" + project.getTitle() + "\"");
        return toResponse(saved);
    }

    @Transactional
    public DefenseResponse updateDefense(Long id, ScheduleDefenseRequest request) {
        Defense defense = defenseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soutenance introuvable : " + id));
        if (defense.getStatus() == DefenseStatus.COMPLETED) {
            throw new BadRequestException("Une soutenance terminée ne peut plus être modifiée.");
        }
        if (!defense.getProject().getId().equals(request.projectId())) {
            throw new BadRequestException("Le projet d'une soutenance existante ne peut pas être modifié.");
        }
        Room room = roomRepo.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + request.roomId()));
        validatePlanningRequest(defense.getProject(), room, request.startTime(), request.endTime());

        List<ConflictException.ConflictDetail> conflicts = detectConflicts(
                defense.getProject().getId(), request.defenseDate(),
                request.startTime(), request.endTime(), request.roomId());

        if (!conflicts.isEmpty()) throw new ConflictException(conflicts);

        defense.setRoom(room);
        defense.setDefenseDate(request.defenseDate());
        defense.setStartTime(request.startTime());
        defense.setEndTime(request.endTime());
        defense.setJuryAssignment(defense.getProject().getJuryAssignment());
        if (defense.getStatus() != DefenseStatus.PUBLISHED) {
            defense.setStatus(DefenseStatus.SCHEDULED);
            defense.setPublished(false);
        }

        Defense saved = defenseRepo.save(defense);
        auditService.log("UPDATE_DEFENSE",
                "Modification de la soutenance du projet \"" + saved.getProject().getTitle() + "\"");
        return toResponse(saved);
    }

    @Transactional
    public PublishResponse publishAll() {
        List<ConflictException.ConflictDetail> conflicts = dashboardService.detectAllConflicts();
        if (!conflicts.isEmpty()) {
            throw new ConflictException(conflicts);
        }

        List<Defense> scheduled = defenseRepo.findAllByStatus(DefenseStatus.SCHEDULED);
        scheduled.forEach(this::validatePublishable);
        for (Defense d : scheduled) {
            d.setStatus(DefenseStatus.PUBLISHED);
            d.setPublished(true);
            defenseRepo.save(d);
        }
        auditService.log("PUBLISH_PLANNING",
                "Publication du planning final : " + scheduled.size() + " soutenance(s) publiée(s)");
        if (!scheduled.isEmpty()) {
            Notification notification = new Notification();
            notification.setTitle("Planning des soutenances publié");
            notification.setMessage("Le planning final des soutenances est disponible.");
            notificationRepo.save(notification);
        }
        return new PublishResponse(scheduled.size());
    }

    @Transactional
    public void deleteDefense(Long id) {
        Defense defense = defenseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soutenance introuvable : " + id));
        if (defense.getStatus() == DefenseStatus.PUBLISHED || defense.getStatus() == DefenseStatus.COMPLETED) {
            throw new BadRequestException("Seuls les brouillons de soutenance peuvent être supprimés.");
        }
        defenseRepo.delete(defense);
        auditService.log("DELETE_DEFENSE",
                "Suppression de la soutenance du projet \"" + defense.getProject().getTitle() + "\"");
    }

    @Transactional(readOnly = true)
    public List<ConflictException.ConflictDetail> getAllConflicts() {
        return dashboardService.detectAllConflicts();
    }

    private void validatePlanningRequest(Project project, Room room, LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("L'heure de début doit précéder l'heure de fin.");
        }
        if (!room.isAvailable()) {
            throw new BadRequestException("La salle sélectionnée n'est pas disponible.");
        }
        if (project.getJuryAssignment() == null) {
            throw new BadRequestException("Affectez un jury au projet avant de planifier sa soutenance.");
        }
    }

    private void validatePublishable(Defense defense) {
        if (defense.getRoom() == null) {
            throw new BadRequestException("Impossible de publier : une soutenance planifiée n'a pas de salle.");
        }
        if (defense.getJuryAssignment() == null) {
            throw new BadRequestException("Impossible de publier : une soutenance planifiée n'a pas de jury.");
        }
    }

    // ── Détection de conflits ─────────────────────────────────────────────────

    public List<ConflictException.ConflictDetail> detectConflicts(
            Long projectId, LocalDate date, LocalTime startTime, LocalTime endTime, Long roomId) {

        List<ConflictException.ConflictDetail> conflicts = new ArrayList<>();

        // Conflit 1 : même salle
        String roomName = roomRepo.findById(roomId).map(Room::getName).orElse("sélectionnée");
        defenseRepo.findRoomConflicts(roomId, date, startTime, endTime, projectId)
                .forEach(d -> conflicts.add(new ConflictException.ConflictDetail(
                        "ROOM",
                        "Conflit détecté : la salle " + roomName + " est déjà utilisée à ce créneau.",
                        d.getProject().getTitle(),
                        d.getStartTime().toString(), d.getEndTime().toString())));

        // Conflit 2 : même enseignant
        projectRepo.findById(projectId).ifPresent(project -> {
            JuryAssignment ja = project.getJuryAssignment();
            if (ja != null) {
                List<User> juryMembers = juryMembers(ja);

                Set<Long> teacherConflictDefenseIds = new HashSet<>();
                for (User juryMember : juryMembers) {
                    defenseRepo.findTeacherConflicts(juryMember.getId(), date, startTime, endTime, projectId)
                            .forEach(d -> {
                                if (teacherConflictDefenseIds.add(d.getId())) {
                                    conflicts.add(new ConflictException.ConflictDetail(
                                            "TEACHER",
                                            "Conflit détecté : le jury " + juryMember.getEmail()
                                                    + " est déjà affecté à une autre soutenance à ce créneau.",
                                            d.getProject().getTitle(),
                                            d.getStartTime().toString(), d.getEndTime().toString()));
                                }
                            });
                }
            }

            // Conflit 3 : même étudiant
            if (project.getStudent() != null) {
                defenseRepo.findStudentConflicts(
                                project.getStudent().getId(), date, startTime, endTime, projectId)
                        .forEach(d -> conflicts.add(new ConflictException.ConflictDetail(
                                "STUDENT",
                                "Conflit détecté : l'étudiant " + project.getStudent().getEmail()
                                        + " possède déjà une soutenance à ce créneau.",
                                d.getProject().getTitle(),
                                d.getStartTime().toString(), d.getEndTime().toString())));
            }

            // Conflit 4 : même encadrant
            if (project.getSupervisor() != null) {
                defenseRepo.findSupervisorConflicts(
                                project.getSupervisor().getId(), date, startTime, endTime, projectId)
                        .forEach(d -> conflicts.add(new ConflictException.ConflictDetail(
                                "SUPERVISOR",
                                "Conflit détecté : l'encadrant " + project.getSupervisor().getEmail()
                                        + " est déjà impliqué dans une autre soutenance à ce créneau.",
                                d.getProject().getTitle(),
                                d.getStartTime().toString(), d.getEndTime().toString())));
            }
        });

        return conflicts;
    }

    // ── Mapping ───────────────────────────────────────────────────────────────

    public DefenseResponse toResponse(Defense d) {
        RoomResponse roomResp = null;
        if (d.getRoom() != null) {
            Room r = d.getRoom();
            roomResp = new RoomResponse(r.getId(), r.getName(), r.getBuilding(),
                    r.getCapacity(), r.getEquipment(), r.isAvailable());
        }
        String studentOrGroup = d.getProject().getStudent() != null
                ? d.getProject().getStudent().getFirstName() + " " + d.getProject().getStudent().getLastName()
                : "";
        JuryAssignment juryAssignment = d.getJuryAssignment();
        return new DefenseResponse(
                d.getId(), d.getProject().getId(), d.getProject().getTitle(),
                studentOrGroup, d.getDefenseDate(), d.getStartTime(), d.getEndTime(),
                roomResp, d.getStatus().name(), d.isPublished(),
                toSummary(juryAssignment != null ? juryAssignment.getPresident() : null),
                toSummary(juryAssignment != null ? juryAssignment.getExaminer1() : null),
                toSummary(juryAssignment != null ? juryAssignment.getExaminer2() : null),
                toSummary(juryAssignment != null ? juryAssignment.getGuest() : null)
        );
    }

    private UserSummary toSummary(User user) {
        if (user == null) return null;
        return new UserSummary(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name());
    }

    private List<User> juryMembers(JuryAssignment assignment) {
        List<User> members = new ArrayList<>();
        if (assignment.getPresident() != null) members.add(assignment.getPresident());
        if (assignment.getExaminer1() != null) members.add(assignment.getExaminer1());
        if (assignment.getExaminer2() != null) members.add(assignment.getExaminer2());
        if (assignment.getGuest() != null) members.add(assignment.getGuest());
        return members;
    }
}

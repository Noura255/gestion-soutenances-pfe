package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.DefenseResponse;
import com.pfe.defense.administration.dto.PublishResponse;
import com.pfe.defense.administration.dto.RoomResponse;
import com.pfe.defense.administration.dto.ScheduleDefenseRequest;
import com.pfe.defense.administration.exception.ConflictException;
import com.pfe.defense.administration.repository.AdminDefenseQueryRepository;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.administration.repository.AdminRoomQueryRepository;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseStatus;
import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.project.Project;
import com.pfe.defense.room.Room;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AdministrationDefenseService {

    private final AdminDefenseQueryRepository defenseRepo;
    private final AdminProjectQueryRepository projectRepo;
    private final AdminRoomQueryRepository    roomRepo;

    public AdministrationDefenseService(AdminDefenseQueryRepository defenseRepo,
                                        AdminProjectQueryRepository projectRepo,
                                        AdminRoomQueryRepository roomRepo) {
        this.defenseRepo = defenseRepo;
        this.projectRepo = projectRepo;
        this.roomRepo    = roomRepo;
    }

    @Transactional(readOnly = true)
    public List<DefenseResponse> getAllDefenses() {
        return defenseRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public DefenseResponse scheduleDefense(ScheduleDefenseRequest request) {
        Project project = projectRepo.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + request.projectId()));
        Room room = roomRepo.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + request.roomId()));

        List<ConflictException.ConflictDetail> conflicts = detectConflicts(
                request.projectId(), request.defenseDate(),
                request.startTime(), request.endTime(), request.roomId());

        if (!conflicts.isEmpty()) throw new ConflictException(conflicts);

        // Chercher une Defense existante pour ce projet
        Defense defense = defenseRepo.findByProjectId(request.projectId())
                .orElse(new Defense());
        defense.setProject(project);
        defense.setRoom(room);
        defense.setDefenseDate(request.defenseDate());
        defense.setStartTime(request.startTime());
        defense.setEndTime(request.endTime());
        defense.setStatus(DefenseStatus.SCHEDULED);

        return toResponse(defenseRepo.save(defense));
    }

    @Transactional
    public DefenseResponse updateDefense(Long id, ScheduleDefenseRequest request) {
        Defense defense = defenseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soutenance introuvable : " + id));
        Room room = roomRepo.findById(request.roomId())
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + request.roomId()));

        List<ConflictException.ConflictDetail> conflicts = detectConflicts(
                defense.getProject().getId(), request.defenseDate(),
                request.startTime(), request.endTime(), request.roomId());

        if (!conflicts.isEmpty()) throw new ConflictException(conflicts);

        defense.setRoom(room);
        defense.setDefenseDate(request.defenseDate());
        defense.setStartTime(request.startTime());
        defense.setEndTime(request.endTime());
        defense.setStatus(DefenseStatus.SCHEDULED);

        return toResponse(defenseRepo.save(defense));
    }

    @Transactional
    public PublishResponse publishAll() {
        List<Defense> scheduled = defenseRepo.findAllByStatus(DefenseStatus.SCHEDULED);
        for (Defense d : scheduled) {
            d.setStatus(DefenseStatus.PUBLISHED);
            d.setPublished(true);
            defenseRepo.save(d);
        }
        return new PublishResponse(scheduled.size());
    }

    // ── Détection de conflits ─────────────────────────────────────────────────

    public List<ConflictException.ConflictDetail> detectConflicts(
            Long projectId, LocalDate date, LocalTime startTime, LocalTime endTime, Long roomId) {

        List<ConflictException.ConflictDetail> conflicts = new ArrayList<>();

        // Conflit 1 : même salle
        defenseRepo.findRoomConflicts(roomId, date, startTime, endTime, projectId)
                .forEach(d -> conflicts.add(new ConflictException.ConflictDetail(
                        "ROOM", d.getProject().getTitle(),
                        d.getStartTime().toString(), d.getEndTime().toString())));

        // Conflit 2 : même enseignant
        projectRepo.findById(projectId).ifPresent(project -> {
            JuryAssignment ja = project.getJuryAssignment();
            if (ja != null) {
                List<Long> teacherIds = new ArrayList<>();
                if (ja.getPresident()  != null) teacherIds.add(ja.getPresident().getId());
                if (ja.getExaminer1()  != null) teacherIds.add(ja.getExaminer1().getId());
                if (ja.getExaminer2()  != null) teacherIds.add(ja.getExaminer2().getId());
                if (ja.getGuest()      != null) teacherIds.add(ja.getGuest().getId());

                for (Long tid : teacherIds) {
                    defenseRepo.findTeacherConflicts(tid, date, startTime, endTime, projectId)
                            .forEach(d -> conflicts.add(new ConflictException.ConflictDetail(
                                    "TEACHER", d.getProject().getTitle(),
                                    d.getStartTime().toString(), d.getEndTime().toString())));
                }
            }

            // Conflit 3 : même étudiant
            if (project.getStudent() != null) {
                defenseRepo.findStudentConflicts(
                                project.getStudent().getId(), date, startTime, endTime, projectId)
                        .forEach(d -> conflicts.add(new ConflictException.ConflictDetail(
                                "STUDENT", d.getProject().getTitle(),
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
        String studentName = d.getProject().getStudent() != null
                ? d.getProject().getStudent().getFirstName() + " " + d.getProject().getStudent().getLastName()
                : "";
        return new DefenseResponse(
                d.getId(), d.getProject().getId(), d.getProject().getTitle(),
                studentName, d.getDefenseDate(), d.getStartTime(), d.getEndTime(),
                roomResp, d.getStatus().name(), d.isPublished()
        );
    }
}

package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.JuryAssignRequest;
import com.pfe.defense.administration.dto.JuryAssignmentResponse;
import com.pfe.defense.administration.dto.UserSummary;
import com.pfe.defense.administration.repository.AdminDefenseQueryRepository;
import com.pfe.defense.administration.repository.AdminJuryQueryRepository;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.administration.repository.AdminUserQueryRepository;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.project.Project;
import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AdministrationJuryService {

    private final AdminProjectQueryRepository projectRepo;
    private final AdminJuryQueryRepository    juryRepo;
    private final AdminUserQueryRepository    userRepo;
    private final AdminDefenseQueryRepository defenseRepo;
    private final AdministrationAuditService  auditService;

    public AdministrationJuryService(AdminProjectQueryRepository projectRepo,
                                     AdminJuryQueryRepository juryRepo,
                                     AdminUserQueryRepository userRepo,
                                     AdminDefenseQueryRepository defenseRepo,
                                     AdministrationAuditService auditService) {
        this.projectRepo = projectRepo;
        this.juryRepo    = juryRepo;
        this.userRepo    = userRepo;
        this.defenseRepo = defenseRepo;
        this.auditService = auditService;
    }

    @Transactional
    public JuryAssignmentResponse assignJury(Long projectId, JuryAssignRequest request) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + projectId));
        validateMutable(project);

        User president = findAndValidate(request.presidentId());
        User examiner1 = findAndValidate(request.examiner1Id());
        User examiner2 = findAndValidate(request.examiner2Id());

        User guest = null;
        if (request.guestId() != null) {
            guest = findAndValidate(request.guestId());
        }
        validateDistinctMembers(request);

        var existingAssignment = juryRepo.findByProject(project);
        JuryAssignment assignment = existingAssignment.orElse(new JuryAssignment());
        assignment.setProject(project);
        assignment.setPresident(president);
        assignment.setExaminer1(examiner1);
        assignment.setExaminer2(examiner2);
        assignment.setGuest(guest);
        assignment.setAssignedAt(LocalDateTime.now());

        // RÈGLE CRITIQUE : ne jamais modifier Report.visibleToJury ici

        JuryAssignment saved = juryRepo.save(assignment);
        defenseRepo.findByProjectId(projectId).ifPresent(defense -> {
            defense.setJuryAssignment(saved);
            defenseRepo.save(defense);
        });
        auditService.log(existingAssignment.isPresent() ? "UPDATE_JURY" : "ASSIGN_JURY",
                (existingAssignment.isPresent() ? "Modification" : "Affectation")
                        + " du jury du projet \"" + project.getTitle() + "\"");

        return toResponse(saved);
    }

    @Transactional
    public JuryAssignmentResponse updateAssignment(Long id, JuryAssignRequest request) {
        JuryAssignment assignment = juryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation jury introuvable : " + id));
        validateMutable(assignment.getProject());

        assignment.setPresident(findAndValidate(request.presidentId()));
        assignment.setExaminer1(findAndValidate(request.examiner1Id()));
        assignment.setExaminer2(findAndValidate(request.examiner2Id()));
        assignment.setGuest(request.guestId() != null ? findAndValidate(request.guestId()) : null);
        assignment.setAssignedAt(LocalDateTime.now());
        validateDistinctMembers(request);

        JuryAssignment saved = juryRepo.save(assignment);
        defenseRepo.findByProjectId(saved.getProject().getId()).ifPresent(defense -> {
            defense.setJuryAssignment(saved);
            defenseRepo.save(defense);
        });
        auditService.log("UPDATE_JURY",
                "Modification du jury du projet \"" + saved.getProject().getTitle() + "\"");
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<JuryAssignmentResponse> getAllJuryAssignments() {
        return juryRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public JuryAssignmentResponse getJuryAssignment(Long id) {
        JuryAssignment assignment = juryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation jury introuvable : " + id));
        return toResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<User> getJuryMembers() {
        return userRepo.findAllByRole(Role.JURY);
    }

    private User findAndValidate(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + userId));
        if (user.getRole() != Role.JURY) {
            throw new BadRequestException(
                    "L'utilisateur " + user.getEmail() + " n'a pas le rôle requis JURY.");
        }
        return user;
    }

    private void validateMutable(Project project) {
        defenseRepo.findByProjectId(project.getId()).ifPresent(defense -> {
            if (defense.getStatus() == com.pfe.defense.defense.DefenseStatus.COMPLETED) {
                throw new BadRequestException("Le jury d'une soutenance terminée ne peut plus être modifié.");
            }
        });
    }

    private void validateDistinctMembers(JuryAssignRequest request) {
        Set<Long> memberIds = new HashSet<>();
        memberIds.add(request.presidentId());
        memberIds.add(request.examiner1Id());
        memberIds.add(request.examiner2Id());
        if (request.guestId() != null) {
            memberIds.add(request.guestId());
        }

        int requestedMembers = request.guestId() == null ? 3 : 4;
        if (memberIds.size() != requestedMembers) {
            throw new BadRequestException("Chaque membre du jury doit être distinct.");
        }
    }

    private JuryAssignmentResponse toResponse(JuryAssignment ja) {
        return new JuryAssignmentResponse(
                ja.getId(),
                ja.getProject().getId(),
                ja.getProject().getTitle(),
                toSummary(ja.getPresident()),
                toSummary(ja.getExaminer1()),
                toSummary(ja.getExaminer2()),
                toSummary(ja.getGuest()),
                ja.getAssignedAt()
        );
    }

    private UserSummary toSummary(User u) {
        if (u == null) return null;
        return new UserSummary(u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getRole().name());
    }
}

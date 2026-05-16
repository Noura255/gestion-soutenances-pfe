package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.JuryAssignRequest;
import com.pfe.defense.administration.dto.JuryAssignmentResponse;
import com.pfe.defense.administration.dto.UserSummary;
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
import java.util.List;

@Service
public class AdministrationJuryService {

    private final AdminProjectQueryRepository projectRepo;
    private final AdminJuryQueryRepository    juryRepo;
    private final AdminUserQueryRepository    userRepo;

    public AdministrationJuryService(AdminProjectQueryRepository projectRepo,
                                     AdminJuryQueryRepository juryRepo,
                                     AdminUserQueryRepository userRepo) {
        this.projectRepo = projectRepo;
        this.juryRepo    = juryRepo;
        this.userRepo    = userRepo;
    }

    @Transactional
    public JuryAssignmentResponse assignJury(Long projectId, JuryAssignRequest request) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + projectId));

        User president = findAndValidate(request.presidentId());
        User examiner1 = findAndValidate(request.examiner1Id());
        User examiner2 = findAndValidate(request.examiner2Id());

        User guest = null;
        if (request.guestId() != null) {
            guest = userRepo.findById(request.guestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Invité introuvable : " + request.guestId()));
        }

        JuryAssignment assignment = juryRepo.findByProject(project).orElse(new JuryAssignment());
        assignment.setProject(project);
        assignment.setPresident(president);
        assignment.setExaminer1(examiner1);
        assignment.setExaminer2(examiner2);
        assignment.setGuest(guest);
        assignment.setAssignedAt(LocalDateTime.now());

        // RÈGLE CRITIQUE : ne jamais modifier Report.visibleToJury ici

        return toResponse(juryRepo.save(assignment));
    }

    @Transactional(readOnly = true)
    public List<JuryAssignmentResponse> getAllJuryAssignments() {
        return juryRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<User> getEligibleJuryMembers() {
        return userRepo.findAllByRoleIn(List.of(Role.JURY, Role.SUPERVISOR));
    }

    private User findAndValidate(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + userId));
        if (user.getRole() != Role.JURY && user.getRole() != Role.SUPERVISOR) {
            throw new BadRequestException(
                    "L'utilisateur " + user.getEmail() + " n'a pas le rôle requis (JURY ou SUPERVISOR)");
        }
        return user;
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

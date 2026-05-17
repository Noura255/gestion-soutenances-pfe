package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.AdministrationProjectResponse;
import com.pfe.defense.administration.dto.AdministrationProjectDetailResponse;
import com.pfe.defense.administration.dto.UserSummary;
import com.pfe.defense.administration.dto.VisibleReportResponse;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseStatus;
import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.project.Project;
import com.pfe.defense.report.Report;
import com.pfe.defense.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdministrationProjectService {

    private final AdminProjectQueryRepository projectRepo;

    public AdministrationProjectService(AdminProjectQueryRepository projectRepo) {
        this.projectRepo = projectRepo;
    }

    public List<AdministrationProjectResponse> getAllProjects() {
        return projectRepo.findAllWithDetails().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<AdministrationProjectResponse> getProjectsWithoutJury() {
        return projectRepo.findAllWithDetails().stream()
                .filter(project -> project.getJuryAssignment() == null)
                .filter(project -> project.getStatus() != com.pfe.defense.project.ProjectStatus.DRAFT)
                .map(this::toResponse)
                .toList();
    }

    public AdministrationProjectDetailResponse getProject(Long id) {
        Project project = projectRepo.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Projet introuvable : " + id));
        return toDetailResponse(project);
    }

    private AdministrationProjectResponse toResponse(Project p) {
        Report  report  = p.getReport();
        Defense defense = p.getDefense();
        JuryAssignment juryAssignment = p.getJuryAssignment();

        String  reportStatus   = report  != null ? report.getStatus().name()  : "NOT_SUBMITTED";
        boolean reportVisible  = report  != null && report.isVisibleToJury();
        String  juryStatus     = juryAssignment != null ? "JURY_ASSIGNED" : "NOT_ASSIGNED";
        String  defenseStatus  = defense != null ? defense.getStatus().name() : DefenseStatus.NOT_SCHEDULED.name();

        String studentOrGroup = p.getStudent() != null
                ? p.getStudent().getFirstName() + " " + p.getStudent().getLastName() : "";
        String supervisorName = p.getSupervisor() != null
                ? p.getSupervisor().getFirstName() + " " + p.getSupervisor().getLastName() : "";
        String fieldName = p.getStudent() != null && p.getStudent().getDepartment() != null
                ? p.getStudent().getDepartment() : "";

        return new AdministrationProjectResponse(
                p.getId(), p.getTitle(), studentOrGroup, supervisorName,
                fieldName, p.getAcademicYear(),
                p.getProjectType() != null ? p.getProjectType().name() : "",
                p.getStatus().name(),
                reportStatus, reportVisible, juryStatus, defenseStatus,
                juryAssignment != null ? juryAssignment.getId() : null,
                defense != null ? defense.getId() : null,
                reportVisible && report != null ? report.getId() : null,
                toSummary(juryAssignment != null ? juryAssignment.getPresident() : null),
                toSummary(juryAssignment != null ? juryAssignment.getExaminer1() : null),
                toSummary(juryAssignment != null ? juryAssignment.getExaminer2() : null),
                toSummary(juryAssignment != null ? juryAssignment.getGuest() : null)
        );
    }

    private AdministrationProjectDetailResponse toDetailResponse(Project p) {
        Report report = p.getReport();
        Defense defense = p.getDefense();
        JuryAssignment juryAssignment = p.getJuryAssignment();

        String reportStatus = report != null ? report.getStatus().name() : "NOT_SUBMITTED";
        boolean reportVisible = report != null && report.isVisibleToJury();
        String juryStatus = juryAssignment != null ? "JURY_ASSIGNED" : "NOT_ASSIGNED";
        String defenseStatus = defense != null ? defense.getStatus().name() : DefenseStatus.NOT_SCHEDULED.name();
        String fieldName = p.getStudent() != null && p.getStudent().getDepartment() != null
                ? p.getStudent().getDepartment() : "";

        VisibleReportResponse visibleReport = null;
        if (reportVisible && report != null) {
            String studentOrGroup = p.getStudent() != null
                    ? p.getStudent().getFirstName() + " " + p.getStudent().getLastName() : "";
            String supervisorName = p.getSupervisor() != null
                    ? p.getSupervisor().getFirstName() + " " + p.getSupervisor().getLastName() : "";
            visibleReport = new VisibleReportResponse(
                    report.getId(),
                    p.getId(),
                    p.getTitle(),
                    studentOrGroup,
                    supervisorName,
                    report.getStatus().name(),
                    report.getUploadedAt(),
                    report.getApprovedAt(),
                    report.getVisibilityActivatedAt(),
                    report.getOriginalFileName(),
                    report.getFilePath() != null && !report.getFilePath().isBlank()
            );
        }

        return new AdministrationProjectDetailResponse(
                p.getId(),
                p.getTitle(),
                p.getSummary(),
                p.getKeywords(),
                toSummary(p.getStudent()),
                toSummary(p.getSupervisor()),
                fieldName,
                p.getAcademicYear(),
                p.getProjectType() != null ? p.getProjectType().name() : "",
                p.getStatus().name(),
                reportStatus,
                reportVisible,
                juryStatus,
                defenseStatus,
                toSummary(juryAssignment != null ? juryAssignment.getPresident() : null),
                toSummary(juryAssignment != null ? juryAssignment.getExaminer1() : null),
                toSummary(juryAssignment != null ? juryAssignment.getExaminer2() : null),
                toSummary(juryAssignment != null ? juryAssignment.getGuest() : null),
                visibleReport
        );
    }

    private UserSummary toSummary(User user) {
        if (user == null) return null;
        return new UserSummary(user.getId(), user.getFirstName(), user.getLastName(),
                user.getEmail(), user.getRole().name());
    }
}

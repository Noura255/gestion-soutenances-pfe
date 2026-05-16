package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.AdministrationProjectResponse;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseStatus;
import com.pfe.defense.project.Project;
import com.pfe.defense.report.Report;
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

    private AdministrationProjectResponse toResponse(Project p) {
        Report  report  = p.getReport();
        Defense defense = p.getDefense();

        String  reportStatus   = report  != null ? report.getStatus().name()  : "NOT_SUBMITTED";
        boolean reportVisible  = report  != null && report.isVisibleToJury();
        boolean juryAssigned   = p.getJuryAssignment() != null;
        String  defenseStatus  = defense != null ? defense.getStatus().name() : DefenseStatus.NOT_SCHEDULED.name();

        String studentName    = p.getStudent() != null
                ? p.getStudent().getFirstName() + " " + p.getStudent().getLastName() : "";
        String supervisorName = p.getSupervisor() != null
                ? p.getSupervisor().getFirstName() + " " + p.getSupervisor().getLastName() : "";

        return new AdministrationProjectResponse(
                p.getId(), p.getTitle(), studentName, supervisorName,
                p.getAcademicYear(),
                p.getProjectType() != null ? p.getProjectType().name() : "",
                p.getStatus().name(),
                reportStatus, reportVisible, juryAssigned, defenseStatus
        );
    }
}

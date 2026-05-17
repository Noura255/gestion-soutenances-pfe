package com.pfe.defense.supervisor;

import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.project.Project;
import com.pfe.defense.report.Report;
import com.pfe.defense.report.ReportStatus;
import com.pfe.defense.report.ReportWorkflowService;
import com.pfe.defense.supervisor.dto.SupervisedStudentDto;
import com.pfe.defense.supervisor.dto.SupervisorDashboardDto;
import com.pfe.defense.supervisor.dto.SupervisorReportDto;
import com.pfe.defense.supervisor.repository.SupervisorProjectRepository;
import com.pfe.defense.supervisor.repository.SupervisorReportRepository;
import com.pfe.defense.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupervisorService {

    private final SupervisorProjectRepository projectRepository;
    private final SupervisorReportRepository reportRepository;
    private final ReportWorkflowService reportWorkflowService;

    public SupervisorService(SupervisorProjectRepository projectRepository,
                             SupervisorReportRepository reportRepository,
                             ReportWorkflowService reportWorkflowService) {
        this.projectRepository = projectRepository;
        this.reportRepository = reportRepository;
        this.reportWorkflowService = reportWorkflowService;
    }

    @Transactional(readOnly = true)
    public SupervisorDashboardDto getDashboardStats(User supervisor) {
        SupervisorDashboardDto dto = new SupervisorDashboardDto();
        Long id = supervisor.getId();
        dto.setSupervisedStudentsCount(projectRepository.countBySupervisorId(id));
        dto.setPendingReportsCount(projectRepository.countBySupervisorIdAndReportStatus(id, ReportStatus.SUBMITTED_TO_SUPERVISOR));
        dto.setToCorrectReportsCount(projectRepository.countBySupervisorIdAndReportStatus(id, ReportStatus.NEEDS_CORRECTION));
        dto.setApprovedReportsCount(projectRepository.countBySupervisorIdAndReportStatus(id, ReportStatus.APPROVED_BY_SUPERVISOR));
        dto.setReadyForVisibilityReportsCount(projectRepository.countBySupervisorIdAndReportStatusAndJuryAssigned(id, ReportStatus.APPROVED_BY_SUPERVISOR));
        dto.setUpcomingDefensesCount(projectRepository.countUpcomingDefensesBySupervisorId(id));
        return dto;
    }

    @Transactional(readOnly = true)
    public List<SupervisedStudentDto> getSupervisedStudents(User supervisor) {
        return projectRepository.findBySupervisorIdWithDetails(supervisor.getId()).stream().map(project -> {
            SupervisedStudentDto dto = new SupervisedStudentDto();
            dto.setProjectId(project.getId());
            User student = project.getStudent();
            dto.setStudentName(student.getFirstName() + " " + student.getLastName());
            dto.setStudentEmail(student.getEmail());
            dto.setProjectTitle(project.getTitle());
            dto.setMajor(student.getDepartment() != null ? student.getDepartment() : "—");
            Report report = project.getReport();
            if (report != null) {
                dto.setReportStatus(report.getStatus());
                dto.setReportId(report.getId());
            } else {
                dto.setReportStatus(ReportStatus.NOT_SUBMITTED);
            }
            dto.setJuryAssigned(project.getJuryAssignment() != null);
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupervisorReportDto> getPendingReports(User supervisor) {
        return projectRepository.findBySupervisorIdWithDetails(supervisor.getId()).stream()
                .filter(p -> p.getReport() != null && p.getReport().getStatus() == ReportStatus.SUBMITTED_TO_SUPERVISOR)
                .map(p -> mapToReportDto(p.getReport(), p))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SupervisorReportDto getReportDetails(Long reportId, User supervisor) {
        Report report = getReportOrThrow(reportId, supervisor.getId());
        return mapToReportDto(report, report.getProject());
    }

    @Transactional
    public void approveReport(Long reportId, String comment, User supervisor) {
        Report report = getReportOrThrow(reportId, supervisor.getId());
        if (report.getStatus() != ReportStatus.SUBMITTED_TO_SUPERVISOR && report.getStatus() != ReportStatus.NEEDS_CORRECTION) {
            throw new BadRequestException("Ce rapport ne peut pas être approuvé dans son état actuel.");
        }
        reportWorkflowService.approveBySupervisor(report);
        if (comment != null && !comment.trim().isEmpty()) {
            report.setSupervisorComment(comment);
        }
        reportRepository.save(report);
    }

    @Transactional
    public void requestCorrection(Long reportId, String comment, User supervisor) {
        Report report = getReportOrThrow(reportId, supervisor.getId());
        if (report.getStatus() != ReportStatus.SUBMITTED_TO_SUPERVISOR) {
            throw new BadRequestException("Ce rapport ne peut pas être renvoyé pour correction.");
        }
        report.setStatus(ReportStatus.NEEDS_CORRECTION);
        if (comment != null && !comment.trim().isEmpty()) {
            report.setSupervisorComment(comment);
        }
        reportRepository.save(report);
    }

    @Transactional
    public void rejectReport(Long reportId, String comment, User supervisor) {
        Report report = getReportOrThrow(reportId, supervisor.getId());
        if (report.getStatus() != ReportStatus.SUBMITTED_TO_SUPERVISOR) {
            throw new BadRequestException("Ce rapport ne peut pas être rejeté.");
        }
        report.setStatus(ReportStatus.NOT_SUBMITTED);
        if (comment != null && !comment.trim().isEmpty()) {
            report.setSupervisorComment(comment);
        }
        reportRepository.save(report);
    }

    @Transactional
    public void activateVisibility(Long reportId, User supervisor) {
        Report report = getReportOrThrow(reportId, supervisor.getId());
        reportWorkflowService.activateVisibilityForAssignedJury(report);
        reportRepository.save(report);
    }

    private Report getReportOrThrow(Long reportId, Long supervisorId) {
        return reportRepository.findByIdAndSupervisorIdWithDetails(reportId, supervisorId)
                .orElseThrow(() -> new ResourceNotFoundException("Rapport introuvable ou non autorisé."));
    }

    private SupervisorReportDto mapToReportDto(Report report, Project project) {
        SupervisorReportDto dto = new SupervisorReportDto();
        dto.setId(report.getId());
        dto.setFileName(report.getFileName());
        dto.setOriginalFileName(report.getOriginalFileName());
        dto.setStatus(report.getStatus());
        dto.setSupervisorComment(report.getSupervisorComment());
        dto.setVisibleToJury(report.isVisibleToJury());
        dto.setUploadedAt(report.getUploadedAt());
        dto.setApprovedAt(report.getApprovedAt());
        dto.setVisibilityActivatedAt(report.getVisibilityActivatedAt());

        User student = project.getStudent();
        dto.setStudentName(student.getFirstName() + " " + student.getLastName());
        dto.setProjectTitle(project.getTitle());
        dto.setJuryAssigned(project.getJuryAssignment() != null);
        return dto;
    }
}

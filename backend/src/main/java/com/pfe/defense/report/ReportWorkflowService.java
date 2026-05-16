package com.pfe.defense.report;

import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.project.Project;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReportWorkflowService {
    public void approveBySupervisor(Report report) {
        report.setStatus(ReportStatus.APPROVED_BY_SUPERVISOR);
        report.setApprovedAt(LocalDateTime.now());
        report.setVisibleToJury(false);
    }

    public void activateVisibilityForAssignedJury(Report report) {
        Project project = report.getProject();
        if (report.getStatus() != ReportStatus.APPROVED_BY_SUPERVISOR) {
            throw new BadRequestException("Le rapport doit être approuvé par l'encadrant avant publication au jury.");
        }
        if (project == null || project.getJuryAssignment() == null) {
            throw new BadRequestException("Les jurys doivent être affectés avant activation de la visibilité.");
        }
        report.setVisibleToJury(true);
        report.setStatus(ReportStatus.VISIBLE_TO_JURY);
        report.setVisibilityActivatedAt(LocalDateTime.now());
    }

    public boolean isVisibleToAssignedJury(Report report) {
        return report.isVisibleToJury() && report.getStatus() == ReportStatus.VISIBLE_TO_JURY;
    }
}

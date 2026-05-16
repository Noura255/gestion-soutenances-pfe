package com.pfe.defense.student.dto;

import com.pfe.defense.report.ReportStatus;

import java.time.LocalDateTime;

public record StudentReportStatusResponse(
        ReportStatus status,
        String originalFileName,
        String supervisorComment,
        LocalDateTime uploadedAt,
        boolean visibleToJury
) {
}


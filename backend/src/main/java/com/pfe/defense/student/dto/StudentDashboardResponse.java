package com.pfe.defense.student.dto;

import com.pfe.defense.report.ReportStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record StudentDashboardResponse(
        String studentName,
        String field,
        String projectTitle,
        String supervisorName,
        ReportStatus reportStatus,
        LocalDate defenseDate,
        LocalTime defenseTime,
        String room,
        List<String> juryMembers
) {
}


package com.pfe.defense.jury.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record DefenseDetailDTO(
        Long id,
        String studentName,
        String projectTitle,
        String supervisorName,
        LocalDate date,
        LocalTime time,
        String room,
        ReportAccessStatus reportStatus,
        JuryEvaluationStatus evaluationStatus,
        ReportDTO report,
        EvaluationResponseDTO evaluation
) {
}

package com.pfe.defense.jury.dto;

import com.pfe.defense.evaluation.EvaluationDecision;
import com.pfe.defense.evaluation.EvaluationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EvaluationResponseDTO(
        Long id,
        Long defenseId,
        BigDecimal notePresentation,
        BigDecimal noteReport,
        BigDecimal noteTechnical,
        BigDecimal noteCommunication,
        BigDecimal finalGrade,
        String remarks,
        EvaluationDecision decision,
        EvaluationStatus status,
        LocalDateTime submittedAt
) {
}

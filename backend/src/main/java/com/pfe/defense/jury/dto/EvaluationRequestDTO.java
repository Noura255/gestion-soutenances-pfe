package com.pfe.defense.jury.dto;

import com.pfe.defense.evaluation.EvaluationDecision;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record EvaluationRequestDTO(
        @NotNull(message = "La soutenance est obligatoire.")
        Long defenseId,

        @DecimalMin(value = "0.00", message = "La note de présentation doit être comprise entre 0 et 20.")
        @DecimalMax(value = "20.00", message = "La note de présentation doit être comprise entre 0 et 20.")
        BigDecimal notePresentation,

        @DecimalMin(value = "0.00", message = "La note du rapport doit être comprise entre 0 et 20.")
        @DecimalMax(value = "20.00", message = "La note du rapport doit être comprise entre 0 et 20.")
        BigDecimal noteReport,

        @DecimalMin(value = "0.00", message = "La note technique doit être comprise entre 0 et 20.")
        @DecimalMax(value = "20.00", message = "La note technique doit être comprise entre 0 et 20.")
        BigDecimal noteTechnical,

        @DecimalMin(value = "0.00", message = "La note de communication doit être comprise entre 0 et 20.")
        @DecimalMax(value = "20.00", message = "La note de communication doit être comprise entre 0 et 20.")
        BigDecimal noteCommunication,

        @DecimalMin(value = "0.00", message = "La note finale doit être comprise entre 0 et 20.")
        @DecimalMax(value = "20.00", message = "La note finale doit être comprise entre 0 et 20.")
        BigDecimal finalGrade,

        String remarks,
        EvaluationDecision decision
) {
}

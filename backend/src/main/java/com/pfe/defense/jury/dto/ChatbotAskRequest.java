package com.pfe.defense.jury.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatbotAskRequest(
        @NotBlank String question
) {
}

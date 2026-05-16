package com.pfe.defense.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatbotAskRequest(
        @NotBlank String question
) {
}

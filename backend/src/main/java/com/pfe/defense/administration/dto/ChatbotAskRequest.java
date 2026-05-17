package com.pfe.defense.administration.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatbotAskRequest(@NotBlank String question) {}

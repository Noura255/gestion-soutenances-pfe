package com.pfe.defense.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SystemSettingsRequest(
        @NotBlank String activeAcademicYear,
        @NotNull @Min(1) Integer maxReportPdfSizeMb,
        boolean registrationsEnabled,
        @NotBlank @Email String supportEmail
) {
}

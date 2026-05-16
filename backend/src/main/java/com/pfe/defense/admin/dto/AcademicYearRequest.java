package com.pfe.defense.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record AcademicYearRequest(
        @NotBlank String label,
        boolean active
) {
}

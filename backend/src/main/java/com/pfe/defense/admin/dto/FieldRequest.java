package com.pfe.defense.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record FieldRequest(
        @NotBlank String name,
        @NotNull Long departmentId
) {
}

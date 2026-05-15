package com.pfe.defense.admin.dto;

public record UserImportIgnoredRowResponse(
        int rowNumber,
        String email,
        String reason
) {
}

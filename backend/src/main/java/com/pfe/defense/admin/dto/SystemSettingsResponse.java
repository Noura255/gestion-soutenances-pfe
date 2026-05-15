package com.pfe.defense.admin.dto;

import com.pfe.defense.admin.settings.SystemSettings;

import java.time.LocalDateTime;

public record SystemSettingsResponse(
        Long id,
        String activeAcademicYear,
        Integer maxReportPdfSizeMb,
        boolean registrationsEnabled,
        String supportEmail,
        LocalDateTime updatedAt
) {
    public static SystemSettingsResponse from(SystemSettings settings) {
        return new SystemSettingsResponse(
                settings.getId(),
                settings.getActiveAcademicYear(),
                settings.getMaxReportPdfSizeMb(),
                settings.isRegistrationsEnabled(),
                settings.getSupportEmail(),
                settings.getUpdatedAt()
        );
    }
}

package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.SystemSettingsRequest;
import com.pfe.defense.admin.dto.SystemSettingsResponse;
import com.pfe.defense.admin.settings.SystemSettings;
import com.pfe.defense.admin.settings.SystemSettingsRepository;
import com.pfe.defense.audit.AuditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SystemSettingsService {
    private final SystemSettingsRepository repository;
    private final AuditLogService auditLogService;

    public SystemSettingsService(SystemSettingsRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    public SystemSettingsResponse getSettings() {
        return SystemSettingsResponse.from(getOrCreate());
    }

    public SystemSettingsResponse updateSettings(SystemSettingsRequest request) {
        SystemSettings settings = getOrCreate();
        settings.setActiveAcademicYear(request.activeAcademicYear());
        settings.setMaxReportPdfSizeMb(request.maxReportPdfSizeMb());
        settings.setRegistrationsEnabled(request.registrationsEnabled());
        settings.setSupportEmail(request.supportEmail());
        SystemSettings saved = repository.save(settings);
        auditLogService.log("UPDATE", "SYSTEM_SETTINGS", "Mise à jour des paramètres système", currentActor());
        return SystemSettingsResponse.from(saved);
    }

    private SystemSettings getOrCreate() {
        return repository.findAll().stream().findFirst().orElseGet(() -> {
            SystemSettings settings = new SystemSettings();
            settings.setActiveAcademicYear("2025-2026");
            settings.setMaxReportPdfSizeMb(25);
            settings.setRegistrationsEnabled(true);
            settings.setSupportEmail("support@sg.local");
            return repository.save(settings);
        });
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

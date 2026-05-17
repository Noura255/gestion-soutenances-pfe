package com.pfe.defense.administration;

import com.pfe.defense.audit.AuditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AdministrationAuditService {

    private final AuditLogService auditLogService;

    public AdministrationAuditService(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    public void log(String action, String description) {
        auditLogService.log(action, "ADMINISTRATION", description, currentActor());
    }

    public String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

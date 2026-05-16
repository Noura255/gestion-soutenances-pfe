package com.pfe.defense.admin.dto;

import com.pfe.defense.audit.AuditLog;

import java.time.LocalDateTime;

public record AuditLogResponse(
        Long id,
        String action,
        String module,
        String description,
        String performedBy,
        LocalDateTime createdAt
) {
    public static AuditLogResponse from(AuditLog auditLog) {
        return new AuditLogResponse(
                auditLog.getId(),
                auditLog.getAction(),
                auditLog.getModule(),
                auditLog.getDescription(),
                auditLog.getPerformedBy(),
                auditLog.getCreatedAt()
        );
    }
}

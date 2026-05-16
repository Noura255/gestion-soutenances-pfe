package com.pfe.defense.audit;

import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog log(String action, String module, String description, String performedBy) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setModule(module);
        auditLog.setDescription(description);
        auditLog.setPerformedBy(performedBy == null || performedBy.isBlank() ? "system" : performedBy);
        return auditLogRepository.save(auditLog);
    }
}

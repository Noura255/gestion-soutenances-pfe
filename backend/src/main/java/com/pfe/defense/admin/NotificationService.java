package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.NotificationRequest;
import com.pfe.defense.admin.dto.NotificationResponse;
import com.pfe.defense.admin.notification.Notification;
import com.pfe.defense.admin.notification.NotificationRepository;
import com.pfe.defense.audit.AuditLogService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationService {
    private final NotificationRepository repository;
    private final AuditLogService auditLogService;

    public NotificationService(NotificationRepository repository, AuditLogService auditLogService) {
        this.repository = repository;
        this.auditLogService = auditLogService;
    }

    public NotificationResponse create(NotificationRequest request) {
        Notification notification = new Notification();
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setTargetRole(request.targetRole());
        Notification saved = repository.save(notification);
        String target = saved.getTargetRole() == null ? "tous les utilisateurs" : saved.getTargetRole().name();
        auditLogService.log("CREATE", "GLOBAL_NOTIFICATION", "Annonce envoyée à " + target, currentActor());
        return NotificationResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(NotificationResponse::from).toList();
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

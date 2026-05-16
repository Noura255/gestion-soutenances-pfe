package com.pfe.defense.admin.dto;

import com.pfe.defense.admin.notification.Notification;
import com.pfe.defense.user.Role;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String title,
        String message,
        Role targetRole,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getTargetRole(),
                notification.getCreatedAt()
        );
    }
}

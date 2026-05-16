package com.pfe.defense.admin.dto;

import com.pfe.defense.user.Role;

public record SecurityAlertResponse(
        Long userId,
        String email,
        Role role,
        long failedAttempts,
        String severity,
        String message
) {
}

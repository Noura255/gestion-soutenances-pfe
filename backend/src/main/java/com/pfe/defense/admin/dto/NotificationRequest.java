package com.pfe.defense.admin.dto;

import com.pfe.defense.user.Role;
import jakarta.validation.constraints.NotBlank;

public record NotificationRequest(
        @NotBlank String title,
        @NotBlank String message,
        Role targetRole
) {
}

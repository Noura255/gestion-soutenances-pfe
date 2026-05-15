package com.pfe.defense.admin.dto;

import com.pfe.defense.user.Role;

import java.time.LocalDateTime;

public record LoginHistoryResponse(
        String email,
        Role role,
        String status,
        String description,
        LocalDateTime createdAt
) {
}

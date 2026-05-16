package com.pfe.defense.admin.dto;

import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Role role,
        boolean enabled,
        String department,
        String phone,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getDepartment(),
                user.getPhone(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}

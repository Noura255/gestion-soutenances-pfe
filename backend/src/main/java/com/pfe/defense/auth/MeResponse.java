package com.pfe.defense.auth;

import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;

public record MeResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        Role role,
        boolean enabled,
        String department,
        String phone
) {
    public static MeResponse from(User user) {
        return new MeResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isEnabled(),
                user.getDepartment(),
                user.getPhone()
        );
    }
}

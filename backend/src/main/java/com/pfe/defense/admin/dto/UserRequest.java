package com.pfe.defense.admin.dto;

import com.pfe.defense.user.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        String password,
        @NotNull Role role,
        String department,
        String phone
) {
}

package com.pfe.defense.administration.dto;

public record UserSummary(
        Long   id,
        String firstName,
        String lastName,
        String email,
        String role
) {}

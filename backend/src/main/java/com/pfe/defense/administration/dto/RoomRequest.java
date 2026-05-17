package com.pfe.defense.administration.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record RoomRequest(
        @NotBlank String  name,
        @NotBlank String  building,
        @Min(1)   Integer capacity,
                  String  equipment,
                  boolean available
) {}

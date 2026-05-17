package com.pfe.defense.administration.dto;

public record RoomResponse(
        Long    id,
        String  name,
        String  building,
        Integer capacity,
        String  equipment,
        boolean available
) {}

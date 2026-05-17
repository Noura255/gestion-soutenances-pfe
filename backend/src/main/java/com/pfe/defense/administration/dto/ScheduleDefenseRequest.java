package com.pfe.defense.administration.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleDefenseRequest(
        @NotNull Long      projectId,
        @NotNull LocalDate defenseDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull Long      roomId
) {}

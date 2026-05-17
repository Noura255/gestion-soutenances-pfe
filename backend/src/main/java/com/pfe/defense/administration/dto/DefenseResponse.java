package com.pfe.defense.administration.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record DefenseResponse(
        Long         id,
        Long         projectId,
        String       projectTitle,
        String       studentOrGroup,
        LocalDate    defenseDate,
        LocalTime    startTime,
        LocalTime    endTime,
        RoomResponse room,
        String       status,
        boolean      published,
        UserSummary  president,
        UserSummary  examiner1,
        UserSummary  examiner2,
        UserSummary  guest
) {}

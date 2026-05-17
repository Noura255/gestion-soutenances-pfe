package com.pfe.defense.student.dto;

import com.pfe.defense.defense.DefenseStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record StudentDefenseResponse(
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String room,
        List<String> juryMembers,
        DefenseStatus planningStatus,
        boolean published
) {
}


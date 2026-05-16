package com.pfe.defense.administration.dto;

public record AdministrationDashboardResponse(
        long totalProjectsSubmitted,
        long projectsWithoutJury,
        long defensesNotScheduled,
        long availableRooms,
        int  conflictsDetected,
        long reportsVisible,
        long reportsNotVisible
) {}

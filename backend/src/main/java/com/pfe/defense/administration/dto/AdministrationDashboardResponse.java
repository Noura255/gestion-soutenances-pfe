package com.pfe.defense.administration.dto;

public record AdministrationDashboardResponse(
        long totalProjects,
        long projectsWithoutJury,
        long projectsWithJury,
        long unscheduledDefenses,
        long scheduledDefenses,
        long publishedDefenses,
        long availableRooms,
        long visibleReports,
        long nonVisibleReports,
        int  conflictsCount
) {}

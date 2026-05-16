package com.pfe.defense.jury.dto;

import java.util.List;

public record DashboardDTO(
        List<DefenseSummaryDTO> upcomingDefenses,
        int availableReports,
        int unavailableReports,
        int pendingEvaluations,
        int submittedEvaluations
) {
}

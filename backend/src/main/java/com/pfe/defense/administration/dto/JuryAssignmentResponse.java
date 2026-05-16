package com.pfe.defense.administration.dto;

import java.time.LocalDateTime;

public record JuryAssignmentResponse(
        Long          id,
        Long          projectId,
        String        projectTitle,
        UserSummary   president,
        UserSummary   examiner1,
        UserSummary   examiner2,
        UserSummary   guest,
        LocalDateTime assignedAt
) {}

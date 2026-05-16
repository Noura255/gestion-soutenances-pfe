package com.pfe.defense.administration.dto;

import jakarta.validation.constraints.NotNull;

public record JuryAssignRequest(
        @NotNull Long presidentId,
        @NotNull Long examiner1Id,
        @NotNull Long examiner2Id,
                 Long guestId
) {}

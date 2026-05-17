package com.pfe.defense.administration.dto;

import java.time.LocalDateTime;

public record VisibleReportResponse(
        Long id,
        Long projectId,
        String projectTitle,
        String studentOrGroup,
        String supervisorName,
        String status,
        LocalDateTime uploadedAt,
        LocalDateTime approvedAt,
        LocalDateTime visibilityActivatedAt,
        String originalFileName,
        boolean downloadable
) {}

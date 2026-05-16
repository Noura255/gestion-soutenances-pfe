package com.pfe.defense.jury.dto;

import java.time.LocalDateTime;

public record ReportDTO(
        Long id,
        String title,
        String fileUrl,
        LocalDateTime uploadedAt,
        ReportVisibilityStatus visibilityStatus
) {
}

package com.pfe.defense.admin.dto;

import java.util.List;

public record AdminDashboardResponse(
        long totalUsers,
        long totalStudents,
        long totalSupervisors,
        long totalJurys,
        long totalAdministration,
        List<AuditLogResponse> latestLogs
) {
}

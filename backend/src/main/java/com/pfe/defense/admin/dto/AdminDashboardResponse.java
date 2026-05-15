package com.pfe.defense.admin.dto;

import com.pfe.defense.user.Role;

import java.util.List;
import java.util.Map;

public record AdminDashboardResponse(
        long totalUsers,
        long totalStudents,
        long totalSupervisors,
        long totalJurys,
        long totalAdministration,
        long totalAdmins,
        long activeUsers,
        long disabledUsers,
        long totalProjects,
        long totalDefenses,
        long failedLoginCount,
        Map<Role, Long> usersByRole,
        List<LoginHistoryResponse> latestFailedLogins,
        List<SecurityAlertResponse> securityAlerts,
        List<String> chatbotSuggestions,
        List<AuditLogResponse> latestLogs
) {
}

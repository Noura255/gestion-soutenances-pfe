package com.pfe.defense.supervisor.dto;

public class SupervisorDashboardDto {
    private long supervisedStudentsCount;
    private long pendingReportsCount;
    private long toCorrectReportsCount;
    private long approvedReportsCount;
    private long readyForVisibilityReportsCount;
    private long upcomingDefensesCount;

    public SupervisorDashboardDto() {}

    public long getSupervisedStudentsCount() {
        return supervisedStudentsCount;
    }

    public void setSupervisedStudentsCount(long supervisedStudentsCount) {
        this.supervisedStudentsCount = supervisedStudentsCount;
    }

    public long getPendingReportsCount() {
        return pendingReportsCount;
    }

    public void setPendingReportsCount(long pendingReportsCount) {
        this.pendingReportsCount = pendingReportsCount;
    }

    public long getToCorrectReportsCount() {
        return toCorrectReportsCount;
    }

    public void setToCorrectReportsCount(long toCorrectReportsCount) {
        this.toCorrectReportsCount = toCorrectReportsCount;
    }

    public long getApprovedReportsCount() {
        return approvedReportsCount;
    }

    public void setApprovedReportsCount(long approvedReportsCount) {
        this.approvedReportsCount = approvedReportsCount;
    }

    public long getReadyForVisibilityReportsCount() {
        return readyForVisibilityReportsCount;
    }

    public void setReadyForVisibilityReportsCount(long readyForVisibilityReportsCount) {
        this.readyForVisibilityReportsCount = readyForVisibilityReportsCount;
    }

    public long getUpcomingDefensesCount() {
        return upcomingDefensesCount;
    }

    public void setUpcomingDefensesCount(long upcomingDefensesCount) {
        this.upcomingDefensesCount = upcomingDefensesCount;
    }
}

package com.pfe.defense.supervisor.dto;

import com.pfe.defense.report.ReportStatus;

public class SupervisedStudentDto {
    private Long projectId;
    private String studentName;
    private String studentEmail;
    private String projectTitle;
    private String major;
    private ReportStatus reportStatus;
    private boolean juryAssigned;
    private Long reportId;

    public SupervisedStudentDto() {}

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public ReportStatus getReportStatus() {
        return reportStatus;
    }

    public void setReportStatus(ReportStatus reportStatus) {
        this.reportStatus = reportStatus;
    }

    public boolean isJuryAssigned() {
        return juryAssigned;
    }

    public void setJuryAssigned(boolean juryAssigned) {
        this.juryAssigned = juryAssigned;
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }
}

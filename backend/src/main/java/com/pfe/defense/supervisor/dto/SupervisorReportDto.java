package com.pfe.defense.supervisor.dto;

import com.pfe.defense.report.ReportStatus;
import java.time.LocalDateTime;

public class SupervisorReportDto {
    private Long id;
    private String fileName;
    private String originalFileName;
    private ReportStatus status;
    private String supervisorComment;
    private boolean visibleToJury;
    private LocalDateTime uploadedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime visibilityActivatedAt;
    
    private String studentName;
    private String projectTitle;
    private boolean juryAssigned;

    public SupervisorReportDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalFileName() {
        return originalFileName;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public String getSupervisorComment() {
        return supervisorComment;
    }

    public void setSupervisorComment(String supervisorComment) {
        this.supervisorComment = supervisorComment;
    }

    public boolean isVisibleToJury() {
        return visibleToJury;
    }

    public void setVisibleToJury(boolean visibleToJury) {
        this.visibleToJury = visibleToJury;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getVisibilityActivatedAt() {
        return visibilityActivatedAt;
    }

    public void setVisibilityActivatedAt(LocalDateTime visibilityActivatedAt) {
        this.visibilityActivatedAt = visibilityActivatedAt;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public boolean isJuryAssigned() {
        return juryAssigned;
    }

    public void setJuryAssigned(boolean juryAssigned) {
        this.juryAssigned = juryAssigned;
    }
}

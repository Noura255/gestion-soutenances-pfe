package com.pfe.defense.admin.settings;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_settings")
public class SystemSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String activeAcademicYear;

    @Column(nullable = false)
    private Integer maxReportPdfSizeMb;

    @Column(nullable = false)
    private boolean registrationsEnabled;

    @Column(nullable = false)
    private String supportEmail;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getActiveAcademicYear() { return activeAcademicYear; }
    public void setActiveAcademicYear(String activeAcademicYear) { this.activeAcademicYear = activeAcademicYear; }
    public Integer getMaxReportPdfSizeMb() { return maxReportPdfSizeMb; }
    public void setMaxReportPdfSizeMb(Integer maxReportPdfSizeMb) { this.maxReportPdfSizeMb = maxReportPdfSizeMb; }
    public boolean isRegistrationsEnabled() { return registrationsEnabled; }
    public void setRegistrationsEnabled(boolean registrationsEnabled) { this.registrationsEnabled = registrationsEnabled; }
    public String getSupportEmail() { return supportEmail; }
    public void setSupportEmail(String supportEmail) { this.supportEmail = supportEmail; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}

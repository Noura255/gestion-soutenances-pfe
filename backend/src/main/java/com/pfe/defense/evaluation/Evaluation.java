package com.pfe.defense.evaluation;

import com.pfe.defense.project.Project;
import com.pfe.defense.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(precision = 5, scale = 2)
    private BigDecimal notePresentation;

    @Column(precision = 5, scale = 2)
    private BigDecimal noteReport;

    @Column(precision = 5, scale = 2)
    private BigDecimal noteTechnical;

    @Column(precision = 5, scale = 2)
    private BigDecimal noteCommunication;

    @Column(precision = 5, scale = 2)
    private BigDecimal finalGrade;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    private EvaluationDecision decision;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EvaluationStatus status = EvaluationStatus.DRAFT;

    @Column(nullable = false)
    private boolean seedData = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jury_member_id", nullable = false)
    private User juryMember;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public BigDecimal getNotePresentation() {
        return notePresentation;
    }

    public void setNotePresentation(BigDecimal notePresentation) {
        this.notePresentation = notePresentation;
    }

    public BigDecimal getNoteReport() {
        return noteReport;
    }

    public void setNoteReport(BigDecimal noteReport) {
        this.noteReport = noteReport;
    }

    public BigDecimal getNoteTechnical() {
        return noteTechnical;
    }

    public void setNoteTechnical(BigDecimal noteTechnical) {
        this.noteTechnical = noteTechnical;
    }

    public BigDecimal getNoteCommunication() {
        return noteCommunication;
    }

    public void setNoteCommunication(BigDecimal noteCommunication) {
        this.noteCommunication = noteCommunication;
    }

    public BigDecimal getFinalGrade() {
        return finalGrade;
    }

    public void setFinalGrade(BigDecimal finalGrade) {
        this.finalGrade = finalGrade;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public EvaluationDecision getDecision() {
        return decision;
    }

    public void setDecision(EvaluationDecision decision) {
        this.decision = decision;
    }

    public EvaluationStatus getStatus() {
        return status;
    }

    public void setStatus(EvaluationStatus status) {
        this.status = status;
    }

    public boolean isSeedData() {
        return seedData;
    }

    public void setSeedData(boolean seedData) {
        this.seedData = seedData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public User getJuryMember() {
        return juryMember;
    }

    public void setJuryMember(User juryMember) {
        this.juryMember = juryMember;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }
}

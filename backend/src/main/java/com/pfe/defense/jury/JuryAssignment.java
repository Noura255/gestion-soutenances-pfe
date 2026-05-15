package com.pfe.defense.jury;

import com.pfe.defense.project.Project;
import com.pfe.defense.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "jury_assignments")
public class JuryAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "president_id")
    private User president;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examiner1_id")
    private User examiner1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "examiner2_id")
    private User examiner2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id")
    private User guest;

    @PrePersist
    public void onCreate() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public User getPresident() {
        return president;
    }

    public void setPresident(User president) {
        this.president = president;
    }

    public User getExaminer1() {
        return examiner1;
    }

    public void setExaminer1(User examiner1) {
        this.examiner1 = examiner1;
    }

    public User getExaminer2() {
        return examiner2;
    }

    public void setExaminer2(User examiner2) {
        this.examiner2 = examiner2;
    }

    public User getGuest() {
        return guest;
    }

    public void setGuest(User guest) {
        this.guest = guest;
    }
}

package com.pfe.defense.defense;

import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.project.Project;
import com.pfe.defense.room.Room;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "defenses")
public class Defense {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate defenseDate;
    private LocalTime startTime;
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DefenseStatus status = DefenseStatus.NOT_SCHEDULED;

    @Column(nullable = false)
    private boolean published = false;

    @Column(nullable = false)
    private boolean seedData = false;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jury_assignment_id", unique = true)
    private JuryAssignment juryAssignment;

    public Long getId() {
        return id;
    }

    public LocalDate getDefenseDate() {
        return defenseDate;
    }

    public void setDefenseDate(LocalDate defenseDate) {
        this.defenseDate = defenseDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public DefenseStatus getStatus() {
        return status;
    }

    public void setStatus(DefenseStatus status) {
        this.status = status;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }

    public boolean isSeedData() {
        return seedData;
    }

    public void setSeedData(boolean seedData) {
        this.seedData = seedData;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Room getRoom() {
        return room;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public JuryAssignment getJuryAssignment() {
        return juryAssignment;
    }

    public void setJuryAssignment(JuryAssignment juryAssignment) {
        this.juryAssignment = juryAssignment;
    }
}

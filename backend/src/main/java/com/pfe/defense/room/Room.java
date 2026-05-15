package com.pfe.defense.room;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.pfe.defense.defense.Defense;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String building;
    private Integer capacity;
    private String equipment;

    @Column(nullable = false)
    private boolean available = true;

    @JsonIgnore
    @OneToMany(mappedBy = "room")
    private List<Defense> defenses;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public List<Defense> getDefenses() {
        return defenses;
    }
}

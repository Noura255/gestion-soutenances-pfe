package com.pfe.defense.admin.structure;

import jakarta.persistence.*;

@Entity
@Table(name = "fields", uniqueConstraints = @UniqueConstraint(columnNames = {"name", "department_id"}))
public class Field {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private boolean seedData = false;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public boolean isSeedData() { return seedData; }
    public void setSeedData(boolean seedData) { this.seedData = seedData; }
}

package com.pfe.defense.admin.dto;

import com.pfe.defense.admin.structure.Department;

public record DepartmentResponse(
        Long id,
        String name,
        String description
) {
    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(department.getId(), department.getName(), department.getDescription());
    }
}

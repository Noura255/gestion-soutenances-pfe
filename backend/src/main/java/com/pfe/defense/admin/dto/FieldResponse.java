package com.pfe.defense.admin.dto;

import com.pfe.defense.admin.structure.Field;

public record FieldResponse(
        Long id,
        String name,
        Long departmentId,
        String departmentName
) {
    public static FieldResponse from(Field field) {
        return new FieldResponse(
                field.getId(),
                field.getName(),
                field.getDepartment().getId(),
                field.getDepartment().getName()
        );
    }
}

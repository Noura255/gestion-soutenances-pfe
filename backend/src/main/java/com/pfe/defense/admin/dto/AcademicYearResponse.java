package com.pfe.defense.admin.dto;

import com.pfe.defense.admin.structure.AcademicYear;

public record AcademicYearResponse(
        Long id,
        String label,
        boolean active
) {
    public static AcademicYearResponse from(AcademicYear academicYear) {
        return new AcademicYearResponse(academicYear.getId(), academicYear.getLabel(), academicYear.isActive());
    }
}

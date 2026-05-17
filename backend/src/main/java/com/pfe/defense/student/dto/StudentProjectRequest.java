package com.pfe.defense.student.dto;

import com.pfe.defense.project.ProjectType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record StudentProjectRequest(
        @NotBlank String title,
        String summary,
        String keywords,
        @NotNull ProjectType projectType,
        @NotBlank String academicYear,
        List<String> groupMembers
) {
}


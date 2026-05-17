package com.pfe.defense.student.dto;

import com.pfe.defense.project.ProjectStatus;
import com.pfe.defense.project.ProjectType;

import java.util.List;

public record StudentProjectResponse(
        Long id,
        String title,
        String summary,
        String keywords,
        ProjectType projectType,
        String academicYear,
        ProjectStatus status,
        String supervisorName,
        List<String> groupMembers
) {
}


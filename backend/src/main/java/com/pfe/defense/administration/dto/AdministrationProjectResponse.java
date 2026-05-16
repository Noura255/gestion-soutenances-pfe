package com.pfe.defense.administration.dto;

public record AdministrationProjectResponse(
        Long    projectId,
        String  title,
        String  studentName,
        String  supervisorName,
        String  academicYear,
        String  projectType,
        String  projectStatus,
        String  reportStatus,
        boolean reportVisibleToJury,
        boolean juryAssigned,
        String  defenseStatus
) {}

package com.pfe.defense.administration.dto;

public record AdministrationProjectResponse(
        Long    projectId,
        String  title,
        String  studentOrGroup,
        String  supervisorName,
        String  fieldName,
        String  academicYear,
        String  projectType,
        String  projectStatus,
        String  reportStatus,
        boolean reportVisibleToJury,
        String  juryStatus,
        String  defenseStatus,
        Long    juryAssignmentId,
        Long    defenseId,
        Long    visibleReportId,
        UserSummary president,
        UserSummary examiner1,
        UserSummary examiner2,
        UserSummary guest
) {}

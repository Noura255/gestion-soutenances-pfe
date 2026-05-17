package com.pfe.defense.administration.dto;

public record AdministrationProjectDetailResponse(
        Long projectId,
        String title,
        String summary,
        String keywords,
        UserSummary student,
        UserSummary supervisor,
        String fieldName,
        String academicYear,
        String projectType,
        String projectStatus,
        String reportStatus,
        boolean reportVisibleToJury,
        String juryStatus,
        String defenseStatus,
        UserSummary president,
        UserSummary examiner1,
        UserSummary examiner2,
        UserSummary guest,
        VisibleReportResponse visibleReport
) {}

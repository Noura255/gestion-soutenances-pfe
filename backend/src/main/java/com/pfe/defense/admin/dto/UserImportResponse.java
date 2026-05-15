package com.pfe.defense.admin.dto;

import java.util.List;

public record UserImportResponse(
        int importedCount,
        List<UserImportIgnoredRowResponse> ignoredRows
) {
}

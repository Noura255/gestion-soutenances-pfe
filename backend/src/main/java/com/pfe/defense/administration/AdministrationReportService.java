package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.VisibleReportResponse;
import com.pfe.defense.administration.repository.AdminReportQueryRepository;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.report.Report;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Service
public class AdministrationReportService {

    private final AdminReportQueryRepository reportRepo;

    public AdministrationReportService(AdminReportQueryRepository reportRepo) {
        this.reportRepo = reportRepo;
    }

    @Transactional(readOnly = true)
    public List<VisibleReportResponse> getVisibleReports() {
        return reportRepo.findAllVisibleWithDetails().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VisibleReportResponse getVisibleReport(Long id) {
        return toResponse(findVisibleReport(id));
    }

    @Transactional(readOnly = true)
    public byte[] downloadVisibleReport(Long id) throws IOException {
        Report report = findVisibleReport(id);
        Path path = resolveExistingPath(report);
        return Files.readAllBytes(path);
    }

    @Transactional(readOnly = true)
    public String getDownloadFilename(Long id) {
        Report report = findVisibleReport(id);
        return report.getOriginalFileName() != null && !report.getOriginalFileName().isBlank()
                ? report.getOriginalFileName()
                : report.getFileName();
    }

    private Report findVisibleReport(Long id) {
        return reportRepo.findVisibleByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rapport visible introuvable : " + id));
    }

    private Path resolveExistingPath(Report report) {
        if (report.getFilePath() == null || report.getFilePath().isBlank()) {
            throw new ResourceNotFoundException("Aucun fichier n'est associé à ce rapport visible.");
        }

        Path configured = Path.of(report.getFilePath()).normalize();
        if (Files.exists(configured)) {
            return configured;
        }

        String relativePath = report.getFilePath().replaceFirst("^/+", "");
        Path relative = Path.of(relativePath).normalize();
        if (Files.exists(relative)) {
            return relative;
        }

        throw new ResourceNotFoundException("Fichier du rapport introuvable.");
    }

    public VisibleReportResponse toResponse(Report report) {
        String studentOrGroup = report.getProject().getStudent() != null
                ? report.getProject().getStudent().getFirstName() + " "
                    + report.getProject().getStudent().getLastName()
                : "";
        String supervisorName = report.getProject().getSupervisor() != null
                ? report.getProject().getSupervisor().getFirstName() + " "
                    + report.getProject().getSupervisor().getLastName()
                : "";

        return new VisibleReportResponse(
                report.getId(),
                report.getProject().getId(),
                report.getProject().getTitle(),
                studentOrGroup,
                supervisorName,
                report.getStatus().name(),
                report.getUploadedAt(),
                report.getApprovedAt(),
                report.getVisibilityActivatedAt(),
                report.getOriginalFileName(),
                report.getFilePath() != null && !report.getFilePath().isBlank()
        );
    }
}

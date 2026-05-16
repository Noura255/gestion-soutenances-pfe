package com.pfe.defense.supervisor;

import com.pfe.defense.supervisor.dto.ActionRequestDto;
import com.pfe.defense.supervisor.dto.SupervisedStudentDto;
import com.pfe.defense.supervisor.dto.SupervisorDashboardDto;
import com.pfe.defense.supervisor.dto.SupervisorReportDto;
import com.pfe.defense.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/supervisor")
@PreAuthorize("hasRole('SUPERVISOR')")
public class SupervisorController {

    private final SupervisorService supervisorService;

    public SupervisorController(SupervisorService supervisorService) {
        this.supervisorService = supervisorService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<SupervisorDashboardDto> getDashboardStats(@AuthenticationPrincipal User supervisor) {
        return ResponseEntity.ok(supervisorService.getDashboardStats(supervisor));
    }

    @GetMapping("/students")
    public ResponseEntity<List<SupervisedStudentDto>> getSupervisedStudents(@AuthenticationPrincipal User supervisor) {
        return ResponseEntity.ok(supervisorService.getSupervisedStudents(supervisor));
    }

    @GetMapping("/reports/pending")
    public ResponseEntity<List<SupervisorReportDto>> getPendingReports(@AuthenticationPrincipal User supervisor) {
        return ResponseEntity.ok(supervisorService.getPendingReports(supervisor));
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<SupervisorReportDto> getReportDetails(@PathVariable Long id, @AuthenticationPrincipal User supervisor) {
        return ResponseEntity.ok(supervisorService.getReportDetails(id, supervisor));
    }

    @PutMapping("/reports/{id}/approve")
    public ResponseEntity<Void> approveReport(@PathVariable Long id, @RequestBody(required = false) ActionRequestDto actionRequest, @AuthenticationPrincipal User supervisor) {
        String comment = actionRequest != null ? actionRequest.getComment() : null;
        supervisorService.approveReport(id, comment, supervisor);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reports/{id}/request-correction")
    public ResponseEntity<Void> requestCorrection(@PathVariable Long id, @RequestBody(required = false) ActionRequestDto actionRequest, @AuthenticationPrincipal User supervisor) {
        String comment = actionRequest != null ? actionRequest.getComment() : null;
        supervisorService.requestCorrection(id, comment, supervisor);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reports/{id}/reject")
    public ResponseEntity<Void> rejectReport(@PathVariable Long id, @RequestBody(required = false) ActionRequestDto actionRequest, @AuthenticationPrincipal User supervisor) {
        String comment = actionRequest != null ? actionRequest.getComment() : null;
        supervisorService.rejectReport(id, comment, supervisor);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/reports/{id}/activate-visibility")
    public ResponseEntity<Void> activateVisibility(@PathVariable Long id, @AuthenticationPrincipal User supervisor) {
        supervisorService.activateVisibility(id, supervisor);
        return ResponseEntity.ok().build();
    }
}

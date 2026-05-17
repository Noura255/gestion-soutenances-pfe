package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.*;
import com.pfe.defense.administration.exception.ConflictException;
import com.pfe.defense.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/administration")
@PreAuthorize("hasRole('ADMINISTRATION')")
public class AdministrationController {

    private final AdministrationDashboardService dashboardService;
    private final AdministrationProjectService   projectService;
    private final AdministrationJuryService      juryService;
    private final AdministrationRoomService      roomService;
    private final AdministrationDefenseService   defenseService;
    private final AdministrationExportService    exportService;
    private final AdministrationReportService    reportService;
    private final AdministrationChatbotService   chatbotService;

    public AdministrationController(AdministrationDashboardService dashboardService,
                                    AdministrationProjectService projectService,
                                    AdministrationJuryService juryService,
                                    AdministrationRoomService roomService,
                                    AdministrationDefenseService defenseService,
                                    AdministrationExportService exportService,
                                    AdministrationReportService reportService,
                                    AdministrationChatbotService chatbotService) {
        this.dashboardService = dashboardService;
        this.projectService   = projectService;
        this.juryService      = juryService;
        this.roomService      = roomService;
        this.defenseService   = defenseService;
        this.exportService    = exportService;
        this.reportService    = reportService;
        this.chatbotService   = chatbotService;
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<AdministrationDashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    // ── Projets ───────────────────────────────────────────────────────────────

    @GetMapping("/projects")
    public ResponseEntity<List<AdministrationProjectResponse>> getProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<AdministrationProjectDetailResponse> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @GetMapping("/projects/without-jury")
    public ResponseEntity<List<AdministrationProjectResponse>> getProjectsWithoutJury() {
        return ResponseEntity.ok(projectService.getProjectsWithoutJury());
    }

    // ── Jury ──────────────────────────────────────────────────────────────────

    @PostMapping("/projects/{id}/assign-jury")
    public ResponseEntity<JuryAssignmentResponse> assignJury(
            @PathVariable Long id,
            @Valid @RequestBody JuryAssignRequest request) {
        return ResponseEntity.ok(juryService.assignJury(id, request));
    }

    @GetMapping("/jury-assignments")
    public ResponseEntity<List<JuryAssignmentResponse>> getAllJuryAssignments() {
        return ResponseEntity.ok(juryService.getAllJuryAssignments());
    }

    @GetMapping("/jury-assignments/{id}")
    public ResponseEntity<JuryAssignmentResponse> getJuryAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(juryService.getJuryAssignment(id));
    }

    @PutMapping("/jury-assignments/{id}")
    public ResponseEntity<JuryAssignmentResponse> updateJuryAssignment(
            @PathVariable Long id,
            @Valid @RequestBody JuryAssignRequest request) {
        return ResponseEntity.ok(juryService.updateAssignment(id, request));
    }

    @GetMapping("/jury-members")
    public ResponseEntity<List<UserSummary>> getJuryMembers() {
        List<User> users = juryService.getJuryMembers();
        List<UserSummary> summaries = users.stream()
                .map(u -> new UserSummary(u.getId(), u.getFirstName(), u.getLastName(),
                        u.getEmail(), u.getRole().name()))
                .toList();
        return ResponseEntity.ok(summaries);
    }

    // Alias de compatibilité interne avec le premier incrément du module.
    @GetMapping("/jury")
    public ResponseEntity<List<JuryAssignmentResponse>> getAllJuryAssignmentsLegacy() {
        return getAllJuryAssignments();
    }

    @GetMapping("/jury/eligible-members")
    public ResponseEntity<List<UserSummary>> getEligibleJuryMembersLegacy() {
        return getJuryMembers();
    }

    // ── Salles ────────────────────────────────────────────────────────────────

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomResponse>> getRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.createRoom(request));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id,
                                                   @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    // ── Soutenances ───────────────────────────────────────────────────────────

    @GetMapping("/defenses")
    public ResponseEntity<List<DefenseResponse>> getDefenses() {
        return ResponseEntity.ok(defenseService.getAllDefenses());
    }

    @GetMapping("/defenses/{id}")
    public ResponseEntity<DefenseResponse> getDefense(@PathVariable Long id) {
        return ResponseEntity.ok(defenseService.getDefense(id));
    }

    @PostMapping("/defenses/schedule")
    public ResponseEntity<?> scheduleDefense(@Valid @RequestBody ScheduleDefenseRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(defenseService.scheduleDefense(request));
        } catch (ConflictException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", ex.getMessage(), "conflicts", ex.getConflicts()));
        }
    }

    @PutMapping("/defenses/{id}")
    public ResponseEntity<?> updateDefense(@PathVariable Long id,
                                           @Valid @RequestBody ScheduleDefenseRequest request) {
        try {
            return ResponseEntity.ok(defenseService.updateDefense(id, request));
        } catch (ConflictException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", ex.getMessage(), "conflicts", ex.getConflicts()));
        }
    }

    @DeleteMapping("/defenses/{id}")
    public ResponseEntity<Void> deleteDefense(@PathVariable Long id) {
        defenseService.deleteDefense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/defenses/conflicts")
    public ResponseEntity<List<ConflictException.ConflictDetail>> getDefenseConflicts() {
        return ResponseEntity.ok(defenseService.getAllConflicts());
    }

    @PutMapping("/defenses/publish")
    public ResponseEntity<?> publishDefenses() {
        try {
            return ResponseEntity.ok(defenseService.publishAll());
        } catch (ConflictException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", ex.getMessage(), "conflicts", ex.getConflicts()));
        }
    }

    // ── Rapports visibles ─────────────────────────────────────────────────────

    @GetMapping("/reports/visible")
    public ResponseEntity<List<VisibleReportResponse>> getVisibleReports() {
        return ResponseEntity.ok(reportService.getVisibleReports());
    }

    @GetMapping("/reports/visible/{id}")
    public ResponseEntity<VisibleReportResponse> getVisibleReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getVisibleReport(id));
    }

    @GetMapping("/reports/visible/{id}/download")
    public ResponseEntity<byte[]> downloadVisibleReport(@PathVariable Long id) throws IOException {
        String filename = reportService.getDownloadFilename(id);
        return download(reportService.downloadVisibleReport(id), filename, MediaType.APPLICATION_PDF_VALUE);
    }

    // ── Export ────────────────────────────────────────────────────────────────

    @GetMapping("/export/planning/csv")
    public ResponseEntity<byte[]> exportPlanningCsv() {
        return download(exportService.exportCsv(), "planning-soutenances.csv", "text/csv");
    }

    @GetMapping("/export/planning/pdf")
    public ResponseEntity<byte[]> exportPlanningPdf() throws IOException {
        return download(exportService.exportPdf(), "planning-soutenances.pdf", MediaType.APPLICATION_PDF_VALUE);
    }

    @GetMapping("/export/planning/excel")
    public ResponseEntity<byte[]> exportPlanningExcel() throws IOException {
        return download(exportService.exportExcel(), "planning-soutenances.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    // Alias de compatibilité avec les anciens écrans.
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdfLegacy() throws IOException {
        return exportPlanningPdf();
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcelLegacy() throws IOException {
        return exportPlanningExcel();
    }

    // ── Chatbot ───────────────────────────────────────────────────────────────

    @GetMapping("/chatbot/suggestions")
    public ResponseEntity<List<String>> getChatbotSuggestions() {
        return ResponseEntity.ok(chatbotService.getSuggestions());
    }

    @PostMapping("/chatbot/ask")
    public ResponseEntity<ChatbotAnswerResponse> askChatbot(
            @Valid @RequestBody ChatbotAskRequest request) {
        return ResponseEntity.ok(chatbotService.ask(request.question()));
    }

    private ResponseEntity<byte[]> download(byte[] bytes, String filename, String contentType) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
    }
}

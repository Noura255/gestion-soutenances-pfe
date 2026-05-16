package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.*;
import com.pfe.defense.administration.exception.ConflictException;
import com.pfe.defense.administration.repository.AdminUserQueryRepository;
import com.pfe.defense.user.Role;
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
    private final AdministrationChatbotService   chatbotService;
    private final AdminUserQueryRepository       userRepo;

    public AdministrationController(AdministrationDashboardService dashboardService,
                                    AdministrationProjectService projectService,
                                    AdministrationJuryService juryService,
                                    AdministrationRoomService roomService,
                                    AdministrationDefenseService defenseService,
                                    AdministrationExportService exportService,
                                    AdministrationChatbotService chatbotService,
                                    AdminUserQueryRepository userRepo) {
        this.dashboardService = dashboardService;
        this.projectService   = projectService;
        this.juryService      = juryService;
        this.roomService      = roomService;
        this.defenseService   = defenseService;
        this.exportService    = exportService;
        this.chatbotService   = chatbotService;
        this.userRepo         = userRepo;
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

    // ── Jury ──────────────────────────────────────────────────────────────────

    @PostMapping("/projects/{id}/assign-jury")
    public ResponseEntity<JuryAssignmentResponse> assignJury(
            @PathVariable Long id,
            @Valid @RequestBody JuryAssignRequest request) {
        return ResponseEntity.ok(juryService.assignJury(id, request));
    }

    @GetMapping("/jury")
    public ResponseEntity<List<JuryAssignmentResponse>> getAllJuryAssignments() {
        return ResponseEntity.ok(juryService.getAllJuryAssignments());
    }

    @GetMapping("/jury/eligible-members")
    public ResponseEntity<List<UserSummary>> getEligibleJuryMembers() {
        List<User> users = userRepo.findAllByRoleIn(List.of(Role.JURY, Role.SUPERVISOR));
        List<UserSummary> summaries = users.stream()
                .map(u -> new UserSummary(u.getId(), u.getFirstName(), u.getLastName(),
                        u.getEmail(), u.getRole().name()))
                .toList();
        return ResponseEntity.ok(summaries);
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

    @PutMapping("/defenses/publish")
    public ResponseEntity<PublishResponse> publishDefenses() {
        return ResponseEntity.ok(defenseService.publishAll());
    }

    // ── Export ────────────────────────────────────────────────────────────────

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf() throws IOException {
        byte[] pdf = exportService.exportPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"planning-soutenances.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/export/excel")
    public ResponseEntity<byte[]> exportExcel() throws IOException {
        byte[] excel = exportService.exportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"planning-soutenances.xlsx\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
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
}

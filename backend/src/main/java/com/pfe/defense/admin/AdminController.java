package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.*;
import com.pfe.defense.user.Role;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    private final UserImportExportService userImportExportService;
    private final SystemSettingsService systemSettingsService;
    private final NotificationService notificationService;
    private final AdminBackupService adminBackupService;
    private final AcademicStructureService academicStructureService;
    private final AdminChatbotService adminChatbotService;
    private final SecurityAlertService securityAlertService;

    public AdminController(AdminService adminService, UserImportExportService userImportExportService,
                           SystemSettingsService systemSettingsService, NotificationService notificationService,
                           AdminBackupService adminBackupService, AcademicStructureService academicStructureService,
                           AdminChatbotService adminChatbotService, SecurityAlertService securityAlertService) {
        this.adminService = adminService;
        this.userImportExportService = userImportExportService;
        this.systemSettingsService = systemSettingsService;
        this.notificationService = notificationService;
        this.adminBackupService = adminBackupService;
        this.academicStructureService = academicStructureService;
        this.adminChatbotService = adminChatbotService;
        this.securityAlertService = securityAlertService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard() {
        return adminService.dashboard();
    }

    @GetMapping("/users")
    public List<UserResponse> users(@RequestParam(required = false) String search,
                                    @RequestParam(required = false) Role role,
                                    @RequestParam(required = false) String department,
                                    @RequestParam(required = false) Boolean enabled) {
        return adminService.listUsers(search, role, department, enabled);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody UserRequest request) {
        return adminService.createUser(request);
    }

    @PutMapping("/users/{id}")
    public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody UserRequest request) {
        return adminService.updateUser(id, request);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }

    @PutMapping("/users/{id}/disable")
    public UserResponse disableUser(@PathVariable Long id) {
        return adminService.disableUser(id);
    }

    @PutMapping("/users/{id}/enable")
    public UserResponse enableUser(@PathVariable Long id) {
        return adminService.enableUser(id);
    }

    @PutMapping("/users/{id}/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@PathVariable Long id, @Valid @RequestBody PasswordResetRequest request) {
        adminService.resetPassword(id, request);
    }

    @PostMapping(value = "/users/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserImportResponse importUsers(@RequestPart("file") MultipartFile file) {
        return userImportExportService.importUsers(file);
    }

    @GetMapping("/users/export/csv")
    public ResponseEntity<byte[]> exportUsersCsv() {
        return download(userImportExportService.exportCsv(), "users.csv", "text/csv");
    }

    @GetMapping("/users/export/excel")
    public ResponseEntity<byte[]> exportUsersExcel() {
        return download(userImportExportService.exportExcel(), "users.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    @GetMapping("/users/export/pdf")
    public ResponseEntity<byte[]> exportUsersPdf() {
        return download(userImportExportService.exportPdf(), "users.pdf", MediaType.APPLICATION_PDF_VALUE);
    }

    @GetMapping("/roles")
    public List<Role> roles() {
        return adminService.listRoles();
    }

    @GetMapping("/logs")
    public List<AuditLogResponse> logs() {
        return adminService.listLogs();
    }

    @GetMapping("/login-history")
    public List<LoginHistoryResponse> loginHistory() {
        return adminService.loginHistory();
    }

    @GetMapping("/settings")
    public SystemSettingsResponse settings() {
        return systemSettingsService.getSettings();
    }

    @PutMapping("/settings")
    public SystemSettingsResponse updateSettings(@Valid @RequestBody SystemSettingsRequest request) {
        return systemSettingsService.updateSettings(request);
    }

    @PostMapping("/notifications")
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponse createNotification(@Valid @RequestBody NotificationRequest request) {
        return notificationService.create(request);
    }

    @GetMapping("/notifications")
    public List<NotificationResponse> notifications() {
        return notificationService.list();
    }

    @GetMapping("/backup")
    public ResponseEntity<byte[]> backup() {
        return download(adminBackupService.backup(), "sg-soutenance-backup.json", MediaType.APPLICATION_JSON_VALUE);
    }

    @GetMapping("/departments")
    public List<DepartmentResponse> departments() {
        return academicStructureService.departments();
    }

    @PostMapping("/departments")
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentResponse createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return academicStructureService.createDepartment(request);
    }

    @PutMapping("/departments/{id}")
    public DepartmentResponse updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
        return academicStructureService.updateDepartment(id, request);
    }

    @DeleteMapping("/departments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDepartment(@PathVariable Long id) {
        academicStructureService.deleteDepartment(id);
    }

    @GetMapping("/fields")
    public List<FieldResponse> fields() {
        return academicStructureService.fields();
    }

    @PostMapping("/fields")
    @ResponseStatus(HttpStatus.CREATED)
    public FieldResponse createField(@Valid @RequestBody FieldRequest request) {
        return academicStructureService.createField(request);
    }

    @PutMapping("/fields/{id}")
    public FieldResponse updateField(@PathVariable Long id, @Valid @RequestBody FieldRequest request) {
        return academicStructureService.updateField(id, request);
    }

    @DeleteMapping("/fields/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteField(@PathVariable Long id) {
        academicStructureService.deleteField(id);
    }

    @GetMapping("/academic-years")
    public List<AcademicYearResponse> academicYears() {
        return academicStructureService.academicYears();
    }

    @PostMapping("/academic-years")
    @ResponseStatus(HttpStatus.CREATED)
    public AcademicYearResponse createAcademicYear(@Valid @RequestBody AcademicYearRequest request) {
        return academicStructureService.createAcademicYear(request);
    }

    @PutMapping("/academic-years/{id}")
    public AcademicYearResponse updateAcademicYear(@PathVariable Long id, @Valid @RequestBody AcademicYearRequest request) {
        return academicStructureService.updateAcademicYear(id, request);
    }

    @DeleteMapping("/academic-years/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAcademicYear(@PathVariable Long id) {
        academicStructureService.deleteAcademicYear(id);
    }

    @GetMapping("/chatbot/suggestions")
    public List<String> chatbotSuggestions() {
        return adminChatbotService.suggestions();
    }

    @PostMapping("/chatbot/ask")
    public ChatbotAnswerResponse askChatbot(@Valid @RequestBody ChatbotAskRequest request) {
        return adminChatbotService.ask(request.question());
    }

    @GetMapping("/security-alerts")
    public List<SecurityAlertResponse> securityAlerts() {
        return securityAlertService.getAlerts();
    }

    private ResponseEntity<byte[]> download(byte[] bytes, String filename, String contentType) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(bytes);
    }
}

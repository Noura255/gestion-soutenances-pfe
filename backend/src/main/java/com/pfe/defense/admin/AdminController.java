package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.*;
import com.pfe.defense.user.Role;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public AdminDashboardResponse dashboard() {
        return adminService.dashboard();
    }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return adminService.listUsers();
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

    @GetMapping("/roles")
    public List<Role> roles() {
        return adminService.listRoles();
    }

    @GetMapping("/logs")
    public List<AuditLogResponse> logs() {
        return adminService.listLogs();
    }
}

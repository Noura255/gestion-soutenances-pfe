package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.*;
import com.pfe.defense.audit.AuditLogRepository;
import com.pfe.defense.audit.AuditLogService;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.defense.DefenseRepository;
import com.pfe.defense.project.ProjectRepository;
import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AdminService {
    private static final String PRIMARY_ADMIN_EMAIL = "admin@sgsoutenance.com";

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final ProjectRepository projectRepository;
    private final DefenseRepository defenseRepository;
    private final SecurityAlertService securityAlertService;
    private final AdminChatbotService adminChatbotService;

    public AdminService(UserRepository userRepository, AuditLogRepository auditLogRepository,
                        AuditLogService auditLogService, PasswordEncoder passwordEncoder,
                        ProjectRepository projectRepository, DefenseRepository defenseRepository,
                        SecurityAlertService securityAlertService, AdminChatbotService adminChatbotService) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
        this.projectRepository = projectRepository;
        this.defenseRepository = defenseRepository;
        this.securityAlertService = securityAlertService;
        this.adminChatbotService = adminChatbotService;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        Map<Role, Long> usersByRole = new EnumMap<>(Role.class);
        Arrays.stream(Role.values()).forEach(role -> usersByRole.put(role, userRepository.countByRole(role)));
        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByRole(Role.STUDENT),
                userRepository.countByRole(Role.SUPERVISOR),
                userRepository.countByRole(Role.JURY),
                userRepository.countByRole(Role.ADMINISTRATION),
                userRepository.countByRole(Role.ADMIN),
                userRepository.countByEnabledTrue(),
                userRepository.countByEnabledFalse(),
                projectRepository.count(),
                defenseRepository.count(),
                auditLogRepository.countByModuleAndAction("AUTH", "LOGIN_FAILED"),
                usersByRole,
                auditLogRepository.findTop5ByModuleAndActionOrderByCreatedAtDesc("AUTH", "LOGIN_FAILED")
                        .stream().map(this::toLoginHistory).toList(),
                securityAlertService.getAlerts(),
                adminChatbotService.suggestions(),
                auditLogRepository.findTop10ByOrderByCreatedAtDesc().stream().map(AuditLogResponse::from).toList()
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers(String search, Role role, String department, Boolean enabled) {
        return userRepository.searchUsers(blankToNull(search), role, blankToNull(department), enabled)
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("Un utilisateur avec cet email existe déjà.");
        }
        if (request.password() == null || request.password().isBlank() || request.password().length() < 8) {
            throw new BadRequestException("Le mot de passe initial doit contenir au moins 8 caractères.");
        }
        User user = new User();
        applyRequest(user, request);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setEnabled(true);
        User saved = userRepository.save(user);
        auditLogService.log("CREATE", "ADMIN_USER", "Création de l'utilisateur " + saved.getEmail(), currentActor());
        return UserResponse.from(saved);
    }

    public UserResponse updateUser(Long id, UserRequest request) {
        User user = findUser(id);
        assertNotPrimaryAdmin(user);
        userRepository.findByEmailIgnoreCase(request.email())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new BadRequestException("Un autre utilisateur utilise déjà cet email.");
                });
        applyRequest(user, request);
        if (request.password() != null && !request.password().isBlank()) {
            if (request.password().length() < 8) {
                throw new BadRequestException("Le mot de passe doit contenir au moins 8 caractères.");
            }
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        User saved = userRepository.save(user);
        auditLogService.log("UPDATE", "ADMIN_USER", "Modification de l'utilisateur " + saved.getEmail(), currentActor());
        return UserResponse.from(saved);
    }

    public void deleteUser(Long id) {
        User user = findUser(id);
        assertNotPrimaryAdmin(user);
        if (user.getRole() == Role.ADMIN && user.getEmail().equals(currentActor())) {
            throw new BadRequestException("Un administrateur ne peut pas supprimer son propre compte.");
        }
        userRepository.delete(user);
        auditLogService.log("DELETE", "ADMIN_USER", "Suppression de l'utilisateur " + user.getEmail(), currentActor());
    }

    public UserResponse disableUser(Long id) {
        User user = findUser(id);
        assertNotPrimaryAdmin(user);
        if (user.getRole() == Role.ADMIN && user.getEmail().equals(currentActor())) {
            throw new BadRequestException("Un administrateur ne peut pas désactiver son propre compte.");
        }
        user.setEnabled(false);
        User saved = userRepository.save(user);
        auditLogService.log("DISABLE", "ADMIN_USER", "Désactivation de l'utilisateur " + saved.getEmail(), currentActor());
        return UserResponse.from(saved);
    }

    public UserResponse enableUser(Long id) {
        User user = findUser(id);
        user.setEnabled(true);
        User saved = userRepository.save(user);
        auditLogService.log("ENABLE", "ADMIN_USER", "Réactivation de l'utilisateur " + saved.getEmail(), currentActor());
        return UserResponse.from(saved);
    }

    public void resetPassword(Long id, PasswordResetRequest request) {
        User user = findUser(id);
        assertNotPrimaryAdmin(user);
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        auditLogService.log("RESET_PASSWORD", "ADMIN_USER", "Réinitialisation du mot de passe pour " + user.getEmail(), currentActor());
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> listLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AuditLogResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LoginHistoryResponse> loginHistory() {
        return auditLogRepository.findByModuleAndActionInOrderByCreatedAtDesc("AUTH", List.of("LOGIN", "LOGIN_SUCCESS", "LOGIN_FAILED"))
                .stream()
                .map(this::toLoginHistory)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Role> listRoles() {
        return Arrays.asList(Role.values());
    }

    private LoginHistoryResponse toLoginHistory(com.pfe.defense.audit.AuditLog log) {
        Role role = userRepository.findByEmailIgnoreCase(log.getPerformedBy()).map(User::getRole).orElse(null);
        String status = "LOGIN_FAILED".equals(log.getAction()) ? "FAILED" : "SUCCESS";
        return new LoginHistoryResponse(log.getPerformedBy(), role, status, log.getDescription(), log.getCreatedAt());
    }

    private void applyRequest(User user, UserRequest request) {
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email().trim().toLowerCase());
        user.setRole(request.role());
        user.setDepartment(request.department());
        user.setPhone(request.phone());
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id));
    }

    private void assertNotPrimaryAdmin(User user) {
        if (PRIMARY_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail())) {
            throw new BadRequestException("L'administrateur principal ne peut pas être modifié.");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.*;
import com.pfe.defense.audit.AuditLogRepository;
import com.pfe.defense.audit.AuditLogService;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@Transactional
public class AdminService {
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository, AuditLogRepository auditLogRepository,
                        AuditLogService auditLogService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse dashboard() {
        return new AdminDashboardResponse(
                userRepository.count(),
                userRepository.countByRole(Role.STUDENT),
                userRepository.countByRole(Role.SUPERVISOR),
                userRepository.countByRole(Role.JURY),
                userRepository.countByRole(Role.ADMINISTRATION),
                auditLogRepository.findTop10ByOrderByCreatedAtDesc().stream().map(AuditLogResponse::from).toList()
        );
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
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
        userRepository.findByEmail(request.email())
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
        if (user.getRole() == Role.ADMIN && user.getEmail().equals(currentActor())) {
            throw new BadRequestException("Un administrateur ne peut pas supprimer son propre compte.");
        }
        userRepository.delete(user);
        auditLogService.log("DELETE", "ADMIN_USER", "Suppression de l'utilisateur " + user.getEmail(), currentActor());
    }

    public UserResponse disableUser(Long id) {
        User user = findUser(id);
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
    public List<Role> listRoles() {
        return Arrays.asList(Role.values());
    }

    private void applyRequest(User user, UserRequest request) {
        user.setFirstName(request.firstName());
        user.setLastName(request.lastName());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setDepartment(request.department());
        user.setPhone(request.phone());
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id " + id));
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

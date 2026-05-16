package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.SecurityAlertResponse;
import com.pfe.defense.audit.AuditLog;
import com.pfe.defense.audit.AuditLogRepository;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class SecurityAlertService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public SecurityAlertService(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    public List<SecurityAlertResponse> getAlerts() {
        Map<String, Long> failuresByEmail = auditLogRepository
                .findByModuleAndActionOrderByCreatedAtDesc("AUTH", "LOGIN_FAILED")
                .stream()
                .collect(Collectors.groupingBy(AuditLog::getPerformedBy, Collectors.counting()));

        return failuresByEmail.entrySet().stream()
                .filter(entry -> entry.getValue() >= 3)
                .map(entry -> {
                    User user = userRepository.findByEmailIgnoreCase(entry.getKey()).orElse(null);
                    String severity = entry.getValue() >= 5 ? "HIGH" : entry.getValue() == 4 ? "MEDIUM" : "LOW";
                    return new SecurityAlertResponse(
                            user == null ? null : user.getId(),
                            entry.getKey(),
                            user == null ? null : user.getRole(),
                            entry.getValue(),
                            severity,
                            "Plusieurs tentatives de connexion échouées détectées pour " + entry.getKey() + ". Voulez-vous désactiver ce compte ?"
                    );
                })
                .sorted(Comparator.comparingLong(SecurityAlertResponse::failedAttempts).reversed())
                .toList();
    }
}

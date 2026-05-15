package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.ChatbotAnswerResponse;
import com.pfe.defense.audit.AuditLogRepository;
import com.pfe.defense.user.Role;
import com.pfe.defense.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional(readOnly = true)
public class AdminChatbotService {
    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final SecurityAlertService securityAlertService;

    public AdminChatbotService(UserRepository userRepository, AuditLogRepository auditLogRepository,
                               SecurityAlertService securityAlertService) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.securityAlertService = securityAlertService;
    }

    public List<String> suggestions() {
        return List.of(
                "Combien d'utilisateurs sont désactivés ?",
                "Quels rôles ont le plus d'utilisateurs ?",
                "Y a-t-il des connexions échouées ?",
                "Quels comptes doivent être surveillés ?",
                "Comment importer des utilisateurs ?",
                "Comment exporter les données ?",
                "Comment réinitialiser un mot de passe ?"
        );
    }

    public ChatbotAnswerResponse ask(String question) {
        String normalized = normalize(question);
        String answer;
        if (normalized.contains("desactive")) {
            answer = userRepository.countByEnabledFalse() + " compte(s) sont actuellement désactivés.";
        } else if (normalized.contains("roles") && (normalized.contains("plus") || normalized.contains("utilisateurs"))) {
            Map<Role, Long> counts = Stream.of(Role.values())
                    .collect(Collectors.toMap(role -> role, userRepository::countByRole));
            Map.Entry<Role, Long> max = counts.entrySet().stream()
                    .max(Comparator.comparingLong(Map.Entry::getValue))
                    .orElseThrow();
            answer = "Le rôle le plus représenté est " + max.getKey() + " avec " + max.getValue() + " utilisateur(s).";
        } else if (normalized.contains("connexions echouees") || normalized.contains("connexion echouee")) {
            long failures = auditLogRepository.countByModuleAndAction("AUTH", "LOGIN_FAILED");
            answer = failures == 0
                    ? "Aucune connexion échouée n'est enregistrée."
                    : "Oui. " + failures + " tentative(s) de connexion échouée(s) sont enregistrée(s).";
        } else if (normalized.contains("surveilles") || normalized.contains("surveiller")) {
            List<String> emails = securityAlertService.getAlerts().stream().map(alert -> alert.email()).toList();
            answer = emails.isEmpty()
                    ? "Aucun compte ne dépasse actuellement le seuil de surveillance."
                    : "Comptes à surveiller : " + String.join(", ", emails) + ".";
        } else if (normalized.contains("import")) {
            answer = "Ouvrez Import utilisateurs, déposez un CSV ou Excel contenant firstName, lastName, email, role, department et phone ; les doublons sont ignorés.";
        } else if (normalized.contains("export")) {
            answer = "Depuis Gestion utilisateurs, utilisez les boutons CSV, Excel ou PDF. Pour un export global, utilisez Sauvegarde JSON dans le dashboard.";
        } else if (normalized.contains("reinitialiser") || normalized.contains("mot de passe")) {
            answer = "Dans Gestion utilisateurs, cliquez sur Reset MDP pour définir un nouveau mot de passe encodé côté serveur.";
        } else {
            answer = "Je peux aider sur les comptes désactivés, les rôles, les connexions échouées, les imports, les exports et les réinitialisations de mot de passe.";
        }
        return new ChatbotAnswerResponse(question, answer);
    }

    private String normalize(String value) {
        String noAccent = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return noAccent.toLowerCase(Locale.ROOT);
    }
}

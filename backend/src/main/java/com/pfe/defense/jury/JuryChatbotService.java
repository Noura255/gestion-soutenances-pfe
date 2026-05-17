package com.pfe.defense.jury;

import com.pfe.defense.common.UnauthorizedActionException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.evaluation.Evaluation;
import com.pfe.defense.evaluation.EvaluationRepository;
import com.pfe.defense.evaluation.EvaluationStatus;
import com.pfe.defense.jury.dto.ChatbotAnswerResponse;
import com.pfe.defense.jury.dto.DefenseSummaryDTO;
import com.pfe.defense.jury.dto.JuryEvaluationStatus;
import com.pfe.defense.jury.dto.ReportAccessStatus;
import com.pfe.defense.project.Project;
import com.pfe.defense.report.Report;
import com.pfe.defense.report.ReportRepository;
import com.pfe.defense.report.ReportStatus;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@Transactional(readOnly = true)
public class JuryChatbotService {
    private final JuryRepository juryRepository;
    private final ReportRepository reportRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    public JuryChatbotService(JuryRepository juryRepository,
                              ReportRepository reportRepository,
                              EvaluationRepository evaluationRepository,
                              UserRepository userRepository) {
        this.juryRepository = juryRepository;
        this.reportRepository = reportRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
    }

    public List<String> suggestions() {
        return List.of(
                "Quels rapports sont disponibles ?",
                "Quelle est ma prochaine soutenance ?",
                "Combien d'évaluations restent à compléter ?",
                "Quelles évaluations sont déjà soumises ?",
                "Pourquoi je ne vois pas un rapport ?",
                "Comment saisir une note ?",
                "Combien de soutenances me sont affectées ?",
                "Quelles soutenances sont prévues cette semaine ?"
        );
    }

    public ChatbotAnswerResponse ask(String question) {
        User juryMember = currentJuryMember();
        List<DefenseSummaryDTO> summaries = getDefenseSummaries(juryMember);
        String normalized = normalize(question);
        String answer = processQuestion(normalized, summaries, juryMember);
        return new ChatbotAnswerResponse(question, answer);
    }

    private String processQuestion(String normalized, List<DefenseSummaryDTO> summaries, User juryMember) {
        // Questions sur les rapports
        if (normalized.contains("rapport") && normalized.contains("disponible")) {
            return answerAvailableReports(summaries);
        }
        
        if (normalized.contains("pourquoi") && normalized.contains("rapport")) {
            return "Un rapport reste masqué tant que l'encadrant n'a pas activé sa visibilité pour le jury. " +
                   "Le système affiche alors \"Rapport non encore disponible\". " +
                   "Contactez l'administration si vous pensez qu'un rapport devrait être visible.";
        }

        // Questions sur les soutenances
        if (normalized.contains("prochaine") && normalized.contains("soutenance")) {
            return answerNextDefense(summaries);
        }
        
        if (normalized.contains("combien") && normalized.contains("soutenance") && normalized.contains("affectee")) {
            return answerTotalDefenses(summaries);
        }
        
        if (normalized.contains("soutenance") && normalized.contains("semaine")) {
            return answerDefensesThisWeek(summaries);
        }

        // Questions sur les évaluations
        if (normalized.contains("evaluation") && (normalized.contains("completer") || normalized.contains("restent"))) {
            return answerPendingEvaluations(summaries);
        }
        
        if (normalized.contains("evaluation") && (normalized.contains("soumise") || normalized.contains("envoyee"))) {
            return answerSubmittedEvaluations(summaries);
        }

        // Questions sur la procédure
        if (normalized.contains("saisir") || normalized.contains("note")) {
            return "Pour saisir une évaluation : " +
                   "1. Ouvrez la page Soutenances, " +
                   "2. Cliquez sur une soutenance, " +
                   "3. Cliquez sur le bouton Évaluer, " +
                   "4. Renseignez les quatre notes sur 20 (présentation, rapport, technique, communication), " +
                   "5. La note finale est calculée automatiquement (moyenne des 4 notes), " +
                   "6. Choisissez la décision (ADMIS, AJOURNÉ, REFUSÉ), " +
                   "7. Ajoutez des remarques si nécessaire, " +
                   "8. Enregistrez un brouillon ou soumettez définitivement. " +
                   "Une fois soumise, l'évaluation ne peut plus être modifiée.";
        }

        // Question générale sur les soutenances
        if (normalized.contains("soutenance")) {
            return answerAllDefenses(summaries);
        }

        // Réponse par défaut
        return "Je peux vous aider sur : " +
               "les rapports disponibles, " +
               "vos soutenances affectées, " +
               "la prochaine soutenance, " +
               "les évaluations à compléter, " +
               "les évaluations soumises, " +
               "et la procédure de saisie des notes. " +
               "Posez-moi une question spécifique !";
    }

    private String answerAvailableReports(List<DefenseSummaryDTO> summaries) {
        List<String> availableReports = summaries.stream()
                .filter(summary -> summary.reportStatus() == ReportAccessStatus.AVAILABLE)
                .map(DefenseSummaryDTO::projectTitle)
                .toList();
        
        if (availableReports.isEmpty()) {
            return "Aucun rapport n'est disponible pour le moment. " +
                   "Les rapports seront visibles une fois que les encadrants les auront rendus accessibles au jury.";
        }
        
        return "Vous avez accès à " + availableReports.size() + " rapport(s) : " +
               String.join(", ", availableReports) + ".";
    }

    private String answerNextDefense(List<DefenseSummaryDTO> summaries) {
        DefenseSummaryDTO nextDefense = summaries.stream()
                .filter(summary -> summary.date() != null && !summary.date().isBefore(LocalDate.now()))
                .findFirst()
                .orElse(null);
        
        if (nextDefense == null) {
            return "Aucune soutenance à venir n'est planifiée actuellement. " +
                   "Consultez régulièrement votre tableau de bord pour les mises à jour.";
        }
        
        String dateFormatted = nextDefense.date().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String timeInfo = nextDefense.time() == null ? "une heure non définie" : nextDefense.time().toString();
        String roomInfo = nextDefense.room() == null ? "une salle non définie" : nextDefense.room();
        
        return "Votre prochaine soutenance concerne le projet \"" + nextDefense.projectTitle() + 
               "\" de " + nextDefense.studentName() + 
               ", prévue le " + dateFormatted + 
               " à " + timeInfo + 
               " en salle " + roomInfo + ".";
    }

    private String answerTotalDefenses(List<DefenseSummaryDTO> summaries) {
        int total = summaries.size();
        if (total == 0) {
            return "Aucune soutenance ne vous est actuellement affectée.";
        }
        
        long upcoming = summaries.stream()
                .filter(summary -> summary.date() != null && !summary.date().isBefore(LocalDate.now()))
                .count();
        long past = total - upcoming;
        
        return "Vous avez " + total + " soutenance(s) affectée(s) au total : " +
               upcoming + " à venir et " + past + " passée(s).";
    }

    private String answerDefensesThisWeek(List<DefenseSummaryDTO> summaries) {
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.plusDays(7);
        
        List<DefenseSummaryDTO> thisWeek = summaries.stream()
                .filter(summary -> summary.date() != null)
                .filter(summary -> !summary.date().isBefore(today) && summary.date().isBefore(endOfWeek))
                .toList();
        
        if (thisWeek.isEmpty()) {
            return "Aucune soutenance n'est prévue dans les 7 prochains jours.";
        }
        
        StringBuilder result = new StringBuilder("Vous avez " + thisWeek.size() + " soutenance(s) cette semaine : ");
        for (DefenseSummaryDTO defense : thisWeek) {
            String dateFormatted = defense.date().format(DateTimeFormatter.ofPattern("dd/MM"));
            result.append(defense.projectTitle())
                  .append(" (")
                  .append(dateFormatted)
                  .append("), ");
        }
        
        return result.substring(0, result.length() - 2) + ".";
    }

    private String answerPendingEvaluations(List<DefenseSummaryDTO> summaries) {
        long pending = summaries.stream()
                .filter(summary -> summary.evaluationStatus() != JuryEvaluationStatus.SUBMITTED)
                .count();
        
        if (pending == 0) {
            return "Félicitations ! Toutes vos évaluations sont déjà soumises.";
        }
        
        long draft = summaries.stream()
                .filter(summary -> summary.evaluationStatus() == JuryEvaluationStatus.DRAFT)
                .count();
        long notStarted = pending - draft;
        
        return pending + " évaluation(s) restent à compléter : " +
               notStarted + " non commencée(s) et " + draft + " en brouillon.";
    }

    private String answerSubmittedEvaluations(List<DefenseSummaryDTO> summaries) {
        List<String> submitted = summaries.stream()
                .filter(summary -> summary.evaluationStatus() == JuryEvaluationStatus.SUBMITTED)
                .map(DefenseSummaryDTO::projectTitle)
                .toList();
        
        if (submitted.isEmpty()) {
            return "Aucune évaluation n'a encore été soumise. " +
                   "Commencez par consulter les rapports disponibles et évaluer les soutenances.";
        }
        
        return "Vous avez soumis " + submitted.size() + " évaluation(s) : " +
               String.join(", ", submitted) + ".";
    }

    private String answerAllDefenses(List<DefenseSummaryDTO> summaries) {
        if (summaries.isEmpty()) {
            return "Aucune soutenance ne vous est actuellement affectée. " +
                   "Contactez l'administration si vous pensez qu'il y a une erreur.";
        }
        
        List<String> defenses = summaries.stream()
                .map(summary -> {
                    String dateInfo = summary.date() == null ? "date à planifier" : 
                                     summary.date().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                    return summary.projectTitle() + " (" + dateInfo + ")";
                })
                .toList();
        
        return "Soutenances affectées (" + summaries.size() + ") : " + String.join(", ", defenses) + ".";
    }

    private List<DefenseSummaryDTO> getDefenseSummaries(User juryMember) {
        return juryRepository.findAccessibleDefenses(juryMember).stream()
                .map(defense -> toDefenseSummary(defense, juryMember))
                .sorted(defenseSummaryComparator())
                .toList();
    }

    private DefenseSummaryDTO toDefenseSummary(Defense defense, User juryMember) {
        Report report = reportRepository.findByProject(defense.getProject()).orElse(null);
        Evaluation evaluation = evaluationRepository.findByProjectAndJuryMember(defense.getProject(), juryMember).orElse(null);
        return new DefenseSummaryDTO(
                defense.getId(),
                fullName(defense.getProject().getStudent()),
                defense.getProject().getTitle(),
                fullName(defense.getProject().getSupervisor()),
                defense.getDefenseDate(),
                defense.getStartTime(),
                defense.getRoom() == null ? null : defense.getRoom().getName(),
                reportStatus(report),
                evaluationStatus(evaluation)
        );
    }

    private ReportAccessStatus reportStatus(Report report) {
        return isReportVisibleToJury(report) ? ReportAccessStatus.AVAILABLE : ReportAccessStatus.UNAVAILABLE;
    }

    private boolean isReportVisibleToJury(Report report) {
        return report != null
                && report.isVisibleToJury()
                && report.getStatus() == ReportStatus.VISIBLE_TO_JURY;
    }

    private JuryEvaluationStatus evaluationStatus(Evaluation evaluation) {
        if (evaluation == null) {
            return JuryEvaluationStatus.NOT_STARTED;
        }
        return evaluation.getStatus() == EvaluationStatus.SUBMITTED
                ? JuryEvaluationStatus.SUBMITTED
                : JuryEvaluationStatus.DRAFT;
    }

    private Comparator<DefenseSummaryDTO> defenseSummaryComparator() {
        return Comparator
                .comparing(DefenseSummaryDTO::date, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(DefenseSummaryDTO::time, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(DefenseSummaryDTO::projectTitle, Comparator.nullsLast(String::compareToIgnoreCase));
    }

    private String fullName(User user) {
        return user == null ? null : (user.getFirstName() + " " + user.getLastName()).trim();
    }

    private User currentJuryMember() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedActionException("Utilisateur jury non authentifié.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UnauthorizedActionException("Utilisateur jury introuvable."));
    }

    private String normalize(String value) {
        String noAccent = Normalizer.normalize(value, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return noAccent.toLowerCase(Locale.ROOT);
    }
}

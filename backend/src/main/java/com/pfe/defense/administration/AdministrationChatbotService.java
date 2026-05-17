package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.ChatbotAnswerResponse;
import com.pfe.defense.administration.exception.ConflictException;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.administration.repository.AdminReportQueryRepository;
import com.pfe.defense.administration.repository.AdminRoomQueryRepository;
import com.pfe.defense.project.Project;
import com.pfe.defense.report.Report;
import com.pfe.defense.room.Room;
import com.pfe.defense.defense.DefenseStatus;
import com.pfe.defense.project.ProjectStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdministrationChatbotService {

    private final AdminProjectQueryRepository  projectRepo;
    private final AdminReportQueryRepository   reportRepo;
    private final AdminRoomQueryRepository     roomRepo;
    private final AdministrationDashboardService dashboardService;

    public AdministrationChatbotService(AdminProjectQueryRepository projectRepo,
                                        AdminReportQueryRepository reportRepo,
                                        AdminRoomQueryRepository roomRepo,
                                        AdministrationDashboardService dashboardService) {
        this.projectRepo      = projectRepo;
        this.reportRepo       = reportRepo;
        this.roomRepo         = roomRepo;
        this.dashboardService = dashboardService;
    }

    public List<String> getSuggestions() {
        return List.of(
                "Quels projets n'ont pas encore de jury ?",
                "Quelles soutenances ne sont pas planifiées ?",
                "Combien de rapports sont visibles ?",
                "Y a-t-il des conflits de planning ?",
                "Quelles salles sont disponibles ?",
                "Comment affecter un jury ?",
                "Comment publier le planning ?"
        );
    }

    public ChatbotAnswerResponse ask(String question) {
        String normalized = normalize(question);
        String answer;

        if (normalized.contains("jury") && (normalized.contains("pas") || normalized.contains("sans"))) {
            answer = answerProjectsWithoutJury();
        } else if (normalized.contains("soutenance") && normalized.contains("planifie")) {
            answer = answerUnscheduledDefenses();
        } else if (normalized.contains("combien") && normalized.contains("rapport") && normalized.contains("visible")) {
            answer = answerVisibleReports();
        } else if (normalized.contains("rapport") && (normalized.contains("visible") || normalized.contains("pas visible"))) {
            answer = answerReportsNotVisible();
        } else if (normalized.contains("conflit")) {
            answer = answerConflicts();
        } else if (normalized.contains("salle") && normalized.contains("disponible")) {
            answer = answerAvailableRooms();
        } else if (normalized.contains("comment") && normalized.contains("affecter") && normalized.contains("jury")) {
            answer = "Ouvrez la section Affectation des jurys, choisissez un projet, puis sélectionnez un président et deux examinateurs JURY distincts.";
        } else if (normalized.contains("comment") && normalized.contains("publier") && normalized.contains("planning")) {
            answer = "Publiez depuis la section Export planning après avoir résolu les conflits et vérifié que chaque soutenance planifiée possède une salle et un jury.";
        } else {
            answer = "Je peux répondre sur les projets sans jury, les soutenances non planifiées, " +
                    "les rapports visibles, les conflits, les salles disponibles et les procédures principales.";
        }

        return new ChatbotAnswerResponse(question, answer);
    }

    private String answerProjectsWithoutJury() {
        List<Project> projects = projectRepo.findAllWithoutJury();
        if (projects.isEmpty()) return "Tous les projets ont un jury affecté.";
        String titles = projects.stream().map(Project::getTitle).collect(Collectors.joining(", "));
        return projects.size() + " projet(s) sans jury : " + titles;
    }

    private String answerReportsNotVisible() {
        List<Report> reports = reportRepo.findAllNotVisibleToJury();
        if (reports.isEmpty()) return "Tous les rapports soumis sont visibles au jury.";
        return reports.size() + " rapport(s) non visible(s) au jury.";
    }

    private String answerUnscheduledDefenses() {
        long count = projectRepo.findAllWithDetails().stream()
                .filter(project -> project.getStatus() != ProjectStatus.DRAFT)
                .filter(project -> project.getDefense() == null
                        || project.getDefense().getStatus() == DefenseStatus.NOT_SCHEDULED)
                .count();
        return count == 0
                ? "Toutes les soutenances concernées sont planifiées."
                : count + " soutenance(s) ne sont pas encore planifiée(s).";
    }

    private String answerVisibleReports() {
        long count = reportRepo.countVisibleToJury();
        return count + " rapport(s) sont actuellement visibles au jury.";
    }

    private String answerConflicts() {
        List<ConflictException.ConflictDetail> conflicts = dashboardService.detectAllConflicts();
        if (conflicts.isEmpty()) return "Aucun conflit de planning détecté.";
        return conflicts.size() + " conflit(s) détecté(s) dans le planning.";
    }

    private String answerAvailableRooms() {
        List<Room> rooms = roomRepo.findAllByAvailableTrue();
        if (rooms.isEmpty()) return "Aucune salle disponible actuellement.";
        String names = rooms.stream().map(Room::getName).collect(Collectors.joining(", "));
        return rooms.size() + " salle(s) disponible(s) : " + names;
    }

    private String normalize(String input) {
        if (input == null) return "";
        String lower = input.toLowerCase();
        return Normalizer.normalize(lower, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }
}

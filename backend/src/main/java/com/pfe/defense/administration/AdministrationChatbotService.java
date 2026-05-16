package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.ChatbotAnswerResponse;
import com.pfe.defense.administration.exception.ConflictException;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.administration.repository.AdminReportQueryRepository;
import com.pfe.defense.administration.repository.AdminRoomQueryRepository;
import com.pfe.defense.project.Project;
import com.pfe.defense.report.Report;
import com.pfe.defense.room.Room;
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
                "Quels rapports ne sont pas encore visibles ?",
                "Y a-t-il des conflits de planning ?",
                "Quelles salles sont disponibles ?"
        );
    }

    public ChatbotAnswerResponse ask(String question) {
        String normalized = normalize(question);
        String answer;

        if (normalized.contains("jury") && (normalized.contains("pas") || normalized.contains("sans"))) {
            answer = answerProjectsWithoutJury();
        } else if (normalized.contains("rapport") && (normalized.contains("visible") || normalized.contains("pas visible"))) {
            answer = answerReportsNotVisible();
        } else if (normalized.contains("conflit")) {
            answer = answerConflicts();
        } else if (normalized.contains("salle") && normalized.contains("disponible")) {
            answer = answerAvailableRooms();
        } else {
            answer = "Je peux répondre sur : les projets sans jury, les rapports non visibles, " +
                     "les conflits de planning, les salles disponibles.";
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

package com.pfe.defense.jury;

import com.pfe.defense.evaluation.EvaluationStatus;
import com.pfe.defense.jury.dto.ChatbotAnswerResponse;
import com.pfe.defense.jury.dto.ChatbotAskRequest;
import com.pfe.defense.jury.dto.DashboardDTO;
import com.pfe.defense.jury.dto.DefenseDetailDTO;
import com.pfe.defense.jury.dto.DefenseSummaryDTO;
import com.pfe.defense.jury.dto.EvaluationRequestDTO;
import com.pfe.defense.jury.dto.EvaluationResponseDTO;
import com.pfe.defense.jury.dto.ReportDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/jury")
@PreAuthorize("hasRole('JURY')")
public class JuryController {
    private final JuryService juryService;

    public JuryController(JuryService juryService) {
        this.juryService = juryService;
    }

    @GetMapping("/dashboard")
    public DashboardDTO dashboard() {
        return juryService.getDashboard();
    }

    @GetMapping("/defenses")
    public List<DefenseSummaryDTO> defenses() {
        return juryService.getDefenses();
    }

    @GetMapping("/defenses/{id}")
    public DefenseDetailDTO defense(@PathVariable Long id) {
        return juryService.getDefense(id);
    }

    @GetMapping("/reports/{defenseId}")
    public ReportDTO report(@PathVariable Long defenseId) {
        return juryService.getReport(defenseId);
    }

    @PostMapping("/evaluations")
    @ResponseStatus(HttpStatus.CREATED)
    public EvaluationResponseDTO createEvaluation(@Valid @RequestBody EvaluationRequestDTO request,
                                                  @RequestParam(defaultValue = "DRAFT") EvaluationStatus status) {
        return juryService.createEvaluation(request, status);
    }

    @PutMapping("/evaluations/{id}/draft")
    public EvaluationResponseDTO updateDraft(@PathVariable Long id, @Valid @RequestBody EvaluationRequestDTO request) {
        return juryService.updateDraft(id, request);
    }

    @PutMapping("/evaluations/{id}/submit")
    public EvaluationResponseDTO submit(@PathVariable Long id, @Valid @RequestBody EvaluationRequestDTO request) {
        return juryService.submit(id, request);
    }

    @GetMapping("/chatbot/suggestions")
    public List<String> chatbotSuggestions() {
        return juryService.chatbotSuggestions();
    }

    @PostMapping("/chatbot/ask")
    public ChatbotAnswerResponse askChatbot(@Valid @RequestBody ChatbotAskRequest request) {
        return juryService.askChatbot(request.question());
    }
}

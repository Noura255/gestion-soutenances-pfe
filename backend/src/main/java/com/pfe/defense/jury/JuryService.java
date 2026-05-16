package com.pfe.defense.jury;

import com.pfe.defense.evaluation.EvaluationStatus;
import com.pfe.defense.jury.dto.ChatbotAnswerResponse;
import com.pfe.defense.jury.dto.DashboardDTO;
import com.pfe.defense.jury.dto.DefenseDetailDTO;
import com.pfe.defense.jury.dto.DefenseSummaryDTO;
import com.pfe.defense.jury.dto.EvaluationRequestDTO;
import com.pfe.defense.jury.dto.EvaluationResponseDTO;
import com.pfe.defense.jury.dto.ReportDTO;

import java.util.List;

public interface JuryService {
    DashboardDTO getDashboard();

    List<DefenseSummaryDTO> getDefenses();

    DefenseDetailDTO getDefense(Long defenseId);

    ReportDTO getReport(Long defenseId);

    EvaluationResponseDTO createEvaluation(EvaluationRequestDTO request, EvaluationStatus status);

    EvaluationResponseDTO updateDraft(Long evaluationId, EvaluationRequestDTO request);

    EvaluationResponseDTO submit(Long evaluationId, EvaluationRequestDTO request);

    List<String> chatbotSuggestions();

    ChatbotAnswerResponse askChatbot(String question);
}

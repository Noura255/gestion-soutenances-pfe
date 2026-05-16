package com.pfe.defense.jury;

import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.common.UnauthorizedActionException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.evaluation.Evaluation;
import com.pfe.defense.evaluation.EvaluationRepository;
import com.pfe.defense.evaluation.EvaluationStatus;
import com.pfe.defense.jury.dto.DashboardDTO;
import com.pfe.defense.jury.dto.DefenseDetailDTO;
import com.pfe.defense.jury.dto.DefenseSummaryDTO;
import com.pfe.defense.jury.dto.EvaluationRequestDTO;
import com.pfe.defense.jury.dto.EvaluationResponseDTO;
import com.pfe.defense.jury.dto.JuryEvaluationStatus;
import com.pfe.defense.jury.dto.ReportAccessStatus;
import com.pfe.defense.jury.dto.ReportDTO;
import com.pfe.defense.jury.dto.ReportVisibilityStatus;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class JuryServiceImpl implements JuryService {
    private static final String REPORT_UNAVAILABLE_MESSAGE = "Rapport non encore disponible";
    private static final String EVALUATION_ALREADY_SUBMITTED_MESSAGE = "Évaluation déjà soumise, modification interdite";

    private final JuryRepository juryRepository;
    private final ReportRepository reportRepository;
    private final EvaluationRepository evaluationRepository;
    private final UserRepository userRepository;

    public JuryServiceImpl(JuryRepository juryRepository,
                           ReportRepository reportRepository,
                           EvaluationRepository evaluationRepository,
                           UserRepository userRepository) {
        this.juryRepository = juryRepository;
        this.reportRepository = reportRepository;
        this.evaluationRepository = evaluationRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        User juryMember = currentJuryMember();
        List<Defense> defenses = juryRepository.findAccessibleDefenses(juryMember);

        List<DefenseSummaryDTO> summaries = defenses.stream()
                .map(defense -> toDefenseSummary(defense, juryMember))
                .toList();

        List<DefenseSummaryDTO> upcomingDefenses = summaries.stream()
                .filter(summary -> summary.date() != null && !summary.date().isBefore(LocalDate.now()))
                .sorted(defenseSummaryComparator())
                .toList();

        int availableReports = (int) summaries.stream()
                .filter(summary -> summary.reportStatus() == ReportAccessStatus.AVAILABLE)
                .count();
        int unavailableReports = summaries.size() - availableReports;
        int submittedEvaluations = (int) summaries.stream()
                .filter(summary -> summary.evaluationStatus() == JuryEvaluationStatus.SUBMITTED)
                .count();
        int pendingEvaluations = summaries.size() - submittedEvaluations;

        return new DashboardDTO(
                upcomingDefenses,
                availableReports,
                unavailableReports,
                pendingEvaluations,
                submittedEvaluations
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DefenseSummaryDTO> getDefenses() {
        User juryMember = currentJuryMember();
        return juryRepository.findAccessibleDefenses(juryMember).stream()
                .map(defense -> toDefenseSummary(defense, juryMember))
                .sorted(defenseSummaryComparator())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DefenseDetailDTO getDefense(Long defenseId) {
        User juryMember = currentJuryMember();
        Defense defense = findDefenseAndAssertAccess(defenseId, juryMember);
        Report report = reportRepository.findByProject(defense.getProject()).orElse(null);
        Evaluation evaluation = evaluationRepository.findByProjectAndJuryMember(defense.getProject(), juryMember).orElse(null);

        ReportDTO visibleReport = isReportVisibleToJury(report) ? toReportDTO(report) : null;
        return new DefenseDetailDTO(
                defense.getId(),
                fullName(defense.getProject().getStudent()),
                defense.getProject().getTitle(),
                fullName(defense.getProject().getSupervisor()),
                defense.getDefenseDate(),
                defense.getStartTime(),
                defense.getRoom() == null ? null : defense.getRoom().getName(),
                reportStatus(report),
                evaluationStatus(evaluation),
                visibleReport,
                evaluation == null ? null : toEvaluationResponse(evaluation, defense)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReportDTO getReport(Long defenseId) {
        User juryMember = currentJuryMember();
        Defense defense = findDefenseAndAssertAccess(defenseId, juryMember);
        Report report = reportRepository.findByProject(defense.getProject())
                .orElseThrow(() -> new UnauthorizedActionException(REPORT_UNAVAILABLE_MESSAGE));

        if (!isReportVisibleToJury(report)) {
            throw new UnauthorizedActionException(REPORT_UNAVAILABLE_MESSAGE);
        }

        return toReportDTO(report);
    }

    @Override
    public EvaluationResponseDTO createEvaluation(EvaluationRequestDTO request, EvaluationStatus status) {
        User juryMember = currentJuryMember();
        Defense defense = findDefenseAndAssertAccess(request.defenseId(), juryMember);
        Project project = defense.getProject();

        evaluationRepository.findByProjectAndJuryMember(project, juryMember)
                .ifPresent(existing -> {
                    throw new BadRequestException("Une évaluation existe déjà pour cette soutenance.");
                });

        Evaluation evaluation = new Evaluation();
        evaluation.setProject(project);
        evaluation.setJuryMember(juryMember);
        applyRequest(evaluation, request);

        if (status == EvaluationStatus.SUBMITTED) {
            prepareSubmission(evaluation);
        } else {
            evaluation.setStatus(EvaluationStatus.DRAFT);
        }

        Evaluation saved = evaluationRepository.save(evaluation);
        return toEvaluationResponse(saved, defense);
    }

    @Override
    public EvaluationResponseDTO updateDraft(Long evaluationId, EvaluationRequestDTO request) {
        User juryMember = currentJuryMember();
        Defense defense = findDefenseAndAssertAccess(request.defenseId(), juryMember);
        Evaluation evaluation = findOwnedEvaluation(evaluationId, juryMember, defense);
        assertDraftEditable(evaluation);

        applyRequest(evaluation, request);
        evaluation.setStatus(EvaluationStatus.DRAFT);
        evaluation.setSubmittedAt(null);

        Evaluation saved = evaluationRepository.save(evaluation);
        return toEvaluationResponse(saved, defense);
    }

    @Override
    public EvaluationResponseDTO submit(Long evaluationId, EvaluationRequestDTO request) {
        User juryMember = currentJuryMember();
        Defense defense = findDefenseAndAssertAccess(request.defenseId(), juryMember);
        Evaluation evaluation = findOwnedEvaluation(evaluationId, juryMember, defense);
        assertDraftEditable(evaluation);

        applyRequest(evaluation, request);
        prepareSubmission(evaluation);

        Evaluation saved = evaluationRepository.save(evaluation);
        return toEvaluationResponse(saved, defense);
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

    private ReportDTO toReportDTO(Report report) {
        return new ReportDTO(
                report.getId(),
                report.getOriginalFileName() == null || report.getOriginalFileName().isBlank()
                        ? report.getFileName()
                        : report.getOriginalFileName(),
                report.getFilePath(),
                report.getUploadedAt(),
                isReportVisibleToJury(report) ? ReportVisibilityStatus.VISIBLE_TO_JURY : ReportVisibilityStatus.HIDDEN
        );
    }

    private EvaluationResponseDTO toEvaluationResponse(Evaluation evaluation, Defense defense) {
        return new EvaluationResponseDTO(
                evaluation.getId(),
                defense.getId(),
                evaluation.getNotePresentation(),
                evaluation.getNoteReport(),
                evaluation.getNoteTechnical(),
                evaluation.getNoteCommunication(),
                evaluation.getFinalGrade(),
                evaluation.getRemarks(),
                evaluation.getDecision(),
                evaluation.getStatus(),
                evaluation.getSubmittedAt()
        );
    }

    private void applyRequest(Evaluation evaluation, EvaluationRequestDTO request) {
        evaluation.setNotePresentation(request.notePresentation());
        evaluation.setNoteReport(request.noteReport());
        evaluation.setNoteTechnical(request.noteTechnical());
        evaluation.setNoteCommunication(request.noteCommunication());
        evaluation.setFinalGrade(request.finalGrade());
        evaluation.setRemarks(request.remarks());
        evaluation.setDecision(request.decision());

        if (evaluation.getFinalGrade() == null && allComponentGradesPresent(evaluation)) {
            evaluation.setFinalGrade(averageComponentGrades(evaluation));
        }
    }

    private void prepareSubmission(Evaluation evaluation) {
        if (evaluation.getFinalGrade() == null && allComponentGradesPresent(evaluation)) {
            evaluation.setFinalGrade(averageComponentGrades(evaluation));
        }
        validateCompleteForSubmission(evaluation);
        evaluation.setStatus(EvaluationStatus.SUBMITTED);
        evaluation.setSubmittedAt(LocalDateTime.now());
    }

    private void validateCompleteForSubmission(Evaluation evaluation) {
        if (evaluation.getNotePresentation() == null
                || evaluation.getNoteReport() == null
                || evaluation.getNoteTechnical() == null
                || evaluation.getNoteCommunication() == null
                || evaluation.getFinalGrade() == null
                || evaluation.getDecision() == null) {
            throw new BadRequestException("Toutes les notes et la décision sont obligatoires pour soumettre définitivement l'évaluation.");
        }
    }

    private boolean allComponentGradesPresent(Evaluation evaluation) {
        return evaluation.getNotePresentation() != null
                && evaluation.getNoteReport() != null
                && evaluation.getNoteTechnical() != null
                && evaluation.getNoteCommunication() != null;
    }

    private BigDecimal averageComponentGrades(Evaluation evaluation) {
        return evaluation.getNotePresentation()
                .add(evaluation.getNoteReport())
                .add(evaluation.getNoteTechnical())
                .add(evaluation.getNoteCommunication())
                .divide(BigDecimal.valueOf(4), 2, RoundingMode.HALF_UP);
    }

    private Evaluation findOwnedEvaluation(Long evaluationId, User juryMember, Defense defense) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation introuvable avec l'id " + evaluationId));

        if (!Objects.equals(evaluation.getJuryMember().getId(), juryMember.getId())
                || !Objects.equals(evaluation.getProject().getId(), defense.getProject().getId())) {
            throw new UnauthorizedActionException("Accès interdit à cette évaluation.");
        }

        return evaluation;
    }

    private void assertDraftEditable(Evaluation evaluation) {
        if (evaluation.getStatus() == EvaluationStatus.SUBMITTED) {
            throw new UnauthorizedActionException(EVALUATION_ALREADY_SUBMITTED_MESSAGE);
        }
    }

    private Defense findDefenseAndAssertAccess(Long defenseId, User juryMember) {
        Defense defense = juryRepository.findById(defenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Soutenance introuvable avec l'id " + defenseId));

        if (!isJuryMemberAssigned(defense, juryMember)) {
            throw new UnauthorizedActionException("Accès interdit à cette soutenance.");
        }

        return defense;
    }

    private boolean isJuryMemberAssigned(Defense defense, User juryMember) {
        JuryAssignment assignment = defense.getJuryAssignment();
        if (assignment == null) {
            return false;
        }

        return sameUser(assignment.getPresident(), juryMember)
                || sameUser(assignment.getExaminer1(), juryMember)
                || sameUser(assignment.getExaminer2(), juryMember)
                || sameUser(assignment.getGuest(), juryMember);
    }

    private boolean sameUser(User left, User right) {
        return left != null && right != null && Objects.equals(left.getId(), right.getId());
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
}

package com.pfe.defense.student;

import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseRepository;
import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.project.Project;
import com.pfe.defense.project.ProjectRepository;
import com.pfe.defense.project.ProjectStatus;
import com.pfe.defense.report.Report;
import com.pfe.defense.report.ReportRepository;
import com.pfe.defense.report.ReportStatus;
import com.pfe.defense.student.dto.*;
import com.pfe.defense.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class StudentService {
    private final ProjectRepository projectRepository;
    private final ReportRepository reportRepository;
    private final DefenseRepository defenseRepository;

    public StudentService(ProjectRepository projectRepository, ReportRepository reportRepository, DefenseRepository defenseRepository) {
        this.projectRepository = projectRepository;
        this.reportRepository = reportRepository;
        this.defenseRepository = defenseRepository;
    }

    @Transactional(readOnly = true)
    public StudentDashboardResponse dashboard(User student) {
        Project project = currentProject(student);
        Report report = reportRepository.findByProject(project).orElse(null);
        Defense defense = defenseRepository.findByProject(project).orElse(null);
        return new StudentDashboardResponse(
                fullName(student),
                student.getDepartment(),
                project.getTitle(),
                fullName(project.getSupervisor()),
                report == null ? ReportStatus.NOT_SUBMITTED : report.getStatus(),
                defense == null ? null : defense.getDefenseDate(),
                defense == null ? null : defense.getStartTime(),
                defense == null || defense.getRoom() == null ? null : defense.getRoom().getName(),
                juryNames(defense == null ? project.getJuryAssignment() : defense.getJuryAssignment())
        );
    }

    @Transactional(readOnly = true)
    public StudentProjectResponse project(User student) {
        return toProjectResponse(currentProject(student));
    }

    public StudentProjectResponse createProject(User student, StudentProjectRequest request) {
        if (projectRepository.findByStudent(student).isPresent()) {
            throw new BadRequestException("Un projet existe déjà pour cet étudiant.");
        }
        throw new BadRequestException("La création d'un projet nécessite un encadrant affecté par l'administration.");
    }

    public StudentProjectResponse updateProject(User student, Long id, StudentProjectRequest request) {
        Project project = currentProject(student);
        if (!project.getId().equals(id)) {
            throw new ResourceNotFoundException("Projet introuvable pour cet étudiant.");
        }
        project.setTitle(request.title());
        project.setSummary(request.summary());
        project.setKeywords(request.keywords());
        project.setProjectType(request.projectType());
        project.setAcademicYear(request.academicYear());
        project.setStatus(ProjectStatus.SUBMITTED);
        return toProjectResponse(projectRepository.save(project));
    }

    public StudentReportStatusResponse uploadReport(User student, MultipartFile file) {
        validatePdf(file);
        Project project = currentProject(student);
        Report report = reportRepository.findByProject(project).orElseGet(Report::new);
        String originalName = file.getOriginalFilename() == null ? "rapport.pdf" : file.getOriginalFilename();
        String storedName = UUID.randomUUID() + ".pdf";
        Path uploadDir = Paths.get("uploads", "reports");
        try {
            Files.createDirectories(uploadDir);
            Path target = uploadDir.resolve(storedName);
            file.transferTo(target);
            report.setProject(project);
            report.setFileName(storedName);
            report.setOriginalFileName(originalName);
            report.setFilePath(target.toString().replace('\\', '/'));
            report.setStatus(ReportStatus.SUBMITTED_TO_SUPERVISOR);
            report.setVisibleToJury(false);
            report.setUploadedAt(LocalDateTime.now());
            report.setApprovedAt(null);
            report.setVisibilityActivatedAt(null);
            report.setSupervisorComment(null);
            return toReportStatus(reportRepository.save(report));
        } catch (IOException ex) {
            throw new BadRequestException("Impossible d'enregistrer le rapport.");
        }
    }

    @Transactional(readOnly = true)
    public StudentReportStatusResponse reportStatus(User student) {
        Project project = currentProject(student);
        return reportRepository.findByProject(project)
                .map(this::toReportStatus)
                .orElse(new StudentReportStatusResponse(ReportStatus.NOT_SUBMITTED, null, null, null, false));
    }

    @Transactional(readOnly = true)
    public StudentDefenseResponse defense(User student) {
        Project project = currentProject(student);
        Defense defense = defenseRepository.findByProject(project)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune soutenance disponible pour cet étudiant."));
        return new StudentDefenseResponse(
                defense.getDefenseDate(),
                defense.getStartTime(),
                defense.getEndTime(),
                defense.getRoom() == null ? null : defense.getRoom().getName(),
                juryNames(defense.getJuryAssignment()),
                defense.getStatus(),
                defense.isPublished()
        );
    }

    private Project currentProject(User student) {
        return projectRepository.findByStudent(student)
                .orElseThrow(() -> new ResourceNotFoundException("Aucun projet trouvé pour cet étudiant."));
    }

    private StudentProjectResponse toProjectResponse(Project project) {
        return new StudentProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getSummary(),
                project.getKeywords(),
                project.getProjectType(),
                project.getAcademicYear(),
                project.getStatus(),
                fullName(project.getSupervisor()),
                List.of(fullName(project.getStudent()))
        );
    }

    private StudentReportStatusResponse toReportStatus(Report report) {
        return new StudentReportStatusResponse(
                report.getStatus(),
                report.getOriginalFileName(),
                report.getSupervisorComment(),
                report.getUploadedAt(),
                report.isVisibleToJury()
        );
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Veuillez sélectionner un fichier PDF.");
        }
        String contentType = file.getContentType();
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!"application/pdf".equalsIgnoreCase(contentType) || !filename.endsWith(".pdf")) {
            throw new BadRequestException("Seuls les fichiers PDF sont acceptés.");
        }
    }

    private List<String> juryNames(JuryAssignment assignment) {
        List<String> members = new ArrayList<>();
        if (assignment == null) return members;
        addIfPresent(members, assignment.getPresident());
        addIfPresent(members, assignment.getExaminer1());
        addIfPresent(members, assignment.getExaminer2());
        addIfPresent(members, assignment.getGuest());
        return members;
    }

    private void addIfPresent(List<String> members, User user) {
        if (user != null) members.add(fullName(user));
    }

    private String fullName(User user) {
        return user.getFirstName() + " " + user.getLastName();
    }
}


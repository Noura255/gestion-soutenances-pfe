package com.pfe.defense.config;

import com.pfe.defense.admin.notification.Notification;
import com.pfe.defense.admin.notification.NotificationRepository;
import com.pfe.defense.admin.structure.*;
import com.pfe.defense.audit.AuditLog;
import com.pfe.defense.audit.AuditLogRepository;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseRepository;
import com.pfe.defense.defense.DefenseStatus;
import com.pfe.defense.evaluation.Evaluation;
import com.pfe.defense.evaluation.EvaluationDecision;
import com.pfe.defense.evaluation.EvaluationRepository;
import com.pfe.defense.evaluation.EvaluationStatus;
import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.jury.JuryAssignmentRepository;
import com.pfe.defense.project.Project;
import com.pfe.defense.project.ProjectRepository;
import com.pfe.defense.project.ProjectStatus;
import com.pfe.defense.project.ProjectType;
import com.pfe.defense.report.Report;
import com.pfe.defense.report.ReportRepository;
import com.pfe.defense.report.ReportStatus;
import com.pfe.defense.room.Room;
import com.pfe.defense.room.RoomRepository;
import com.pfe.defense.user.Role;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class DataSeeder implements ApplicationRunner {
    public static final String PRIMARY_ADMIN_EMAIL = "admin@sgsoutenance.com";
    private static final String PRIMARY_ADMIN_PASSWORD = "admin123";
    private static final String TEST_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final FieldRepository fieldRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ProjectRepository projectRepository;
    private final ReportRepository reportRepository;
    private final RoomRepository roomRepository;
    private final JuryAssignmentRepository juryAssignmentRepository;
    private final DefenseRepository defenseRepository;
    private final EvaluationRepository evaluationRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean enabled;

    @Value("${app.seed.reset-fake-data:false}")
    private boolean resetFakeData;

    public DataSeeder(UserRepository userRepository,
                      DepartmentRepository departmentRepository,
                      FieldRepository fieldRepository,
                      AcademicYearRepository academicYearRepository,
                      ProjectRepository projectRepository,
                      ReportRepository reportRepository,
                      RoomRepository roomRepository,
                      JuryAssignmentRepository juryAssignmentRepository,
                      DefenseRepository defenseRepository,
                      EvaluationRepository evaluationRepository,
                      AuditLogRepository auditLogRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.fieldRepository = fieldRepository;
        this.academicYearRepository = academicYearRepository;
        this.projectRepository = projectRepository;
        this.reportRepository = reportRepository;
        this.roomRepository = roomRepository;
        this.juryAssignmentRepository = juryAssignmentRepository;
        this.defenseRepository = defenseRepository;
        this.evaluationRepository = evaluationRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        ensurePrimaryAdmin();

        if (resetFakeData) {
            resetSeedData();
        }

        seedAcademicStructure();
        Map<String, User> users = seedUsers();
        Map<String, Project> projects = seedProjects(users);
        seedReports(projects);
        Map<String, Room> rooms = seedRooms();
        Map<String, JuryAssignment> assignments = seedJuryAssignments(projects, users);
        seedDefenses(projects, rooms, assignments);
        seedEvaluations(projects, users);
        seedAuditLogs();
        seedNotifications();
    }

    private void ensurePrimaryAdmin() {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(PRIMARY_ADMIN_EMAIL);
        if (existing.isPresent()) {
            User admin = existing.get();
            boolean dirty = false;
            if (admin.isSeedData()) {
                admin.setSeedData(false);
                dirty = true;
            }
            if (admin.getPassword() == null || admin.getPassword().isBlank() || !looksLikeBCryptHash(admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(PRIMARY_ADMIN_PASSWORD));
                dirty = true;
            }
            if (dirty) {
                userRepository.save(admin);
            }
            return;
        }

        User admin = new User();
        admin.setFirstName("Admin");
        admin.setLastName("Principal");
        admin.setEmail(PRIMARY_ADMIN_EMAIL);
        admin.setPassword(passwordEncoder.encode(PRIMARY_ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        admin.setDepartment("Direction");
        admin.setPhone("+212600000000");
        admin.setSeedData(false);
        userRepository.save(admin);
    }

    private void resetSeedData() {
        evaluationRepository.deleteAll(evaluationRepository.findAllBySeedDataTrue());
        evaluationRepository.flush();

        defenseRepository.deleteAll(defenseRepository.findAllBySeedDataTrue());
        defenseRepository.flush();

        reportRepository.deleteAll(reportRepository.findAllBySeedDataTrue());
        reportRepository.flush();

        juryAssignmentRepository.deleteAll(juryAssignmentRepository.findAllBySeedDataTrue());
        juryAssignmentRepository.flush();

        projectRepository.deleteAll(projectRepository.findAllBySeedDataTrue());
        projectRepository.flush();

        auditLogRepository.deleteAll(auditLogRepository.findAllBySeedDataTrue());
        auditLogRepository.flush();

        notificationRepository.deleteAll(notificationRepository.findAllBySeedDataTrue());
        notificationRepository.flush();

        for (Room room : roomRepository.findAllBySeedDataTrue()) {
            if (!defenseRepository.existsByRoom(room)) {
                roomRepository.delete(room);
            }
        }
        roomRepository.flush();

        fieldRepository.deleteAll(fieldRepository.findAllBySeedDataTrue());
        fieldRepository.flush();

        for (Department department : departmentRepository.findAllBySeedDataTrue()) {
            if (!fieldRepository.existsByDepartment(department)) {
                departmentRepository.delete(department);
            }
        }
        departmentRepository.flush();

        academicYearRepository.deleteAll(academicYearRepository.findAllBySeedDataTrue());
        academicYearRepository.flush();

        for (User user : userRepository.findAllBySeedDataTrue()) {
            if (PRIMARY_ADMIN_EMAIL.equalsIgnoreCase(user.getEmail())) {
                continue;
            }
            boolean referencedByProject = projectRepository.existsByStudentOrSupervisor(user, user);
            boolean referencedByJury = juryAssignmentRepository.existsByPresidentOrExaminer1OrExaminer2OrGuest(user, user, user, user);
            boolean referencedByEvaluation = evaluationRepository.existsByJuryMember(user);
            if (!referencedByProject && !referencedByJury && !referencedByEvaluation) {
                userRepository.delete(user);
            }
        }
        userRepository.flush();
    }

    private void seedAcademicStructure() {
        Department informatique = upsertDepartment("Informatique", "Département des sciences informatiques.");
        upsertDepartment("Mathématiques", "Département de mathématiques appliquées.");
        upsertDepartment("Physique", "Département de physique.");

        upsertField("Génie Informatique", informatique);
        upsertField("Systèmes d’Information", informatique);
        upsertField("Intelligence Artificielle", informatique);
        upsertField("Cybersécurité", informatique);

        upsertAcademicYear("2024/2025", false);
        upsertAcademicYear("2025/2026", true);
    }

    private Department upsertDepartment(String name, String description) {
        Optional<Department> existing = departmentRepository.findByNameIgnoreCase(name);
        if (existing.isPresent()) {
            Department department = existing.get();
            if (department.isSeedData()) {
                department.setDescription(description);
                return departmentRepository.save(department);
            }
            return department;
        }
        Department department = new Department();
        department.setName(name);
        department.setDescription(description);
        department.setSeedData(true);
        return departmentRepository.save(department);
    }

    private Field upsertField(String name, Department department) {
        Optional<Field> existing = fieldRepository.findByNameIgnoreCaseAndDepartment(name, department);
        if (existing.isPresent()) {
            return existing.get();
        }
        Field field = new Field();
        field.setName(name);
        field.setDepartment(department);
        field.setSeedData(true);
        return fieldRepository.save(field);
    }

    private AcademicYear upsertAcademicYear(String label, boolean active) {
        Optional<AcademicYear> existing = academicYearRepository.findByLabelIgnoreCase(label);
        if (existing.isPresent()) {
            AcademicYear year = existing.get();
            if (year.isSeedData()) {
                year.setActive(active);
                return academicYearRepository.save(year);
            }
            return year;
        }
        AcademicYear year = new AcademicYear();
        year.setLabel(label);
        year.setActive(active);
        year.setSeedData(true);
        return academicYearRepository.save(year);
    }

    private Map<String, User> seedUsers() {
        Map<String, User> users = new LinkedHashMap<>();
        List<UserSpec> specs = List.of(
                new UserSpec("student1@sgsoutenance.com", "Yasmine", "Alaoui", Role.STUDENT, "Informatique", "+212600000101"),
                new UserSpec("student2@sgsoutenance.com", "Omar", "Benali", Role.STUDENT, "Informatique", "+212600000102"),
                new UserSpec("student3@sgsoutenance.com", "Salma", "El Idrissi", Role.STUDENT, "Mathématiques", "+212600000103"),
                new UserSpec("student4@sgsoutenance.com", "Ilyas", "Rami", Role.STUDENT, "Informatique", "+212600000104"),
                new UserSpec("student5@sgsoutenance.com", "Nour", "Berrada", Role.STUDENT, "Physique", "+212600000105"),
                new UserSpec("supervisor1@sgsoutenance.com", "Khadija", "Mansouri", Role.SUPERVISOR, "Informatique", "+212600000201"),
                new UserSpec("supervisor2@sgsoutenance.com", "Rachid", "Tazi", Role.SUPERVISOR, "Informatique", "+212600000202"),
                new UserSpec("supervisor3@sgsoutenance.com", "Amal", "Kettani", Role.SUPERVISOR, "Mathématiques", "+212600000203"),
                new UserSpec("jury1@sgsoutenance.com", "Hicham", "Fassi", Role.JURY, "Informatique", "+212600000301"),
                new UserSpec("jury2@sgsoutenance.com", "Meryem", "Lahlou", Role.JURY, "Informatique", "+212600000302"),
                new UserSpec("jury3@sgsoutenance.com", "Adil", "Chraibi", Role.JURY, "Mathématiques", "+212600000303"),
                new UserSpec("jury4@sgsoutenance.com", "Soukaina", "Bennis", Role.JURY, "Physique", "+212600000304"),
                new UserSpec("jury5@sgsoutenance.com", "Younes", "Amrani", Role.JURY, "Informatique", "+212600000305"),
                new UserSpec("administration1@sgsoutenance.com", "Nadia", "Sefrioui", Role.ADMINISTRATION, "Scolarité", "+212600000401"),
                new UserSpec("administration2@sgsoutenance.com", "Hamza", "Ait Lahcen", Role.ADMINISTRATION, "Scolarité", "+212600000402")
        );
        for (UserSpec spec : specs) {
            users.put(spec.email(), upsertSeedUser(spec));
        }
        return users;
    }

    private User upsertSeedUser(UserSpec spec) {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(spec.email());
        if (existing.isPresent()) {
            User user = existing.get();
            user.setFirstName(spec.firstName());
            user.setLastName(spec.lastName());
            user.setRole(spec.role());
            user.setDepartment(spec.department());
            user.setPhone(spec.phone());
            user.setEnabled(true);
            user.setSeedData(true);
            if (!passwordEncoder.matches(TEST_PASSWORD, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(TEST_PASSWORD));
            }
            return userRepository.save(user);
        }

        User user = new User();
        user.setFirstName(spec.firstName());
        user.setLastName(spec.lastName());
        user.setEmail(spec.email());
        user.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        user.setRole(spec.role());
        user.setEnabled(true);
        user.setDepartment(spec.department());
        user.setPhone(spec.phone());
        user.setSeedData(true);
        return userRepository.save(user);
    }

    private Map<String, Project> seedProjects(Map<String, User> users) {
        Map<String, Project> projects = new LinkedHashMap<>();
        List<ProjectSpec> specs = List.of(
                new ProjectSpec("Plateforme de gestion des soutenances", "Centraliser les dépôts, affectations de jury et plannings de soutenance.", "soutenance, workflow, gestion", "2025/2026", ProjectType.PFE, ProjectStatus.VALIDATED, "student1@sgsoutenance.com", "supervisor1@sgsoutenance.com"),
                new ProjectSpec("Application de suivi des stages", "Suivre les stages, conventions, validations et retours des encadrants.", "stage, suivi, validation", "2025/2026", ProjectType.PFE, ProjectStatus.SUBMITTED, "student2@sgsoutenance.com", "supervisor1@sgsoutenance.com"),
                new ProjectSpec("Système intelligent de réservation des salles", "Optimiser la disponibilité des salles et réduire les conflits de réservation.", "réservation, salles, optimisation", "2024/2025", ProjectType.MASTER, ProjectStatus.VALIDATED, "student3@sgsoutenance.com", "supervisor2@sgsoutenance.com"),
                new ProjectSpec("Dashboard analytique universitaire", "Visualiser les indicateurs académiques clés pour la direction pédagogique.", "analytics, dashboard, décision", "2025/2026", ProjectType.MASTER, ProjectStatus.DRAFT, "student4@sgsoutenance.com", "supervisor3@sgsoutenance.com"),
                new ProjectSpec("Application mobile de gestion des absences", "Permettre la déclaration et le suivi mobile des absences étudiantes.", "mobile, absences, notification", "2025/2026", ProjectType.PFE, ProjectStatus.REJECTED, "student5@sgsoutenance.com", "supervisor2@sgsoutenance.com")
        );
        for (ProjectSpec spec : specs) {
            projects.put(spec.title(), upsertSeedProject(spec, users));
        }
        return projects;
    }

    private Project upsertSeedProject(ProjectSpec spec, Map<String, User> users) {
        Project project = projectRepository.findByTitleIgnoreCaseAndSeedDataTrue(spec.title()).orElseGet(Project::new);
        project.setTitle(spec.title());
        project.setSummary(spec.summary());
        project.setKeywords(spec.keywords());
        project.setAcademicYear(spec.academicYear());
        project.setProjectType(spec.projectType());
        project.setStatus(spec.status());
        project.setStudent(users.get(spec.studentEmail()));
        project.setSupervisor(users.get(spec.supervisorEmail()));
        project.setSeedData(true);
        return projectRepository.save(project);
    }

    private void seedReports(Map<String, Project> projects) {
        upsertReport(projects.get("Plateforme de gestion des soutenances"), "report1.pdf", ReportStatus.VISIBLE_TO_JURY,
                null, true, LocalDateTime.of(2026, 5, 2, 10, 15), LocalDateTime.of(2026, 5, 4, 14, 0), LocalDateTime.of(2026, 5, 6, 9, 30));
        upsertReport(projects.get("Application de suivi des stages"), "report2.pdf", ReportStatus.SUBMITTED_TO_SUPERVISOR,
                null, false, LocalDateTime.of(2026, 5, 7, 11, 0), null, null);
        upsertReport(projects.get("Système intelligent de réservation des salles"), "report3.pdf", ReportStatus.APPROVED_BY_SUPERVISOR,
                null, false, LocalDateTime.of(2026, 4, 28, 16, 0), LocalDateTime.of(2026, 5, 1, 10, 0), null);
        upsertReport(projects.get("Dashboard analytique universitaire"), null, ReportStatus.NOT_SUBMITTED,
                null, false, null, null, null);
        upsertReport(projects.get("Application mobile de gestion des absences"), "report5.pdf", ReportStatus.NEEDS_CORRECTION,
                "Ajouter la méthodologie, corriger la bibliographie et clarifier les jeux de tests.", false,
                LocalDateTime.of(2026, 5, 8, 9, 0), null, null);
    }

    private Report upsertReport(Project project, String fileName, ReportStatus status, String supervisorComment,
                                boolean visibleToJury, LocalDateTime uploadedAt, LocalDateTime approvedAt,
                                LocalDateTime visibilityActivatedAt) {
        Report report = reportRepository.findByProject(project).orElseGet(Report::new);
        report.setProject(project);
        report.setFileName(fileName);
        report.setFilePath(fileName == null ? null : "/uploads/reports/" + fileName);
        report.setOriginalFileName(fileName);
        report.setStatus(status);
        report.setSupervisorComment(supervisorComment);
        report.setVisibleToJury(visibleToJury);
        report.setUploadedAt(uploadedAt);
        report.setApprovedAt(approvedAt);
        report.setVisibilityActivatedAt(visibilityActivatedAt);
        report.setSeedData(true);
        return reportRepository.save(report);
    }

    private Map<String, Room> seedRooms() {
        Map<String, Room> rooms = new LinkedHashMap<>();
        List<RoomSpec> specs = List.of(
                new RoomSpec("Salle A1", "Bâtiment A", 24, "Vidéoprojecteur, tableau blanc", true),
                new RoomSpec("Salle A2", "Bâtiment A", 28, "Vidéoprojecteur, visioconférence", true),
                new RoomSpec("Salle B1", "Bâtiment B", 32, "Écran interactif, sonorisation", true),
                new RoomSpec("Salle B2", "Bâtiment B", 20, "Vidéoprojecteur", false),
                new RoomSpec("Salle Conférence", "Bâtiment Central", 80, "Sonorisation, captation vidéo, visioconférence", true)
        );
        for (RoomSpec spec : specs) {
            rooms.put(spec.name(), upsertSeedRoom(spec));
        }
        return rooms;
    }

    private Room upsertSeedRoom(RoomSpec spec) {
        Room room = roomRepository.findByNameIgnoreCaseAndSeedDataTrue(spec.name()).orElseGet(Room::new);
        room.setName(spec.name());
        room.setBuilding(spec.building());
        room.setCapacity(spec.capacity());
        room.setEquipment(spec.equipment());
        room.setAvailable(spec.available());
        room.setSeedData(true);
        return roomRepository.save(room);
    }

    private Map<String, JuryAssignment> seedJuryAssignments(Map<String, Project> projects, Map<String, User> users) {
        Map<String, JuryAssignment> assignments = new LinkedHashMap<>();
        assignments.put("Plateforme de gestion des soutenances", upsertAssignment(
                projects.get("Plateforme de gestion des soutenances"),
                users.get("jury1@sgsoutenance.com"),
                users.get("jury2@sgsoutenance.com"),
                users.get("jury3@sgsoutenance.com"),
                users.get("jury4@sgsoutenance.com")
        ));
        assignments.put("Système intelligent de réservation des salles", upsertAssignment(
                projects.get("Système intelligent de réservation des salles"),
                users.get("jury2@sgsoutenance.com"),
                users.get("jury3@sgsoutenance.com"),
                users.get("jury4@sgsoutenance.com"),
                users.get("jury5@sgsoutenance.com")
        ));
        assignments.put("Application mobile de gestion des absences", upsertAssignment(
                projects.get("Application mobile de gestion des absences"),
                users.get("jury1@sgsoutenance.com"),
                users.get("jury4@sgsoutenance.com"),
                users.get("jury5@sgsoutenance.com"),
                null
        ));
        return assignments;
    }

    private JuryAssignment upsertAssignment(Project project, User president, User examiner1, User examiner2, User guest) {
        JuryAssignment assignment = juryAssignmentRepository.findByProject(project).orElseGet(JuryAssignment::new);
        assignment.setProject(project);
        assignment.setPresident(president);
        assignment.setExaminer1(examiner1);
        assignment.setExaminer2(examiner2);
        assignment.setGuest(guest);
        assignment.setAssignedAt(LocalDateTime.of(2026, 5, 6, 10, 0));
        assignment.setSeedData(true);
        return juryAssignmentRepository.save(assignment);
    }

    private void seedDefenses(Map<String, Project> projects, Map<String, Room> rooms, Map<String, JuryAssignment> assignments) {
        upsertDefense(projects.get("Plateforme de gestion des soutenances"), rooms.get("Salle A1"),
                assignments.get("Plateforme de gestion des soutenances"), LocalDate.of(2026, 6, 10),
                LocalTime.of(9, 0), LocalTime.of(10, 0), DefenseStatus.PUBLISHED, true);
        upsertDefense(projects.get("Système intelligent de réservation des salles"), rooms.get("Salle A2"),
                assignments.get("Système intelligent de réservation des salles"), LocalDate.of(2026, 5, 10),
                LocalTime.of(10, 30), LocalTime.of(11, 30), DefenseStatus.COMPLETED, true);
        upsertDefense(projects.get("Application mobile de gestion des absences"), rooms.get("Salle B1"),
                assignments.get("Application mobile de gestion des absences"), LocalDate.of(2026, 6, 11),
                LocalTime.of(11, 0), LocalTime.of(12, 0), DefenseStatus.SCHEDULED, false);
        upsertDefense(projects.get("Application de suivi des stages"), null, null,
                null, null, null, DefenseStatus.NOT_SCHEDULED, false);
    }

    private Defense upsertDefense(Project project, Room room, JuryAssignment assignment, LocalDate date,
                                  LocalTime startTime, LocalTime endTime, DefenseStatus status, boolean published) {
        Defense defense = defenseRepository.findByProject(project).orElseGet(Defense::new);
        defense.setProject(project);
        defense.setRoom(room);
        defense.setJuryAssignment(assignment);
        defense.setDefenseDate(date);
        defense.setStartTime(startTime);
        defense.setEndTime(endTime);
        defense.setStatus(status);
        defense.setPublished(published);
        defense.setSeedData(true);
        return defenseRepository.save(defense);
    }

    private void seedEvaluations(Map<String, Project> projects, Map<String, User> users) {
        upsertEvaluation(projects.get("Plateforme de gestion des soutenances"), users.get("jury1@sgsoutenance.com"),
                "16.50", "17.00", "17.50", "16.00", "16.75",
                "Travail solide et présentation claire.", EvaluationDecision.VALIDATED, EvaluationStatus.SUBMITTED,
                LocalDateTime.of(2026, 6, 10, 10, 15));
        upsertEvaluation(projects.get("Plateforme de gestion des soutenances"), users.get("jury2@sgsoutenance.com"),
                "16.00", "16.50", "17.00", "16.50", "16.50",
                "Brouillon en cours de consolidation.", EvaluationDecision.VALIDATED, EvaluationStatus.DRAFT, null);
        upsertEvaluation(projects.get("Système intelligent de réservation des salles"), users.get("jury2@sgsoutenance.com"),
                "15.00", "15.50", "16.00", "15.00", "15.38",
                "Bonne maîtrise de la problématique.", EvaluationDecision.VALIDATED, EvaluationStatus.SUBMITTED,
                LocalDateTime.of(2026, 5, 10, 11, 45));
        upsertEvaluation(projects.get("Application mobile de gestion des absences"), users.get("jury4@sgsoutenance.com"),
                "12.00", "11.50", "12.50", "13.00", "12.25",
                "Des améliorations restent nécessaires.", EvaluationDecision.NEEDS_REVISION, EvaluationStatus.DRAFT, null);
    }

    private Evaluation upsertEvaluation(Project project, User juryMember, String presentation, String report,
                                        String technical, String communication, String finalGrade, String remarks,
                                        EvaluationDecision decision, EvaluationStatus status, LocalDateTime submittedAt) {
        Evaluation evaluation = evaluationRepository.findByProjectAndJuryMember(project, juryMember).orElseGet(Evaluation::new);
        evaluation.setProject(project);
        evaluation.setJuryMember(juryMember);
        evaluation.setNotePresentation(new BigDecimal(presentation));
        evaluation.setNoteReport(new BigDecimal(report));
        evaluation.setNoteTechnical(new BigDecimal(technical));
        evaluation.setNoteCommunication(new BigDecimal(communication));
        evaluation.setFinalGrade(new BigDecimal(finalGrade));
        evaluation.setRemarks(remarks);
        evaluation.setDecision(decision);
        evaluation.setStatus(status);
        evaluation.setSubmittedAt(submittedAt);
        evaluation.setSeedData(true);
        return evaluationRepository.save(evaluation);
    }

    private void seedAuditLogs() {
        List<AuditLogSpec> logs = List.of(
                new AuditLogSpec("CREATE", "ADMIN_USER", "Création de l'utilisateur student1@sgsoutenance.com", PRIMARY_ADMIN_EMAIL),
                new AuditLogSpec("LOGIN_SUCCESS", "AUTH", "Connexion réussie", PRIMARY_ADMIN_EMAIL),
                new AuditLogSpec("LOGIN_FAILED", "AUTH", "Échec de connexion seed #1", "student5@sgsoutenance.com"),
                new AuditLogSpec("LOGIN_FAILED", "AUTH", "Échec de connexion seed #2", "student5@sgsoutenance.com"),
                new AuditLogSpec("LOGIN_FAILED", "AUTH", "Échec de connexion seed #3", "student5@sgsoutenance.com"),
                new AuditLogSpec("SUBMIT", "REPORT", "Dépôt du rapport report2.pdf", "student2@sgsoutenance.com"),
                new AuditLogSpec("APPROVE", "REPORT", "Approbation du rapport report3.pdf", "supervisor2@sgsoutenance.com"),
                new AuditLogSpec("ASSIGN", "JURY", "Affectation du jury pour Plateforme de gestion des soutenances", "administration1@sgsoutenance.com"),
                new AuditLogSpec("ACTIVATE_VISIBILITY", "REPORT", "Activation de la visibilité jury pour report1.pdf", "supervisor1@sgsoutenance.com"),
                new AuditLogSpec("SUBMIT", "EVALUATION", "Soumission de l'évaluation du projet Plateforme de gestion des soutenances", "jury1@sgsoutenance.com")
        );
        for (AuditLogSpec spec : logs) {
            if (!auditLogRepository.existsByActionAndModuleAndPerformedByAndDescriptionAndSeedDataTrue(
                    spec.action(), spec.module(), spec.performedBy(), spec.description())) {
                AuditLog log = new AuditLog();
                log.setAction(spec.action());
                log.setModule(spec.module());
                log.setDescription(spec.description());
                log.setPerformedBy(spec.performedBy());
                log.setSeedData(true);
                auditLogRepository.save(log);
            }
        }
    }

    private void seedNotifications() {
        upsertNotification("Maintenance prévue", "Une maintenance applicative est prévue dimanche de 08h00 à 10h00.", null);
        upsertNotification("Rappel dépôt rapports", "Merci de déposer les rapports avant le 25 mai.", Role.STUDENT);
        upsertNotification("Publication planning", "Le planning des soutenances publiées est disponible dans votre espace.", null);
        upsertNotification("Consignes soutenance", "Présentez-vous 15 minutes avant le créneau avec votre support final.", Role.STUDENT);
    }

    private Notification upsertNotification(String title, String message, Role targetRole) {
        Notification notification = notificationRepository.findByTitleIgnoreCaseAndSeedDataTrue(title).orElseGet(Notification::new);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setTargetRole(targetRole);
        notification.setSeedData(true);
        return notificationRepository.save(notification);
    }

    private boolean looksLikeBCryptHash(String value) {
        return value.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$");
    }

    private record UserSpec(String email, String firstName, String lastName, Role role, String department, String phone) {
    }

    private record ProjectSpec(String title, String summary, String keywords, String academicYear, ProjectType projectType,
                               ProjectStatus status, String studentEmail, String supervisorEmail) {
    }

    private record RoomSpec(String name, String building, Integer capacity, String equipment, boolean available) {
    }

    private record AuditLogSpec(String action, String module, String description, String performedBy) {
    }
}

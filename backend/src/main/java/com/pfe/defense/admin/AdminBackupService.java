package com.pfe.defense.admin;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pfe.defense.audit.AuditLog;
import com.pfe.defense.audit.AuditLogRepository;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseRepository;
import com.pfe.defense.project.Project;
import com.pfe.defense.project.ProjectRepository;
import com.pfe.defense.user.User;
import com.pfe.defense.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class AdminBackupService {
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final DefenseRepository defenseRepository;
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AdminBackupService(UserRepository userRepository, ProjectRepository projectRepository,
                              DefenseRepository defenseRepository, AuditLogRepository auditLogRepository,
                              ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.defenseRepository = defenseRepository;
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    public byte[] backup() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("generatedAt", LocalDateTime.now());
        payload.put("users", userRepository.findAll().stream().map(this::userMap).toList());
        payload.put("projects", projectRepository.findAll().stream().map(this::projectMap).toList());
        payload.put("defenses", defenseRepository.findAll().stream().map(this::defenseMap).toList());
        payload.put("auditLogs", auditLogRepository.findAllByOrderByCreatedAtDesc().stream().map(this::auditLogMap).toList());
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(payload);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Impossible de générer la sauvegarde JSON.");
        }
    }

    private Map<String, Object> userMap(User user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("firstName", user.getFirstName());
        map.put("lastName", user.getLastName());
        map.put("email", user.getEmail());
        map.put("role", user.getRole());
        map.put("enabled", user.isEnabled());
        map.put("department", user.getDepartment());
        map.put("phone", user.getPhone());
        return map;
    }

    private Map<String, Object> projectMap(Project project) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", project.getId());
        map.put("title", project.getTitle());
        map.put("academicYear", project.getAcademicYear());
        map.put("projectType", project.getProjectType());
        map.put("status", project.getStatus());
        map.put("studentId", project.getStudent() == null ? null : project.getStudent().getId());
        map.put("supervisorId", project.getSupervisor() == null ? null : project.getSupervisor().getId());
        return map;
    }

    private Map<String, Object> defenseMap(Defense defense) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", defense.getId());
        map.put("projectId", defense.getProject() == null ? null : defense.getProject().getId());
        map.put("defenseDate", defense.getDefenseDate());
        map.put("startTime", defense.getStartTime());
        map.put("endTime", defense.getEndTime());
        map.put("status", defense.getStatus());
        map.put("published", defense.isPublished());
        return map;
    }

    private Map<String, Object> auditLogMap(AuditLog log) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", log.getId());
        map.put("action", log.getAction());
        map.put("module", log.getModule());
        map.put("description", log.getDescription());
        map.put("performedBy", log.getPerformedBy());
        map.put("createdAt", log.getCreatedAt());
        return map;
    }
}

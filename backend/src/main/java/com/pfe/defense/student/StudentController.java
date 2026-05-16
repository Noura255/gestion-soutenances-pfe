package com.pfe.defense.student;

import com.pfe.defense.student.dto.*;
import com.pfe.defense.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {
    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/dashboard")
    public StudentDashboardResponse dashboard(@AuthenticationPrincipal User student) {
        return studentService.dashboard(student);
    }

    @GetMapping("/project")
    public StudentProjectResponse project(@AuthenticationPrincipal User student) {
        return studentService.project(student);
    }

    @PostMapping("/project")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentProjectResponse createProject(@AuthenticationPrincipal User student, @Valid @RequestBody StudentProjectRequest request) {
        return studentService.createProject(student, request);
    }

    @PutMapping("/project/{id}")
    public StudentProjectResponse updateProject(@AuthenticationPrincipal User student, @PathVariable Long id, @Valid @RequestBody StudentProjectRequest request) {
        return studentService.updateProject(student, id, request);
    }

    @PostMapping(value = "/report/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public StudentReportStatusResponse uploadReport(@AuthenticationPrincipal User student, @RequestPart("file") MultipartFile file) {
        return studentService.uploadReport(student, file);
    }

    @GetMapping("/report/status")
    public StudentReportStatusResponse reportStatus(@AuthenticationPrincipal User student) {
        return studentService.reportStatus(student);
    }

    @GetMapping("/defense")
    public StudentDefenseResponse defense(@AuthenticationPrincipal User student) {
        return studentService.defense(student);
    }
}


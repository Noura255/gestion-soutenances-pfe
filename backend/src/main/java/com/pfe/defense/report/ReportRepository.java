package com.pfe.defense.report;

import com.pfe.defense.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByProject(Project project);
    List<Report> findAllBySeedDataTrue();
}

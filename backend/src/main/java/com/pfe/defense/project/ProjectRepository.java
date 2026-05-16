package com.pfe.defense.project;

import com.pfe.defense.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByTitleIgnoreCaseAndSeedDataTrue(String title);
    List<Project> findAllBySeedDataTrue();
    boolean existsByStudentOrSupervisor(User student, User supervisor);
}

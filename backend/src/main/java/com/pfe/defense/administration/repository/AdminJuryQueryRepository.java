package com.pfe.defense.administration.repository;

import com.pfe.defense.jury.JuryAssignment;
import com.pfe.defense.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository dédié au module administration pour les requêtes sur les jurys.
 */
public interface AdminJuryQueryRepository extends JpaRepository<JuryAssignment, Long> {

    Optional<JuryAssignment> findByProject(Project project);
}

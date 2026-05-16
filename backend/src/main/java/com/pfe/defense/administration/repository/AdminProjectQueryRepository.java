package com.pfe.defense.administration.repository;

import com.pfe.defense.project.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repository dédié au module administration pour les requêtes sur les projets.
 * N'étend pas ProjectRepository — accède directement à l'entité Project.
 */
public interface AdminProjectQueryRepository extends JpaRepository<Project, Long> {

    @Query("SELECT COUNT(p) FROM Project p WHERE p.status <> 'DRAFT'")
    long countSubmitted();

    @Query("SELECT p FROM Project p WHERE p.juryAssignment IS NULL AND p.status <> 'DRAFT'")
    List<Project> findAllWithoutJury();

    @Query("""
            SELECT p FROM Project p
            LEFT JOIN FETCH p.student
            LEFT JOIN FETCH p.supervisor
            LEFT JOIN FETCH p.report
            LEFT JOIN FETCH p.defense
            LEFT JOIN FETCH p.juryAssignment
            ORDER BY p.createdAt DESC
            """)
    List<Project> findAllWithDetails();
}

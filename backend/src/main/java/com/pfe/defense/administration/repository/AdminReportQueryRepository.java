package com.pfe.defense.administration.repository;

import com.pfe.defense.report.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repository dédié au module administration pour les requêtes sur les rapports.
 */
public interface AdminReportQueryRepository extends JpaRepository<Report, Long> {

    @Query("SELECT COUNT(r) FROM Report r WHERE r.visibleToJury = true OR r.status = 'VISIBLE_TO_JURY'")
    long countVisibleToJury();

    @Query("""
            SELECT COUNT(r) FROM Report r
            WHERE r.visibleToJury = false
              AND r.status NOT IN ('NOT_SUBMITTED', 'VISIBLE_TO_JURY')
            """)
    long countNotVisibleButSubmitted();

    @Query("""
            SELECT r FROM Report r
            WHERE r.visibleToJury = false
              AND r.status NOT IN ('NOT_SUBMITTED', 'VISIBLE_TO_JURY')
            """)
    List<Report> findAllNotVisibleToJury();

    @Query("""
            SELECT r FROM Report r
            JOIN FETCH r.project p
            JOIN FETCH p.student
            JOIN FETCH p.supervisor
            WHERE r.visibleToJury = true OR r.status = 'VISIBLE_TO_JURY'
            ORDER BY r.visibilityActivatedAt DESC
            """)
    List<Report> findAllVisibleWithDetails();

    @Query("""
            SELECT r FROM Report r
            JOIN FETCH r.project p
            JOIN FETCH p.student
            JOIN FETCH p.supervisor
            WHERE r.id = :id
              AND (r.visibleToJury = true OR r.status = 'VISIBLE_TO_JURY')
            """)
    java.util.Optional<Report> findVisibleByIdWithDetails(Long id);
}

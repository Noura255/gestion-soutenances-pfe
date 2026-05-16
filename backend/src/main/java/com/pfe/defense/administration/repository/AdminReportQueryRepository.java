package com.pfe.defense.administration.repository;

import com.pfe.defense.report.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * Repository dédié au module administration pour les requêtes sur les rapports.
 */
public interface AdminReportQueryRepository extends JpaRepository<Report, Long> {

    long countByVisibleToJuryTrue();

    @Query("SELECT COUNT(r) FROM Report r WHERE r.visibleToJury = false AND r.status <> 'NOT_SUBMITTED'")
    long countNotVisibleButSubmitted();

    @Query("SELECT r FROM Report r WHERE r.visibleToJury = false AND r.status <> 'NOT_SUBMITTED'")
    List<Report> findAllNotVisibleToJury();
}

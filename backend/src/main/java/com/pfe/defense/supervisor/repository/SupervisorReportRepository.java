package com.pfe.defense.supervisor.repository;

import com.pfe.defense.report.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface SupervisorReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT r FROM Report r " +
           "JOIN FETCH r.project p " +
           "JOIN FETCH p.student " +
           "JOIN FETCH p.supervisor " +
           "LEFT JOIN FETCH p.juryAssignment " +
           "WHERE r.id = :reportId AND p.supervisor.id = :supervisorId")
    Optional<Report> findByIdAndSupervisorIdWithDetails(@Param("reportId") Long reportId, @Param("supervisorId") Long supervisorId);
}

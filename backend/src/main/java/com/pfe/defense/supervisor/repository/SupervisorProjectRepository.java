package com.pfe.defense.supervisor.repository;

import com.pfe.defense.project.Project;
import com.pfe.defense.report.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SupervisorProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p " +
           "LEFT JOIN FETCH p.student " +
           "LEFT JOIN FETCH p.report " +
           "LEFT JOIN FETCH p.juryAssignment " +
           "LEFT JOIN FETCH p.defense " +
           "WHERE p.supervisor.id = :supervisorId")
    List<Project> findBySupervisorIdWithDetails(@Param("supervisorId") Long supervisorId);

    Optional<Project> findByIdAndSupervisorId(Long id, Long supervisorId);

    long countBySupervisorId(Long supervisorId);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.supervisor.id = :supervisorId AND p.report IS NOT NULL AND p.report.status = :status")
    long countBySupervisorIdAndReportStatus(@Param("supervisorId") Long supervisorId, @Param("status") ReportStatus status);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.supervisor.id = :supervisorId AND p.report IS NOT NULL AND p.report.status = :status AND p.juryAssignment IS NOT NULL")
    long countBySupervisorIdAndReportStatusAndJuryAssigned(@Param("supervisorId") Long supervisorId, @Param("status") ReportStatus status);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.supervisor.id = :supervisorId AND p.defense IS NOT NULL")
    long countUpcomingDefensesBySupervisorId(@Param("supervisorId") Long supervisorId);
}

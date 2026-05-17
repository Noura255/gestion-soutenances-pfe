package com.pfe.defense.administration.repository;

import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Repository dédié au module administration pour les requêtes sur les soutenances.
 */
public interface AdminDefenseQueryRepository extends JpaRepository<Defense, Long> {

    List<Defense> findAllByStatus(DefenseStatus status);
    long countByStatus(DefenseStatus status);

    // Chercher une soutenance par projet (pour scheduleDefense)
    @Query("SELECT d FROM Defense d WHERE d.project.id = :projectId")
    java.util.Optional<Defense> findByProjectId(@Param("projectId") Long projectId);

    @Query("""
            SELECT DISTINCT d FROM Defense d
            LEFT JOIN FETCH d.project p
            LEFT JOIN FETCH p.student
            LEFT JOIN FETCH p.supervisor
            LEFT JOIN FETCH d.room
            LEFT JOIN FETCH d.juryAssignment ja
            LEFT JOIN FETCH ja.president
            LEFT JOIN FETCH ja.examiner1
            LEFT JOIN FETCH ja.examiner2
            LEFT JOIN FETCH ja.guest
            ORDER BY d.defenseDate ASC, d.startTime ASC
            """)
    List<Defense> findAllWithDetails();

    @Query("""
            SELECT DISTINCT d FROM Defense d
            LEFT JOIN FETCH d.project p
            LEFT JOIN FETCH p.student
            LEFT JOIN FETCH p.supervisor
            LEFT JOIN FETCH d.room
            LEFT JOIN FETCH d.juryAssignment ja
            LEFT JOIN FETCH ja.president
            LEFT JOIN FETCH ja.examiner1
            LEFT JOIN FETCH ja.examiner2
            LEFT JOIN FETCH ja.guest
            WHERE d.id = :id
            """)
    java.util.Optional<Defense> findByIdWithDetails(@Param("id") Long id);

    // Toutes les soutenances planifiées avec leurs relations (pour détection de conflits globale)
    @Query("""
            SELECT DISTINCT d FROM Defense d
            LEFT JOIN FETCH d.project p
            LEFT JOIN FETCH p.student
            LEFT JOIN FETCH p.supervisor
            LEFT JOIN FETCH d.room
            LEFT JOIN FETCH d.juryAssignment ja
            LEFT JOIN FETCH ja.president
            LEFT JOIN FETCH ja.examiner1
            LEFT JOIN FETCH ja.examiner2
            LEFT JOIN FETCH ja.guest
            WHERE d.status IN ('SCHEDULED', 'PUBLISHED')
            """)
    List<Defense> findAllScheduledWithDetails();

    // Conflit salle : même salle, même date, chevauchement horaire, projet différent
    @Query("""
            SELECT d FROM Defense d
            WHERE d.room.id = :roomId
              AND d.defenseDate = :date
              AND d.startTime < :endTime
              AND d.endTime > :startTime
              AND d.project.id <> :excludeProjectId
              AND d.status IN ('SCHEDULED', 'PUBLISHED')
            """)
    List<Defense> findRoomConflicts(@Param("roomId") Long roomId,
                                    @Param("date") LocalDate date,
                                    @Param("startTime") LocalTime startTime,
                                    @Param("endTime") LocalTime endTime,
                                    @Param("excludeProjectId") Long excludeProjectId);

    // Conflit enseignant : un membre du jury est dans une autre soutenance au même créneau
    @Query("""
            SELECT d FROM Defense d
            JOIN d.juryAssignment ja
            WHERE d.defenseDate = :date
              AND d.startTime < :endTime
              AND d.endTime > :startTime
              AND d.project.id <> :excludeProjectId
              AND d.status IN ('SCHEDULED', 'PUBLISHED')
              AND (ja.president.id = :teacherId
                OR ja.examiner1.id = :teacherId
                OR ja.examiner2.id = :teacherId
                OR ja.guest.id = :teacherId)
            """)
    List<Defense> findTeacherConflicts(@Param("teacherId") Long teacherId,
                                       @Param("date") LocalDate date,
                                       @Param("startTime") LocalTime startTime,
                                       @Param("endTime") LocalTime endTime,
                                       @Param("excludeProjectId") Long excludeProjectId);

    // Conflit étudiant : même étudiant dans deux soutenances
    @Query("""
            SELECT d FROM Defense d
            WHERE d.project.student.id = :studentId
              AND d.defenseDate = :date
              AND d.startTime < :endTime
              AND d.endTime > :startTime
              AND d.project.id <> :excludeProjectId
              AND d.status IN ('SCHEDULED', 'PUBLISHED')
            """)
    List<Defense> findStudentConflicts(@Param("studentId") Long studentId,
                                       @Param("date") LocalDate date,
                                       @Param("startTime") LocalTime startTime,
                                       @Param("endTime") LocalTime endTime,
                                       @Param("excludeProjectId") Long excludeProjectId);

    @Query("""
            SELECT d FROM Defense d
            WHERE d.project.supervisor.id = :supervisorId
              AND d.defenseDate = :date
              AND d.startTime < :endTime
              AND d.endTime > :startTime
              AND d.project.id <> :excludeProjectId
              AND d.status IN ('SCHEDULED', 'PUBLISHED')
            """)
    List<Defense> findSupervisorConflicts(@Param("supervisorId") Long supervisorId,
                                          @Param("date") LocalDate date,
                                          @Param("startTime") LocalTime startTime,
                                          @Param("endTime") LocalTime endTime,
                                          @Param("excludeProjectId") Long excludeProjectId);
}

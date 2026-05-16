package com.pfe.defense.jury;

import com.pfe.defense.defense.Defense;
import com.pfe.defense.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JuryRepository extends JpaRepository<Defense, Long> {
    @Query("""
            select d from Defense d
            join fetch d.project p
            join fetch p.student
            join fetch p.supervisor
            left join fetch d.room
            join fetch d.juryAssignment ja
            where ja.president = :juryMember
               or ja.examiner1 = :juryMember
               or ja.examiner2 = :juryMember
               or ja.guest = :juryMember
            order by d.defenseDate asc, d.startTime asc
            """)
    List<Defense> findAccessibleDefenses(@Param("juryMember") User juryMember);
}

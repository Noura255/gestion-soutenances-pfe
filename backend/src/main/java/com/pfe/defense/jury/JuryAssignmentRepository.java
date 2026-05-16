package com.pfe.defense.jury;

import com.pfe.defense.project.Project;
import com.pfe.defense.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JuryAssignmentRepository extends JpaRepository<JuryAssignment, Long> {
    Optional<JuryAssignment> findByProject(Project project);
    List<JuryAssignment> findAllBySeedDataTrue();
    boolean existsByPresidentOrExaminer1OrExaminer2OrGuest(User president, User examiner1, User examiner2, User guest);
}

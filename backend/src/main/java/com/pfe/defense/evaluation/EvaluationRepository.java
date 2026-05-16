package com.pfe.defense.evaluation;

import com.pfe.defense.project.Project;
import com.pfe.defense.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByProjectAndJuryMember(Project project, User juryMember);
    List<Evaluation> findAllBySeedDataTrue();
    boolean existsByJuryMember(User juryMember);
}

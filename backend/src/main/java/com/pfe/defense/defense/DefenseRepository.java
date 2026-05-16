package com.pfe.defense.defense;

import com.pfe.defense.project.Project;
import com.pfe.defense.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DefenseRepository extends JpaRepository<Defense, Long> {
    Optional<Defense> findByProject(Project project);
    List<Defense> findAllBySeedDataTrue();
    boolean existsByRoom(Room room);
}

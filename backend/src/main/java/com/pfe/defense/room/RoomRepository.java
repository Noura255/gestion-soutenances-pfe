package com.pfe.defense.room;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByNameIgnoreCaseAndSeedDataTrue(String name);
    List<Room> findAllBySeedDataTrue();
}

package com.pfe.defense.administration.repository;

import com.pfe.defense.room.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository dédié au module administration pour les requêtes sur les salles.
 */
public interface AdminRoomQueryRepository extends JpaRepository<Room, Long> {

    List<Room> findAllByAvailableTrue();
}

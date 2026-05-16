package com.pfe.defense.admin.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByCreatedAtDesc();
    Optional<Notification> findByTitleIgnoreCaseAndSeedDataTrue(String title);
    List<Notification> findAllBySeedDataTrue();
}

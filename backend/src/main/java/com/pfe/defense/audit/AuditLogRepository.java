package com.pfe.defense.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop10ByOrderByCreatedAtDesc();
    List<AuditLog> findAllByOrderByCreatedAtDesc();
}

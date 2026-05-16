package com.pfe.defense.audit;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findTop10ByOrderByCreatedAtDesc();
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    List<AuditLog> findByModuleAndActionOrderByCreatedAtDesc(String module, String action);
    List<AuditLog> findByModuleAndActionInOrderByCreatedAtDesc(String module, Collection<String> actions);
    List<AuditLog> findTop5ByModuleAndActionOrderByCreatedAtDesc(String module, String action);
    long countByModuleAndAction(String module, String action);
    boolean existsByActionAndModuleAndPerformedByAndDescriptionAndSeedDataTrue(String action, String module,
                                                                              String performedBy, String description);
    List<AuditLog> findAllBySeedDataTrue();
}

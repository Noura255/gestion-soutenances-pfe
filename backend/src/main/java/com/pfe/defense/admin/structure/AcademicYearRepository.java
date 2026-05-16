package com.pfe.defense.admin.structure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    boolean existsByLabelIgnoreCase(String label);
    Optional<AcademicYear> findByLabelIgnoreCase(String label);
    List<AcademicYear> findAllByOrderByLabelDesc();
    List<AcademicYear> findAllBySeedDataTrue();
}

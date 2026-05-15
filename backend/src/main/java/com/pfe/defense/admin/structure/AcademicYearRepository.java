package com.pfe.defense.admin.structure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    boolean existsByLabelIgnoreCase(String label);
    List<AcademicYear> findAllByOrderByLabelDesc();
}

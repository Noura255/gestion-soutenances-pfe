package com.pfe.defense.admin.structure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FieldRepository extends JpaRepository<Field, Long> {
    boolean existsByNameIgnoreCaseAndDepartment(String name, Department department);
    Optional<Field> findByNameIgnoreCaseAndDepartment(String name, Department department);
    boolean existsByDepartment(Department department);
    List<Field> findAllByOrderByNameAsc();
    List<Field> findAllBySeedDataTrue();
}

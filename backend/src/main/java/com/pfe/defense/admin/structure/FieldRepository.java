package com.pfe.defense.admin.structure;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, Long> {
    boolean existsByNameIgnoreCaseAndDepartment(String name, Department department);
    boolean existsByDepartment(Department department);
    List<Field> findAllByOrderByNameAsc();
}

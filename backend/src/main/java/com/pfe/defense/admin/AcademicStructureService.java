package com.pfe.defense.admin;

import com.pfe.defense.admin.dto.*;
import com.pfe.defense.admin.structure.*;
import com.pfe.defense.audit.AuditLogService;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AcademicStructureService {
    private final DepartmentRepository departmentRepository;
    private final FieldRepository fieldRepository;
    private final AcademicYearRepository academicYearRepository;
    private final AuditLogService auditLogService;

    public AcademicStructureService(DepartmentRepository departmentRepository, FieldRepository fieldRepository,
                                    AcademicYearRepository academicYearRepository, AuditLogService auditLogService) {
        this.departmentRepository = departmentRepository;
        this.fieldRepository = fieldRepository;
        this.academicYearRepository = academicYearRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> departments() {
        return departmentRepository.findAllByOrderByNameAsc().stream().map(DepartmentResponse::from).toList();
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("Ce département existe déjà.");
        }
        Department department = new Department();
        department.setName(request.name());
        department.setDescription(request.description());
        Department saved = departmentRepository.save(department);
        auditLogService.log("CREATE", "DEPARTMENT", "Création du département " + saved.getName(), currentActor());
        return DepartmentResponse.from(saved);
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = findDepartment(id);
        if (!department.getName().equalsIgnoreCase(request.name()) && departmentRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("Un autre département porte déjà ce nom.");
        }
        department.setName(request.name());
        department.setDescription(request.description());
        Department saved = departmentRepository.save(department);
        auditLogService.log("UPDATE", "DEPARTMENT", "Modification du département " + saved.getName(), currentActor());
        return DepartmentResponse.from(saved);
    }

    public void deleteDepartment(Long id) {
        Department department = findDepartment(id);
        if (fieldRepository.existsByDepartment(department)) {
            throw new BadRequestException("Supprimez d'abord les filières rattachées à ce département.");
        }
        departmentRepository.delete(department);
        auditLogService.log("DELETE", "DEPARTMENT", "Suppression du département " + department.getName(), currentActor());
    }

    @Transactional(readOnly = true)
    public List<FieldResponse> fields() {
        return fieldRepository.findAllByOrderByNameAsc().stream().map(FieldResponse::from).toList();
    }

    public FieldResponse createField(FieldRequest request) {
        Department department = findDepartment(request.departmentId());
        if (fieldRepository.existsByNameIgnoreCaseAndDepartment(request.name(), department)) {
            throw new BadRequestException("Cette filière existe déjà dans ce département.");
        }
        Field field = new Field();
        field.setName(request.name());
        field.setDepartment(department);
        Field saved = fieldRepository.save(field);
        auditLogService.log("CREATE", "FIELD", "Création de la filière " + saved.getName(), currentActor());
        return FieldResponse.from(saved);
    }

    public FieldResponse updateField(Long id, FieldRequest request) {
        Field field = findField(id);
        Department department = findDepartment(request.departmentId());
        if ((!field.getName().equalsIgnoreCase(request.name()) || !field.getDepartment().getId().equals(department.getId()))
                && fieldRepository.existsByNameIgnoreCaseAndDepartment(request.name(), department)) {
            throw new BadRequestException("Une autre filière porte déjà ce nom dans ce département.");
        }
        field.setName(request.name());
        field.setDepartment(department);
        Field saved = fieldRepository.save(field);
        auditLogService.log("UPDATE", "FIELD", "Modification de la filière " + saved.getName(), currentActor());
        return FieldResponse.from(saved);
    }

    public void deleteField(Long id) {
        Field field = findField(id);
        fieldRepository.delete(field);
        auditLogService.log("DELETE", "FIELD", "Suppression de la filière " + field.getName(), currentActor());
    }

    @Transactional(readOnly = true)
    public List<AcademicYearResponse> academicYears() {
        return academicYearRepository.findAllByOrderByLabelDesc().stream().map(AcademicYearResponse::from).toList();
    }

    public AcademicYearResponse createAcademicYear(AcademicYearRequest request) {
        if (academicYearRepository.existsByLabelIgnoreCase(request.label())) {
            throw new BadRequestException("Cette année universitaire existe déjà.");
        }
        if (request.active()) {
            deactivateAllAcademicYears();
        }
        AcademicYear academicYear = new AcademicYear();
        academicYear.setLabel(request.label());
        academicYear.setActive(request.active());
        AcademicYear saved = academicYearRepository.save(academicYear);
        auditLogService.log("CREATE", "ACADEMIC_YEAR", "Création de l'année universitaire " + saved.getLabel(), currentActor());
        return AcademicYearResponse.from(saved);
    }

    public AcademicYearResponse updateAcademicYear(Long id, AcademicYearRequest request) {
        AcademicYear academicYear = findAcademicYear(id);
        if (!academicYear.getLabel().equalsIgnoreCase(request.label()) && academicYearRepository.existsByLabelIgnoreCase(request.label())) {
            throw new BadRequestException("Une autre année universitaire porte déjà ce libellé.");
        }
        if (request.active()) {
            deactivateAllAcademicYears();
        }
        academicYear.setLabel(request.label());
        academicYear.setActive(request.active());
        AcademicYear saved = academicYearRepository.save(academicYear);
        auditLogService.log("UPDATE", "ACADEMIC_YEAR", "Modification de l'année universitaire " + saved.getLabel(), currentActor());
        return AcademicYearResponse.from(saved);
    }

    public void deleteAcademicYear(Long id) {
        AcademicYear academicYear = findAcademicYear(id);
        academicYearRepository.delete(academicYear);
        auditLogService.log("DELETE", "ACADEMIC_YEAR", "Suppression de l'année universitaire " + academicYear.getLabel(), currentActor());
    }

    private void deactivateAllAcademicYears() {
        academicYearRepository.findAll().forEach(year -> year.setActive(false));
    }

    private Department findDepartment(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Département introuvable avec l'id " + id));
    }

    private Field findField(Long id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Filière introuvable avec l'id " + id));
    }

    private AcademicYear findAcademicYear(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Année universitaire introuvable avec l'id " + id));
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}

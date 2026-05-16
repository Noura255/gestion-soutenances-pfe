package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.AdministrationDashboardResponse;
import com.pfe.defense.administration.exception.ConflictException;
import com.pfe.defense.administration.repository.AdminDefenseQueryRepository;
import com.pfe.defense.administration.repository.AdminProjectQueryRepository;
import com.pfe.defense.administration.repository.AdminReportQueryRepository;
import com.pfe.defense.administration.repository.AdminRoomQueryRepository;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.defense.DefenseStatus;
import com.pfe.defense.jury.JuryAssignment;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AdministrationDashboardService {

    private final AdminProjectQueryRepository projectRepo;
    private final AdminDefenseQueryRepository defenseRepo;
    private final AdminReportQueryRepository  reportRepo;
    private final AdminRoomQueryRepository    roomRepo;

    public AdministrationDashboardService(AdminProjectQueryRepository projectRepo,
                                          AdminDefenseQueryRepository defenseRepo,
                                          AdminReportQueryRepository reportRepo,
                                          AdminRoomQueryRepository roomRepo) {
        this.projectRepo = projectRepo;
        this.defenseRepo = defenseRepo;
        this.reportRepo  = reportRepo;
        this.roomRepo    = roomRepo;
    }

    public AdministrationDashboardResponse getDashboard() {
        long totalSubmitted    = projectRepo.countSubmitted();
        long withoutJury       = projectRepo.findAllWithoutJury().size();
        long notScheduled      = countDefensesNotScheduled(totalSubmitted);
        long availableRooms    = roomRepo.findAllByAvailableTrue().size();
        int  conflicts         = detectAllConflicts().size();
        long reportsVisible    = reportRepo.countByVisibleToJuryTrue();
        long reportsNotVisible = reportRepo.countNotVisibleButSubmitted();

        return new AdministrationDashboardResponse(
                totalSubmitted, withoutJury, notScheduled,
                availableRooms, conflicts, reportsVisible, reportsNotVisible
        );
    }

    private long countDefensesNotScheduled(long totalSubmitted) {
        long scheduled = defenseRepo.findAll().stream()
                .filter(d -> d.getStatus() != DefenseStatus.NOT_SCHEDULED)
                .count();
        return Math.max(0, totalSubmitted - scheduled);
    }

    public List<ConflictException.ConflictDetail> detectAllConflicts() {
        List<Defense> defenses = defenseRepo.findAllScheduledWithDetails();
        List<ConflictException.ConflictDetail> conflicts = new ArrayList<>();

        for (int i = 0; i < defenses.size(); i++) {
            Defense d1 = defenses.get(i);
            if (d1.getDefenseDate() == null) continue;

            for (int j = i + 1; j < defenses.size(); j++) {
                Defense d2 = defenses.get(j);
                if (d2.getDefenseDate() == null) continue;
                if (!d1.getDefenseDate().equals(d2.getDefenseDate())) continue;

                boolean overlap = d1.getStartTime().isBefore(d2.getEndTime())
                        && d1.getEndTime().isAfter(d2.getStartTime());
                if (!overlap) continue;

                // Conflit salle
                if (d1.getRoom() != null && d2.getRoom() != null
                        && d1.getRoom().getId().equals(d2.getRoom().getId())) {
                    conflicts.add(new ConflictException.ConflictDetail(
                            "ROOM",
                            d1.getProject().getTitle() + " / " + d2.getProject().getTitle(),
                            d1.getStartTime().toString(), d1.getEndTime().toString()));
                }

                // Conflit enseignant
                JuryAssignment ja1 = d1.getJuryAssignment();
                JuryAssignment ja2 = d2.getJuryAssignment();
                if (ja1 != null && ja2 != null) {
                    List<Long> ids1 = juryMemberIds(ja1);
                    List<Long> ids2 = juryMemberIds(ja2);
                    ids1.retainAll(ids2);
                    if (!ids1.isEmpty()) {
                        conflicts.add(new ConflictException.ConflictDetail(
                                "TEACHER",
                                d1.getProject().getTitle() + " / " + d2.getProject().getTitle(),
                                d1.getStartTime().toString(), d1.getEndTime().toString()));
                    }
                }

                // Conflit étudiant
                if (d1.getProject().getStudent() != null && d2.getProject().getStudent() != null
                        && d1.getProject().getStudent().getId()
                            .equals(d2.getProject().getStudent().getId())) {
                    conflicts.add(new ConflictException.ConflictDetail(
                            "STUDENT",
                            d1.getProject().getTitle() + " / " + d2.getProject().getTitle(),
                            d1.getStartTime().toString(), d1.getEndTime().toString()));
                }
            }
        }
        return conflicts;
    }

    private List<Long> juryMemberIds(JuryAssignment ja) {
        List<Long> ids = new ArrayList<>();
        if (ja.getPresident()  != null) ids.add(ja.getPresident().getId());
        if (ja.getExaminer1()  != null) ids.add(ja.getExaminer1().getId());
        if (ja.getExaminer2()  != null) ids.add(ja.getExaminer2().getId());
        if (ja.getGuest()      != null) ids.add(ja.getGuest().getId());
        return ids;
    }
}

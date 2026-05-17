package com.pfe.defense.administration;

import com.pfe.defense.administration.dto.RoomRequest;
import com.pfe.defense.administration.dto.RoomResponse;
import com.pfe.defense.administration.repository.AdminDefenseQueryRepository;
import com.pfe.defense.administration.repository.AdminRoomQueryRepository;
import com.pfe.defense.common.BadRequestException;
import com.pfe.defense.common.ResourceNotFoundException;
import com.pfe.defense.defense.Defense;
import com.pfe.defense.room.Room;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdministrationRoomService {

    private final AdminRoomQueryRepository    roomRepo;
    private final AdminDefenseQueryRepository defenseRepo;
    private final AdministrationAuditService  auditService;

    public AdministrationRoomService(AdminRoomQueryRepository roomRepo,
                                     AdminDefenseQueryRepository defenseRepo,
                                     AdministrationAuditService auditService) {
        this.roomRepo    = roomRepo;
        this.defenseRepo = defenseRepo;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Room room = new Room();
        apply(room, request);
        Room saved = roomRepo.save(room);
        auditService.log("CREATE_ROOM", "Création de la salle \"" + saved.getName() + "\"");
        return toResponse(saved);
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + id));
        apply(room, request);
        Room saved = roomRepo.save(room);
        auditService.log("UPDATE_ROOM", "Modification de la salle \"" + saved.getName() + "\"");
        return toResponse(saved);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Salle introuvable : " + id));

        boolean usedInDefense = defenseRepo.findAll().stream()
                .map(Defense::getRoom)
                .anyMatch(r -> r != null && r.getId().equals(id));

        if (usedInDefense) {
            throw new BadRequestException(
                    "Impossible de supprimer la salle : elle est utilisée dans une soutenance planifiée.");
        }
        roomRepo.delete(room);
        auditService.log("DELETE_ROOM", "Suppression de la salle \"" + room.getName() + "\"");
    }

    private void apply(Room room, RoomRequest req) {
        room.setName(req.name());
        room.setBuilding(req.building());
        room.setCapacity(req.capacity());
        room.setEquipment(req.equipment());
        room.setAvailable(req.available());
    }

    public RoomResponse toResponse(Room room) {
        return new RoomResponse(room.getId(), room.getName(), room.getBuilding(),
                room.getCapacity(), room.getEquipment(), room.isAvailable());
    }
}

package com.pfe.defense.administration.exception;

import java.util.List;

public class ConflictException extends RuntimeException {

    private final List<ConflictDetail> conflicts;

    public ConflictException(List<ConflictDetail> conflicts) {
        super("Conflit(s) de planning détecté(s)");
        this.conflicts = conflicts;
    }

    public List<ConflictDetail> getConflicts() {
        return conflicts;
    }

    public record ConflictDetail(String type, String message, String projectTitle, String startTime, String endTime) {}
}

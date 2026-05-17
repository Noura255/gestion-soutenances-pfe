package com.pfe.defense.supervisor.dto;

public class ActionRequestDto {
    private String comment;

    public ActionRequestDto() {}

    public ActionRequestDto(String comment) {
        this.comment = comment;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}

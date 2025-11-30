package com.campstation.camp.admin.dto;

import java.time.LocalDateTime;

/**
 * 최근 활동 내역 DTO
 */
public class RecentActivityDto {
    private Long id;
    private String type; // 'user', 'campground', 'reservation', 'review'
    private String title;
    private String description;
    private LocalDateTime createdAt;

    // 기본 생성자
    public RecentActivityDto() {}

    // 전체 생성자
    public RecentActivityDto(Long id, String type, String title, String description, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
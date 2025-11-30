package com.campstation.camp.campground.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * 캠핑장 이미지 엔티티
 */
@Entity
@Table(name = "campground_images")
public class CampgroundImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false)
    private Campground campground;

    @Column(name = "thumbnail_url", nullable = false, length = 500)
    private String thumbnailUrl;

    @Column(name = "original_url", nullable = false, length = 500)
    private String originalUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Constructors
    public CampgroundImage() {
    }

    public CampgroundImage(Long id, Campground campground, String thumbnailUrl, String originalUrl, Integer displayOrder, Boolean isMain, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.campground = campground;
        this.thumbnailUrl = thumbnailUrl;
        this.originalUrl = originalUrl;
        this.displayOrder = displayOrder;
        this.isMain = isMain;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Campground getCampground() {
        return campground;
    }

    public void setCampground(Campground campground) {
        this.campground = campground;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    // Backward compatibility: getImageUrl returns thumbnail URL
    @Deprecated
    public String getImageUrl() {
        return thumbnailUrl;
    }

    // Backward compatibility: setImageUrl sets both URLs (for migration)
    @Deprecated
    public void setImageUrl(String imageUrl) {
        this.thumbnailUrl = imageUrl;
        this.originalUrl = imageUrl;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsMain() {
        return isMain;
    }

    public void setIsMain(Boolean isMain) {
        this.isMain = isMain;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * 메인 이미지로 설정
     */
    public void setAsMainImage() {
        this.isMain = true;
    }

    /**
     * 일반 이미지로 설정
     */
    public void setAsNormalImage() {
        this.isMain = false;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Campground campground;
        private String thumbnailUrl;
        private String originalUrl;
        private Integer displayOrder = 0;
        private Boolean isMain = false;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder campground(Campground campground) {
            this.campground = campground;
            return this;
        }

        public Builder thumbnailUrl(String thumbnailUrl) {
            this.thumbnailUrl = thumbnailUrl;
            return this;
        }

        public Builder originalUrl(String originalUrl) {
            this.originalUrl = originalUrl;
            return this;
        }

        // Backward compatibility
        @Deprecated
        public Builder imageUrl(String imageUrl) {
            this.thumbnailUrl = imageUrl;
            this.originalUrl = imageUrl;
            return this;
        }

        public Builder displayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
            return this;
        }

        public Builder isMain(Boolean isMain) {
            this.isMain = isMain;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public CampgroundImage build() {
            CampgroundImage image = new CampgroundImage();
            image.setId(id);
            image.setCampground(campground);
            image.setThumbnailUrl(thumbnailUrl);
            image.setOriginalUrl(originalUrl);
            image.setDisplayOrder(displayOrder);
            image.setIsMain(isMain);
            image.setCreatedAt(createdAt);
            image.setUpdatedAt(updatedAt);
            return image;
        }
    }
}
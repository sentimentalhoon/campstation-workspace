package com.campstation.camp.campground.domain;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.campstation.camp.shared.domain.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 캠핑 사이트 정보를 저장하는 엔티티
 */
@Entity
@Table(name = "sites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Site extends BaseEntity {

    @Column(name = "site_number", nullable = false, length = 20)
    @NotBlank(message = "사이트 번호는 필수입니다")
    @Size(max = 20, message = "사이트 번호는 20자를 초과할 수 없습니다")
    private String siteNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "site_type", nullable = false)
    private SiteType siteType;

    @Column(name = "capacity", nullable = false)
    @Min(value = 1, message = "수용 인원은 1명 이상이어야 합니다")
    @Max(value = 20, message = "수용 인원은 20명을 초과할 수 없습니다")
    private Integer capacity;

    @Column(name = "description", columnDefinition = "TEXT")
    @Size(max = 1000, message = "설명은 1000자를 초과할 수 없습니다")
    private String description;

    @Column(name = "latitude", precision = 10, scale = 8)
    @DecimalMin(value = "-90.0", message = "위도는 -90.0 이상이어야 합니다")
    @DecimalMax(value = "90.0", message = "위도는 90.0 이하여야 합니다")
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    @DecimalMin(value = "-180.0", message = "경도는 -180.0 이상이어야 합니다")
    @DecimalMax(value = "180.0", message = "경도는 180.0 이하여야 합니다")
    private BigDecimal longitude;

    // 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SiteStatus status = SiteStatus.AVAILABLE;

    // 연관 관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false, insertable = false, updatable = false)
    private Campground campground;

    // Campground ID를 직접 저장 (LazyInitializationException 방지)
    @Column(name = "campground_id", nullable = false)
    private Long campgroundId;

    /**
     * 사이트 이미지 목록
     * CascadeType.ALL: 사이트 삭제 시 이미지도 함께 삭제
     * orphanRemoval = true: 컬렉션에서 제거된 이미지는 자동 삭제
     */
    @OneToMany(mappedBy = "site", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<SiteImage> images = new ArrayList<>();

    /**
     * JPA Optimistic Locking을 위한 버전 필드
     * 동시성 제어를 통해 예약 충돌 방지
     */
    @Version
    @Column(name = "version")
    private Long version;

    /**
     * 편의시설 비트마스크
     * 각 비트는 AmenityType의 ordinal 위치를 나타냄
     */
    @Column(name = "amenities_flags", nullable = false)
    @Builder.Default
    private Long amenitiesFlags = 0L;

    /**
     * 사이트 정보 업데이트
     */
    public void updateInfo(String siteNumber, SiteType siteType, Integer capacity,
                          String description, BigDecimal latitude, BigDecimal longitude) {
        if (siteNumber != null && !siteNumber.isBlank()) {
            this.siteNumber = siteNumber;
        }
        if (siteType != null) {
            this.siteType = siteType;
        }
        if (capacity != null) {
            this.capacity = capacity;
        }
        if (latitude != null) {
            this.latitude = latitude;
        }
        if (longitude != null) {
            this.longitude = longitude;
        }
        this.description = description;
    }

    /**
     * 편의시설 추가
     */
    public void addAmenity(AmenityType amenity) {
        this.amenitiesFlags |= amenity.toBitMask();
    }
    
    /**
     * 편의시설 제거
     */
    public void removeAmenity(AmenityType amenity) {
        this.amenitiesFlags &= ~amenity.toBitMask();
    }
    
    /**
     * 편의시설 보유 여부 확인
     */
    public boolean hasAmenity(AmenityType amenity) {
        return (this.amenitiesFlags & amenity.toBitMask()) != 0;
    }
    
    /**
     * 모든 편의시설 조회
     */
    public Set<AmenityType> getAmenities() {
        return Arrays.stream(AmenityType.values())
            .filter(this::hasAmenity)
            .collect(Collectors.toCollection(() -> EnumSet.noneOf(AmenityType.class)));
    }
    
    /**
     * 편의시설 목록으로 비트마스크 설정
     */
    public void setAmenities(Set<AmenityType> amenities) {
        this.amenitiesFlags = 0L;
        if (amenities != null) {
            for (AmenityType amenity : amenities) {
                addAmenity(amenity);
            }
        }
    }
    
    /**
     * 편의시설 비트마스크 직접 설정 (마이그레이션용)
     */
    public void setAmenitiesFlags(Long flags) {
        this.amenitiesFlags = flags != null ? flags : 0L;
    }
    
    /**
     * 편의시설 비트마스크 조회
     */
    public Long getAmenitiesFlags() {
        return this.amenitiesFlags;
    }

    /**
     * 상태 변경
     */
    public void changeStatus(SiteStatus status) {
        this.status = status;
    }

    /**
     * 캠핑장 설정 (연관관계 편의 메서드)
     */
    public void setCampground(Campground campground) {
        this.campground = campground;
    }

    /**
     * 이미지 목록 조회
     */
    public List<SiteImage> getImages() {
        return images;
    }

    /**
     * 이미지 추가 (연관관계 편의 메서드)
     */
    public void addImage(SiteImage image) {
        images.add(image);
        image.setSite(this);
    }

    /**
     * 이미지 제거 (연관관계 편의 메서드)
     */
    public void removeImage(SiteImage image) {
        images.remove(image);
        image.setSite(null);
    }

    // Getters and Setters
    public String getSiteNumber() {
        return siteNumber;
    }

    public void setSiteNumber(String siteNumber) {
        this.siteNumber = siteNumber;
    }

    public SiteType getSiteType() {
        return siteType;
    }

    public void setSiteType(SiteType siteType) {
        this.siteType = siteType;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public SiteStatus getStatus() {
        return status;
    }

    public void setStatus(SiteStatus status) {
        this.status = status;
    }

    public Campground getCampground() {
        return campground;
    }
}
package com.campstation.camp.banner.domain;

import java.time.LocalDateTime;

import com.campstation.camp.shared.domain.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 배너 엔티티
 * 메인 페이지, 이벤트 페이지 등에 표시되는 배너 정보를 저장합니다.
 */
@Entity
@Table(name = "banners")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Banner extends BaseEntity {

    @Column(name = "title", nullable = false, length = 200)
    @NotBlank(message = "배너 제목은 필수입니다")
    @Size(max = 200, message = "배너 제목은 200자를 초과할 수 없습니다")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    @Size(max = 1000, message = "배너 설명은 1000자를 초과할 수 없습니다")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    @NotNull(message = "배너 타입은 필수입니다")
    private BannerType type;

    // 이미지 정보
    @Column(name = "image_url", nullable = false, length = 500)
    @NotBlank(message = "이미지 URL은 필수입니다")
    private String imageUrl;

    @Column(name = "thumbnail_url", nullable = false, length = 500)
    @NotBlank(message = "썸네일 URL은 필수입니다")
    private String thumbnailUrl;

    // 링크 정보
    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "link_target", length = 20)
    private String linkTarget; // _blank, _self

    // 표시 순서
    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    // 활성화 상태
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @NotNull(message = "배너 상태는 필수입니다")
    private BannerStatus status = BannerStatus.INACTIVE;

    // 활성화 기간
    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // 통계
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @Column(name = "click_count", nullable = false)
    private Long clickCount = 0L;

    @Builder
    public Banner(String title, String description, BannerType type, 
                  String imageUrl, String thumbnailUrl, 
                  String linkUrl, String linkTarget,
                  Integer displayOrder, BannerStatus status,
                  LocalDateTime startDate, LocalDateTime endDate) {
        this.title = title;
        this.description = description;
        this.type = type;
        this.imageUrl = imageUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.linkUrl = linkUrl;
        this.linkTarget = linkTarget;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.status = status != null ? status : BannerStatus.INACTIVE;
        this.startDate = startDate;
        this.endDate = endDate;
        this.viewCount = 0L;
        this.clickCount = 0L;
    }

    /**
     * 배너 정보 업데이트
     */
    public void update(String title, String description, BannerType type,
                      String imageUrl, String thumbnailUrl,
                      String linkUrl, String linkTarget,
                      LocalDateTime startDate, LocalDateTime endDate) {
        if (title != null) this.title = title;
        if (description != null) this.description = description;
        if (type != null) this.type = type;
        if (imageUrl != null) this.imageUrl = imageUrl;
        if (thumbnailUrl != null) this.thumbnailUrl = thumbnailUrl;
        this.linkUrl = linkUrl;
        this.linkTarget = linkTarget;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    /**
     * 표시 순서 변경
     */
    public void updateDisplayOrder(Integer displayOrder) {
        if (displayOrder != null) {
            this.displayOrder = displayOrder;
        }
    }

    /**
     * 상태 변경
     */
    public void updateStatus(BannerStatus status) {
        if (status != null) {
            this.status = status;
        }
    }

    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * 클릭수 증가
     */
    public void incrementClickCount() {
        this.clickCount++;
    }

    /**
     * 활성 기간 내에 있는지 확인
     */
    public boolean isWithinActivePeriod() {
        LocalDateTime now = LocalDateTime.now();
        
        if (startDate != null && now.isBefore(startDate)) {
            return false;
        }
        
        if (endDate != null && now.isAfter(endDate)) {
            return false;
        }
        
        return true;
    }

    /**
     * 현재 활성화되어 있는지 확인
     */
    public boolean isActive() {
        return status == BannerStatus.ACTIVE && isWithinActivePeriod();
    }
}

package com.campstation.camp.announcement.domain;

import java.util.ArrayList;
import java.util.List;

import com.campstation.camp.campground.domain.Campground;
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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 공지사항 엔티티
 * 캠핑장별 공지사항 정보를 저장합니다.
 */
@Entity
@Table(name = "announcements")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Announcement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false)
    @NotNull(message = "캠핑장은 필수입니다")
    private Campground campground;

    @Column(name = "title", nullable = false, length = 200)
    @NotBlank(message = "공지사항 제목은 필수입니다")
    @Size(max = 200, message = "공지사항 제목은 200자를 초과할 수 없습니다")
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "공지사항 내용은 필수입니다")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    @NotNull(message = "공지사항 타입은 필수입니다")
    private AnnouncementType type;

    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;

    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AnnouncementImage> images = new ArrayList<>();

    @Builder
    public Announcement(Campground campground, String title, String content,
                       AnnouncementType type, Boolean isPinned) {
        this.campground = campground;
        this.title = title;
        this.content = content;
        this.type = type;
        this.isPinned = isPinned != null ? isPinned : false;
        this.viewCount = 0L;
    }

    /**
     * 공지사항 정보 업데이트
     */
    public void update(String title, String content, AnnouncementType type, Boolean isPinned) {
        if (title != null) this.title = title;
        if (content != null) this.content = content;
        if (type != null) this.type = type;
        if (isPinned != null) this.isPinned = isPinned;
    }

    /**
     * 조회수 증가
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    /**
     * 고정 상태 토글
     */
    public void togglePin() {
        this.isPinned = !this.isPinned;
    }

    /**
     * 이미지 추가 헬퍼 메서드
     */
    public void addImage(AnnouncementImage image) {
        images.add(image);
        image.setAnnouncement(this);
    }

    /**
     * 이미지 제거 헬퍼 메서드
     */
    public void removeImage(AnnouncementImage image) {
        images.remove(image);
        image.setAnnouncement(null);
    }

    /**
     * 모든 이미지 제거
     */
    public void clearImages() {
        images.clear();
    }
}

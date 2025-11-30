package com.campstation.camp.stats.domain;

import java.time.LocalDateTime;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.user.domain.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 캠핑장 조회 로그 엔티티
 * 모든 캠핑장 페이지 조회 기록을 저장
 * 보관 기간: 90일 (배치 작업으로 자동 삭제)
 */
@Entity
@Table(name = "campground_view_logs", indexes = {
    @Index(name = "idx_campground_viewed_at", columnList = "campground_id, viewed_at"),
    @Index(name = "idx_session_campground_viewed", columnList = "session_id, campground_id, viewed_at"),
    @Index(name = "idx_user_viewed_at", columnList = "user_id, viewed_at"),
    @Index(name = "idx_viewed_date", columnList = "campground_id, viewed_at")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CampgroundViewLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false)
    private Campground campground;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "session_id", nullable = false, length = 255)
    private String sessionId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "referrer", length = 500)
    private String referrer;

    @Column(name = "view_duration", nullable = false)
    private Integer viewDuration = 0;

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Builder
    public CampgroundViewLog(Campground campground, User user, String sessionId,
                             String ipAddress, String userAgent, String referrer,
                             Integer viewDuration, LocalDateTime viewedAt) {
        this.campground = campground;
        this.user = user;
        this.sessionId = sessionId;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.referrer = referrer;
        this.viewDuration = viewDuration != null ? viewDuration : 0;
        this.viewedAt = viewedAt != null ? viewedAt : LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 체류 시간 업데이트
     */
    public void updateViewDuration(Integer duration) {
        if (duration != null && duration > 0) {
            this.viewDuration = duration;
        }
    }
}

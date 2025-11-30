package com.campstation.camp.review.domain;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

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
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 리뷰 좋아요 엔티티
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Entity
@Table(name = "review_likes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"review_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ReviewLike {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * ReviewLike 생성
     * 
     * @param review 리뷰
     * @param user 사용자
     * @return ReviewLike
     */
    public static ReviewLike of(Review review, User user) {
        return ReviewLike.builder()
                .review(review)
                .user(user)
                .build();
    }
}

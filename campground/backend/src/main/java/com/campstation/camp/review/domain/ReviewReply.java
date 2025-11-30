package com.campstation.camp.review.domain;

import com.campstation.camp.shared.domain.BaseEntity;
import com.campstation.camp.user.domain.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

/**
 * 리뷰 답글 엔티티 (운영자/관리자 전용)
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Entity
@Table(name = "review_replies")
public class ReviewReply extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false, unique = true)
    private Review review;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 답글 작성자 (OWNER 또는 ADMIN)

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comment;

    // Constructors
    public ReviewReply() {
    }

    public ReviewReply(Review review, User user, String comment) {
        this.review = review;
        this.user = user;
        this.comment = comment;
    }

    // Getters and Setters
    public Review getReview() {
        return review;
    }

    public void setReview(Review review) {
        this.review = review;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    // Business Methods
    public void updateComment(String comment) {
        this.comment = comment;
    }
}

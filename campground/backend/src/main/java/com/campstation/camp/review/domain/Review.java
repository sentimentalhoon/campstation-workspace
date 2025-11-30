package com.campstation.camp.review.domain;

import java.util.ArrayList;
import java.util.List;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.shared.domain.BaseEntity;
import com.campstation.camp.shared.security.Ownable;
import com.campstation.camp.user.domain.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/**
 * 리뷰 엔티티
 * Ownable 인터페이스를 구현하여 소유자(작성자) 기반 권한 체크 지원
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Entity
@Table(name = "reviews")
public class Review extends BaseEntity implements Ownable {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false)
    private Campground campground;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = true)
    private com.campstation.camp.reservation.domain.Reservation reservation;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ReviewImage> images = new ArrayList<>();

    // Constructors
    public Review() {
    }

    public Review(User user, Campground campground, Integer rating, String comment) {
        this.user = user;
        this.campground = campground;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Campground getCampground() {
        return campground;
    }

    public void setCampground(Campground campground) {
        this.campground = campground;
    }

    public com.campstation.camp.reservation.domain.Reservation getReservation() {
        return reservation;
    }

    public void setReservation(com.campstation.camp.reservation.domain.Reservation reservation) {
        this.reservation = reservation;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public List<ReviewImage> getImages() {
        return images;
    }

    public void setImages(List<ReviewImage> images) {
        this.images = images;
    }

    /**
     * 이미지 추가 헬퍼 메서드
     */
    public void addImage(ReviewImage image) {
        images.add(image);
        image.setReview(this);
    }

    /**
     * 이미지 제거 헬퍼 메서드
     */
    public void removeImage(ReviewImage image) {
        images.remove(image);
        image.setReview(null);
    }

    /**
     * 모든 이미지 제거
     */
    public void clearImages() {
        images.clear();
    }

    /**
     * Ownable 인터페이스 구현: 리뷰 작성자(소유자) 반환
     * 
     * @return 리뷰 작성자
     */
    @Override
    public User getOwner() {
        return this.user;
    }

    /**
     * 리뷰 정보 업데이트
     *
     * @param rating 평점
     * @param comment 리뷰 내용
     */
    public void updateReview(Integer rating, String comment) {
        if (rating != null) {
            this.rating = rating;
        }
        this.comment = comment;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private User user;
        private Campground campground;
        private Integer rating;
        private String comment;

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder campground(Campground campground) {
            this.campground = campground;
            return this;
        }

        public Builder rating(Integer rating) {
            this.rating = rating;
            return this;
        }

        public Builder comment(String comment) {
            this.comment = comment;
            return this;
        }

        public Review build() {
            Review review = new Review();
            review.setUser(user);
            review.setCampground(campground);
            review.setRating(rating);
            review.setComment(comment);
            return review;
        }
    }
}

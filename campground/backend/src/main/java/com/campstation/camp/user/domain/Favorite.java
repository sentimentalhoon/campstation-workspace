package com.campstation.camp.user.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import com.campstation.camp.shared.domain.BaseEntity;
import com.campstation.camp.campground.domain.Campground;

/**
 * 찜하기 엔티티
 * 사용자가 캠핑장을 찜하는 기능
 */
@Entity
@Table(name = "favorites")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Favorite extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campground_id", nullable = false)
    private Campground campground;

    @Builder
    public Favorite(User user, Campground campground) {
        this.user = user;
        this.campground = campground;
    }
}
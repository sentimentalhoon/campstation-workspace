package com.campstation.camp.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campstation.camp.user.domain.ProfileImage;

/**
 * 프로필 이미지 Repository
 */
public interface ProfileImageRepository extends JpaRepository<ProfileImage, Long> {

    /**
     * 사용자 ID로 프로필 이미지 조회
     */
    @Query("SELECT pi FROM ProfileImage pi WHERE pi.user.id = :userId")
    Optional<ProfileImage> findByUserId(@Param("userId") Long userId);

    /**
     * 사용자 ID로 프로필 이미지 삭제
     */
    @Modifying
    @Query("DELETE FROM ProfileImage pi WHERE pi.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    /**
     * 사용자 ID로 프로필 이미지 존재 여부 확인
     */
    @Query("SELECT COUNT(pi) > 0 FROM ProfileImage pi WHERE pi.user.id = :userId")
    boolean existsByUserId(@Param("userId") Long userId);
}

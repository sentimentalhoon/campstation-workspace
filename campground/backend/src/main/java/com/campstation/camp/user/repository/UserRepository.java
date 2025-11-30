package com.campstation.camp.user.repository;

import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;
import com.campstation.camp.user.domain.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 사용자 데이터 접근을 위한 Repository
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 사용자명으로 사용자 조회
     */
    Optional<User> findByUsername(String username);

    /**
     * 이메일로 사용자 조회
     */
    Optional<User> findByEmail(String email);

    /**
     * 사용자명과 상태로 사용자 조회 (로그인용)
     */
    Optional<User> findByUsernameAndStatus(String username, UserStatus status);

    /**
     * 이메일과 상태로 사용자 조회 (로그인용)
     */
    Optional<User> findByEmailAndStatus(String email, UserStatus status);

    /**
     * 사용자명 존재 여부 확인
     */
    boolean existsByUsername(String username);

    /**
     * 이메일 존재 여부 확인
     */
    boolean existsByEmail(String email);

    /**
     * 활성 사용자 수 조회 (관리자용)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
    long countByStatus(UserStatus status);

    /**
     * 역할별 사용자 수 조회 (관리자용)
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    long countByRole(UserRole role);
}
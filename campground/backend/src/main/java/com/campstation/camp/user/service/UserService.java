package com.campstation.camp.user.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.logging.Logger;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.user.domain.ProfileImage;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserStatus;
import com.campstation.camp.user.dto.UserResponseDto;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스
 * Spring Security UserDetailsService 구현
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService implements UserDetailsService {

    private static final Logger logger = Logger.getLogger(UserService.class.getName());

    private final UserRepository userRepository;
    private final ProfileImageRepository profileImageRepository;
    private final S3FileService s3FileService;

    /**
     * User 엔티티 직접 조회 (내부 로직에서만 사용)
     * - 캐싱하지 않고 항상 DB에서 조회
     */
    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = getUserEntityByEmail(email);
        // User 자체가 UserDetails 구현체이므로 그대로 반환 가능
        return user;
    }

    /**
     * 사용자명으로 사용자 조회 (캐싱 불필요)
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * 이메일로 사용자 조회
     * Optional<User>를 직접 캐싱하지 않고, User 캐싱 메서드를 감싸서 반환
     */
    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(getUserEntityByEmail(email));
    }

    /**
     * ID로 사용자 조회
     * Optional<User> 캐싱 대신 User 캐싱 후 Optional로 감싸기
     */
    @Cacheable(value = "users", key = "'id:' + #id", unless = "#result == null")
    public User getUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    public Optional<User> findById(Long id) {
        return Optional.ofNullable(getUserEntityById(id));
    }

    /**
     * 사용자 생성
     */
    @Transactional
    @CacheEvict(value = {"users", "userDetails"}, allEntries = true)
    public User createUser(User user) {
        logger.info("Creating new user: " + user.getUsername());

        // 중복 확인
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }

        return userRepository.save(user);
    }

    /**
     * 사용자 정보 업데이트
     */
    @Transactional
    @CachePut(value = "users", key = "'id:' + #id")
    public User updateUser(Long id, User updateUser) {
        logger.info("Updating user: " + id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        // 업데이트 가능한 필드만 수정
        if (updateUser.getName() != null) {
            user.setName(updateUser.getName());
        }
        if (updateUser.getPhone() != null) {
            user.setPhone(updateUser.getPhone());
        }

        return userRepository.save(user);
    }

    /**
     * 마지막 로그인 시간 업데이트
     */
    @Transactional
    @CacheEvict(value = "users", key = "'email:' + #email")
    public void updateLastLoginTime(String email) {
        userRepository.findByEmail(email)
                .ifPresent(user -> {
                    user.setLastLoginAt(LocalDateTime.now());
                    userRepository.save(user);
                });
    }

    /**
     * 사용자 활성화/비활성화
     */
    @Transactional
    @CacheEvict(value = "users", key = "'id:' + #id")
    public void updateUserStatus(Long id, UserStatus status) {
        logger.info("Updating user status: " + id + " to " + status);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));

        user.setStatus(status);
        userRepository.save(user);
    }

    /**
     * 사용자명 또는 이메일 존재 여부 확인
     */
    public boolean existsByUsernameOrEmail(String username, String email) {
        return userRepository.existsByUsername(username) ||
               userRepository.existsByEmail(email);
    }

    /**
     * 현재 로그인된 사용자 정보 조회
     */
    public User getCurrentUser(String email) {
        return userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }

    /**
     * 사용자 프로필 업데이트
     */
    @Transactional
    @CacheEvict(value = "users", key = "'email:' + #email")
    public User updateProfile(String email, String name, String phone, String thumbnailUrl, String originalUrl) {
        User user = getCurrentUser(email);

        if (name != null && !name.trim().isEmpty()) {
            user.setName(name.trim());
        }
        if (phone != null && !phone.trim().isEmpty()) {
            user.setPhone(phone.trim());
        }
        
        // 프로필 이미지 처리
        if (thumbnailUrl != null && originalUrl != null) {
            // URL에서 경로만 추출하여 저장 (S3FileService 공통 로직 사용)
            String thumbnailPath = s3FileService.normalizePath(thumbnailUrl);
            String originalPath = s3FileService.normalizePath(originalUrl);

            // 기존 프로필 이미지가 있으면 업데이트, 없으면 새로 생성
            ProfileImage profileImage = profileImageRepository.findByUserId(user.getId())
                    .orElse(new ProfileImage(user, thumbnailPath, originalPath));

            // 기존 이미지가 있었다면 S3에서 삭제
            if (profileImage.getId() != null) {
                try {
                    log.info("Deleting old profile images from S3 for user: {}", user.getId());
                    s3FileService.deleteFile(profileImage.getThumbnailUrl());
                    s3FileService.deleteFile(profileImage.getOriginalUrl());
                } catch (Exception e) {
                    log.error("Failed to delete old profile images from S3", e);
                }
                
                // 이미지 경로 업데이트
                profileImage.setThumbnailUrl(thumbnailPath);
                profileImage.setOriginalUrl(originalPath);
            }

            profileImageRepository.save(profileImage);
            log.info("Saved profile image for user: {} (thumbnail: {}, original: {})", 
                    user.getId(), thumbnailPath, originalPath);
        }

        return userRepository.save(user);
    }

    /**
     * 환불 계좌 정보 업데이트
     */
    @Transactional
    @CacheEvict(value = "users", key = "'email:' + #email")
    public User updateRefundAccount(String email, String refundBankName, String refundAccountNumber, String refundAccountHolder) {
        User user = getCurrentUser(email);

        if (refundBankName != null) {
            user.setRefundBankName(refundBankName.trim());
        }
        if (refundAccountNumber != null) {
            user.setRefundAccountNumber(refundAccountNumber.trim());
        }
        if (refundAccountHolder != null) {
            user.setRefundAccountHolder(refundAccountHolder.trim());
        }

        return userRepository.save(user);
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    @CacheEvict(value = "users", key = "'email:' + #email")
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = getCurrentUser(email);

        // 현재 비밀번호 검증 (실제로는 PasswordEncoder 사용)
        if (!user.getPassword().equals(currentPassword)) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(newPassword);
        userRepository.save(user);
    }

        /**
     * 소셜 로그인 사용자 생성
     * username이 제공되지 않은 경우 자동 생성
     */
    @Transactional
    @CacheEvict(value = {"users", "userDetails"}, allEntries = true)
    public User createSocialUser(String email, String name, String provider, String providerId) {
        log.info("Creating social user: {} from {}", email, provider);

        // 이메일 중복 확인
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setStatus(UserStatus.ACTIVE);
        user.setProvider(provider);
        user.setProviderId(providerId);

        // username 자동 생성
        user.generateUsernameForSocialLogin();

        // username 중복 확인 및 해결
        String originalUsername = user.getUsername();
        int suffix = 1;
        while (userRepository.existsByUsername(user.getUsername())) {
            user.setUsernameField(originalUsername);
            user.appendUsernameSuffix(suffix);
            suffix++;
            if (suffix > 100) { // 무한 루프 방지
                throw new IllegalArgumentException("Unable to generate unique username for: " + email);
            }
        }

        return userRepository.save(user);
    }

    /**
     * 소셜 로그인 사용자 조회 또는 생성
     * 기존 사용자가 있으면 반환, 없으면 새로 생성
     */
    @Transactional
    public User findOrCreateSocialUser(String email, String name, String provider, String providerId) {
        log.info("Finding or creating social user: {} from {}", email, provider);

        // 기존 사용자 조회
        Optional<User> existingUser = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // 소셜 로그인 정보 업데이트 (필요한 경우)
            if (user.getProvider() == null) {
                user.setProvider(provider);
                user.setProviderId(providerId);
                userRepository.save(user);
            }
            return user;
        }

        // 새 사용자 생성
        return createSocialUser(email, name, provider, providerId);
    }

    /**
     * 이메일로 User ID만 조회 (캐싱 없이 단순 조회)
     * - 인증/인가 과정에서 자주 쓰일 경우 성능 최적화 가능
     */
    public Long getUserIdByEmail(String email) {
        return userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .map(User::getId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
    }
    /**
     * 이메일로 UserResponseDto 조회 (캐싱 적용)
     * - User 엔티티 대신 UserResponseDto를 캐싱하여 직렬화 문제 방지
     */
    @Cacheable(value = "users", key = "'email:' + #email", unless = "#result == null")
    public UserResponseDto getUserByEmail(String email) {
        log.debug("DB 조회: {}", email);
        User user = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return UserResponseDto.fromEntity(user, s3FileService, profileImageRepository);
    }

}

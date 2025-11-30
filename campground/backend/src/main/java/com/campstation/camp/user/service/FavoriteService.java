package com.campstation.camp.user.service;

import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.shared.dto.PageResponse;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.user.domain.Favorite;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.dto.FavoriteResponseDto;
import com.campstation.camp.user.repository.FavoriteRepository;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 찜하기 서비스
 * 최신 Spring Boot 기법과 캐싱 전략을 적용한 완벽한 구현
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final CampgroundRepository campgroundRepository;

    /**
     * 캠핑장 찜하기 토글 (추가/제거)
     * @param userId 사용자 ID
     * @param campgroundId 캠핑장 ID
     * @return 찜하기 응답 DTO (추가된 경우) 또는 null (제거된 경우)
     */
    @Transactional
    @CacheEvict(value = {"userFavorites", "favoriteStatus", "favoriteCounts", "popularCampgrounds", "campgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public FavoriteResponseDto toggleFavorite(Long userId, Long campgroundId) {
        log.debug("Toggling favorite for user: {}, campground: {}", userId, campgroundId);

        User user = findUserById(userId);
        Campground campground = findCampgroundById(campgroundId);

        // 이미 찜하기한 경우 제거
        if (favoriteRepository.existsByUserAndCampground(user, campground)) {
            favoriteRepository.deleteByUserAndCampground(user, campground);
            campground.decrementFavoriteCount();
            campgroundRepository.save(campground);
            log.info("Removed favorite for user: {}, campground: {} (count: {})", userId, campgroundId, campground.getFavoriteCount());
            return null;
        }

        // 찜하기 추가
        Favorite favorite = Favorite.builder()
                .user(user)
                .campground(campground)
                .build();

        Favorite savedFavorite = favoriteRepository.save(favorite);
        campground.incrementFavoriteCount();
        campgroundRepository.save(campground);

        FavoriteResponseDto response = createFavoriteResponseDto(savedFavorite);
        log.info("Added favorite for user: {}, campground: {} (count: {})", userId, campgroundId, campground.getFavoriteCount());

        return response;
    }

    /**
     * 캠핑장 찜하기 추가 (기존 방식 유지)
     */
    @Transactional
    @CacheEvict(value = {"userFavorites", "favoriteStatus", "favoriteCounts", "popularCampgrounds", "campgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public FavoriteResponseDto addFavorite(Long userId, Long campgroundId) {
        log.debug("Adding favorite for user: {}, campground: {}", userId, campgroundId);

        User user = findUserById(userId);
        Campground campground = findCampgroundById(campgroundId);

        // 이미 찜하기한 경우 확인
        if (favoriteRepository.existsByUserAndCampground(user, campground)) {
            throw new IllegalArgumentException("이미 찜하기한 캠핑장입니다.");
        }

        Favorite favorite = Favorite.builder()
                .user(user)
                .campground(campground)
                .build();

        Favorite savedFavorite = favoriteRepository.save(favorite);
        campground.incrementFavoriteCount();
        campgroundRepository.save(campground);

        FavoriteResponseDto response = createFavoriteResponseDto(savedFavorite);

        log.info("Added favorite for user: {}, campground: {} (count: {})", userId, campgroundId, campground.getFavoriteCount());
        return response;
    }

    /**
     * 캠핑장 찜하기 제거
     */
    @Transactional
    @CacheEvict(value = {"userFavorites", "favoriteStatus", "favoriteCounts", "popularCampgrounds", "campgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public void removeFavorite(Long userId, Long campgroundId) {
        log.debug("Removing favorite for user: {}, campground: {}", userId, campgroundId);

        User user = findUserById(userId);
        Campground campground = findCampgroundById(campgroundId);

        favoriteRepository.deleteByUserAndCampground(user, campground);
        campground.decrementFavoriteCount();
        campgroundRepository.save(campground);

        log.info("Removed favorite for user: {}, campground: {} (count: {})", userId, campgroundId, campground.getFavoriteCount());
    }

    /**
     * 사용자의 찜하기 목록 조회 (페이징 지원)
     */
    @Cacheable(value = "userFavorites", key = "'user:' + #userId + ':page:' + #pageable.pageNumber + ':size:' + #pageable.pageSize", condition = "!@environment.acceptsProfiles('local')")
    public PageResponse<FavoriteResponseDto> getUserFavorites(Long userId, Pageable pageable) {
        log.debug("Getting favorites for user: {}, page: {}, size: {}", userId, pageable.getPageNumber(), pageable.getPageSize());

        User user = findUserById(userId);

        Page<Favorite> favoritePage = favoriteRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        Page<FavoriteResponseDto> responsePage = favoritePage.map(this::createFavoriteResponseDto);

        return PageResponse.from(responsePage);
    }

    /**
     * 사용자의 찜하기 목록 조회 (페이징 미지원 - 하위 호환성)
     */
    @Transactional(readOnly = true)
    public List<FavoriteResponseDto> getUserFavorites(Long userId) {
        log.debug("Getting all favorites for user: {}", userId);

        User user = findUserById(userId);
        // fetch join을 사용하여 N+1 문제 해결 및 LazyInitializationException 방지
        List<Favorite> favorites = favoriteRepository.findByUserWithCampground(user);

        return favorites.stream()
                .map(this::createFavoriteResponseDto)
                .toList();
    }

    /**
     * 캠핑장 찜하기 여부 확인
     */
    @Cacheable(value = "favoriteStatus", key = "'user:' + #userId + ':campground:' + #campgroundId", condition = "!@environment.acceptsProfiles('local')")
    public boolean isFavorite(Long userId, Long campgroundId) {
        log.debug("Checking favorite status for user: {}, campground: {}", userId, campgroundId);

        User user = findUserById(userId);
        Campground campground = findCampgroundById(campgroundId);

        return favoriteRepository.existsByUserAndCampground(user, campground);
    }

    /**
     * 캠핑장 즐겨찾기 수 조회
     * favoriteCount 컬럼을 사용하여 성능 최적화 (COUNT 쿼리 제거)
     */
    @Cacheable(value = "favoriteCounts", key = "'campground:' + #campgroundId", condition = "!@environment.acceptsProfiles('local')")
    public long getFavoriteCount(Long campgroundId) {
        log.debug("Getting favorite count for campground: {}", campgroundId);

        Campground campground = findCampgroundById(campgroundId);
        return campground.getFavoriteCount();
    }

    /**
     * 사용자의 찜하기한 캠핑장 ID 목록 조회
     */
    @Cacheable(value = "userFavoriteIds", key = "'user:' + #userId", condition = "!@environment.acceptsProfiles('local')")
    public List<Long> getUserFavoriteCampgroundIds(Long userId) {
        log.debug("Getting favorite campground IDs for user: {}", userId);

        User user = findUserById(userId);
        return favoriteRepository.findCampgroundIdsByUser(user);
    }

    /**
     * 사용자 조회 헬퍼 메소드
     */
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다. ID: " + userId));
    }

    /**
     * 캠핑장 조회 헬퍼 메소드
     */
    private Campground findCampgroundById(Long campgroundId) {
        return campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new ResourceNotFoundException("캠핑장을 찾을 수 없습니다. ID: " + campgroundId));
    }

    /**
     * FavoriteResponseDto 생성 헬퍼 메소드
     */
    private FavoriteResponseDto createFavoriteResponseDto(Favorite favorite) {
        Campground campground = favorite.getCampground();
        return new FavoriteResponseDto(
                favorite.getId(),
                campground.getId(),
                campground.getName(),
                campground.getAddress(),
                favorite.getCreatedAt()
        );
    }
}
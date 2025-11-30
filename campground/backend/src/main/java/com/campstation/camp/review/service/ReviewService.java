package com.campstation.camp.review.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.review.domain.Review;
import com.campstation.camp.review.domain.ReviewImage;
import com.campstation.camp.review.dto.CreateReviewRequest;
import com.campstation.camp.review.dto.ReviewResponse;
import com.campstation.camp.review.dto.UpdateReviewRequest;
import com.campstation.camp.review.repository.ReviewImageRepository;
import com.campstation.camp.review.repository.ReviewRepository;
import com.campstation.camp.shared.dto.ImagePairDto;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.shared.security.SecurityUtils;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 리뷰 서비스
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 * 
 * @author CampStation Team
 * @version 2.0
 * @since 2024-01-01
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final UserRepository userRepository;
    private final CampgroundRepository campgroundRepository;
    private final com.campstation.camp.reservation.repository.ReservationRepository reservationRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final S3FileService s3FileService;
    private final com.campstation.camp.review.repository.ReviewLikeRepository reviewLikeRepository;
    private final ProfileImageRepository profileImageRepository;
    private final com.campstation.camp.review.repository.ReviewReplyRepository reviewReplyRepository;
    // private final EntityManager entityManager; // 향후 필요 시 사용
    
    @Value("${file.upload.path:uploads}")
    private String uploadPath;
    
    /**
     * 리뷰 생성
     * 
     * @param request 리뷰 생성 요청
     * @param userId 사용자 ID
     * @return 생성된 리뷰 정보
     */
    @CacheEvict(value = {"averageRatings", "reviewCounts", "reviewStatistics", "reviewStats"}, 
                key = "'campground:' + #request.getCampgroundId()")
    public ReviewResponse createReview(CreateReviewRequest request, Long userId) {
        log.info("Review Create Request : 리뷰 생성 요청: userId={}, campgroundId={}, reservationId={}, rating={}", 
                userId, request.getCampgroundId(), request.getReservationId(), request.getRating());
        
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Not Found User : 사용자를 찾을 수 없습니다."));
        
        // 캠핑장 조회
        Campground campground = campgroundRepository.findById(request.getCampgroundId())
                .orElseThrow(() -> new RuntimeException("Not Found Campground : 캠핑장을 찾을 수 없습니다."));
        
        // OWNER, ADMIN은 예약 없이도 리뷰 작성 가능 (테스트 목적)
        com.campstation.camp.reservation.domain.Reservation reservation = null;
        
        if (user.getRole() == UserRole.USER) {
            // 일반 사용자는 예약 필수
            reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new RuntimeException("Not Found Reservation : 예약을 찾을 수 없습니다."));
            
            // 예약 소유자 확인
            if (!reservation.getUser().getId().equals(userId)) {
                throw new RuntimeException("Forbidden : 본인의 예약만 리뷰를 작성할 수 있습니다.");
            }
            
            // 예약 완료 상태 확인
            if (reservation.getStatus() != com.campstation.camp.reservation.domain.ReservationStatus.COMPLETED) {
                throw new RuntimeException("Invalid Status : 이용 완료된 예약만 리뷰를 작성할 수 있습니다.");
            }
            
            // 예약의 캠핑장 일치 확인
            if (!reservation.getSite().getCampground().getId().equals(request.getCampgroundId())) {
                throw new RuntimeException("Invalid Campground : 예약과 캠핑장 정보가 일치하지 않습니다.");
            }
            
            // 예약별 리뷰 중복 체크 (USER만 체크)
            reviewRepository.findByUserIdAndReservationId(userId, request.getReservationId())
                    .ifPresent(review -> {
                        throw new RuntimeException("Already Exists Review : 이미 해당 예약에 대한 리뷰가 존재합니다.");
                    });
        } else {
            // OWNER, ADMIN은 reservationId가 있으면 검증
            if (request.getReservationId() != null) {
                reservation = reservationRepository.findById(request.getReservationId())
                        .orElse(null); // 없어도 괜찮음
            }
        }
        
        // 리뷰 생성
        Review review = new Review();
        review.setUser(user);
        review.setCampground(campground);
        review.setReservation(reservation);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        
        Review savedReview = reviewRepository.save(review);

        // 이미지 처리 - ReviewImage 엔티티 생성
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            int order = 0;
            for (ImagePairDto imageDto : request.getImages()) {
                // URL에서 경로만 추출하여 저장 (S3FileService 공통 로직 사용)
                String thumbnailPath = s3FileService.normalizePath(imageDto.getThumbnailUrl());
                String originalPath = s3FileService.normalizePath(imageDto.getOriginalUrl());
                
                ReviewImage reviewImage = new ReviewImage(
                    savedReview,
                    thumbnailPath,
                    originalPath,
                    order++
                );
                reviewImageRepository.save(reviewImage);
                savedReview.addImage(reviewImage);
            }
            log.info("Review Images Added : 리뷰 이미지 추가 완료: count={}", request.getImages().size());
        }

        // 리뷰 카운트 증가
        campground.incrementReviewCount();
        campgroundRepository.save(campground);

        log.info("Review Create Completed : 리뷰 생성 완료: reviewId={}, reviewCount={}",
                savedReview.getId(), campground.getReviewCount());

        // 캠핑장 평점 업데이트
        updateCampgroundRating(request.getCampgroundId());

        return convertToResponse(savedReview);
    }
    
    /**
     * 리뷰 수정
     * 
     * @param reviewId 리뷰 ID
     * @param request 리뷰 수정 요청
     * @param userId 사용자 ID
     * @return 수정된 리뷰 정보
     */
    public ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request, Long userId) {
        log.info("리뷰 수정 요청: reviewId={}, userId={}", reviewId, userId);
        
        // 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        
        // 권한 체크
        if (!hasReviewPermission(review, userId)) {
            throw new RuntimeException("리뷰 수정 권한이 없습니다.");
        }
        
        Long campgroundId = review.getCampground().getId();
        
        // 1. 삭제할 이미지 처리
        if (request.getImageIdsToDelete() != null && !request.getImageIdsToDelete().isEmpty()) {
            log.info("삭제할 이미지 ID: {}", request.getImageIdsToDelete());
            
            // 이미지 조회 및 S3 삭제
            for (Long imageId : request.getImageIdsToDelete()) {
                reviewImageRepository.findById(imageId).ifPresent(image -> {
                    // S3에서 파일 삭제
                    try {
                        s3FileService.deleteFile(image.getThumbnailUrl());
                        s3FileService.deleteFile(image.getOriginalUrl());
                    } catch (Exception e) {
                        log.error("이미지 파일 삭제 실패: {}", e.getMessage());
                    }
                    // DB에서 삭제
                    reviewImageRepository.delete(image);
                    review.removeImage(image);
                });
            }
        }
        
        // 2. 새 이미지 추가
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            int currentMaxOrder = review.getImages().stream()
                .mapToInt(ReviewImage::getDisplayOrder)
                .max()
                .orElse(-1);
            
            int order = currentMaxOrder + 1;
            for (ImagePairDto imageDto : request.getImages()) {
                // URL에서 경로만 추출하여 저장 (S3FileService 공통 로직 사용)
                String thumbnailPath = s3FileService.normalizePath(imageDto.getThumbnailUrl());
                String originalPath = s3FileService.normalizePath(imageDto.getOriginalUrl());
                
                ReviewImage reviewImage = new ReviewImage(
                    review,
                    thumbnailPath,
                    originalPath,
                    order++
                );
                reviewImageRepository.save(reviewImage);
                review.addImage(reviewImage);
            }
            log.info("새 이미지 추가 완료: count={}", request.getImages().size());
        }
        
        // 3. 리뷰 기본 정보 업데이트
        review.updateReview(request.getRating(), request.getComment());
        Review updatedReview = reviewRepository.save(review);
        
        // 캠핑장 평점 업데이트 및 캐시 무효화
        evictRatingCache(campgroundId);
        
        log.info("리뷰 수정 완료: reviewId={}", reviewId);
        return convertToResponse(updatedReview);
    }
    
    /**
     * 리뷰 삭제
     * 
     * @param reviewId 리뷰 ID
     * @param userId 사용자 ID
     */
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        log.info("리뷰 삭제 요청: reviewId={}, userId={}", reviewId, userId);
        
        // 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        
        // 권한 체크
        if (!hasReviewPermission(review, userId)) {
            throw new RuntimeException("리뷰 삭제 권한이 없습니다.");
        }
        
        Long campgroundId = review.getCampground().getId();
        
        // 리뷰 이미지 S3에서 삭제
        if (review.getImages() != null && !review.getImages().isEmpty()) {
            try {
                for (ReviewImage image : review.getImages()) {
                    s3FileService.deleteImagePair(
                        image.getThumbnailUrl(), 
                        image.getOriginalUrl()
                    );
                }
                log.info("리뷰 이미지 {}개 삭제 완료", review.getImages().size());
            } catch (Exception e) {
                log.error("리뷰 이미지 삭제 중 오류: {}", e.getMessage());
            }
        }
        
        reviewRepository.delete(review);

        // 리뷰 카운트 감소
        Campground campground = review.getCampground();
        campground.decrementReviewCount();
        campgroundRepository.save(campground);

        // 캠핑장 평점 업데이트
        updateCampgroundRating(campgroundId);

        // 캐시 무효화
        evictCampgroundCache(campgroundId);

        log.info("리뷰 삭제 완료: reviewId={}, reviewCount={}", reviewId, campground.getReviewCount());
    }
    
    /**
     * 캠핑장 리뷰 관련 캐시 무효화
     * 
     * @param campgroundId 캠핑장 ID
     */
    @CacheEvict(value = {"averageRatings", "reviewCounts", "reviewStatistics", "reviewStats"}, 
                key = "'campground:' + #campgroundId")
    public void evictCampgroundCache(Long campgroundId) {
        log.debug("캠핑장 리뷰 캐시 무효화: campgroundId={}", campgroundId);
    }
    
    /**
     * 리뷰 단일 조회
     * 
     * @param reviewId 리뷰 ID
     * @return 리뷰 정보
     */
    @Transactional(readOnly = true)
    public ReviewResponse getReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("리뷰를 찾을 수 없습니다."));
        
        return convertToResponse(review);
    }
    
    /**
     * 캠핑장의 리뷰 목록 조회
     * 
     * @param campgroundId 캠핑장 ID
     * @param pageable 페이징 정보
     * @param currentUserId 현재 사용자 ID (로그인 안 한 경우 null)
     * @return 리뷰 목록
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getCampgroundReviews(Long campgroundId, Pageable pageable, Long currentUserId) {
        Page<Review> reviews = reviewRepository.findByCampgroundIdOrderByCreatedAtDesc(campgroundId, pageable);
        return reviews.map(review -> convertToResponse(review, currentUserId));
    }
    
    /**
     * 캠핑장의 전체 리뷰 목록 조회 (페이징 없음)
     * 
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 목록
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getAllCampgroundReviews(Long campgroundId) {
        List<Review> reviews = reviewRepository.findByCampgroundIdOrderByCreatedAtDesc(campgroundId);
        return reviews.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 최근 리뷰 목록 조회 (페이징 없음, 최근 10개)
     * 
     * @param limit 조회할 개수 (기본값: 10)
     * @return 최근 리뷰 목록
     */
    @Transactional(readOnly = true)
    public List<ReviewResponse> getRecentReviews(int limit) {
        List<Review> reviews = reviewRepository.findTop10ByOrderByCreatedAtDesc();
        return reviews.stream()
                .limit(limit)
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * 사용자의 리뷰 목록 조회
     * 
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getUserReviews(Long userId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return reviews.map(this::convertToResponse);
    }
    
    /**
     * 캠핑장의 리뷰 통계 조회 (Multi-level 캐싱)
     * 
     * L1: Caffeine (5분) - 로컬 메모리 캐시
     * L2: Redis (1시간) - 분산 캐시
     * 
     * - DB 집계 쿼리 6번 → 0번
     * - 리뷰 생성/수정/삭제 시 양쪽 캐시 모두 제거
     * 
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 통계 정보
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "reviewStats", key = "'campground:' + #campgroundId", unless = "#result == null")
    public Map<String, Object> getCampgroundReviewStats(Long campgroundId) {
        // L2: Redis 조회
        Map<String, Object> redisStats = getReviewStatsFromRedis(campgroundId);
        if (redisStats != null) {
            log.info("리뷰 통계 조회 (Redis) - campgroundId: {}", campgroundId);
            return redisStats;
        }
        
        // L3: DB 조회
        log.info("리뷰 통계 조회 (DB) - campgroundId: {}", campgroundId);
        Map<String, Object> stats = calculateReviewStatsFromDB(campgroundId);
        
        log.info("리뷰 통계 조회 완료 - campgroundId: {}, totalReviews: {}, avgRating: {}", 
                 campgroundId, stats.get("totalReviews"), stats.get("averageRating"));
        
        return stats;
    }
    
    /**
     * Redis에서 리뷰 통계 조회 (기존 reviewStatistics 캐시 재사용)
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> getReviewStatsFromRedis(Long campgroundId) {
        String redisKey = "reviewStatistics::campground:" + campgroundId;
        Object cached = redisTemplate.opsForValue().get(redisKey);
        return cached != null ? (Map<String, Object>) cached : null;
    }
    
    /**
     * DB에서 리뷰 통계 계산
     */
    @Cacheable(value = "reviewStatistics", key = "'campground:' + #campgroundId", unless = "#result == null")
    private Map<String, Object> calculateReviewStatsFromDB(Long campgroundId) {
        Map<String, Object> stats = new HashMap<>();
        
        // 평균 평점
        Double averageRating = reviewRepository.findAverageRatingByCampgroundId(campgroundId);
        stats.put("averageRating", averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0);

        // 총 리뷰 수 (reviewCount 컬럼 사용)
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new RuntimeException("캠핑장을 찾을 수 없습니다: " + campgroundId));
        long totalReviews = campground.getReviewCount();
        stats.put("totalReviews", totalReviews);
        
        // 평점별 리뷰 수
        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int rating = 1; rating <= 5; rating++) {
            long count = reviewRepository.countByCampgroundIdAndRating(campgroundId, rating);
            ratingCounts.put(rating, count);
        }
        stats.put("ratingCounts", ratingCounts);
        
        return stats;
    }
    
    /**
     * 사용자의 특정 캠핑장 리뷰 조회
     * 
     * @param userId 사용자 ID
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 정보 (없으면 null)
     */
    @Transactional(readOnly = true)
    public ReviewResponse getUserCampgroundReview(Long userId, Long campgroundId) {
        return reviewRepository.findByUserIdAndCampgroundId(userId, campgroundId)
                .map(this::convertToResponse)
                .orElse(null);
    }
    
    /**
     * 캠핑장의 평점과 리뷰 수를 업데이트
     * 
     * @param campgroundId 캠핑장 ID
     */
    private void updateCampgroundRating(Long campgroundId) {
        log.info("캠핑장 평점 업데이트 시작: campgroundId={}", campgroundId);
        
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new RuntimeException("캠핑장을 찾을 수 없습니다."));

        // 리뷰 수 조회 (reviewCount 컬럼 사용)
        long reviewCount = campground.getReviewCount();

        if (reviewCount == 0) {
            // 리뷰가 없음 - 별도 처리 불필요 (계산 필드 제거됨)
            log.debug("캠핑장에 리뷰가 없습니다: campgroundId={}", campgroundId);
        } else {
            // 평균 평점 계산 (저장하지 않음)
            Double averageRating = reviewRepository.findAverageRatingByCampgroundId(campgroundId);

            java.math.BigDecimal rating = java.math.BigDecimal.valueOf(averageRating != null ? averageRating : 0.0)
                    .setScale(2, java.math.RoundingMode.HALF_UP);

            log.debug("캠핑장 평점 계산 완료: campgroundId={}, rating={}, reviewCount={}",
                    campgroundId, rating, reviewCount);
        }
    }

    /**
     * 리뷰 수정 권한 체크
     * 
     * @param review 리뷰 엔티티
     * @param userId 요청 사용자 ID
     * @return 권한이 있는 경우 true
     */
    /**
     * 리뷰 수정/삭제 권한 확인
     * SecurityUtils를 사용하여 작성자 또는 ADMIN 권한 체크
     * 
     * @param review 리뷰
     * @param userId 사용자 ID
     * @return 권한 여부
     */
    private boolean hasReviewPermission(Review review, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // SecurityUtils를 사용하여 권한 체크 (작성자 또는 ADMIN)
        return SecurityUtils.isResourceOwnerOrAdmin(user, review);
    }
    
    private ReviewResponse convertToResponse(Review review) {
        return convertToResponse(review, null);
    }
    
    private ReviewResponse convertToResponse(Review review, Long currentUserId) {
        // ReviewImage 엔티티를 ImagePairDto로 변환 (ID 포함)
        List<ImagePairDto> imageDtos = review.getImages().stream()
            .sorted((a, b) -> a.getDisplayOrder().compareTo(b.getDisplayOrder()))
            .map(img -> ImagePairDto.builder()
                .id(img.getId())
                .thumbnailUrl(s3FileService.generatePublicUrl(img.getThumbnailUrl()))
                .originalUrl(s3FileService.generatePublicUrl(img.getOriginalUrl()))
                .build())
            .collect(Collectors.toList());

        // 사용자 프로필 이미지를 ProfileImage 엔티티에서 조회하여 Public URL로 변환
        String profileImageUrl = profileImageRepository.findByUserId(review.getUser().getId())
            .map(profileImage -> s3FileService.generatePublicUrl(profileImage.getThumbnailUrl()))
            .orElse(null);

        // 좋아요 수 및 현재 사용자의 좋아요 여부 확인
        Long likeCount = reviewLikeRepository.countByReviewId(review.getId());
        Boolean isLiked = currentUserId != null 
            ? reviewLikeRepository.existsByReviewIdAndUserId(review.getId(), currentUserId)
            : false;

        // 운영자 답글 조회
        com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse ownerReply = 
            reviewReplyRepository.findByReviewId(review.getId())
                .map(com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse::from)
                .orElse(null);

        return new ReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getName(), // userName
                review.getUser().getName(), // name (동일하게 설정)
                review.getUser().getEmail(),
                profileImageUrl, // ProfileImage 엔티티에서 조회한 프로필 이미지
                review.getCampground().getId(),
                review.getCampground().getName(),
                review.getCampground().getOwner().getId(), // 캠핑장 소유자 ID
                review.getRating(),
                review.getComment(),
                imageDtos, // ImagePairDto 리스트
                likeCount,
                isLiked,
                ownerReply, // 운영자 답글
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    /**
     * 평점 관련 캐시 무효화 (리뷰 통계 포함)
     */
    @CacheEvict(value = {"averageRatings", "reviewCounts", "reviewStatistics", "reviewStats"}, key = "'campground:' + #campgroundId")
    public void evictRatingCache(Long campgroundId) {
        // 캐시 무효화를 위한 메소드
    }
    
    /**
     * 리뷰 좋아요 추가
     * 
     * @param reviewId 리뷰 ID
     * @param userId 사용자 ID
     */
    public void likeReview(Long reviewId, Long userId) {
        log.info("Review Like Request : 리뷰 좋아요 요청: reviewId={}, userId={}", reviewId, userId);
        
        // 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Not Found Review : 리뷰를 찾을 수 없습니다."));
        
        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Not Found User : 사용자를 찾을 수 없습니다."));
        
        // 이미 좋아요한 경우 체크
        if (reviewLikeRepository.existsByReviewIdAndUserId(reviewId, userId)) {
            throw new RuntimeException("Already Liked Review : 이미 좋아요한 리뷰입니다.");
        }
        
        // 좋아요 추가
        com.campstation.camp.review.domain.ReviewLike reviewLike = 
            com.campstation.camp.review.domain.ReviewLike.of(review, user);
        reviewLikeRepository.save(reviewLike);
        
        log.info("Review Like Success : 리뷰 좋아요 성공: reviewId={}, userId={}", reviewId, userId);
    }
    
    /**
     * 리뷰 좋아요 취소
     * 
     * @param reviewId 리뷰 ID
     * @param userId 사용자 ID
     */
    public void unlikeReview(Long reviewId, Long userId) {
        log.info("Review Unlike Request : 리뷰 좋아요 취소 요청: reviewId={}, userId={}", reviewId, userId);
        
        // 좋아요 조회
        com.campstation.camp.review.domain.ReviewLike reviewLike = 
            reviewLikeRepository.findByReviewIdAndUserId(reviewId, userId)
                .orElseThrow(() -> new RuntimeException("Not Found ReviewLike : 좋아요를 찾을 수 없습니다."));
        
        // 좋아요 삭제
        reviewLikeRepository.delete(reviewLike);
        
        log.info("Review Unlike Success : 리뷰 좋아요 취소 성공: reviewId={}, userId={}", reviewId, userId);
    }
    
    /**
     * Owner - 내 캠핑장의 모든 리뷰 조회
     * 
     * @param ownerId Owner ID
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByOwnerId(Long ownerId, Pageable pageable) {
        log.info("Owner Reviews Request : Owner 리뷰 조회 요청: ownerId={}", ownerId);
        
        // Owner의 모든 캠핑장 조회 (페이징 없이 전체 조회)
        Page<Campground> campgroundsPage = campgroundRepository.findByOwnerId(
                ownerId, Pageable.unpaged());
        List<Campground> campgrounds = campgroundsPage.getContent();
        
        if (campgrounds.isEmpty()) {
            log.info("Owner Reviews Empty : Owner의 캠핑장이 없습니다: ownerId={}", ownerId);
            return Page.empty(pageable);
        }
        
        // 캠핑장 ID 목록 추출
        List<Long> campgroundIds = campgrounds.stream()
                .map(Campground::getId)
                .collect(Collectors.toList());
        
        log.info("Owner Reviews Search : 캠핑장 ID 목록: {}", campgroundIds);
        
        // 해당 캠핑장들의 모든 리뷰 조회
        Page<Review> reviews = reviewRepository.findByCampgroundIdIn(
                campgroundIds, pageable);
        
        log.info("Owner Reviews Found : 리뷰 조회 완료: count={}", reviews.getTotalElements());
        
        return reviews.map(this::convertToResponse);
    }
    
    /**
     * 운영자 답글 작성
     * 
     * @param reviewId 리뷰 ID
     * @param request 답글 작성 요청
     * @param userId 사용자 ID (OWNER 또는 ADMIN)
     * @return 생성된 답글 정보
     */
    public com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse createReply(
            Long reviewId, 
            com.campstation.camp.review.dto.ReviewReplyDto.CreateReviewReplyRequest request, 
            Long userId) {
        log.info("Review Reply Create Request : 답글 생성 요청: reviewId={}, userId={}", reviewId, userId);
        
        // 사용자 조회 및 권한 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Not Found User : 사용자를 찾을 수 없습니다."));
        
        if (user.getRole() != UserRole.OWNER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Forbidden : 운영자 또는 관리자만 답글을 작성할 수 있습니다.");
        }
        
        // 리뷰 조회
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Not Found Review : 리뷰를 찾을 수 없습니다."));
        
        // OWNER인 경우 자기 캠핑장의 리뷰인지 확인
        if (user.getRole() == UserRole.OWNER) {
            Campground campground = review.getCampground();
            if (!campground.getOwner().getId().equals(userId)) {
                throw new RuntimeException("Forbidden : 본인 소유 캠핑장의 리뷰에만 답글을 작성할 수 있습니다.");
            }
        }
        // ADMIN은 모든 리뷰에 답글 가능
        
        // 이미 답글이 있는지 확인
        if (reviewReplyRepository.existsByReviewId(reviewId)) {
            throw new RuntimeException("Already Exists Reply : 이미 답글이 존재합니다.");
        }
        
        // 답글 생성
        com.campstation.camp.review.domain.ReviewReply reply = 
            new com.campstation.camp.review.domain.ReviewReply(review, user, request.comment());
        
        com.campstation.camp.review.domain.ReviewReply savedReply = reviewReplyRepository.save(reply);
        
        return com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse.from(savedReply);
    }

    /**
     * 운영자 답글 수정
     * 
     * @param reviewId 리뷰 ID
     * @param replyId 답글 ID
     * @param request 답글 수정 요청
     * @param userId 사용자 ID (OWNER 또는 ADMIN)
     * @return 수정된 답글 정보
     */
    public com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse updateReply(
            Long reviewId,
            Long replyId,
            com.campstation.camp.review.dto.ReviewReplyDto.UpdateReviewReplyRequest request,
            Long userId) {
        log.info("Review Reply Update Request : 답글 수정 요청: reviewId={}, replyId={}, userId={}", 
                reviewId, replyId, userId);
        
        // 사용자 조회 및 권한 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Not Found User : 사용자를 찾을 수 없습니다."));
        
        if (user.getRole() != UserRole.OWNER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Forbidden : 운영자 또는 관리자만 답글을 수정할 수 있습니다.");
        }
        
        // 답글 조회
        com.campstation.camp.review.domain.ReviewReply reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Not Found Reply : 답글을 찾을 수 없습니다."));
        
        // 답글이 해당 리뷰의 것인지 확인
        if (!reply.getReview().getId().equals(reviewId)) {
            throw new RuntimeException("Invalid Reply : 해당 리뷰의 답글이 아닙니다.");
        }
        
        // OWNER인 경우 자기 캠핑장의 리뷰인지 확인
        if (user.getRole() == UserRole.OWNER) {
            Campground campground = reply.getReview().getCampground();
            if (!campground.getOwner().getId().equals(userId)) {
                throw new RuntimeException("Forbidden : 본인 소유 캠핑장의 리뷰 답글만 수정할 수 있습니다.");
            }
        }
        // ADMIN은 모든 답글 수정 가능
        
        // 답글 수정
        reply.updateComment(request.comment());
        
        com.campstation.camp.review.domain.ReviewReply updatedReply = reviewReplyRepository.save(reply);
        
        return com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse.from(updatedReply);
    }

    /**
     * 운영자 답글 삭제
     * 
     * @param reviewId 리뷰 ID
     * @param replyId 답글 ID
     * @param userId 사용자 ID (OWNER 또는 ADMIN)
     */
    public void deleteReply(Long reviewId, Long replyId, Long userId) {
        log.info("Review Reply Delete Request : 답글 삭제 요청: reviewId={}, replyId={}, userId={}", 
                reviewId, replyId, userId);
        
        // 사용자 조회 및 권한 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Not Found User : 사용자를 찾을 수 없습니다."));
        
        if (user.getRole() != UserRole.OWNER && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Forbidden : 운영자 또는 관리자만 답글을 삭제할 수 있습니다.");
        }
        
        // 답글 조회
        com.campstation.camp.review.domain.ReviewReply reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Not Found Reply : 답글을 찾을 수 없습니다."));
        
        // 답글이 해당 리뷰의 것인지 확인
        if (!reply.getReview().getId().equals(reviewId)) {
            throw new RuntimeException("Invalid Reply : 해당 리뷰의 답글이 아닙니다.");
        }
        
        // OWNER인 경우 자기 캠핑장의 리뷰인지 확인
        if (user.getRole() == UserRole.OWNER) {
            Campground campground = reply.getReview().getCampground();
            if (!campground.getOwner().getId().equals(userId)) {
                throw new RuntimeException("Forbidden : 본인 소유 캠핑장의 리뷰 답글만 삭제할 수 있습니다.");
            }
        }
        // ADMIN은 모든 답글 삭제 가능
        
        // 답글 삭제
        reviewReplyRepository.delete(reply);
    }
}

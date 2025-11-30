package com.campstation.camp.owner.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.campground.domain.SiteStatus;
import com.campstation.camp.campground.dto.CampgroundResponse;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.owner.dto.OwnerDashboardStatsResponse;
import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.dto.PaymentResponse;
import com.campstation.camp.reservation.dto.RefundRequest;
import com.campstation.camp.reservation.dto.RefundResponse;
import com.campstation.camp.reservation.dto.ReservationResponse;
import com.campstation.camp.reservation.repository.PaymentRepository;
import com.campstation.camp.reservation.repository.ReservationRepository;
import com.campstation.camp.reservation.service.PaymentService;
import com.campstation.camp.review.domain.Review;
import com.campstation.camp.review.repository.ReviewRepository;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.campstation.camp.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Owner 서비스
 * Owner 전용 비즈니스 로직 처리
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class OwnerService {

    private final UserRepository userRepository;
    private final CampgroundRepository campgroundRepository;
    private final ReservationRepository reservationRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final S3FileService s3FileService;
    private final ProfileImageRepository profileImageRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final PaymentService paymentService;
    private final com.campstation.camp.review.repository.ReviewReplyRepository reviewReplyRepository;

    /**
     * Owner의 캠핑장 목록 조회 (Public URL 포함)
     */
    public Page<CampgroundResponse> getOwnerCampgrounds(String email, Pageable pageable) {
        User owner = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        Page<Campground> campgrounds = campgroundRepository.findByOwnerId(owner.getId(), pageable);
        return campgrounds.map(this::toCampgroundResponseWithPublicUrl);
    }

    /**
     * Owner의 예약 목록 조회
     */
    public Page<ReservationResponse> getOwnerReservations(String email, Pageable pageable) {
        User owner = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // Owner의 캠핑장 ID 목록 조회
        List<Long> campgroundIds = campgroundRepository.findByOwnerId(owner.getId(), Pageable.unpaged())
            .getContent()
            .stream()
            .map(Campground::getId)
            .toList();

        if (campgroundIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // 캠핑장 ID 목록으로 예약 조회
        Page<Reservation> reservations = reservationRepository.findByCampgroundIdIn(campgroundIds, pageable);
        return reservations.map(this::toReservationResponse);
    }

    /**
     * Owner의 예약 상세 조회
     */
    public ReservationResponse getOwnerReservation(String email, Long reservationId) {
        User owner = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // 예약 조회
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));

        // Owner의 캠핑장인지 확인
        if (!reservation.getCampground().getOwner().getId().equals(owner.getId())) {
            throw new ResourceNotFoundException("해당 예약에 대한 권한이 없습니다.");
        }

        return toReservationResponse(reservation);
    }

    /**
     * Owner의 모든 캠핑장 리뷰 조회
     */
    public Page<com.campstation.camp.review.dto.ReviewResponse> getOwnerReviews(String email, Pageable pageable) {
        User owner = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // Owner의 캠핑장 ID 목록 조회
        List<Long> campgroundIds = campgroundRepository.findByOwnerId(owner.getId(), Pageable.unpaged())
            .getContent()
            .stream()
            .map(Campground::getId)
            .toList();

        if (campgroundIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // 캠핑장 ID 목록으로 리뷰 조회
        Page<Review> reviews = reviewRepository.findByCampgroundIdIn(campgroundIds, pageable);
        return reviews.map(this::toReviewResponse);
    }

    /**
     * Review를 ReviewResponse로 변환
     */
    private com.campstation.camp.review.dto.ReviewResponse toReviewResponse(Review review) {
        // ReviewImage 엔티티를 ImagePairDto로 변환
        List<com.campstation.camp.shared.dto.ImagePairDto> imageDtos = review.getImages().stream()
                .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                .map(img -> {
                    String thumbnailUrl = img.getThumbnailUrl() != null
                        ? s3FileService.generatePublicUrl(img.getThumbnailUrl())
                        : null;
                    String originalUrl = img.getOriginalUrl() != null
                        ? s3FileService.generatePublicUrl(img.getOriginalUrl())
                        : null;
                    return com.campstation.camp.shared.dto.ImagePairDto.builder()
                        .id(img.getId())
                        .thumbnailUrl(thumbnailUrl)
                        .originalUrl(originalUrl)
                        .build();
                })
                .toList();

        // 사용자 프로필 이미지를 Public URL로 변환
        String profileImageUrl = null;
        if (review.getUser().getProfileImage() != null && !review.getUser().getProfileImage().isBlank()) {
            profileImageUrl = s3FileService.generatePublicUrl(review.getUser().getProfileImage());
        }

        // 운영자 답글 조회
        com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse ownerReply = 
            reviewReplyRepository.findByReviewId(review.getId())
                .map(com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse::from)
                .orElse(null);

        return new com.campstation.camp.review.dto.ReviewResponse(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getName(),
                review.getUser().getName(),
                review.getUser().getEmail(),
                profileImageUrl,
                review.getCampground().getId(),
                review.getCampground().getName(),
                review.getCampground().getOwner().getId(), // 캠핑장 소유자 ID
                review.getRating(),
                review.getComment(),
                imageDtos,
                0L, // likeCount
                false, // isLiked
                ownerReply, // 운영자 답글
                review.getCreatedAt(),
                review.getUpdatedAt()
        );
    }

    /**
     * Reservation을 ReservationResponse로 변환
     */
    private ReservationResponse toReservationResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setUserId(reservation.getUser().getId());
        response.setUserName(reservation.getUser().getName());
        response.setCampgroundId(reservation.getCampground().getId());
        response.setCampgroundName(reservation.getCampground().getName());
        
        // Site 정보 (옵셔널)
        if (reservation.getSite() != null) {
            response.setSiteId(reservation.getSite().getId());
            response.setSiteNumber(reservation.getSite().getSiteNumber());
        }
        
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setNumberOfGuests(reservation.getNumberOfGuests());
        response.setNumberOfNights(reservation.getNumberOfNights());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setStatus(reservation.getStatus());
        response.setSpecialRequests(reservation.getSpecialRequests());
        response.setCreatedAt(reservation.getCreatedAt());
        response.setUpdatedAt(reservation.getUpdatedAt());
        
        // 결제 정보 조회 및 설정
        List<Payment> payments = paymentRepository.findByReservationIdOrderByCreatedAtDesc(reservation.getId());
        if (!payments.isEmpty()) {
            Payment payment = payments.get(0); // 가장 최근 결제 정보
            response.setPayment(PaymentResponse.fromEntity(payment));
        }
        
        return response;
    }

    /**
     * Owner 대시보드 통계 조회 (Multi-level 캐싱)
     * L1: Caffeine (1분)
     * L2: Redis (10분)
     * L3: DB
     */
    @Cacheable(value = "ownerDashboardStats", key = "#email")
    public OwnerDashboardStatsResponse getOwnerDashboardStats(String email) {
        // L2: Redis 조회
        String redisKey = "dashboard:owner:" + email;
        Object cached = redisTemplate.opsForValue().get(redisKey);
        
        if (cached != null) {
            try {
                // LinkedHashMap을 OwnerDashboardStatsResponse로 변환
                return objectMapper.convertValue(cached, OwnerDashboardStatsResponse.class);
            } catch (Exception e) {
                log.warn("Redis 캐시 역직렬화 실패, DB에서 재조회: {}", e.getMessage());
            }
        }
        
        // L3: DB 조회 및 계산
        OwnerDashboardStatsResponse stats = calculateOwnerStatsFromDB(email);
        
        // Redis에 캐시 저장 (10분)
        redisTemplate.opsForValue().set(redisKey, stats, 10, TimeUnit.MINUTES);
        
        return stats;
    }
    
    /**
     * DB에서 Owner 통계 계산
     */
    private OwnerDashboardStatsResponse calculateOwnerStatsFromDB(String email) {
        User owner = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다."));

        // Owner의 캠핑장 목록
        List<Campground> campgrounds = campgroundRepository.findAllByOwnerId(owner.getId());
        List<Long> campgroundIds = campgrounds.stream()
            .map(Campground::getId)
            .toList();

        if (campgroundIds.isEmpty()) {
            return OwnerDashboardStatsResponse.builder()
                .myCampgrounds(0L)
                .totalSites(0L)
                .availableSites(0L)
                .totalReservations(0L)
                .activeReservations(0L)
                .upcomingCheckIns(0L)
                .monthlyRevenue(0L)
                .totalRevenue(0L)
                .averageRevenuePerSite(0L)
                .siteOccupancyRate(0.0)
                .averageStayLength(0.0)
                .totalGuests(0L)
                .totalReviews(0L)
                .averageRating(0.0)
                .cancellationRate(0.0)
                .build();
        }

        // 사이트 데이터 (캠핑장 내 모든 사이트)
        List<Site> allSites = campgrounds.stream()
            .flatMap(c -> c.getSites().stream())
            .toList();
        long totalSites = allSites.size();
        long availableSites = allSites.stream()
            .filter(s -> s.getStatus() == SiteStatus.AVAILABLE)
            .count();

        // 예약 데이터
        List<Reservation> allReservations = reservationRepository.findByCampgroundIdIn(campgroundIds);
        List<Reservation> activeReservations = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
            .toList();

        // 리뷰 데이터
        List<Review> allReviews = reviewRepository.findByCampgroundIdIn(campgroundIds);

        // 통계 계산
        long totalReservations = allReservations.size();
        long cancelledReservations = allReservations.stream()
            .filter(r -> r.getStatus() == ReservationStatus.CANCELLED)
            .count();

        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = now.plusMonths(1).withDayOfMonth(1).minusDays(1);

        long monthlyRevenue = activeReservations.stream()
            .filter(r -> r.getCreatedAt().toLocalDate().isAfter(monthStart.minusDays(1)) 
                      && r.getCreatedAt().toLocalDate().isBefore(monthEnd.plusDays(1)))
            .mapToLong(r -> r.getTotalAmount().longValue())
            .sum();

        long upcomingCheckIns = activeReservations.stream()
            .filter(r -> r.getCheckInDate().isAfter(now) 
                      && r.getCheckInDate().isBefore(now.plusDays(31)))
            .count();

        long totalGuests = activeReservations.stream()
            .mapToLong(r -> r.getNumberOfGuests().longValue())
            .sum();

        double averageRating = allReviews.stream()
            .mapToInt(Review::getRating)
            .average()
            .orElse(0.0);

        double cancellationRate = totalReservations > 0 
            ? (cancelledReservations * 100.0 / totalReservations) 
            : 0.0;

        double averageStayLength = activeReservations.stream()
            .mapToLong(r -> ChronoUnit.DAYS.between(r.getCheckInDate(), r.getCheckOutDate()))
            .average()
            .orElse(0.0);

        // 추가 통계 계산
        long totalRevenue = activeReservations.stream()
            .mapToLong(r -> r.getTotalAmount().longValue())
            .sum();
        
        long averageRevenuePerSite = totalSites > 0 ? totalRevenue / totalSites : 0;
        
        // 사이트 가동률 (간단 계산: 진행 중인 예약 / 총 사이트)
        double siteOccupancyRate = totalSites > 0 
            ? (activeReservations.size() * 100.0 / totalSites) 
            : 0.0;

        return OwnerDashboardStatsResponse.builder()
            .myCampgrounds((long) campgrounds.size())
            .totalSites(totalSites)
            .availableSites(availableSites)
            .totalReservations(totalReservations)
            .activeReservations((long) activeReservations.size())
            .upcomingCheckIns(upcomingCheckIns)
            .monthlyRevenue(monthlyRevenue)
            .totalRevenue(totalRevenue)
            .averageRevenuePerSite(averageRevenuePerSite)
            .siteOccupancyRate(Math.round(siteOccupancyRate * 10.0) / 10.0)
            .averageStayLength(Math.round(averageStayLength * 10.0) / 10.0)
            .totalGuests(totalGuests)
            .totalReviews((long) allReviews.size())
            .averageRating(Math.round(averageRating * 10.0) / 10.0)
            .cancellationRate(Math.round(cancellationRate * 10.0) / 10.0)
            .build();
    }

    /**
     * Campground를 CampgroundResponse로 변환 (Public URL 포함)
     */
    private CampgroundResponse toCampgroundResponseWithPublicUrl(Campground campground) {
        // 메인 이미지 URL을 Public URL로 변환
        String mainImageUrl = null;
        if (campground.getMainImageUrl() != null && !campground.getMainImageUrl().isBlank()) {
            mainImageUrl = s3FileService.generatePublicUrl(campground.getMainImageUrl());
        }

        // 썸네일 URL들을 Public URL로 변환
        List<String> thumbnailUrls = campground.getAllThumbnailUrls().stream()
            .map(url -> s3FileService.generatePublicUrl(url))
            .toList();

        // 원본 이미지 URL들을 Public URL로 변환
        List<String> originalImageUrls = campground.getAllOriginalImageUrls().stream()
            .map(url -> s3FileService.generatePublicUrl(url))
            .toList();

        // CampgroundResponse 생성 - imageUrl에 public URL 설정
        CampgroundResponse response = CampgroundResponse.fromEntity(
            campground, 
            thumbnailUrls, 
            originalImageUrls, 
            BigDecimal.ZERO, 
            0, 
            0,
            s3FileService,
            profileImageRepository
        );
        
        // imageUrl 필드를 Public URL로 교체
        return new CampgroundResponse(
            response.id(),
            response.name(),
            response.description(),
            response.address(),
            response.phone(),
            response.email(),
            response.website(),
            mainImageUrl != null ? mainImageUrl : response.imageUrl(),
            response.thumbnailUrls(),
            response.originalImageUrls(),
            response.latitude(),
            response.longitude(),
            response.status(),
            response.operationType(),
            response.certification(),
            response.rating(),
            response.reviewCount(),
            response.favoriteCount(),
            response.checkInTime(),
            response.checkOutTime(),
            response.businessOwnerName(),
            response.businessName(),
            response.businessAddress(),
            response.businessEmail(),
            response.businessRegistrationNumber(),
            response.tourismBusinessNumber(),
            response.owner(),
            response.createdAt(),
            response.updatedAt(),
            response.amenities()  // amenities 필드 추가
        );
    }

    /**
     * Owner의 예약 상태 변경
     */
    @Transactional
    public ReservationResponse updateReservationStatus(String ownerEmail, Long reservationId, String statusStr) {
        // Owner 조회
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner를 찾을 수 없습니다."));

        // 예약 조회
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));

        // 예약이 Owner의 캠핑장에 속하는지 확인
        Campground campground = reservation.getCampground();
        if (!campground.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("본인 캠핑장의 예약만 수정할 수 있습니다.");
        }

        // 상태 변환
        ReservationStatus newStatus;
        try {
            newStatus = ReservationStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 예약 상태입니다: " + statusStr);
        }

        // 상태 변경 로직
        ReservationStatus currentStatus = reservation.getStatus();
        
        // PENDING -> CONFIRMED, CANCELLED 허용
        if (currentStatus == ReservationStatus.PENDING) {
            if (newStatus == ReservationStatus.CONFIRMED || newStatus == ReservationStatus.CANCELLED) {
                reservation.setStatus(newStatus);
            } else {
                throw new IllegalArgumentException("PENDING 상태에서는 CONFIRMED 또는 CANCELLED로만 변경 가능합니다.");
            }
        }
        // CONFIRMED -> CANCELLED, COMPLETED 허용
        else if (currentStatus == ReservationStatus.CONFIRMED) {
            if (newStatus == ReservationStatus.CANCELLED || newStatus == ReservationStatus.COMPLETED) {
                reservation.setStatus(newStatus);
            } else {
                throw new IllegalArgumentException("CONFIRMED 상태에서는 CANCELLED 또는 COMPLETED로만 변경 가능합니다.");
            }
        }
        // 다른 상태 변경은 허용하지 않음
        else {
            throw new IllegalArgumentException("현재 상태에서는 변경할 수 없습니다.");
        }

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("예약 상태 변경: {} -> {} (예약 ID: {}, Owner: {})", currentStatus, newStatus, reservationId, ownerEmail);

        return toReservationResponse(savedReservation);
    }

    /**
     * Owner의 예약 환불 처리 (제한 없음)
     * Owner는 당일 환불 및 전액 환불이 가능합니다.
     */
    @Transactional
    public RefundResponse processOwnerRefund(String ownerEmail, Long paymentId, RefundRequest request) {
        // Owner 조회
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Owner를 찾을 수 없습니다."));

        // 결제 조회
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("결제 정보를 찾을 수 없습니다."));

        // 예약 조회
        Reservation reservation = reservationRepository.findById(payment.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("예약을 찾을 수 없습니다."));

        // 예약이 Owner의 캠핑장에 속하는지 확인
        Campground campground = reservation.getCampground();
        if (!campground.getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("본인 캠핑장의 예약만 환불 처리할 수 있습니다.");
        }

        // Owner는 제한 없이 환불 가능 - PaymentService의 오너 전용 메서드 호출
        RefundResponse response = paymentService.processOwnerRefund(payment, reservation, request, owner.getId());
        
        log.info("Owner 환불 처리 완료: 결제 ID={}, 환불 금액={}, Owner={}", 
            paymentId, request.getRefundAmount(), ownerEmail);
        
        return response;
    }
}

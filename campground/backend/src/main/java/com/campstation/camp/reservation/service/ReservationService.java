package com.campstation.camp.reservation.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.CampgroundStatus;
import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.campground.domain.SiteStatus;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.campground.repository.SiteRepository;
import com.campstation.camp.pricing.service.PriceCalculationService;
import com.campstation.camp.reservation.domain.Payment;
import com.campstation.camp.reservation.domain.PaymentStatus;
import com.campstation.camp.reservation.domain.Reservation;
import com.campstation.camp.reservation.domain.ReservationPriceItem;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.dto.CreateReservationRequest;
import com.campstation.camp.reservation.dto.GuestReservationLookupRequest;
import com.campstation.camp.reservation.dto.GuestReservationRequest;
import com.campstation.camp.reservation.dto.PaymentResponse;
import com.campstation.camp.reservation.dto.PriceBreakdownDto;
import com.campstation.camp.reservation.dto.ReservationResponse;
import com.campstation.camp.reservation.dto.UpdateReservationRequest;
import com.campstation.camp.reservation.repository.PaymentRepository;
import com.campstation.camp.reservation.repository.ReservationRepository;
import com.campstation.camp.shared.exception.ReservationConflictException;
import com.campstation.camp.shared.notification.EmailNotificationService;
import com.campstation.camp.shared.notification.SmsNotificationService;
import com.campstation.camp.shared.security.SecurityUtils;
import com.campstation.camp.user.domain.Guest;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 예약 서비스
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 *
 * @author CampStation Team
 * @version 2.0
 * @since 2024-01-01
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final CampgroundRepository campgroundRepository;
    private final UserRepository userRepository;
    private final SiteRepository siteRepository;
    private final PaymentRepository paymentRepository;
    private final EmailNotificationService emailNotificationService;
    private final SmsNotificationService smsNotificationService;
    private final PriceCalculationService priceCalculationService;
    
    /**
     * 예약 생성
     * 
     * @param request 예약 생성 요청
     * @param userId 사용자 ID
     * @return 생성된 예약 정보
     */
    @Transactional
    @CacheEvict(value = "reservations", key = "'user:' + #userId + ':reservations'", condition = "!@environment.acceptsProfiles('local')")
    public ReservationResponse createReservation(CreateReservationRequest request, Long userId) {
        log.info("Creating reservation for user: {}, campground: {}", userId, request.getCampgroundId());
        
        // 사용자 존재 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 캠핑장 존재 확인
        Campground campground = campgroundRepository.findById(request.getCampgroundId())
                .orElseThrow(() -> new RuntimeException("캠핑장을 찾을 수 없습니다."));
        
        // 사이트 존재 확인 및 캠핑장 일치 검증
        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("사이트를 찾을 수 없습니다."));
        
        if (!site.getCampground().getId().equals(request.getCampgroundId())) {
            throw new RuntimeException("사이트가 해당 캠핑장에 속하지 않습니다.");
        }
        
        // 사이트 상태 확인
        if (site.getStatus() == SiteStatus.MAINTENANCE) {
            throw new RuntimeException("현재 점검 중인 사이트입니다.");
        }
        
        if (site.getStatus() == SiteStatus.UNAVAILABLE) {
            throw new RuntimeException("사용할 수 없는 사이트입니다.");
        }
        
        // 캠핑장 운영 상태 확인
        if (campground.getStatus() != CampgroundStatus.ACTIVE) {
            throw new RuntimeException("현재 예약할 수 없는 캠핑장입니다.");
        }
        
        // 날짜 유효성 검증
        validateReservationDates(request.getCheckInDate(), request.getCheckOutDate());

        // 예약 충돌 확인 (Pessimistic Lock으로 동시성 제어)
        // 이 쿼리가 실행되는 동안 해당 행들이 잠기므로, 다른 트랜잭션은 대기합니다.
        List<Reservation> conflictingReservations = reservationRepository
                .findConflictingReservationsForSiteWithLock(
                        request.getSiteId(),
                        request.getCheckInDate(),
                        request.getCheckOutDate()
                );

        if (!conflictingReservations.isEmpty()) {
            log.warn("Reservation conflict detected for site {} between {} and {}",
                    request.getSiteId(), request.getCheckInDate(), request.getCheckOutDate());
            throw new ReservationConflictException(
                    request.getSiteId(),
                    request.getCheckInDate(),
                    request.getCheckOutDate()
            );
        }
        
        // 가격 계산 (상세 내역 포함)
        PriceBreakdownDto priceBreakdown = priceCalculationService.calculatePrice(
            site,
            request.getCheckInDate(),
            request.getCheckOutDate(),
            request.getNumberOfGuests() != null ? request.getNumberOfGuests() : 2
        );

        // 프론트엔드 예상 금액 검증 (선택적)
        if (request.getExpectedAmount() != null) {
            BigDecimal calculatedAmount = priceBreakdown.getTotalAmount();
            BigDecimal expectedAmount = request.getExpectedAmount();
            BigDecimal difference = calculatedAmount.subtract(expectedAmount).abs();
            
            // 100원 이상 차이나면 경고 로그
            if (difference.compareTo(BigDecimal.valueOf(100)) > 0) {
                log.warn("Price mismatch detected! Expected: {}, Calculated: {}, Difference: {}",
                    expectedAmount, calculatedAmount, difference);
                log.warn("Reservation details: siteId={}, checkIn={}, checkOut={}, guests={}",
                    request.getSiteId(), request.getCheckInDate(), request.getCheckOutDate(), request.getNumberOfGuests());
                
                // 옵션 1: 에러 throw (엄격한 검증)
                // throw new PriceMismatchException(expectedAmount, calculatedAmount);
                
                // 옵션 2: 경고만 로그하고 계산된 금액 사용 (현재 선택)
                // 이유: 요금제가 변경되었을 수 있으므로 백엔드 계산값이 정확함
            } else {
                log.debug("Price validation passed. Expected: {}, Calculated: {}",
                    expectedAmount, calculatedAmount);
            }
        }

        // 예약 생성
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setCampground(campground);
        reservation.setSite(site);
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setNumberOfGuests(request.getNumberOfGuests());
        reservation.setTotalAmount(priceBreakdown.getTotalAmount());
        reservation.setPriceBreakdown(priceBreakdown); // JSONB 스냅샷 저장
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setStatus(ReservationStatus.PENDING);

        // 가격 항목 저장 (분석용)
        priceBreakdown.getItems().forEach(itemDto -> {
            ReservationPriceItem priceItem = ReservationPriceItem.builder()
                .itemType(itemDto.getType())
                .itemName(itemDto.getName())
                .quantity(itemDto.getQuantity())
                .unitPrice(itemDto.getUnitPrice())
                .amount(itemDto.getAmount())
                .displayOrder(itemDto.getDisplayOrder())
                .build();
            reservation.addPriceItem(priceItem);
        });
        
        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Created reservation with ID: {}", savedReservation.getId());
        
        // 결제 정보 생성 (모든 결제 방식에 대해 PENDING 상태로 생성)
        Payment payment = createPaymentForReservation(savedReservation, request, userId);
        log.info("Created payment with ID: {} for reservation: {} with status: PENDING", 
                payment.getId(), savedReservation.getId());
        
        // 결제 승인은 별도 API(confirmPayment)에서 처리
        // - 카드/카카오페이: 토스페이먼츠 결제 완료 후 /payment/success에서 confirmPayment 호출
        // - 계좌이체: Owner/Admin이 입금 확인 후 confirmDeposit 호출
        
        // 예약 확인 알림 전송
        try {
            emailNotificationService.sendReservationConfirmationEmail(savedReservation);
            smsNotificationService.sendReservationConfirmationSms(savedReservation);
        } catch (Exception e) {
            log.warn("예약 알림 전송 실패 (예약은 정상 생성됨): {}", savedReservation.getId(), e);
        }
        
        return convertToResponse(savedReservation);
    }
    
    /**
     * 예약에 대한 결제 정보 생성
     * 모든 결제 방식에 대해 PENDING 상태로 생성
     * 카드/카카오페이는 토스페이먼츠에서 처리하므로 카드 정보 불필요
     */
    private Payment createPaymentForReservation(Reservation reservation, CreateReservationRequest request, Long userId) {
        // 사용자 정보 조회
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다: " + userId));
        
        // 모든 결제 방식을 PENDING으로 생성 (카드 정보 없이)
        Payment payment = Payment.builder()
                .user(user)  // User 엔티티 설정 (userId가 아닌 user 객체)
                .reservationId(reservation.getId())
                .amount(reservation.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .transactionId(null)  // transactionId는 결제 승인 시 설정
                .cardNumber(null)     // cardNumber - 토스페이먼츠가 처리
                .cardHolderName(null) // cardHolderName - 토스페이먼츠가 처리
                .depositorName(request.getDepositorName())  // 무통장 입금 시 입금자명
                .build();
        
        return paymentRepository.save(payment);
    }
    
    /**
     * 예약 조회 (ID로)
     * 
     * @param reservationId 예약 ID
     * @param userId 사용자 ID (본인 예약만 조회)
     * @return 예약 정보
     */
    @Cacheable(value = "reservations", key = "'user:' + #userId + ':reservation:' + #reservationId", unless = "#result == null", condition = "!@environment.acceptsProfiles('local')")
    public ReservationResponse getReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findByIdAndUserId(reservationId, userId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        return convertToResponse(reservation);
    }
    
    /**
     * 사용자의 모든 예약 조회
     * 
     * @param userId 사용자 ID
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    public Page<ReservationResponse> getUserReservations(Long userId, Pageable pageable) {
        Page<Reservation> reservations = reservationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return reservations.map(this::convertToResponse);
    }
    
    /**
     * 사용자 예약 삭제 (soft delete)
     * 
     * @param reservationId 예약 ID
     * @param userId 사용자 ID
     */
    @Transactional
    @CacheEvict(value = "reservations", key = "'user:' + #userId + ':reservations'", condition = "!@environment.acceptsProfiles('local')")
    public void deleteReservationByUser(Long reservationId, Long userId) {
        log.info("User {} deleting reservation: {}", userId, reservationId);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // 권한 체크: 예약자 본인 또는 ADMIN만 삭제 가능
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        if (!SecurityUtils.isResourceOwnerOrAdmin(user, reservation)) {
            throw new RuntimeException("예약을 삭제할 권한이 없습니다.");
        }
        
        reservation.deleteByUser();
        reservationRepository.save(reservation);
        
        log.info("Reservation {} marked as deleted", reservationId);
    }
    
    /**
     * 예약 수정
     * 
     * @param reservationId 예약 ID
     * @param request 수정 요청
     * @param userId 사용자 ID
     * @return 수정된 예약 정보
     */
    @Transactional
    public ReservationResponse updateReservation(Long reservationId, UpdateReservationRequest request, Long userId) {
        log.info("Updating reservation: {} for user: {}", reservationId, userId);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // 권한 체크: 예약자 본인 또는 ADMIN만 수정 가능
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        if (!SecurityUtils.isResourceOwnerOrAdmin(user, reservation)) {
            throw new RuntimeException("예약을 수정할 권한이 없습니다.");
        }
        
        // 확정된 예약은 수정 불가
        if (reservation.getStatus() == ReservationStatus.CONFIRMED) {
            throw new RuntimeException("확정된 예약은 수정할 수 없습니다.");
        }
        
        // 취소된 예약은 수정 불가
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("취소된 예약은 수정할 수 없습니다.");
        }
        
        // 날짜가 변경되는 경우 유효성 및 충돌 검사
        LocalDate newCheckInDate = request.checkInDate() != null ? request.checkInDate() : reservation.getCheckInDate();
        LocalDate newCheckOutDate = request.checkOutDate() != null ? request.checkOutDate() : reservation.getCheckOutDate();
        
        if (request.checkInDate() != null || request.checkOutDate() != null) {
            validateReservationDates(newCheckInDate, newCheckOutDate);
            
            // 자신을 제외한 충돌 예약 확인 (사이트별로)
            List<Reservation> conflictingReservations = reservationRepository.findBySiteIdAndStatusIn(
                    reservation.getSite().getId(),
                    List.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING)
            ).stream()
            .filter(r -> !r.getId().equals(reservationId))
            .filter(r -> {
                // 날짜가 겹치는지 확인
                LocalDate reqStart = newCheckInDate;
                LocalDate reqEnd = newCheckOutDate;
                LocalDate resStart = r.getCheckInDate();
                LocalDate resEnd = r.getCheckOutDate();
                return reqStart.isBefore(resEnd) && reqEnd.isAfter(resStart);
            })
            .collect(java.util.stream.Collectors.toList());
            
            if (!conflictingReservations.isEmpty()) {
                throw new RuntimeException("선택한 날짜에 이미 예약이 있습니다.");
            }
            
            // 총 금액 재계산 (인원 정보도 함께 전달)
            Integer updatedGuests = request.numberOfGuests() != null ? request.numberOfGuests() : reservation.getNumberOfGuests();
            BigDecimal newTotalAmount = calculateTotalAmount(reservation.getSite(), newCheckInDate, newCheckOutDate, updatedGuests);
            reservation.setTotalAmount(newTotalAmount);
        }
        
        // 예약 정보 업데이트
    reservation.updateReservation(
        request.checkInDate(),
        request.checkOutDate(),
        request.numberOfGuests(),
        request.specialRequests()
    );
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        log.info("Updated reservation: {}", reservationId);
        
        return convertToResponse(updatedReservation);
    }
    
    /**
     * 예약 취소
     * 
     * @param reservationId 예약 ID
     * @param userId 사용자 ID
     */
    @Transactional
    @CacheEvict(value = "reservations", allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public void cancelReservation(Long reservationId, Long userId) {
        log.info("Cancelling reservation: {} for user: {}", reservationId, userId);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        // 권한 체크: 예약자 본인 또는 ADMIN만 취소 가능
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        if (!SecurityUtils.isResourceOwnerOrAdmin(user, reservation)) {
            throw new RuntimeException("예약을 취소할 권한이 없습니다.");
        }
        
        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new RuntimeException("이미 취소된 예약입니다.");
        }
        
        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new RuntimeException("완료된 예약은 취소할 수 없습니다.");
        }
        
        reservation.changeStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
        
        log.info("Cancelled reservation: {}", reservationId);
        
        // 예약 취소 알림 전송
        try {
            emailNotificationService.sendReservationCancellationEmail(reservation);
            smsNotificationService.sendReservationCancellationSms(reservation);
        } catch (Exception e) {
            log.warn("예약 취소 알림 전송 실패 (예약은 정상 취소됨): {}", reservationId, e);
        }
    }
    
    /**
     * 예약 날짜 유효성 검증
     * 
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     */
    private void validateReservationDates(LocalDate checkInDate, LocalDate checkOutDate) {
        if (checkInDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("체크인 날짜는 오늘 이후여야 합니다.");
        }
        
        if (checkOutDate.isBefore(checkInDate.plusDays(1))) {
            throw new RuntimeException("체크아웃 날짜는 체크인 날짜보다 최소 1일 후여야 합니다.");
        }
    }
    
    /**
     * 총 금액 계산
     * 
     * @param site 사이트
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @param numberOfGuests 총 인원
     * @return 총 금액
     */
    private BigDecimal calculateTotalAmount(Site site, LocalDate checkInDate, LocalDate checkOutDate, Integer numberOfGuests) {
        // PriceCalculationService를 사용하여 총 금액 계산
        PriceBreakdownDto breakdown = priceCalculationService.calculatePrice(
            site,
            checkInDate,
            checkOutDate,
            numberOfGuests != null ? numberOfGuests : 2
        );
        return breakdown.getTotalAmount();
    }
    
    /**
     * 예약 엔티티를 응답 DTO로 변환
     * 
     * @param reservation 예약 엔티티
     * @return 예약 응답 DTO
     */
    private ReservationResponse convertToResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setUserId(reservation.getUser().getId());
        response.setUserName(reservation.getUser().getUsername());
        response.setCampgroundId(reservation.getCampground().getId());
        response.setCampgroundName(reservation.getCampground().getName());
        response.setSiteId(reservation.getSite() != null ? reservation.getSite().getId() : null);
        response.setSiteNumber(reservation.getSite() != null ? reservation.getSite().getSiteNumber() : null);
        response.setCheckInDate(reservation.getCheckInDate());
        response.setCheckOutDate(reservation.getCheckOutDate());
        response.setNumberOfGuests(reservation.getNumberOfGuests());
        response.setNumberOfNights(reservation.getNumberOfNights());
        response.setTotalAmount(reservation.getTotalAmount());
        response.setStatus(reservation.getStatus());
        response.setSpecialRequests(reservation.getSpecialRequests());
        response.setCreatedAt(reservation.getCreatedAt());
        response.setUpdatedAt(reservation.getUpdatedAt());
        response.setPriceBreakdown(reservation.getPriceBreakdown()); // 가격 상세 내역

        // 결제 정보 조회 및 포함
        List<Payment> payments = paymentRepository.findByReservationIdOrderByCreatedAtDesc(reservation.getId());
        if (!payments.isEmpty()) {
            Payment latestPayment = payments.get(0); // 가장 최근 결제 정보
            response.setPayment(PaymentResponse.fromEntity(latestPayment));
        }
        
        return response;
    }
    
    // ==================== 관리자용 메서드들 ====================
    
    /**
     * 모든 예약 조회 (관리자용)
     * 
     * @param search 검색어
     * @param status 상태 필터
     * @param dateFilter 날짜 필터
     * @param pageable 페이징 정보
     * @return 예약 목록
     */
    public Page<ReservationResponse> getAllReservationsForAdmin(String search, String status, String dateFilter, Pageable pageable) {
        // 기본적으로 모든 예약을 조회하고, 필터링은 추후 구현
        Page<Reservation> reservations = reservationRepository.findAll(pageable);
        return reservations.map(this::convertToResponse);
    }
    
    /**
     * 예약 상태 업데이트 (관리자용)
     * 
     * @param reservationId 예약 ID
     * @param statusStr 새 상태
     * @return 업데이트된 예약 정보
     */
    @Transactional
    public ReservationResponse updateReservationStatusByAdmin(Long reservationId, String statusStr) {
        log.info("Admin updating reservation {} status to: {}", reservationId, statusStr);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        try {
            ReservationStatus newStatus = ReservationStatus.valueOf(statusStr);
            reservation.changeStatus(newStatus);
            Reservation updatedReservation = reservationRepository.save(reservation);
            
            log.info("Admin updated reservation {} status to: {}", reservationId, newStatus);
            return convertToResponse(updatedReservation);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("유효하지 않은 상태입니다: " + statusStr);
        }
    }
    
    /**
     * 예약 삭제 (관리자용)
     * 
     * @param reservationId 예약 ID
     */
    @Transactional
    public void deleteReservationByAdmin(Long reservationId) {
        log.info("Admin deleting reservation: {}", reservationId);
        
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다."));
        
        reservationRepository.delete(reservation);
        log.info("Admin deleted reservation: {}", reservationId);
    }
    
    /**
     * 예약 통계 조회 (관리자용)
     * 
     * @return 예약 통계 정보
     */
    public Map<String, Object> getReservationStatistics() {
        log.info("Fetching reservation statistics for admin");
        
        // 기본 통계 정보
        long totalReservations = reservationRepository.count();
        long pendingReservations = reservationRepository.countByStatus(ReservationStatus.PENDING);
        long confirmedReservations = reservationRepository.countByStatus(ReservationStatus.CONFIRMED);
        long cancelledReservations = reservationRepository.countByStatus(ReservationStatus.CANCELLED);
        long completedReservations = reservationRepository.countByStatus(ReservationStatus.COMPLETED);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalReservations", totalReservations);
        statistics.put("pendingReservations", pendingReservations);
        statistics.put("confirmedReservations", confirmedReservations);
        statistics.put("cancelledReservations", cancelledReservations);
        statistics.put("completedReservations", completedReservations);
        
        return statistics;
    }

    /**
     * 비회원 예약 생성
     * 
     * @param request 비회원 예약 생성 요청
     * @return 생성된 예약 정보
     */
    @Transactional
    public ReservationResponse createGuestReservation(GuestReservationRequest request) {
    log.info("Creating guest reservation for campground: {}, site: {}, guest: {}", 
        request.campgroundId(), request.siteId(), request.guestName());
        
        // 1. 캠핑장 조회 및 검증
        Campground campground = campgroundRepository.findById(request.campgroundId())
            .orElseThrow(() -> new IllegalArgumentException("캠핑장을 찾을 수 없습니다: " + request.campgroundId()));
        
        if (campground.getStatus() != CampgroundStatus.ACTIVE) {
            throw new IllegalStateException("현재 이용할 수 없는 캠핑장입니다.");
        }
        
        // 2. 사이트 조회 및 검증
        Site site = siteRepository.findById(request.siteId())
            .orElseThrow(() -> new IllegalArgumentException("사이트를 찾을 수 없습니다: " + request.siteId()));
        
        if (!site.getCampground().getId().equals(request.campgroundId())) {
            throw new IllegalArgumentException("사이트가 해당 캠핑장에 속하지 않습니다.");
        }
        
        if (site.getStatus() == SiteStatus.MAINTENANCE) {
            throw new IllegalStateException("현재 점검 중인 사이트입니다.");
        }
        
        if (site.getStatus() == SiteStatus.UNAVAILABLE) {
            throw new IllegalStateException("사용할 수 없는 사이트입니다.");
        }
        
        // 3. 날짜 검증
    validateReservationDates(request.checkInDate(), request.checkOutDate());
        
        // 4. 예약 가능성 검사 (사이트별로)
        List<Reservation> conflictingReservations = reservationRepository.findBySiteIdAndStatusIn(
            request.siteId(),
            List.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING)
        ).stream()
        .filter(reservation -> {
            // 날짜가 겹치는지 확인
            LocalDate reqStart = request.checkInDate();
            LocalDate reqEnd = request.checkOutDate();
            LocalDate resStart = reservation.getCheckInDate();
            LocalDate resEnd = reservation.getCheckOutDate();
            return reqStart.isBefore(resEnd) && reqEnd.isAfter(resStart);
        })
        .collect(java.util.stream.Collectors.toList());
        
        if (!conflictingReservations.isEmpty()) {
            throw new IllegalStateException("해당 날짜에 이미 예약이 있습니다.");
        }
        
        // 5. 총 금액 계산 (사이트별 요금제 적용)
    BigDecimal totalAmount = calculateTotalAmount(site, request.checkInDate(), request.checkOutDate(), request.numberOfGuests());
        
        // 6. Guest 정보 생성
        Guest guest = Guest.builder()
            .name(request.guestName())
            .phone(request.guestPhone())
            .email(request.guestEmail())
            .password(encodePassword(request.guestPassword()))
            .build();

        // 7. 비회원 예약 생성
        Reservation reservation = new Reservation();
        reservation.setUser(null); // 비회원은 user가 null
        reservation.setCampground(campground);
        reservation.setSite(site);
    reservation.setCheckInDate(request.checkInDate());
    reservation.setCheckOutDate(request.checkOutDate());
    reservation.setNumberOfGuests(request.numberOfGuests());
        reservation.setTotalAmount(totalAmount);
    reservation.setSpecialRequests(request.specialRequests());
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setGuest(guest);
        
        Reservation savedReservation = reservationRepository.save(reservation);
        
        log.info("Guest reservation created successfully: {}", savedReservation.getId());
        return convertToResponse(savedReservation);
    }

    /**
     * 비회원 예약 조회
     *
     * @param request 비회원 예약 조회 요청
     * @return 예약 정보 목록
     */
    public List<ReservationResponse> getGuestReservations(GuestReservationLookupRequest request) {
        log.info("Looking up guest reservations for phone: {}, email: {}",
                request.getGuestPhone(), request.getGuestEmail());

        // 비회원 예약 조회
        List<Reservation> reservations = reservationRepository.findGuestReservations(
            request.getGuestPhone(),
            request.getGuestEmail()
        );

        // 비밀번호 검증을 통해 필터링
        return reservations.stream()
            .filter(reservation -> reservation.getGuest() != null && verifyGuestPassword(request.getGuestPassword(), reservation.getGuest().getPassword()))
            .map(this::convertToResponse)
            .toList();
    }

    /**
     * 특정 사이트의 예약된 날짜 범위 조회
     *
     * @param siteId 사이트 ID
     * @return 예약된 날짜 범위 목록 (시작일, 종료일)
     */
    public List<Map<String, LocalDate>> getReservedDateRangesForSite(Long siteId) {
        // 해당 사이트의 CONFIRMED와 PENDING 상태인 예약들을 조회
        List<Reservation> reservations = reservationRepository.findBySiteIdAndStatusIn(
            siteId,
            List.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING)
        );

        return reservations.stream()
                .map(reservation -> {
                    Map<String, LocalDate> dateRange = new HashMap<>();
                    dateRange.put("checkInDate", reservation.getCheckInDate());
                    dateRange.put("checkOutDate", reservation.getCheckOutDate());
                    return dateRange;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 캠핑장의 모든 사이트 예약 날짜 범위 조회 (일괄 조회)
     *
     * @param campgroundId 캠핑장 ID
     * @return 사이트별 예약된 날짜 범위 맵 (key: siteId, value: 예약 날짜 범위 목록)
     */
    public Map<Long, List<Map<String, LocalDate>>> getReservedDateRangesForCampground(Long campgroundId) {
        // 캠핑장의 모든 사이트에 대한 CONFIRMED와 PENDING 상태인 예약들을 한 번에 조회
        List<Reservation> reservations = reservationRepository.findBySite_Campground_IdAndStatusIn(
            campgroundId,
            List.of(ReservationStatus.CONFIRMED, ReservationStatus.PENDING)
        );

        // 사이트별로 그룹화
        return reservations.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                    reservation -> reservation.getSite().getId(),
                    java.util.stream.Collectors.mapping(
                        reservation -> {
                            Map<String, LocalDate> dateRange = new HashMap<>();
                            dateRange.put("checkInDate", reservation.getCheckInDate());
                            dateRange.put("checkOutDate", reservation.getCheckOutDate());
                            return dateRange;
                        },
                        java.util.stream.Collectors.toList()
                    )
                ));
    }

    /**
     * 비밀번호 검증
     */
    private boolean verifyGuestPassword(String inputPassword, String encodedPassword) {
        try {
            String decoded = new String(java.util.Base64.getDecoder().decode(encodedPassword));
            return inputPassword.equals(decoded);
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 비밀번호 인코딩
     */
    private String encodePassword(String password) {
        return java.util.Base64.getEncoder().encodeToString(password.getBytes());
    }
}
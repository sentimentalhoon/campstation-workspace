package com.campstation.camp.admin.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.admin.dto.AdminDashboardStatsResponse;
import com.campstation.camp.campground.domain.CampgroundStatus;
import com.campstation.camp.campground.dto.CampgroundResponse;
import com.campstation.camp.campground.dto.CreateCampgroundRequest;
import com.campstation.camp.campground.dto.UpdateCampgroundRequest;
import com.campstation.camp.campground.service.CampgroundAdminFacade;
import com.campstation.camp.payment.dto.PaymentLogResponse;
import com.campstation.camp.payment.service.PaymentAdminFacade;
import com.campstation.camp.reservation.domain.ReservationStatus;
import com.campstation.camp.reservation.dto.AdminReservationResponse;
import com.campstation.camp.reservation.repository.PaymentRepository;
import com.campstation.camp.reservation.repository.ReservationRepository;
import com.campstation.camp.reservation.service.ReservationAdminFacade;
import com.campstation.camp.review.dto.ReviewResponse;
import com.campstation.camp.review.repository.ReviewRepository;
import com.campstation.camp.review.service.ReviewAdminFacade;
import com.campstation.camp.user.dto.AdminUserUpdateRequest;
import com.campstation.camp.user.dto.UserAdminResponse;
import com.campstation.camp.user.service.UserAdminFacade;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 관리자 서비스
 * 사용자 및 캠핑장 관리 기능 제공
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminService {

    private final UserAdminFacade userAdminFacade;
    private final CampgroundAdminFacade campgroundAdminFacade;
    private final ReviewAdminFacade reviewAdminFacade;
    private final ReservationAdminFacade reservationAdminFacade;
    private final PaymentAdminFacade paymentAdminFacade;

    // 통계용 Repository
    private final PaymentRepository paymentRepository;
    private final ReservationRepository reservationRepository;
    private final ReviewRepository reviewRepository;

    // ===== 대시보드 통계 =====

    /**
     * 관리자 대시보드 통계 조회
     */
    public AdminDashboardStatsResponse getDashboardStats() {
        log.info("Admin: Retrieve dashboard statistics");

        long totalUsers = userAdminFacade.countAll();
        long totalCampgrounds = campgroundAdminFacade.countAll();
        long totalReservations = reservationAdminFacade.countAll();
        long totalReviews = reviewAdminFacade.countAll();

        long pendingCampgrounds = campgroundAdminFacade.countByStatus(CampgroundStatus.INACTIVE);
        long activeReservations = reservationAdminFacade.countByStatus(ReservationStatus.CONFIRMED);

        // 월간 매출 계산 (현재 월)
        LocalDate now = LocalDate.now();
        Double monthlyRevenue = paymentRepository.findMonthlyRevenue(now.getMonthValue(), now.getYear());
        if (monthlyRevenue == null) {
            monthlyRevenue = 0.0;
        }

        // 전체 평균 평점 계산
        Double averageRating = reviewRepository.findAverageRating();
        if (averageRating == null) {
            averageRating = 0.0;
        }

        // 오늘 체크인/체크아웃 계산
        LocalDate today = LocalDate.now();
        Long todayCheckIns = reservationRepository.countTodayCheckIns(today);
        Long todayCheckOuts = reservationRepository.countTodayCheckOuts(today);

        log.info("Dashboard stats calculated - Revenue: {}, AvgRating: {}, CheckIns: {}, CheckOuts: {}",
                monthlyRevenue, averageRating, todayCheckIns, todayCheckOuts);

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalCampgrounds(totalCampgrounds)
                .totalReservations(totalReservations)
                .totalReviews(totalReviews)
                .pendingCampgrounds(pendingCampgrounds)
                .activeReservations(activeReservations)
                .monthlyRevenue(monthlyRevenue)
                .averageRating(averageRating)
                .todayCheckIns(todayCheckIns)
                .todayCheckOuts(todayCheckOuts)
                .build();
    }

    // ===== 예약 관리 =====

    /**
     * 모든 예약 목록 조회 (관리자용)
     */
    public Page<AdminReservationResponse> getAllReservations(Pageable pageable) {
        log.info("Admin: Retrieve all reservations 관리자용 전체 예약 목록 조회");
        return reservationAdminFacade.findAll(pageable);
    }

    /**
     * 예약 거부 (관리자용)
     */
    @Transactional
    public AdminReservationResponse rejectReservation(Long reservationId, String rejectionReason) {
        log.info("Admin: Reject reservation - reservationId: {}, reason: {}", reservationId, rejectionReason);
        return reservationAdminFacade.rejectReservation(reservationId, rejectionReason);
    }

    // ===== 사용자 관리 =====

    /**
     * 모든 사용자 목록 조회
     */
    public Page<UserAdminResponse> getAllUsers(Pageable pageable) {
        log.info("Admin: Retrieve all users 관리자용 전체 사용자 목록 조회");
        return userAdminFacade.findAll(pageable);
    }

    /**
     * 이메일로 사용자 조회
     */
    public UserAdminResponse getUserByEmail(String email) {
        log.info("Admin: Retrieve user by email 관리자용 이메일로 사용자 조회: {}", email);
        return userAdminFacade.getByEmail(email);
    }

    /**
     * ID로 사용자 조회
     */
    public UserAdminResponse getUserById(Long userId) {
        log.info("Admin: Retrieve user by ID 관리자용 ID로 사용자 조회: {}", userId);
        return userAdminFacade.getById(userId);
    }

    /**
     * 사용자 정보 수정
     */
    @Transactional
    public UserAdminResponse updateUser(Long userId, AdminUserUpdateRequest updateDto) {
        log.info("- Admin: Update user information 관리자용 사용자 정보 수정 - userId: {}", userId);
        return userAdminFacade.updateUser(userId, updateDto);
    }

    /**
     * 사용자 삭제
     */
    @Transactional
    public void deleteUser(Long userId) {
        log.info("Admin: Delete user 관리자용 사용자 삭제 - userId: {}", userId);

        userAdminFacade.deleteUser(userId);
    }

    // ===== 캠핑장 관리 =====
    /**
     * 모든 캠핑장 목록 조회
     */
    public Page<CampgroundResponse> getAllCampgrounds(Pageable pageable) {
        log.info("- Admin: Retrieve all campgrounds 관리자용 전체 캠핑장 목록 조회");
        return campgroundAdminFacade.findAll(pageable);
    }

    /**
     * 캠핑장 등록
     */
    @Transactional
    public CampgroundResponse createCampground(CreateCampgroundRequest createDto) {
        log.info("- Admin: Register campground 관리자용 캠핑장 등록 - name: {}", createDto.name());
        return campgroundAdminFacade.create(createDto);
    }

    /**
     * 캠핑장 정보 수정
     */
    @Transactional
    public CampgroundResponse updateCampground(Long campgroundId, UpdateCampgroundRequest updateDto) {
        log.info("- Admin: Update campground information 관리자용 캠핑장 정보 수정 - campgroundId: {}", campgroundId);
        return campgroundAdminFacade.update(campgroundId, updateDto);
    }

    /**
     * 캠핑장 삭제
     */
    @Transactional
    public void deleteCampground(Long campgroundId) {
        log.info("- Admin: Delete campground 관리자용 캠핑장 삭제 - campgroundId: {}", campgroundId);

        campgroundAdminFacade.delete(campgroundId);
    }

    /**
     * 캠핑장 상태 변경
     */
    @Transactional
    public CampgroundResponse updateCampgroundStatus(Long campgroundId, String status) {
        log.info("- Admin: Update campground status - campgroundId: {}, status: {}", campgroundId, status);
        CampgroundStatus parsed = Optional.ofNullable(status)
                .map(String::toUpperCase)
                .map(CampgroundStatus::valueOf)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 캠핑장 상태: " + status));
        return campgroundAdminFacade.updateStatus(campgroundId, parsed);
    }

    // ===== 리뷰 관리 =====

    /**
     * 모든 리뷰 목록 조회 (관리자용)
     */
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        log.info("Admin: Retrieve all reviews 관리자용 전체 리뷰 목록 조회");
        return reviewAdminFacade.findAll(pageable);
    }

    /**
     * 리뷰 삭제
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        log.info("Admin: Delete review - reviewId: {}", reviewId);
        reviewAdminFacade.delete(reviewId);
    }
    // ===== 캠핑장 승인/거부 =====

    /**
     * 캠핑장 승인
     */
    @Transactional
    public CampgroundResponse approveCampground(Long campgroundId) {
        log.info("Admin: Approve campground - campgroundId: {}", campgroundId);
        return campgroundAdminFacade.updateStatus(campgroundId, CampgroundStatus.ACTIVE);
    }

    /**
     * 캠핑장 거부
     */
    @Transactional
    public CampgroundResponse rejectCampground(Long campgroundId, String reason) {
        log.info("Admin: Reject campground - campgroundId: {}, reason: {}", campgroundId, reason);
        // TODO: 거부 사유 저장 로직 추가 필요
        return campgroundAdminFacade.updateStatus(campgroundId, CampgroundStatus.INACTIVE);
    }

    // ===== 사용자 상태 관리 =====

    /**
     * 사용자 활성/비활성 상태 토글
     */
    @Transactional
    public UserAdminResponse toggleUserStatus(Long userId) {
        log.info("Admin: Toggle user status - userId: {}", userId);
        return userAdminFacade.toggleStatus(userId);
    }

    // ===== 결제 로그 조회 =====

    /**
     * 결제/환불 로그 조회
     */
    public Page<PaymentLogResponse> getPaymentLogs(String type, String from, String to, Pageable pageable) {
        log.info("Admin: Retrieve payment logs - type: {}, from: {}, to: {}", type, from, to);
        
        return paymentAdminFacade.findPaymentLogs(type, from, to, pageable);
    }
}

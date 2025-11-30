package com.campstation.camp.admin.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.admin.service.AdminService;
import com.campstation.camp.banner.domain.BannerStatus;
import com.campstation.camp.banner.domain.BannerType;
import com.campstation.camp.banner.dto.BannerResponse;
import com.campstation.camp.banner.dto.BannerSearchParams;
import com.campstation.camp.banner.dto.BannerStats;
import com.campstation.camp.banner.dto.BulkUpdateBannerOrderRequest;
import com.campstation.camp.banner.dto.CreateBannerRequest;
import com.campstation.camp.banner.dto.UpdateBannerOrderRequest;
import com.campstation.camp.banner.dto.UpdateBannerRequest;
import com.campstation.camp.banner.dto.UpdateBannerStatusRequest;
import com.campstation.camp.banner.service.BannerService;
import com.campstation.camp.campground.dto.CampgroundResponse;
import com.campstation.camp.campground.dto.CreateCampgroundRequest;
import com.campstation.camp.campground.dto.UpdateCampgroundRequest;
import com.campstation.camp.payment.dto.PaymentLogResponse;
import com.campstation.camp.review.dto.ReviewResponse;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.user.dto.AdminUserUpdateRequest;
import com.campstation.camp.user.dto.UserAdminResponse;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 관리자 컨트롤러
 * 관리자 전용 기능을 제공하는 REST API 컨트롤러
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final BannerService bannerService;

    // 사용자 관리
    @GetMapping("/users")
    public ResponseEntity<CommonResponse<Page<UserAdminResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserAdminResponse> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(CommonResponse.success("사용자 목록 조회 성공", users));
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<CommonResponse<UserAdminResponse>> getUserByEmail(@PathVariable String email) {
        UserAdminResponse user = adminService.getUserByEmail(email);
        return ResponseEntity.ok(CommonResponse.success("사용자 조회 성공", user));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<CommonResponse<UserAdminResponse>> getUserById(@PathVariable Long userId) {
        UserAdminResponse user = adminService.getUserById(userId);
        return ResponseEntity.ok(CommonResponse.success("사용자 조회 성공", user));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<CommonResponse<UserAdminResponse>> updateUser(
            @PathVariable Long userId,
            @RequestBody AdminUserUpdateRequest updateDto) {
        UserAdminResponse updatedUser = adminService.updateUser(userId, updateDto);
        return ResponseEntity.ok(CommonResponse.success("사용자 정보 수정 성공", updatedUser));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    // 캠핑장 관리
    @Operation(summary = "관리자용 전체 캠핑장 목록 조회")
    @GetMapping("/campgrounds")
    public ResponseEntity<CommonResponse<Page<CampgroundResponse>>> getAllCampgrounds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CampgroundResponse> campgrounds = adminService.getAllCampgrounds(pageable);

        return ResponseEntity.ok(CommonResponse.success("캠핑장 목록 조회 성공", campgrounds));
    }

    @PostMapping("/campgrounds")
    public ResponseEntity<CommonResponse<CampgroundResponse>> createCampground(
            @RequestBody CreateCampgroundRequest createDto) {
        CampgroundResponse campground = adminService.createCampground(createDto);
        return ResponseEntity.status(201).body(CommonResponse.success("캠핑장 등록 성공", campground));
    }

    @PutMapping("/campgrounds/{campgroundId}")
    public ResponseEntity<CommonResponse<CampgroundResponse>> updateCampground(
            @PathVariable Long campgroundId,
            @RequestBody UpdateCampgroundRequest updateDto) {
        CampgroundResponse updatedCampground = adminService.updateCampground(campgroundId, updateDto);
        return ResponseEntity.ok(CommonResponse.success("캠핑장 정보 수정 성공", updatedCampground));
    }

    @DeleteMapping("/campgrounds/{campgroundId}")
    public ResponseEntity<Void> deleteCampground(@PathVariable Long campgroundId) {
        adminService.deleteCampground(campgroundId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/campgrounds/{campgroundId}/status")
    public ResponseEntity<CommonResponse<CampgroundResponse>> updateCampgroundStatus(
            @PathVariable Long campgroundId,
            @RequestParam String status) {
        CampgroundResponse updatedCampground = adminService.updateCampgroundStatus(campgroundId, status);
        return ResponseEntity.ok(CommonResponse.success("캠핑장 상태 변경 성공", updatedCampground));
    }

    // 리뷰 관리
    @Operation(summary = "관리자용 전체 리뷰 목록 조회")
    @GetMapping("/reviews")
    public ResponseEntity<CommonResponse<Page<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = adminService.getAllReviews(pageable);

        return ResponseEntity.ok(CommonResponse.success("리뷰 목록 조회 성공", reviews));
    }

    @Operation(summary = "리뷰 삭제")
    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        log.info("Admin deleting review: {}", reviewId);
        adminService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    // 캠핑장 승인/거부
    @Operation(summary = "캠핑장 승인")
    @PostMapping("/campgrounds/{campgroundId}/approve")
    public ResponseEntity<CommonResponse<CampgroundResponse>> approveCampground(@PathVariable Long campgroundId) {
        log.info("Admin approving campground: {}", campgroundId);
        CampgroundResponse campground = adminService.approveCampground(campgroundId);
        return ResponseEntity.ok(CommonResponse.success("캠핑장 승인 성공", campground));
    }

    @Operation(summary = "캠핑장 거부")
    @PostMapping("/campgrounds/{campgroundId}/reject")
    public ResponseEntity<CommonResponse<CampgroundResponse>> rejectCampground(
            @PathVariable Long campgroundId,
            @RequestBody Map<String, String> request) {
        
        String reason = request.get("reason");
        log.info("Admin rejecting campground: {} with reason: {}", campgroundId, reason);
        CampgroundResponse campground = adminService.rejectCampground(campgroundId, reason);
        return ResponseEntity.ok(CommonResponse.success("캠핑장 거부 처리 완료", campground));
    }

    // 사용자 역할 변경 (프론트엔드 호환)
    @Operation(summary = "사용자 역할 변경")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<CommonResponse<UserAdminResponse>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        String roleStr = request.get("role");
        log.info("Admin updating user role: {} to {}", userId, roleStr);
        AdminUserUpdateRequest updateDto = new AdminUserUpdateRequest();
        updateDto.setRole(com.campstation.camp.user.domain.UserRole.valueOf(roleStr));
        UserAdminResponse user = adminService.updateUser(userId, updateDto);
        return ResponseEntity.ok(CommonResponse.success("사용자 역할 변경 성공", user));
    }

    // 사용자 상태 변경 (프론트엔드 호환) - toggle-status 사용
    @Operation(summary = "사용자 상태 변경")
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<CommonResponse<UserAdminResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        log.info("Admin updating user status: {}", userId);
        // status 변경은 toggle로 처리
        UserAdminResponse user = adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(CommonResponse.success("사용자 상태 변경 성공", user));
    }

    // 사용자 상태 토글
    @Operation(summary = "사용자 활성/비활성 상태 토글")
    @PutMapping("/users/{userId}/toggle-status")
    public ResponseEntity<CommonResponse<UserAdminResponse>> toggleUserStatus(@PathVariable Long userId) {
        log.info("Admin toggling user status: {}", userId);
        UserAdminResponse user = adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(CommonResponse.success("사용자 상태 변경 성공", user));
    }

    // 결제 로그 조회
    @Operation(summary = "결제/환불 로그 조회")
    @GetMapping("/payments")
    public ResponseEntity<CommonResponse<Page<PaymentLogResponse>>> getPaymentLogs(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Getting payment logs - type: {}, from: {}, to: {}", type, from, to);
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentLogResponse> logs = adminService.getPaymentLogs(type, from, to, pageable);

        return ResponseEntity.ok(CommonResponse.success("결제 로그 조회 성공", logs));
    }

    // 배너 관리
    @Operation(summary = "관리자용 배너 목록 조회")
    @GetMapping("/banners")
    public ResponseEntity<CommonResponse<Page<BannerResponse>>> getAllBanners(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) BannerType type,
            @RequestParam(required = false) BannerStatus status,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Get All Banners - title: {}, type: {}, status: {}", title, type, status);
        
        BannerSearchParams params = BannerSearchParams.builder()
                .title(title)
                .type(type)
                .status(status)
                .sort(sort)
                .direction(direction)
                .build();
        
        Pageable pageable = PageRequest.of(page, size);
        Page<BannerResponse> banners = bannerService.searchBanners(params, pageable);

        return ResponseEntity.ok(CommonResponse.success("배너 목록 조회 성공", banners));
    }

    @Operation(summary = "배너 단건 조회")
    @GetMapping("/banners/{bannerId}")
    public ResponseEntity<CommonResponse<BannerResponse>> getBanner(@PathVariable Long bannerId) {
        log.info("Get Banner: {}", bannerId);
        BannerResponse banner = bannerService.getBanner(bannerId);
        return ResponseEntity.ok(CommonResponse.success("배너 조회 성공", banner));
    }

    @Operation(summary = "배너 생성")
    @PostMapping("/banners")
    public ResponseEntity<CommonResponse<BannerResponse>> createBanner(
            @Valid @RequestBody CreateBannerRequest request) {
        log.info("Create Banner: title={}, type={}", request.getTitle(), request.getType());
        BannerResponse banner = bannerService.createBanner(request);
        return ResponseEntity.status(201).body(CommonResponse.success("배너 생성 성공", banner));
    }

    @Operation(summary = "배너 수정")
    @PutMapping("/banners/{bannerId}")
    public ResponseEntity<CommonResponse<BannerResponse>> updateBanner(
            @PathVariable Long bannerId,
            @Valid @RequestBody UpdateBannerRequest request) {
        log.info("Update Banner: {}", bannerId);
        BannerResponse banner = bannerService.updateBanner(bannerId, request);
        return ResponseEntity.ok(CommonResponse.success("배너 수정 성공", banner));
    }

    @Operation(summary = "배너 삭제")
    @DeleteMapping("/banners/{bannerId}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long bannerId) {
        log.info("Delete Banner: {}", bannerId);
        bannerService.deleteBanner(bannerId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "배너 순서 변경")
    @PutMapping("/banners/{bannerId}/order")
    public ResponseEntity<CommonResponse<BannerResponse>> updateBannerOrder(
            @PathVariable Long bannerId,
            @Valid @RequestBody UpdateBannerOrderRequest request) {
        log.info("Update Banner Order: {} to {}", bannerId, request.getDisplayOrder());
        BannerResponse banner = bannerService.updateBannerOrder(bannerId, request.getDisplayOrder());
        return ResponseEntity.ok(CommonResponse.success("배너 순서 변경 성공", banner));
    }

    @Operation(summary = "배너 순서 일괄 변경")
    @PatchMapping("/banners/order")
    public ResponseEntity<CommonResponse<Map<String, Integer>>> updateBannerOrderBulk(
            @Valid @RequestBody BulkUpdateBannerOrderRequest request) {
        log.info("Bulk Update Banner Order: {} banners", request.getOrders().size());
        int updatedCount = bannerService.updateBannerOrderBulk(request);
        return ResponseEntity.ok(CommonResponse.success("배너 순서 일괄 변경 성공",
                Map.of("updatedCount", updatedCount)));
    }

    @Operation(summary = "배너 상태 변경")
    @PutMapping("/banners/{bannerId}/status")
    public ResponseEntity<CommonResponse<BannerResponse>> updateBannerStatus(
            @PathVariable Long bannerId,
            @Valid @RequestBody UpdateBannerStatusRequest request) {
        log.info("Update Banner Status: {} to {}", bannerId, request.getStatus());
        BannerResponse banner = bannerService.updateBannerStatus(bannerId, request.getStatus());
        return ResponseEntity.ok(CommonResponse.success("배너 상태 변경 성공", banner));
    }

    @Operation(summary = "배너 통계 조회")
    @GetMapping("/banners/stats")
    public ResponseEntity<CommonResponse<BannerStats>> getBannerStats() {
        log.info("Get Banner Stats");
        BannerStats stats = bannerService.getBannerStats();
        return ResponseEntity.ok(CommonResponse.success("배너 통계 조회 성공", stats));
    }
}

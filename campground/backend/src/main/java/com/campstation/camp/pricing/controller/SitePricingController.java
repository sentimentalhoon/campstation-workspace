package com.campstation.camp.pricing.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.campground.repository.SiteRepository;
import com.campstation.camp.pricing.dto.CreateSitePricingRequest;
import com.campstation.camp.pricing.dto.PriceBreakdown;
import com.campstation.camp.pricing.dto.SitePricingResponse;
import com.campstation.camp.pricing.service.PricingCalculationService;
import com.campstation.camp.pricing.service.SitePricingService;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.security.annotation.OwnerOrAdmin;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 사이트 요금제 관리 API
 * 
 * Owner용: 자신의 캠핑장 사이트에 대한 요금제 CRUD
 * 공개용: 예약 전 요금 미리 계산
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class SitePricingController {

    private final SitePricingService pricingService;
    private final PricingCalculationService calculationService;
    private final SiteRepository siteRepository;
    private final UserService userService;

    /**
     * 요금제 생성 (Owner 전용)
     * 
     * @param siteId 사이트 ID
     * @param request 요금제 생성 요청
     * @param userDetails 현재 로그인한 Owner
     * @return 생성된 요금제
     */
    @PostMapping("/owner/sites/{siteId}/pricing")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<SitePricingResponse>> createSitePricing(
            @PathVariable Long siteId,
            @Valid @RequestBody CreateSitePricingRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("POST /api/v1/owner/sites/{}/pricing - owner: {}", siteId, email);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Long ownerId = user.getId();
        log.info("로그인 사용자 정보 - userId: {}, email: {}, role: {}", ownerId, email, user.getRole());
        
        SitePricingResponse response = pricingService.createSitePricing(siteId, request, ownerId);
        return ResponseEntity.ok(CommonResponse.success("요금제가 생성되었습니다.", response));
    }

    /**
     * 사이트의 모든 요금제 조회 (Owner 전용)
     * 
     * @param siteId 사이트 ID
     * @param authentication 현재 로그인한 Owner
     * @return 요금제 목록 (우선순위 내림차순)
     */
    @GetMapping("/owner/sites/{siteId}/pricing")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<List<SitePricingResponse>>> getSitePricings(
            @PathVariable Long siteId,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("GET /api/v1/owner/sites/{}/pricing - owner: {}", siteId, email);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Long ownerId = user.getId();
        log.info("로그인 사용자 정보 (조회) - userId: {}, email: {}, role: {}", ownerId, email, user.getRole());
        
        List<SitePricingResponse> pricings = pricingService.getSitePricings(siteId, ownerId);
        return ResponseEntity.ok(CommonResponse.success("요금제 목록 조회 성공", pricings));
    }

    /**
     * 요금제 수정 (Owner 전용)
     * 
     * @param siteId 사이트 ID
     * @param pricingId 요금제 ID
     * @param request 수정 요청
     * @param authentication 현재 로그인한 Owner
     * @return 수정된 요금제
     */
    @PutMapping("/owner/sites/{siteId}/pricing/{pricingId}")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<SitePricingResponse>> updateSitePricing(
            @PathVariable Long siteId,
            @PathVariable Long pricingId,
            @Valid @RequestBody CreateSitePricingRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("PUT /api/v1/owner/sites/{}/pricing/{} - owner: {}", siteId, pricingId, email);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Long ownerId = user.getId();
        
        SitePricingResponse response = pricingService.updateSitePricing(pricingId, request, ownerId);
        return ResponseEntity.ok(CommonResponse.success("요금제가 수정되었습니다.", response));
    }

    /**
     * 요금제 삭제 (Owner 전용)
     * 
     * @param siteId 사이트 ID
     * @param pricingId 요금제 ID
     * @param authentication 현재 로그인한 Owner
     * @return 204 No Content
     */
    @DeleteMapping("/owner/sites/{siteId}/pricing/{pricingId}")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<Void>> deleteSitePricing(
            @PathVariable Long siteId,
            @PathVariable Long pricingId,
            Authentication authentication) {
        String email = authentication.getName();
        log.info("DELETE /api/v1/owner/sites/{}/pricing/{} - owner: {}", siteId, pricingId, email);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Long ownerId = user.getId();
        
        pricingService.deleteSitePricing(pricingId, ownerId);
        return ResponseEntity.ok(CommonResponse.success("요금제가 삭제되었습니다.", null));
    }

    /**
     * Owner의 모든 캠핑장 요금제 조회 (Owner 전용)
     * 
     * @param authentication 현재 로그인한 Owner
     * @return 모든 요금제 목록
     */
    @GetMapping("/owner/pricing")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<List<SitePricingResponse>>> getAllOwnerPricings(
            Authentication authentication) {
        String email = authentication.getName();
        log.debug("GET /api/v1/owner/pricing - owner: {}", email);

        User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        Long ownerId = user.getId();
        
        List<SitePricingResponse> pricings = pricingService.getAllOwnerPricings(ownerId);
        return ResponseEntity.ok(CommonResponse.success("전체 요금제 목록 조회 성공", pricings));
    }

    /**
     * 요금 미리 계산 (공개 API)
     * 
     * 예약 페이지에서 날짜와 인원을 선택하면 실시간으로 요금을 계산하여 보여줌
     * 
     * @param siteId 사이트 ID
     * @param checkInDate 체크인 날짜 (yyyy-MM-dd)
     * @param checkOutDate 체크아웃 날짜 (yyyy-MM-dd)
     * @param numberOfGuests 인원 수
     * @return 요금 상세 내역 (날짜별 요금, 할인 내역 포함)
     */
    @GetMapping("/pricing/calculate")
    public ResponseEntity<CommonResponse<PriceBreakdown>> calculatePrice(
            @RequestParam Long siteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam Integer numberOfGuests) {
        log.debug("GET /api/v1/pricing/calculate - siteId: {}, checkIn: {}, checkOut: {}, guests: {}",
                siteId, checkInDate, checkOutDate, numberOfGuests);

        // 사이트 조회 (존재 여부만 확인)
        if (!siteRepository.existsById(siteId)) {
            throw new RuntimeException("사이트를 찾을 수 없습니다.");
        }

        // 요금 계산
        PriceBreakdown priceBreakdown = calculationService.calculatePrice(siteId, checkInDate, checkOutDate,
                numberOfGuests);

        return ResponseEntity.ok(CommonResponse.success("요금 계산 성공", priceBreakdown));
    }
}


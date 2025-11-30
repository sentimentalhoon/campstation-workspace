package com.campstation.camp.pricing.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.campground.repository.SiteRepository;
import com.campstation.camp.pricing.domain.SitePricing;
import com.campstation.camp.pricing.dto.CreateSitePricingRequest;
import com.campstation.camp.pricing.dto.SitePricingResponse;
import com.campstation.camp.pricing.repository.SitePricingRepository;
import com.campstation.camp.shared.security.annotation.OwnerOrAdmin;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.domain.UserRole;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 사이트 요금제 관리 서비스
 * 
 * Owner가 자신의 캠핑장 사이트에 대한 요금제를 생성/수정/삭제하는 기능
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class SitePricingService {

    private final SitePricingRepository pricingRepository;
    private final SiteRepository siteRepository;

    /**
     * 사이트 요금제 생성
     * 
     * @param siteId 사이트 ID
     * @param request 요금제 생성 요청
     * @param ownerId Owner ID
     * @return 생성된 요금제
     */
    @Transactional
    @OwnerOrAdmin
    public SitePricingResponse createSitePricing(Long siteId, CreateSitePricingRequest request, Long ownerId) {
        log.info("Creating pricing for site {}, owner: {}", siteId, ownerId);

        // 1. 사이트 조회 및 Owner 권한 확인
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new RuntimeException("사이트를 찾을 수 없습니다."));

        Long campgroundOwnerId = site.getCampground().getOwner().getId();
        log.debug("권한 체크 - 요청 ownerId: {}, 캠핑장 ownerId: {}, 사이트ID: {}, 캠핑장ID: {}",
                  ownerId, campgroundOwnerId, siteId, site.getCampground().getId());

        checkOwnerPermission(campgroundOwnerId, ownerId);

        // 2. 요금제 타입별 날짜 검증
        validatePricingDates(request);

        // 3. 요금제 이름 중복 확인
        if (pricingRepository.findBySiteIdAndPricingName(siteId, request.getPricingName()).isPresent()) {
            throw new RuntimeException("이미 존재하는 요금제 이름입니다.");
        }

        // 3. 요금제 생성
        SitePricing pricing = SitePricing.builder()
                .site(site)
                .pricingName(request.getPricingName())
                .description(request.getDescription())
                .ruleType(request.getRuleType())
                .basePrice(request.getBasePrice())
                .weekendPrice(request.getWeekendPrice())
                .dayMultipliers(request.getDayMultipliers())
                .baseGuests(request.getBaseGuests())
                .maxGuests(request.getMaxGuests())
                .extraGuestFee(request.getExtraGuestFee())
                .seasonType(request.getSeasonType())
                .startMonth(request.getStartMonth())
                .startDay(request.getStartDay())
                .endMonth(request.getEndMonth())
                .endDay(request.getEndDay())
                .longStayDiscountRate(request.getLongStayDiscountRate())
                .longStayMinNights(request.getLongStayMinNights())
                .extendedStayDiscountRate(request.getExtendedStayDiscountRate())
                .extendedStayMinNights(request.getExtendedStayMinNights())
                .earlyBirdDiscountRate(request.getEarlyBirdDiscountRate())
                .earlyBirdMinDays(request.getEarlyBirdMinDays())
                .priority(request.getPriority())
                .isActive(request.getIsActive())
                .build();

        SitePricing savedPricing = pricingRepository.save(pricing);
        log.info("Created pricing: {} for site: {}", savedPricing.getId(), siteId);

        return SitePricingResponse.fromEntity(savedPricing);
    }

    /**
     * 사이트의 모든 요금제 조회
     * 
     * @param siteId 사이트 ID
     * @param ownerId Owner ID
     * @return 요금제 목록
     */
    @OwnerOrAdmin
    public List<SitePricingResponse> getSitePricings(Long siteId, Long ownerId) {
        log.debug("Getting pricings for site {}, owner: {}", siteId, ownerId);

        // 사이트 조회 및 Owner 권한 확인
        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new RuntimeException("사이트를 찾을 수 없습니다."));

        Long campgroundOwnerId = site.getCampground().getOwner().getId();
        log.debug("권한 체크 (조회) - 요청 ownerId: {}, 캠핑장 ownerId: {}", ownerId, campgroundOwnerId);

        checkOwnerPermission(campgroundOwnerId, ownerId);

        List<SitePricing> pricings = pricingRepository.findBySiteIdOrderByPriorityDesc(siteId);
        return pricings.stream()
                .map(SitePricingResponse::fromEntity)
                .toList();
    }

    /**
     * 요금제 수정
     * 
     * @param pricingId 요금제 ID
     * @param request 수정 요청
     * @param ownerId Owner ID
     * @return 수정된 요금제
     */
    @Transactional
    @OwnerOrAdmin
    public SitePricingResponse updateSitePricing(Long pricingId, CreateSitePricingRequest request, Long ownerId) {
        log.info("Updating pricing {}, owner: {}", pricingId, ownerId);

        // 요금제 조회 및 Owner 권한 확인
        SitePricing pricing = pricingRepository.findById(pricingId)
                .orElseThrow(() -> new RuntimeException("요금제를 찾을 수 없습니다."));

        Long campgroundOwnerId = pricing.getSite().getCampground().getOwner().getId();
        log.debug("권한 체크 (수정) - 요청 ownerId: {}, 캠핑장 ownerId: {}, pricingId: {}",
                  ownerId, campgroundOwnerId, pricingId);

        checkOwnerPermission(campgroundOwnerId, ownerId);

        // 요금제 타입별 날짜 검증
        validatePricingDates(request);

        // 요금제 업데이트
        pricing.setPricingName(request.getPricingName());
        pricing.setDescription(request.getDescription());
        pricing.setRuleType(request.getRuleType());
        pricing.setBasePrice(request.getBasePrice());
        pricing.setWeekendPrice(request.getWeekendPrice());
        pricing.setDayMultipliers(request.getDayMultipliers());
        pricing.setBaseGuests(request.getBaseGuests());
        pricing.setMaxGuests(request.getMaxGuests());
        pricing.setExtraGuestFee(request.getExtraGuestFee());
        pricing.setSeasonType(request.getSeasonType());
        pricing.setStartMonth(request.getStartMonth());
        pricing.setStartDay(request.getStartDay());
        pricing.setEndMonth(request.getEndMonth());
        pricing.setEndDay(request.getEndDay());
        pricing.setLongStayDiscountRate(request.getLongStayDiscountRate());
        pricing.setLongStayMinNights(request.getLongStayMinNights());
        pricing.setExtendedStayDiscountRate(request.getExtendedStayDiscountRate());
        pricing.setExtendedStayMinNights(request.getExtendedStayMinNights());
        pricing.setEarlyBirdDiscountRate(request.getEarlyBirdDiscountRate());
        pricing.setEarlyBirdMinDays(request.getEarlyBirdMinDays());
        pricing.setPriority(request.getPriority());
        pricing.setIsActive(request.getIsActive());

        SitePricing updatedPricing = pricingRepository.save(pricing);
        log.info("Updated pricing: {}", pricingId);

        return SitePricingResponse.fromEntity(updatedPricing);
    }

    /**
     * 요금제 삭제
     * 
     * @param pricingId 요금제 ID
     * @param ownerId Owner ID
     */
    @Transactional
    @OwnerOrAdmin
    public void deleteSitePricing(Long pricingId, Long ownerId) {
        log.info("Deleting pricing {}, owner: {}", pricingId, ownerId);

        // 요금제 조회 및 Owner 권한 확인
        SitePricing pricing = pricingRepository.findById(pricingId)
                .orElseThrow(() -> new RuntimeException("요금제를 찾을 수 없습니다."));

        Long campgroundOwnerId = pricing.getSite().getCampground().getOwner().getId();
        log.debug("권한 체크 (삭제) - 요청 ownerId: {}, 캠핑장 ownerId: {}, pricingId: {}",
                  ownerId, campgroundOwnerId, pricingId);

        checkOwnerPermission(campgroundOwnerId, ownerId);

        pricingRepository.delete(pricing);
        log.info("Deleted pricing: {}", pricingId);
    }

    /**
     * Owner의 모든 캠핑장 요금제 조회
     *
     * @param ownerId Owner ID
     * @return 요금제 목록
     */
    public List<SitePricingResponse> getAllOwnerPricings(Long ownerId) {
        log.debug("Getting all pricings for owner: {}", ownerId);

        List<SitePricing> pricings = pricingRepository.findByOwnerId(ownerId);
        return pricings.stream()
                .map(SitePricingResponse::fromEntity)
                .toList();
    }

    /**
     * 현재 사용자가 ADMIN인지 확인
     *
     * @return ADMIN이면 true
     */
    private boolean isCurrentUserAdmin() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof User) {
                User user = (User) authentication.getPrincipal();
                return user.getRole() == UserRole.ADMIN;
            }
        } catch (Exception e) {
            log.debug("Failed to check admin role: {}", e.getMessage());
        }
        return false;
    }

    /**
     * 캠핑장 Owner 권한 체크 (ADMIN은 모든 권한 허용)
     *
     * @param campgroundOwnerId 캠핑장 소유자 ID
     * @param requestOwnerId 요청자 ID
     * @throws RuntimeException 권한이 없는 경우
     */
    private void checkOwnerPermission(Long campgroundOwnerId, Long requestOwnerId) {
        // ADMIN은 모든 권한 허용
        if (isCurrentUserAdmin()) {
            log.debug("Admin user - permission granted");
            return;
        }

        // Owner 권한 체크
        if (!campgroundOwnerId.equals(requestOwnerId)) {
            log.error("권한 없음 - 요청 ownerId: {}, 실제 캠핑장 ownerId: {}", requestOwnerId, campgroundOwnerId);
            throw new RuntimeException("해당 리소스에 대한 권한이 없습니다.");
        }
    }

    /**
     * 요금제 타입별 월-일 검증
     * SEASONAL: 시즌 타입만 설정하면 해당 월에 자동 적용, 월-일은 선택 사항
     * DATE_RANGE, SPECIAL_EVENT: 적용 기간 필수
     * 
     * @param request 요금제 생성/수정 요청
     */
    private void validatePricingDates(CreateSitePricingRequest request) {
        switch (request.getRuleType()) {
            case SEASONAL:
                // 시즌별 요금제는 월-일을 지정하지 않으면 시즌 타입에 따라 자동으로 해당 월에 적용
                // 월-일을 지정하는 경우 시작월, 시작일, 종료월, 종료일 모두 필요
                boolean hasAnyDate = request.getStartMonth() != null || request.getStartDay() != null 
                    || request.getEndMonth() != null || request.getEndDay() != null;
                boolean hasAllDates = request.getStartMonth() != null && request.getStartDay() != null 
                    && request.getEndMonth() != null && request.getEndDay() != null;
                
                if (hasAnyDate && !hasAllDates) {
                    throw new IllegalArgumentException("시즌별 요금제는 시작월/일과 종료월/일을 모두 입력하거나 모두 비워주세요.");
                }
                break;
            case DATE_RANGE:
                if (request.getStartMonth() == null || request.getStartDay() == null 
                    || request.getEndMonth() == null || request.getEndDay() == null) {
                    throw new IllegalArgumentException("기간 지정 요금제는 적용 시작월/일과 종료월/일이 필수입니다.");
                }
                break;
            case SPECIAL_EVENT:
                if (request.getStartMonth() == null || request.getStartDay() == null 
                    || request.getEndMonth() == null || request.getEndDay() == null) {
                    throw new IllegalArgumentException("특별 이벤트 요금제는 적용 시작월/일과 종료월/일이 필수입니다.");
                }
                break;
            case BASE:
                // 기본 요금제는 날짜 제약 없음
                break;
        }

        // 월-일이 설정된 경우 유효성 검증
        if (request.getStartMonth() != null && request.getStartDay() != null) {
            validateMonthDay(request.getStartMonth(), request.getStartDay(), "시작");
        }
        if (request.getEndMonth() != null && request.getEndDay() != null) {
            validateMonthDay(request.getEndMonth(), request.getEndDay(), "종료");
        }
    }

    /**
     * 월-일 유효성 검증
     * 
     * @param month 월 (1-12)
     * @param day 일 (1-31)
     * @param prefix 오류 메시지 접두사
     */
    private void validateMonthDay(Integer month, Integer day, String prefix) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException(prefix + " 월은 1~12 사이여야 합니다.");
        }
        if (day < 1 || day > 31) {
            throw new IllegalArgumentException(prefix + " 일은 1~31 사이여야 합니다.");
        }
        // 각 월의 최대 일수 검증
        int maxDay = switch (month) {
            case 2 -> 29; // 윤년 고려하여 29일까지 허용
            case 4, 6, 9, 11 -> 30;
            default -> 31;
        };
        if (day > maxDay) {
            throw new IllegalArgumentException(prefix + " 일이 " + month + "월의 유효 범위를 초과합니다.");
        }
    }
}

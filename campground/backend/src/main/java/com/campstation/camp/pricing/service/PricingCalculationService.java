package com.campstation.camp.pricing.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.pricing.domain.SitePricing;
import com.campstation.camp.pricing.dto.AppliedDiscount;
import com.campstation.camp.pricing.dto.DailyPriceDetail;
import com.campstation.camp.pricing.dto.PriceBreakdown;
import com.campstation.camp.pricing.repository.SitePricingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 요금 계산 서비스
 * 
 * 복잡한 요금 계산 로직을 담당하는 핵심 서비스
 * 다양한 요금제, 할인 정책, 시즌별 가격을 종합적으로 계산
 * 
 * 주요 기능:
 * - 날짜별 요금제 선택 (우선순위 기반)
 * - 요일별 차등 요금 적용
 * - 추가 인원 요금 계산
 * - 장기 숙박/조기 예약 할인 적용
 * - 상세한 요금 내역 제공
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class PricingCalculationService {

    private final SitePricingRepository pricingRepository;

    /**
     * 예약 총 금액 계산 (상세 내역 포함)
     * 
     * @param siteId 사이트 ID
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @param numberOfGuests 총 인원
     * @return 가격 상세 내역
     */
    public PriceBreakdown calculatePrice(
            Long siteId,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            Integer numberOfGuests) {

        log.info("=== Price Calculation Start ===");
        log.info("Site ID: {}, Check-in: {}, Check-out: {}, Guests: {}",
                siteId, checkInDate, checkOutDate, numberOfGuests);

        try {
            // 입력 유효성 검증
            if (checkInDate == null || checkOutDate == null) {
                log.error("Invalid dates: checkInDate={}, checkOutDate={}", checkInDate, checkOutDate);
                throw new IllegalArgumentException("체크인/체크아웃 날짜는 필수입니다.");
            }
            
            if (checkInDate.isAfter(checkOutDate) || checkInDate.isEqual(checkOutDate)) {
                log.error("Invalid date range: checkInDate={}, checkOutDate={}", checkInDate, checkOutDate);
                throw new IllegalArgumentException("체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.");
            }
            
            if (numberOfGuests == null || numberOfGuests < 1) {
                log.error("Invalid number of guests: {}", numberOfGuests);
                throw new IllegalArgumentException("인원 수는 1명 이상이어야 합니다.");
            }

            // 1. 사이트의 활성화된 요금제 조회 (우선순위 순)
            List<SitePricing> pricings = pricingRepository
                    .findBySiteIdAndIsActiveTrueOrderByPriorityDesc(siteId);

            if (pricings.isEmpty()) {
                log.warn("No active pricing found for site {}, using default price", siteId);
                return calculateWithDefaultPrice(checkInDate, checkOutDate, numberOfGuests);
            }
            
            log.info("Found {} active pricing rules for site {}", pricings.size(), siteId);

        // 2. 날짜별로 요금 계산 및 대표 요금제 결정
        BigDecimal subtotal = BigDecimal.ZERO;
        List<DailyPriceDetail> dailyBreakdown = new ArrayList<>();
        SitePricing primaryPricing = null; // 할인 계산에 사용할 대표 요금제
        
        LocalDate currentDate = checkInDate;
        while (currentDate.isBefore(checkOutDate)) {
            // 해당 날짜에 적용 가능한 요금제 찾기
            SitePricing applicablePricing = findApplicablePricing(pricings, currentDate);
            
            // 첫 날짜의 요금제를 대표 요금제로 설정 (할인 계산에 사용)
            if (primaryPricing == null) {
                primaryPricing = applicablePricing;
            }
            
            // 일일 요금 계산 (요일별 차등 적용)
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            BigDecimal dailyRate = applicablePricing.getDailyRate(dayOfWeek);
            
            subtotal = subtotal.add(dailyRate);
            
            // 주말 여부 확인 (금요일, 토요일)
            boolean isWeekend = dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY;
            
            dailyBreakdown.add(DailyPriceDetail.builder()
                    .date(currentDate)
                    .dailyRate(dailyRate)
                    .pricingName(applicablePricing.getPricingName())
                    .isWeekend(isWeekend)
                    .build());
            
            currentDate = currentDate.plusDays(1);
        }

        // 3. 숙박 일수 계산
        long numberOfNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);

        // primaryPricing이 null이면 첫 번째 요금제 사용 (이론상 발생하지 않음)
        if (primaryPricing == null) {
            primaryPricing = pricings.get(0);
            log.warn("Primary pricing was null, using first pricing rule");
        }
        
        log.info("Using primary pricing: {} (priority: {})", 
                primaryPricing.getPricingName(), primaryPricing.getPriority());

        // 4. 추가 인원 요금 계산 - primaryPricing 사용
        BigDecimal extraGuestFee = primaryPricing.calculateExtraGuestFee(numberOfGuests);
        // 추가 인원 요금은 전체 숙박 기간에 적용
        BigDecimal totalExtraGuestFee = extraGuestFee.multiply(BigDecimal.valueOf(numberOfNights));

        // 5. 소계 (기본 요금 + 추가 인원 요금)
        BigDecimal subtotalWithGuests = subtotal.add(totalExtraGuestFee);

        // 6. 할인 계산 - primaryPricing의 할인율 사용
        BigDecimal totalDiscount = BigDecimal.ZERO;
        List<AppliedDiscount> appliedDiscounts = new ArrayList<>();

        // 6-1. 장기 숙박 할인 (3박 이상 or 7박 이상)
        BigDecimal longStayDiscountRate = primaryPricing.getLongStayDiscountRate((int) numberOfNights);
        if (longStayDiscountRate.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = subtotalWithGuests.multiply(longStayDiscountRate)
                    .setScale(0, RoundingMode.HALF_UP);
            totalDiscount = totalDiscount.add(discountAmount);
            
            String discountType;
            String description;
            if (numberOfNights >= primaryPricing.getExtendedStayMinNights()) {
                discountType = "EXTENDED_STAY";
                description = String.format("연박 할인 (%d박 이상)", primaryPricing.getExtendedStayMinNights());
            } else {
                discountType = "LONG_STAY";
                description = String.format("장기 숙박 할인 (%d박 이상)", primaryPricing.getLongStayMinNights());
            }
            
            appliedDiscounts.add(AppliedDiscount.builder()
                    .discountType(discountType)
                    .discountRate(longStayDiscountRate.multiply(BigDecimal.valueOf(100)).intValue())
                    .discountAmount(discountAmount)
                    .description(description)
                    .build());
            
            log.info("Applied long stay discount: rate={}%, amount={}", 
                    longStayDiscountRate.multiply(BigDecimal.valueOf(100)), discountAmount);
        }

        // 6-2. 조기 예약 할인
        long daysBeforeCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), checkInDate);
        BigDecimal earlyBirdDiscountRate = primaryPricing.getEarlyBirdDiscountRate(daysBeforeCheckIn);
        if (earlyBirdDiscountRate.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = subtotalWithGuests.multiply(earlyBirdDiscountRate)
                    .setScale(0, RoundingMode.HALF_UP);
            totalDiscount = totalDiscount.add(discountAmount);
            
            appliedDiscounts.add(AppliedDiscount.builder()
                    .discountType("EARLY_BIRD")
                    .discountRate(earlyBirdDiscountRate.multiply(BigDecimal.valueOf(100)).intValue())
                    .discountAmount(discountAmount)
                    .description(String.format("조기 예약 할인 (%d일 전)", primaryPricing.getEarlyBirdMinDays()))
                    .build());
            
            log.info("Applied early bird discount: rate={}%, amount={}, days before check-in={}", 
                    earlyBirdDiscountRate.multiply(BigDecimal.valueOf(100)), discountAmount, daysBeforeCheckIn);
        }

        // 7. 최종 금액 계산
        BigDecimal totalAmount = subtotalWithGuests.subtract(totalDiscount);
        
        // 최소 금액 보장 (0원 이하가 되지 않도록)
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        log.info("Price calculation completed: subtotal={}, discount={}, total={}",
                subtotal, totalDiscount, totalAmount);
        log.info("=== Price Calculation Complete ===");

        return PriceBreakdown.builder()
                .siteId(siteId)
                .checkInDate(checkInDate)
                .checkOutDate(checkOutDate)
                .numberOfNights((int) numberOfNights)
                .numberOfGuests(numberOfGuests)
                .basePrice(subtotal)
                .extraGuestFee(totalExtraGuestFee)
                .subtotal(subtotalWithGuests)
                .totalDiscount(totalDiscount)
                .totalAmount(totalAmount)
                .dailyBreakdown(dailyBreakdown)
                .appliedDiscounts(appliedDiscounts)
                .build();
                
        } catch (IllegalArgumentException e) {
            log.error("Invalid input for price calculation: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during price calculation for site {}: {}", siteId, e.getMessage(), e);
            throw new RuntimeException("요금 계산 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 해당 날짜에 적용 가능한 요금제 찾기
     * 우선순위가 높은 요금제부터 확인
     * 
     * @param pricings 요금제 목록 (우선순위 내림차순 정렬됨)
     * @param date 날짜
     * @return 적용 가능한 요금제
     */
    private SitePricing findApplicablePricing(List<SitePricing> pricings, LocalDate date) {
        for (SitePricing pricing : pricings) {
            if (pricing.isApplicableOn(date)) {
                return pricing;
            }
        }
        
        // 적용 가능한 요금제가 없으면 마지막 요금제(기본 요금제) 사용
        return pricings.get(pricings.size() - 1);
    }

    /**
     * 기본 요금으로 계산 (요금제가 없을 때)
     * 
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @param numberOfGuests 총 인원
     * @return 가격 상세 내역
     */
    private PriceBreakdown calculateWithDefaultPrice(
            LocalDate checkInDate,
            LocalDate checkOutDate,
            Integer numberOfGuests) {

        long numberOfNights = ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        BigDecimal defaultPricePerNight = new BigDecimal("50000");
        BigDecimal totalAmount = defaultPricePerNight.multiply(BigDecimal.valueOf(numberOfNights));

        // 날짜별 기본 요금 내역 생성
        List<DailyPriceDetail> dailyBreakdown = new ArrayList<>();
        LocalDate currentDate = checkInDate;
        while (currentDate.isBefore(checkOutDate)) {
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            boolean isWeekend = dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY;
            
            dailyBreakdown.add(DailyPriceDetail.builder()
                    .date(currentDate)
                    .dailyRate(defaultPricePerNight)
                    .pricingName("기본 요금")
                    .isWeekend(isWeekend)
                    .build());
            
            currentDate = currentDate.plusDays(1);
        }

        return PriceBreakdown.builder()
                .siteId(null)
                .checkInDate(checkInDate)
                .checkOutDate(checkOutDate)
                .numberOfNights((int) numberOfNights)
                .numberOfGuests(numberOfGuests)
                .basePrice(totalAmount)
                .extraGuestFee(BigDecimal.ZERO)
                .subtotal(totalAmount)
                .totalDiscount(BigDecimal.ZERO)
                .totalAmount(totalAmount)
                .dailyBreakdown(dailyBreakdown)
                .appliedDiscounts(List.of())
                .build();
    }

    /**
     * 간단한 총액만 계산 (ReservationService에서 사용)
     * 
     * @param siteId 사이트 ID
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @param numberOfGuests 총 인원
     * @return 총 금액
     */
    public BigDecimal calculateTotalAmount(
            Long siteId,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            Integer numberOfGuests) {
        
        PriceBreakdown breakdown = calculatePrice(siteId, checkInDate, checkOutDate, numberOfGuests);
        return breakdown.getTotalAmount();
    }
}

package com.campstation.camp.pricing.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.pricing.domain.PriceItemType;
import com.campstation.camp.pricing.domain.SitePricing;
import com.campstation.camp.pricing.repository.SitePricingRepository;
import com.campstation.camp.reservation.dto.PriceBreakdownDto;
import com.campstation.camp.reservation.dto.PriceBreakdownDto.PriceItemDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 가격 계산 서비스
 * 복잡한 요금제 로직을 처리하여 예약 금액을 계산
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PriceCalculationService {

    private final SitePricingRepository pricingRepository;

    /**
     * 예약 가격 계산 (메인 메서드)
     *
     * @param site 사이트
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @param numberOfGuests 인원 수
     * @return 가격 상세 내역
     */
    public PriceBreakdownDto calculatePrice(
        Site site,
        LocalDate checkInDate,
        LocalDate checkOutDate,
        int numberOfGuests
    ) {
        log.info("=== 가격 계산 시작 ===");
        log.info("사이트 ID: {}, 체크인: {}, 체크아웃: {}, 인원: {}",
            site.getId(), checkInDate, checkOutDate, numberOfGuests);

        // 1. 적용 가능한 요금제 조회 (우선순위 순)
        List<SitePricing> pricings = pricingRepository.findBySiteIdOrderByPriorityDesc(site.getId())
            .stream()
            .filter(SitePricing::getIsActive)
            .toList();

        if (pricings.isEmpty()) {
            log.error("No active pricing found for site {}", site.getId());
            throw new IllegalStateException("사이트에 활성화된 요금제가 없습니다. 요금제를 먼저 생성해주세요.");
        }

        log.info("활성 요금제 {}개 발견", pricings.size());

        int nights = (int) ChronoUnit.DAYS.between(checkInDate, checkOutDate);
        int displayOrder = 0;

        // 2. 일별로 적용할 요금제 결정 및 기본 요금 계산
        BigDecimal totalBasePrice = BigDecimal.ZERO;
        BigDecimal totalWeekendSurcharge = BigDecimal.ZERO;
        int weekendNights = 0;
        
        SitePricing primaryPricing = null; // 대표 요금제 (할인 계산용)

        for (LocalDate date = checkInDate; date.isBefore(checkOutDate); date = date.plusDays(1)) {
            final LocalDate currentDate = date; // Lambda에서 사용하기 위해 final
            
            // 해당 날짜에 적용 가능한 최우선 요금제 찾기 (우선순위 내림차순)
            SitePricing applicablePricing = pricings.stream()
                .filter(p -> p.isApplicableOn(currentDate))
                .findFirst() // 이미 priority 내림차순 정렬됨
                .orElse(null);

            if (applicablePricing == null) {
                log.warn("날짜 {}에 적용 가능한 요금제 없음", currentDate);
                throw new IllegalStateException("날짜 " + currentDate + "에 적용 가능한 요금제가 없습니다.");
            }

            // 첫 번째 요금제를 대표 요금제로 설정 (할인율 적용)
            if (primaryPricing == null) {
                primaryPricing = applicablePricing;
                log.info("대표 요금제 선택: {} (우선순위: {})", 
                    primaryPricing.getPricingName(), primaryPricing.getPriority());
            }

            // 일일 기본 요금 계산
            BigDecimal dailyBasePrice = applicablePricing.getBasePrice();
            totalBasePrice = totalBasePrice.add(dailyBasePrice);

            // 주말 할증 계산
            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            boolean isWeekend = dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SATURDAY;
            
            if (isWeekend && applicablePricing.getWeekendPrice() != null) {
                BigDecimal dailySurcharge = applicablePricing.getWeekendPrice()
                    .subtract(applicablePricing.getBasePrice());
                totalWeekendSurcharge = totalWeekendSurcharge.add(dailySurcharge);
                weekendNights++;
            }

            log.debug("날짜: {}, 요금제: {}, 기본요금: {}, 주말할증: {}", 
                currentDate, 
                applicablePricing.getPricingName(),
                dailyBasePrice,
                isWeekend && applicablePricing.getWeekendPrice() != null ? 
                    applicablePricing.getWeekendPrice().subtract(applicablePricing.getBasePrice()) : 0);
        }

        log.info("일별 계산 완료 - 총 기본요금: {}, 주말할증: {}", totalBasePrice, totalWeekendSurcharge);

        // primaryPricing이 null이면 안 됨 (위 로직에서 반드시 설정됨)
        if (primaryPricing == null) {
            throw new IllegalStateException("대표 요금제를 찾을 수 없습니다.");
        }

        // 3. PriceBreakdownDto 생성
        PriceBreakdownDto breakdown = PriceBreakdownDto.builder()
            .basePrice(totalBasePrice)
            .weekendSurcharge(totalWeekendSurcharge)
            .items(new ArrayList<>())
            .build();

        // 기본 요금 항목 추가
        breakdown.addItem(PriceItemDto.builder()
            .type(PriceItemType.BASE_PRICE)
            .name(String.format("기본 요금 (%d박)", nights))
            .quantity(BigDecimal.valueOf(nights))
            .unitPrice(totalBasePrice.divide(BigDecimal.valueOf(nights), 2, RoundingMode.HALF_UP))
            .amount(totalBasePrice)
            .displayOrder(displayOrder++)
            .appliedPricingId(primaryPricing.getId())
            .build());

        // 주말 할증 항목 추가
        if (totalWeekendSurcharge.compareTo(BigDecimal.ZERO) > 0) {
            breakdown.addItem(PriceItemDto.builder()
                .type(PriceItemType.WEEKEND_SURCHARGE)
                .name(String.format("주말 할증 (%d박)", weekendNights))
                .quantity(BigDecimal.valueOf(weekendNights))
                .unitPrice(weekendNights > 0 ? 
                    totalWeekendSurcharge.divide(BigDecimal.valueOf(weekendNights), 2, RoundingMode.HALF_UP) : 
                    BigDecimal.ZERO)
                .amount(totalWeekendSurcharge)
                .displayOrder(displayOrder++)
                .appliedPricingId(primaryPricing.getId())
                .build());
        }

        // 4. 추가 인원 요금 계산 (대표 요금제 기준)
        if (primaryPricing.getBaseGuests() != null && numberOfGuests > primaryPricing.getBaseGuests()) {
            int extraGuests = numberOfGuests - primaryPricing.getBaseGuests();
            BigDecimal extraGuestFee = primaryPricing.getExtraGuestFee()
                .multiply(BigDecimal.valueOf(extraGuests))
                .multiply(BigDecimal.valueOf(nights));

            breakdown.setExtraGuestFee(extraGuestFee);

            breakdown.addItem(PriceItemDto.builder()
                .type(PriceItemType.EXTRA_GUEST_FEE)
                .name(String.format("추가 인원 요금 (%d명 × %d박)", extraGuests, nights))
                .quantity(BigDecimal.valueOf(extraGuests * nights))
                .unitPrice(primaryPricing.getExtraGuestFee())
                .amount(extraGuestFee)
                .displayOrder(displayOrder++)
                .appliedPricingId(primaryPricing.getId())
                .build());
        }

        // 5. 소계 계산 (할인 적용 전)
        BigDecimal subtotal = totalBasePrice
            .add(breakdown.getWeekendSurcharge())
            .add(breakdown.getExtraGuestFee());

        log.info("소계 (할인 전): {}", subtotal);

        // 7. 장기 숙박 할인 (대표 요금제 기준)
        if (primaryPricing.getLongStayDiscountRate() != null
            && primaryPricing.getLongStayMinNights() != null
            && nights >= primaryPricing.getLongStayMinNights()) {

            BigDecimal discount = subtotal
                .multiply(primaryPricing.getLongStayDiscountRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                .negate(); // 음수로 변환

            breakdown.addItem(PriceItemDto.builder()
                .type(PriceItemType.LONG_STAY_DISCOUNT)
                .name(String.format("장기 숙박 할인 (-%d%%)", primaryPricing.getLongStayDiscountRate().intValue()))
                .quantity(BigDecimal.ONE)
                .unitPrice(discount)
                .amount(discount)
                .displayOrder(displayOrder++)
                .appliedPricingId(primaryPricing.getId())
                .build());
        }

        // 8. 연박 할인 (대표 요금제 기준)
        if (primaryPricing.getExtendedStayDiscountRate() != null
            && primaryPricing.getExtendedStayMinNights() != null
            && nights >= primaryPricing.getExtendedStayMinNights()) {

            BigDecimal discount = subtotal
                .multiply(primaryPricing.getExtendedStayDiscountRate())
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                .negate();

            breakdown.addItem(PriceItemDto.builder()
                .type(PriceItemType.EXTENDED_STAY_DISCOUNT)
                .name(String.format("연박 할인 (-%d%%)", primaryPricing.getExtendedStayDiscountRate().intValue()))
                .quantity(BigDecimal.ONE)
                .unitPrice(discount)
                .amount(discount)
                .displayOrder(displayOrder++)
                .appliedPricingId(primaryPricing.getId())
                .build());
        }

        // 9. 조기 예약 할인 (대표 요금제 기준)
        if (primaryPricing.getEarlyBirdDiscountRate() != null
            && primaryPricing.getEarlyBirdMinDays() != null) {

            long daysUntilCheckIn = ChronoUnit.DAYS.between(LocalDate.now(), checkInDate);

            if (daysUntilCheckIn >= primaryPricing.getEarlyBirdMinDays()) {
                BigDecimal discount = subtotal
                    .multiply(primaryPricing.getEarlyBirdDiscountRate())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    .negate();

                breakdown.addItem(PriceItemDto.builder()
                    .type(PriceItemType.EARLY_BIRD_DISCOUNT)
                    .name(String.format("얼리버드 할인 (-%d%%, %d일 전 예약)",
                        primaryPricing.getEarlyBirdDiscountRate().intValue(),
                        primaryPricing.getEarlyBirdMinDays()))
                    .quantity(BigDecimal.ONE)
                    .unitPrice(discount)
                    .amount(discount)
                    .displayOrder(displayOrder++)
                    .appliedPricingId(primaryPricing.getId())
                    .build());
            }
        }

        // 10. 최종 금액 계산
        breakdown.calculateTotalAmount();

        log.info("=== 가격 계산 완료 ===");
        log.info("기본 요금: {}, 주말 할증: {}, 추가 인원: {}, 할인: {}, 최종 금액: {}",
            breakdown.getBasePrice(),
            breakdown.getWeekendSurcharge(),
            breakdown.getExtraGuestFee(),
            breakdown.getTotalDiscount(),
            breakdown.getTotalAmount());

        return breakdown;
    }

}

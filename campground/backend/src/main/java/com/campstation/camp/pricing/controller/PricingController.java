package com.campstation.camp.pricing.controller;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.campground.repository.SiteRepository;
import com.campstation.camp.pricing.service.PriceCalculationService;
import com.campstation.camp.reservation.dto.PriceBreakdownDto;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 가격 계산 API 컨트롤러
 * 예약 전 가격 미리 계산
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2025-01-01
 */
@RestController
@RequestMapping("/v1/pricing")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Pricing", description = "가격 계산 API")
public class PricingController {

    private final PriceCalculationService priceCalculationService;
    private final SiteRepository siteRepository;

    /**
     * 사이트 가격 계산 (예약 전 미리보기)
     *
     * @param siteId 사이트 ID
     * @param checkInDate 체크인 날짜 (YYYY-MM-DD)
     * @param checkOutDate 체크아웃 날짜 (YYYY-MM-DD)
     * @param numberOfGuests 인원 수
     * @return 가격 상세 내역
     */
    @GetMapping("/calculate")
    @Operation(
        summary = "가격 계산",
        description = "예약 전 사이트 가격을 미리 계산합니다. 할인/할증이 모두 적용된 상세 내역을 반환합니다."
    )
    public ResponseEntity<PriceBreakdownDto> calculatePrice(
        @Parameter(description = "사이트 ID", required = true)
        @RequestParam Long siteId,

        @Parameter(description = "체크인 날짜 (YYYY-MM-DD)", required = true, example = "2025-07-01")
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,

        @Parameter(description = "체크아웃 날짜 (YYYY-MM-DD)", required = true, example = "2025-07-03")
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,

        @Parameter(description = "인원 수", required = true, example = "4")
        @RequestParam(defaultValue = "2") Integer numberOfGuests
    ) {
        log.info("Calculating price for site: {}, checkIn: {}, checkOut: {}, guests: {}",
            siteId, checkInDate, checkOutDate, numberOfGuests);

        // 사이트 조회
        Site site = siteRepository.findById(siteId)
            .orElseThrow(() -> new IllegalArgumentException("사이트를 찾을 수 없습니다: " + siteId));

        // 가격 계산
        PriceBreakdownDto breakdown = priceCalculationService.calculatePrice(
            site,
            checkInDate,
            checkOutDate,
            numberOfGuests
        );

        return ResponseEntity.ok(breakdown);
    }

    /**
     * 특정 사이트의 가격 계산 (경로 파라미터 버전)
     *
     * @param siteId 사이트 ID
     * @param checkInDate 체크인 날짜
     * @param checkOutDate 체크아웃 날짜
     * @param numberOfGuests 인원 수
     * @return 가격 상세 내역
     */
    @GetMapping("/sites/{siteId}/calculate")
    @Operation(
        summary = "사이트별 가격 계산",
        description = "특정 사이트의 가격을 계산합니다."
    )
    public ResponseEntity<PriceBreakdownDto> calculateSitePrice(
        @Parameter(description = "사이트 ID", required = true)
        @PathVariable Long siteId,

        @Parameter(description = "체크인 날짜 (YYYY-MM-DD)", required = true)
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,

        @Parameter(description = "체크아웃 날짜 (YYYY-MM-DD)", required = true)
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,

        @Parameter(description = "인원 수", required = true)
        @RequestParam(defaultValue = "2") Integer numberOfGuests
    ) {
        return calculatePrice(siteId, checkInDate, checkOutDate, numberOfGuests);
    }
}

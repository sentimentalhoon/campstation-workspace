package com.campstation.camp.banner.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.banner.domain.BannerType;
import com.campstation.camp.banner.dto.BannerResponse;
import com.campstation.camp.banner.service.BannerService;
import com.campstation.camp.shared.dto.CommonResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 배너 컨트롤러 (퍼블릭)
 * 배너 조회 및 통계 추적 API
 */
@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Banner", description = "배너 API")
public class BannerController {

    private final BannerService bannerService;

    /**
     * 활성 배너 목록 조회
     * 
     * @param type 배너 타입 (옵션)
     * @param size 조회 개수 (기본값: 10)
     * @return 활성 배너 목록
     */
    @GetMapping
    @Operation(summary = "활성 배너 목록 조회", description = "현재 활성화된 배너 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "배너 목록 조회 성공")
    })
    public ResponseEntity<CommonResponse<List<BannerResponse>>> getActiveBanners(
            @Parameter(description = "배너 타입 (PROMOTION, EVENT, ANNOUNCEMENT, NOTICE)")
            @RequestParam(required = false) BannerType type,
            @Parameter(description = "조회 개수 (기본값: 10)")
            @RequestParam(defaultValue = "10") Integer size) {
        
        log.info("Get Active Banners Request: type={}, size={}", type, size);
        
        List<BannerResponse> banners = bannerService.getActiveBanners(type, size);
        
        return ResponseEntity.ok(CommonResponse.success("활성 배너 목록 조회 성공", banners));
    }

    /**
     * 배너 조회수 증가
     * 
     * @param bannerId 배너 ID
     * @return 성공 메시지
     */
    @PostMapping("/{bannerId}/view")
    @Operation(summary = "배너 조회수 증가", description = "배너의 조회수를 1 증가시킵니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회수 증가 성공"),
        @ApiResponse(responseCode = "404", description = "배너를 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<Void>> incrementViewCount(
            @PathVariable Long bannerId) {
        
        log.debug("Increment View Count: bannerId={}", bannerId);
        
        try {
            bannerService.incrementViewCount(bannerId);
            return ResponseEntity.ok(CommonResponse.success("조회수 증가 성공", null));
        } catch (RuntimeException e) {
            log.error("Increment View Count Failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 배너 클릭수 증가
     * 
     * @param bannerId 배너 ID
     * @return 성공 메시지
     */
    @PostMapping("/{bannerId}/click")
    @Operation(summary = "배너 클릭수 증가", description = "배너의 클릭수를 1 증가시킵니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "클릭수 증가 성공"),
        @ApiResponse(responseCode = "404", description = "배너를 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<Void>> incrementClickCount(
            @PathVariable Long bannerId) {
        
        log.debug("Increment Click Count: bannerId={}", bannerId);
        
        try {
            bannerService.incrementClickCount(bannerId);
            return ResponseEntity.ok(CommonResponse.success("클릭수 증가 성공", null));
        } catch (RuntimeException e) {
            log.error("Increment Click Count Failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}

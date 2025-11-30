package com.campstation.camp.campground.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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

import com.campstation.camp.campground.domain.CampgroundCertification;
import com.campstation.camp.campground.domain.CampgroundOperationType;
import com.campstation.camp.campground.dto.CampgroundResponse;
import com.campstation.camp.campground.dto.CreateCampgroundRequest;
import com.campstation.camp.campground.dto.SiteResponseDto;
import com.campstation.camp.campground.dto.UpdateCampgroundRequest;
import com.campstation.camp.campground.service.CampgroundService;
import com.campstation.camp.campground.service.SiteService;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.dto.PageResponse;
import com.campstation.camp.shared.dto.PageResponseDto;
import com.campstation.camp.shared.security.annotation.OwnerOrAdmin;
import com.campstation.camp.shared.validation.InputValidator;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 캠핑장 컨트롤러
 * 캠핑장 CRUD 및 검색 관련 REST API를 제공하는 컨트롤러
 *
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@Tag(name = "Campground", description = "캠핑장 관련 API")
@RestController
@RequestMapping("/api/v1/campgrounds")
@RequiredArgsConstructor
public class CampgroundController {

    private final CampgroundService campgroundService;
    private final SiteService siteService;
    private final InputValidator inputValidator;
    private final com.campstation.camp.user.service.UserService userService;

    @Operation(summary = "새 캠핑장 생성", description = "새로운 캠핑장 정보를 생성합니다. 소유자 또는 관리자만 가능합니다.")
    @PostMapping
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<CampgroundResponse>> createCampground(@Valid @RequestBody CreateCampgroundRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        // username으로부터 user ID 조회
        Long ownerId = userService.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."))
            .getId();

        // 입력 데이터 검증
        if (!inputValidator.isValidTextLength(request.name(), 1, 100)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("캠핑장 이름은 1-100자 사이여야 합니다."));
        }

    if (!inputValidator.isValidTextLength(request.description(), 10, 10000)) {
            return ResponseEntity.badRequest()
        .body(CommonResponse.error("캠핑장 설명은 10-10000자 사이여야 합니다."));
        }

        if (!inputValidator.isValidTextLength(request.address(), 1, 200)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("주소는 1-200자 사이여야 합니다."));
        }

        if (request.phone() != null && !inputValidator.isValidPhoneNumber(request.phone())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("유효하지 않은 전화번호 형식입니다."));
        }

        if (request.email() != null && !inputValidator.isValidEmail(request.email())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("유효하지 않은 이메일 형식입니다."));
        }

        CampgroundResponse campground = campgroundService.createCampground(
                request.name(), request.description(), request.address(),
                request.phone(), request.email(), request.website(), request.imageUrls(),
                request.latitude(), request.longitude(),
                request.checkInTime(), request.checkOutTime(),
                request.businessOwnerName(), request.businessName(), request.businessAddress(),
                request.businessEmail(), request.businessRegistrationNumber(), request.tourismBusinessNumber(),
                request.operationType(), request.certification(),
                ownerId
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonResponse.success("캠핑장이 성공적으로 생성되었습니다.", campground));
    }

    @Operation(summary = "캠핑장 ID로 조회", description = "특정 캠핑장 정보를 ID로 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<CommonResponse<CampgroundResponse>> getCampgroundById(@PathVariable Long id) {
        CampgroundResponse campground = campgroundService.getCampgroundById(id);
        return ResponseEntity.ok(CommonResponse.success("캠핑장 조회 성공", campground));
    }

    /**
     * 모든 캠핑장 목록을 페이지네이션하여 조회합니다.
     *
     * @param pageable 페이지네이션 정보를 담고 있는 Pageable 객체
     * @return 캠핑장 목록을 포함한 CommonResponse 객체
     */
    @Operation(summary = "모든 캠핑장 조회", description = "모든 캠핑장 목록을 페이지네이션하여 조회합니다.")
    @GetMapping
    public ResponseEntity<CommonResponse<PageResponse<CampgroundResponse>>> getAllCampgrounds(Pageable pageable) {
        PageResponse<CampgroundResponse> campgrounds = campgroundService.getAllCampgrounds(pageable);
        return ResponseEntity.ok(CommonResponse.success("캠핑장 목록 조회 성공", campgrounds));
    }

    @Operation(summary = "캠핑장 검색", description = "키워드, 가격 범위, 편의시설, 운영 주체, 인증/등급으로 캠핑장을 검색합니다.")
    @GetMapping("/search")
    public ResponseEntity<CommonResponse<Page<CampgroundResponse>>> searchCampgrounds(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) List<CampgroundOperationType> operationTypes,
            @RequestParam(required = false) List<CampgroundCertification> certifications,
            Pageable pageable) {
        Page<CampgroundResponse> campgrounds = campgroundService.searchCampgrounds(keyword, minPrice, maxPrice, amenities, operationTypes, certifications, pageable);
        return ResponseEntity.ok(CommonResponse.success("캠핑장 검색 성공", campgrounds));
    }

    @Operation(summary = "인기 캠핑장 조회", description = "즐겨찾기 수가 많은 순서대로 인기 캠핑장을 조회합니다.")
    @GetMapping("/popular")
    public ResponseEntity<CommonResponse<List<CampgroundResponse>>> getPopularCampgrounds(
            @RequestParam(defaultValue = "10") int limit) {
        List<CampgroundResponse> campgrounds = campgroundService.getPopularCampgrounds(limit);
        return ResponseEntity.ok(CommonResponse.success("인기 캠핑장 조회 성공", campgrounds));
    }

    /**
     * 지도 영역 내의 캠핑장을 조회합니다.
     * 
     * @param swLat 남서쪽 위도 (South-West Latitude)
     * @param swLng 남서쪽 경도 (South-West Longitude)
     * @param neLat 북동쪽 위도 (North-East Latitude)
     * @param neLng 북동쪽 경도 (North-East Longitude)
     * @return 지도 영역 내의 캠핑장 목록
     */
    @Operation(summary = "지도 영역 내 캠핑장 조회", description = "지도의 현재 보이는 영역(경계 박스) 내에 있는 모든 캠핑장을 조회합니다.")
    @GetMapping("/map")
    public ResponseEntity<CommonResponse<List<CampgroundResponse>>> getCampgroundsByMapBounds(
            @RequestParam BigDecimal swLat,
            @RequestParam BigDecimal swLng,
            @RequestParam BigDecimal neLat,
            @RequestParam BigDecimal neLng) {
        List<CampgroundResponse> campgrounds = campgroundService.getCampgroundsByMapBounds(
                swLat, swLng, neLat, neLng
        );
        return ResponseEntity.ok(CommonResponse.success("지도 영역 내 캠핑장 조회 성공", campgrounds));
    }

    @Operation(summary = "캠핑장 정보 업데이트", description = "캠핑장 정보를 업데이트합니다. 해당 캠핑장의 소유자 또는 관리자만 가능합니다.")
    @PutMapping("/{id}")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<CampgroundResponse>> updateCampground(
            @PathVariable Long id, 
            @Valid @RequestBody UpdateCampgroundRequest request,
            Authentication authentication) {

        // 입력 데이터 검증
        if (!inputValidator.isValidTextLength(request.name(), 1, 100)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("캠핑장 이름은 1-100자 사이여야 합니다."));
        }

    if (!inputValidator.isValidTextLength(request.description(), 10, 10000)) {
            return ResponseEntity.badRequest()
        .body(CommonResponse.error("캠핑장 설명은 10-10000자 사이여야 합니다."));
        }

        if (!inputValidator.isValidTextLength(request.address(), 1, 200)) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("주소는 1-200자 사이여야 합니다."));
        }

        if (request.phone() != null && !inputValidator.isValidPhoneNumber(request.phone())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("유효하지 않은 전화번호 형식입니다."));
        }

        if (request.email() != null && !inputValidator.isValidEmail(request.email())) {
            return ResponseEntity.badRequest()
                .body(CommonResponse.error("유효하지 않은 이메일 형식입니다."));
        }

        // 권한 체크: 실제 소유자인지 확인 (ADMIN은 모든 캠핑장 수정 가능)
        String email = authentication.getName();
        var user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 캠핑장 조회
        var campground = campgroundService.getCampgroundEntityById(id);
        
        // SecurityUtils를 사용한 권한 체크
        if (!com.campstation.camp.shared.security.SecurityUtils.isOwnerOrAdmin(user, campground.getOwner().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(CommonResponse.error("이 캠핑장을 수정할 권한이 없습니다."));
        }

        CampgroundResponse updatedCampground = campgroundService.updateCampground(
                id, request.name(), request.description(), request.address(),
                request.phone(), request.email(), request.website(), request.imageUrls(),
                request.imagesToDelete(), request.latitude(), request.longitude(),
                request.checkInTime(), request.checkOutTime(),
                request.businessOwnerName(), request.businessName(), request.businessAddress(),
                request.businessEmail(), request.businessRegistrationNumber(), request.tourismBusinessNumber(),
                request.operationType(), request.certification()
        );
        return ResponseEntity.ok(CommonResponse.success("캠핑장이 성공적으로 업데이트되었습니다.", updatedCampground));
    }

    @Operation(summary = "캠핑장 삭제", description = "캠핑장을 삭제합니다. 해당 캠핑장의 소유자 또는 관리자만 가능합니다.")
    @DeleteMapping("/{id}")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<Void>> deleteCampground(
            @PathVariable Long id,
            Authentication authentication) {
        
        // 권한 체크: 실제 소유자인지 확인 (ADMIN은 모든 캠핑장 삭제 가능)
        String email = authentication.getName();
        var user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 캠핑장 조회
        var campground = campgroundService.getCampgroundEntityById(id);
        
        // SecurityUtils를 사용한 권한 체크
        if (!com.campstation.camp.shared.security.SecurityUtils.isOwnerOrAdmin(user, campground.getOwner().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(CommonResponse.error("이 캠핑장을 삭제할 권한이 없습니다."));
        }
        
        campgroundService.deleteCampground(id);
        return ResponseEntity.ok(CommonResponse.success("캠핑장이 성공적으로 삭제되었습니다.", null));
    }

    @Operation(summary = "캠핑장 메인 이미지 설정", description = "캠핑장의 메인 이미지를 설정합니다. 해당 캠핑장의 소유자 또는 관리자만 가능합니다.")
    @PatchMapping("/{id}/images/main")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<CampgroundResponse>> setMainImage(
            @PathVariable Long id,
            @RequestParam String imageUrl) {
        CampgroundResponse updatedCampground = campgroundService.setMainImage(id, imageUrl);
        return ResponseEntity.ok(CommonResponse.success("메인 이미지가 성공적으로 설정되었습니다.", updatedCampground));
    }

    @Operation(summary = "캠핑장 사이트 목록 조회", description = "특정 캠핑장에 속한 사이트 목록을 페이지로 조회합니다.")
    @GetMapping("/{id}/sites")
    public ResponseEntity<CommonResponse<PageResponseDto<SiteResponseDto>>> getCampgroundSites(
            @PathVariable Long id,
            @org.springframework.data.web.PageableDefault(size = 50) Pageable pageable) {
        PageResponseDto<SiteResponseDto> pageResponse = siteService.getSitesByCampground(id, pageable);
        return ResponseEntity.ok(CommonResponse.success(pageResponse));
    }
}

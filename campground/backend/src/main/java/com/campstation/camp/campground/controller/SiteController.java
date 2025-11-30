package com.campstation.camp.campground.controller;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campstation.camp.campground.dto.SiteCreateRequestDto;
import com.campstation.camp.campground.dto.SiteResponseDto;
import com.campstation.camp.campground.dto.SiteUpdateRequestDto;
import com.campstation.camp.campground.service.SiteService;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.dto.PageResponseDto;
import com.campstation.camp.shared.security.annotation.OwnerOrAdmin;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/sites")
@RequiredArgsConstructor
@Tag(name = "Site", description = "캠핑장 사이트 API")
@Slf4j
public class SiteController {

    private final SiteService siteService;
    private final UserService userService;
    private final com.campstation.camp.campground.repository.SiteRepository siteRepository;
    private final com.campstation.camp.campground.service.CampgroundService campgroundService;

    @Operation(summary = "캠핑장 ID로 사이트 목록 조회", description = "특정 캠핑장에 속한 사이트 목록을 페이지로 조회합니다.")
    @GetMapping("/by-campground/{campgroundId}")
    public ResponseEntity<CommonResponse<PageResponseDto<SiteResponseDto>>> getSitesByCampground(
            @PathVariable Long campgroundId,
            @PageableDefault(size = 50) Pageable pageable) {
        PageResponseDto<SiteResponseDto> pageResponse = siteService.getSitesByCampground(campgroundId, pageable);
        return ResponseEntity.ok(CommonResponse.success(pageResponse));
    }

    @Operation(summary = "사이트 상세 조회", description = "사이트 ID로 특정 사이트의 상세 정보를 조회합니다.")
    @GetMapping("/{siteId}")
    public ResponseEntity<CommonResponse<SiteResponseDto>> getSiteById(@PathVariable Long siteId) {
        SiteResponseDto siteResponse = siteService.getSiteById(siteId);
        return ResponseEntity.ok(CommonResponse.success(siteResponse));
    }

    @Operation(summary = "사이트 생성", description = "새로운 사이트를 생성합니다. (이미지 포함 가능)")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<SiteResponseDto>> createSite(
            @Valid @ModelAttribute SiteCreateRequestDto requestDto,
            @RequestParam(value = "imageFiles", required = false) List<MultipartFile> imageFiles,
            Authentication authentication) {
        
        // 권한 체크: 캠핑장 소유자 확인
        String email = authentication.getName();
        var user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        var campground = campgroundService.getCampgroundEntityById(requestDto.campgroundId());
        
        // SecurityUtils를 사용한 권한 체크
        if (!com.campstation.camp.shared.security.SecurityUtils.isOwnerOrAdmin(user, campground.getOwner().getId())) {
            log.error("권한 없음 (사이트 생성) - 요청 userId: {}, 실제 캠핑장 ownerId: {}", 
                      user.getId(), campground.getOwner().getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(CommonResponse.error("이 캠핑장에 사이트를 생성할 권한이 없습니다."));
        }
        
        SiteResponseDto createdSite = siteService.createSite(requestDto, imageFiles);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommonResponse.success("Site created successfully.", createdSite));
    }

    @Operation(summary = "사이트 수정", description = "기존 사이트 정보를 수정합니다. (이미지 추가/삭제 가능)")
    @PutMapping(value = "/{siteId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<SiteResponseDto>> updateSite(
            @PathVariable Long siteId,
            @Valid @ModelAttribute SiteUpdateRequestDto requestDto,
            @RequestParam(value = "imageFiles", required = false) List<MultipartFile> imageFiles,
            @RequestParam(value = "deleteImageIds", required = false) List<Long> deleteImageIds,
            Authentication authentication) {

        // 권한 체크: 사이트 소유자 확인
        String email = authentication.getName();
        var user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // Campground와 Owner를 Fetch Join으로 조회 (LazyInitializationException 방지)
        var site = siteRepository.findByIdWithCampgroundAndOwner(siteId)
                .orElseThrow(() -> new RuntimeException("사이트를 찾을 수 없습니다."));

        // SecurityUtils를 사용한 권한 체크
        if (!com.campstation.camp.shared.security.SecurityUtils.isOwnerOrAdmin(user, site.getCampground().getOwner().getId())) {
            log.error("권한 없음 (사이트 수정) - 요청 userId: {}, 실제 캠핑장 ownerId: {}",
                      user.getId(), site.getCampground().getOwner().getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(CommonResponse.error("이 사이트를 수정할 권한이 없습니다."));
        }

        SiteResponseDto updatedSite = siteService.updateSite(siteId, requestDto, imageFiles, deleteImageIds);
        return ResponseEntity.ok(CommonResponse.success("Site updated successfully.", updatedSite));
    }

    @Operation(summary = "사이트 삭제", description = "사이트를 삭제합니다.")
    @DeleteMapping("/{siteId}")
    @OwnerOrAdmin
    public ResponseEntity<CommonResponse<Void>> deleteSite(
            @PathVariable Long siteId,
            Authentication authentication) {

        // 권한 체크: 사이트 소유자 확인
        String email = authentication.getName();
        var user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // Campground와 Owner를 Fetch Join으로 조회 (LazyInitializationException 방지)
        var site = siteRepository.findByIdWithCampgroundAndOwner(siteId)
                .orElseThrow(() -> new RuntimeException("사이트를 찾을 수 없습니다."));

        // SecurityUtils를 사용한 권한 체크
        if (!com.campstation.camp.shared.security.SecurityUtils.isOwnerOrAdmin(user, site.getCampground().getOwner().getId())) {
            log.error("권한 없음 (사이트 삭제) - 요청 userId: {}, 실제 캠핑장 ownerId: {}",
                      user.getId(), site.getCampground().getOwner().getId());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(CommonResponse.error("이 사이트를 삭제할 권한이 없습니다."));
        }

        siteService.deleteSite(siteId);
        return ResponseEntity.ok(CommonResponse.success("Site deleted successfully.", null));
    }
}

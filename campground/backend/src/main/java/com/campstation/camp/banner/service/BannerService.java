package com.campstation.camp.banner.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.banner.domain.Banner;
import com.campstation.camp.banner.domain.BannerStatus;
import com.campstation.camp.banner.domain.BannerType;
import com.campstation.camp.banner.dto.BannerResponse;
import com.campstation.camp.banner.dto.BannerSearchParams;
import com.campstation.camp.banner.dto.BannerStats;
import com.campstation.camp.banner.dto.BulkUpdateBannerOrderRequest;
import com.campstation.camp.banner.dto.CreateBannerRequest;
import com.campstation.camp.banner.dto.UpdateBannerRequest;
import com.campstation.camp.banner.repository.BannerRepository;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.shared.file.S3FileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 배너 서비스
 * 퍼블릭 배너 조회 및 통계 관리
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class BannerService {

    private final BannerRepository bannerRepository;
    private final S3FileService s3FileService;

    /**
     * 활성 배너 목록 조회 (퍼블릭)
     * 
     * @param type 배너 타입 (nullable)
     * @param size 조회 개수
     * @return 활성 배너 목록
     */
    @Transactional(readOnly = true)
    public List<BannerResponse> getActiveBanners(BannerType type, Integer size) {
        log.info("Get Active Banners: type={}, size={}", type, size);
        
        LocalDateTime now = LocalDateTime.now();
        Pageable pageable = PageRequest.of(0, size != null ? size : 10);
        
        List<Banner> banners;
        if (type != null) {
            banners = bannerRepository.findActiveBannersByType(type, now, pageable);
        } else {
            banners = bannerRepository.findActiveBanners(now, pageable);
        }
        
        return banners.stream()
                .map(BannerResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * 배너 조회수 증가
     * 
     * @param bannerId 배너 ID
     */
    public void incrementViewCount(Long bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다: " + bannerId));
        
        banner.incrementViewCount();
        log.debug("Banner view count incremented: bannerId={}, viewCount={}", 
                bannerId, banner.getViewCount());
    }

    /**
     * 배너 클릭수 증가
     * 
     * @param bannerId 배너 ID
     */
    public void incrementClickCount(Long bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다: " + bannerId));
        
        banner.incrementClickCount();
        log.debug("Banner click count incremented: bannerId={}, clickCount={}", 
                bannerId, banner.getClickCount());
    }

    /**
     * 관리자용 배너 목록 조회 (검색 및 필터링)
     * 
     * @param params 검색 파라미터
     * @param pageable 페이징 정보
     * @return 배너 페이지
     */
    @Transactional(readOnly = true)
    public Page<BannerResponse> searchBanners(BannerSearchParams params, Pageable pageable) {
        log.info("Search Banners: params={}, page={}", params, pageable);
        
        Page<Banner> banners;
        
        // 검색 조건에 따라 적절한 Repository 메서드 호출
        if (params.getTitle() != null && params.getType() != null && params.getStatus() != null) {
            banners = bannerRepository.findByTitleAndTypeAndStatus(
                    params.getTitle(), params.getType(), params.getStatus(), pageable);
        } else if (params.getTitle() != null && params.getType() != null) {
            banners = bannerRepository.findByTitleAndType(params.getTitle(), params.getType(), pageable);
        } else if (params.getTitle() != null && params.getStatus() != null) {
            banners = bannerRepository.findByTitleAndStatus(params.getTitle(), params.getStatus(), pageable);
        } else if (params.getType() != null && params.getStatus() != null) {
            banners = bannerRepository.findByTypeAndStatus(params.getType(), params.getStatus(), pageable);
        } else if (params.getTitle() != null) {
            banners = bannerRepository.findByTitleContaining(params.getTitle(), pageable);
        } else if (params.getType() != null) {
            banners = bannerRepository.findByType(params.getType(), pageable);
        } else if (params.getStatus() != null) {
            banners = bannerRepository.findByStatus(params.getStatus(), pageable);
        } else {
            banners = bannerRepository.findAllNotDeleted(pageable);
        }
        
        return banners.map(BannerResponse::from);
    }

    /**
     * 배너 단건 조회
     * 
     * @param bannerId 배너 ID
     * @return 배너 정보
     */
    @Transactional(readOnly = true)
    public BannerResponse getBanner(Long bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다: " + bannerId));
        
        return BannerResponse.from(banner);
    }

    /**
     * 배너 생성
     * 
     * @param request 생성 요청
     * @return 생성된 배너 정보
     */
    public BannerResponse createBanner(CreateBannerRequest request) {
        log.info("Create Banner: title={}, type={}", request.getTitle(), request.getType());
        
        Banner banner = Banner.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .imageUrl(request.getImage().getOriginalUrl())
                .thumbnailUrl(request.getImage().getThumbnailUrl())
                .linkUrl(request.getLinkUrl())
                .linkTarget(request.getLinkTarget())
                .displayOrder(request.getDisplayOrder())
                .status(request.getStatus() != null ? request.getStatus() : BannerStatus.INACTIVE)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();
        
        Banner savedBanner = bannerRepository.save(banner);
        log.info("Banner created: bannerId={}", savedBanner.getId());
        
        return BannerResponse.from(savedBanner);
    }

    /**
     * 배너 수정
     * 
     * @param bannerId 배너 ID
     * @param request 수정 요청
     * @return 수정된 배너 정보
     */
    public BannerResponse updateBanner(Long bannerId, UpdateBannerRequest request) {
        log.info("Update Banner: bannerId={}", bannerId);
        
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다: " + bannerId));
        
        banner.update(
                request.getTitle(),
                request.getDescription(),
                request.getType(),
                request.getImage() != null ? request.getImage().getOriginalUrl() : null,
                request.getImage() != null ? request.getImage().getThumbnailUrl() : null,
                request.getLinkUrl(),
                request.getLinkTarget(),
                request.getStartDate(),
                request.getEndDate()
        );
        
        log.info("Banner updated: bannerId={}", bannerId);
        return BannerResponse.from(banner);
    }

    /**
     * 배너 삭제 (소프트 삭제 + 이미지 삭제)
     * 
     * @param bannerId 배너 ID
     */
    public void deleteBanner(Long bannerId) {
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다: " + bannerId));
        
        // 소프트 삭제
        banner.markAsDeleted();
        log.info("Banner deleted: bannerId={}", bannerId);
        
        // S3에서 이미지 파일 삭제
        try {
            List<String> imagePaths = new ArrayList<>();
            
            if (banner.getThumbnailUrl() != null) {
                imagePaths.add(banner.getThumbnailUrl());
            }
            if (banner.getImageUrl() != null && !banner.getImageUrl().equals(banner.getThumbnailUrl())) {
                imagePaths.add(banner.getImageUrl());
            }
            
            if (!imagePaths.isEmpty()) {
                s3FileService.deleteFiles(imagePaths);
                log.info("Deleted banner images from S3: bannerId={}, paths={}", bannerId, imagePaths);
            }
        } catch (Exception e) {
            log.error("Failed to delete banner images from S3: bannerId={}", bannerId, e);
            // 이미지 삭제 실패해도 배너 소프트 삭제는 완료됨
        }
    }

    /**
     * 배너 순서 변경
     *
     * @param bannerId 배너 ID
     * @param displayOrder 새로운 순서
     * @return 수정된 배너 정보
     */
    public BannerResponse updateBannerOrder(Long bannerId, Integer displayOrder) {
        log.info("Update Banner Order: bannerId={}, displayOrder={}", bannerId, displayOrder);

        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다: " + bannerId));

        banner.updateDisplayOrder(displayOrder);

        return BannerResponse.from(banner);
    }

    /**
     * 배너 순서 일괄 변경
     * 여러 배너의 순서를 한 번에 변경
     *
     * @param request 순서 변경 요청 목록
     * @return 업데이트된 배너 개수
     */
    public int updateBannerOrderBulk(BulkUpdateBannerOrderRequest request) {
        log.info("Bulk Update Banner Order: {} banners", request.getOrders().size());

        int updatedCount = 0;

        for (BulkUpdateBannerOrderRequest.BannerOrderItem item : request.getOrders()) {
            try {
                Banner banner = bannerRepository.findById(item.getBannerId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "배너를 찾을 수 없습니다: " + item.getBannerId()));

                banner.updateDisplayOrder(item.getDisplayOrder());
                updatedCount++;

                log.debug("Banner order updated: bannerId={}, displayOrder={}",
                        item.getBannerId(), item.getDisplayOrder());
            } catch (ResourceNotFoundException e) {
                log.error("Failed to update banner order: {}", e.getMessage());
                throw e;
            }
        }

        log.info("Bulk Update Banner Order completed: {} banners updated", updatedCount);
        return updatedCount;
    }

    /**
     * 배너 상태 변경
     * 
     * @param bannerId 배너 ID
     * @param status 새로운 상태
     * @return 수정된 배너 정보
     */
    public BannerResponse updateBannerStatus(Long bannerId, BannerStatus status) {
        log.info("Update Banner Status: bannerId={}, status={}", bannerId, status);
        
        Banner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new ResourceNotFoundException("배너를 찾을 수 없습니다: " + bannerId));
        
        banner.updateStatus(status);
        
        return BannerResponse.from(banner);
    }

    /**
     * 배너 통계 조회
     * 
     * @return 배너 통계
     */
    @Transactional(readOnly = true)
    public BannerStats getBannerStats() {
        LocalDateTime now = LocalDateTime.now();
        
        long activeBanners = bannerRepository.countActiveBanners(now);
        long totalViews = bannerRepository.sumViewCount();
        long totalClicks = bannerRepository.sumClickCount();
        
        return BannerStats.of(activeBanners, totalViews, totalClicks);
    }
}

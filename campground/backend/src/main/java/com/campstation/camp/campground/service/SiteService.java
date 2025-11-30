package com.campstation.camp.campground.service;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.campstation.camp.campground.domain.AmenityType;
import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.Site;
import com.campstation.camp.campground.domain.SiteImage;
import com.campstation.camp.campground.dto.SiteCreateRequestDto;
import com.campstation.camp.campground.dto.SiteResponseDto;
import com.campstation.camp.campground.dto.SiteUpdateRequestDto;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.campground.repository.SiteImageRepository;
import com.campstation.camp.campground.repository.SiteRepository;
import com.campstation.camp.pricing.domain.PricingRuleType;
import com.campstation.camp.pricing.domain.SitePricing;
import com.campstation.camp.pricing.repository.SitePricingRepository;
import com.campstation.camp.shared.dto.PageResponseDto;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.shared.file.S3FileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class SiteService {

    private final SiteRepository siteRepository;
    private final CampgroundRepository campgroundRepository;
    private final SitePricingRepository sitePricingRepository;
    private final SiteImageRepository siteImageRepository;
    private final S3FileService s3FileService;

    /**
     * Site 생성 (이미지 업로드, 기본 요금제 자동 생성)
     * 트랜잭션 내에서 모든 작업 완료 및 DTO 변환
     */
    @Transactional
    @CacheEvict(value = {"sites", "campgrounds", "popularCampgrounds"}, allEntries = true)
    public SiteResponseDto createSite(SiteCreateRequestDto requestDto, List<MultipartFile> imageFiles) {
        Campground campground = campgroundRepository.findById(requestDto.campgroundId())
                .orElseThrow(() -> new ResourceNotFoundException("Campground not found with id: " + requestDto.campgroundId()));

        Site newSite = Site.builder()
                .siteNumber(requestDto.siteNumber())
                .siteType(requestDto.siteType())
                .capacity(requestDto.capacity())
                .description(requestDto.description())
                .campground(campground)
                .campgroundId(campground.getId()) // LazyInitializationException 방지
                .build();

        // 편의시설 정보 설정 (비트마스크 방식)
        if (requestDto.amenities() != null && !requestDto.amenities().isEmpty()) {
            Set<AmenityType> amenityTypes = requestDto.amenities().stream()
                    .map(amenityStr -> AmenityType.valueOf(amenityStr))
                    .collect(Collectors.toSet());
            newSite.setAmenities(amenityTypes);
        }

        Site savedSite = siteRepository.save(newSite);
        
        // 이미지 업로드 처리 (트랜잭션 내)
        if (imageFiles != null && !imageFiles.isEmpty()) {
            uploadSiteImages(savedSite, imageFiles);
        }
        
        // 기본 요금제 자동 생성
        createDefaultPricing(savedSite);
        
        // basePrice 조회
        BigDecimal basePrice = sitePricingRepository
                .findBySiteIdAndIsActiveTrueOrderByPriorityDesc(savedSite.getId())
                .stream()
                .findFirst()
                .map(SitePricing::getBasePrice)
                .orElse(null);
        
        // 트랜잭션 내에서 이미지 데이터 추출
        List<String> thumbnailUrls = savedSite.getImages().stream()
                .map(img -> s3FileService.generatePublicUrl(img.getThumbnailUrl()))
                .collect(Collectors.toList());
        
        List<String> originalUrls = savedSite.getImages().stream()
                .map(img -> s3FileService.generatePublicUrl(img.getOriginalUrl()))
                .collect(Collectors.toList());
        
        List<Long> imageIds = savedSite.getImages().stream()
                .map(img -> img.getId())
                .collect(Collectors.toList());
        
        return SiteResponseDto.of(savedSite, basePrice, thumbnailUrls, originalUrls, imageIds);
    }
    
    /**
     * 사이트 이미지 업로드 및 저장
     */
    private void uploadSiteImages(Site site, List<MultipartFile> imageFiles) {
        int displayOrder = site.getImages().size();
        
        for (MultipartFile file : imageFiles) {
            try {
                // S3에 이미지 쌍 업로드 (원본 + 썸네일)
                S3FileService.ImagePairResult result = s3FileService.uploadImagePair(file, "site");
                
                // SiteImage 엔티티 생성 (경로만 저장)
                SiteImage siteImage = SiteImage.builder()
                        .site(site)
                        .originalUrl(result.originalPath())
                        .thumbnailUrl(result.thumbnailPath())
                        .fileName(file.getOriginalFilename())
                        .fileSize(file.getSize())
                        .contentType(file.getContentType())
                        .displayOrder(displayOrder++)
                        .build();
                
                site.addImage(siteImage);
                siteImageRepository.save(siteImage);
                
                log.info("사이트 이미지 업로드 성공 - Site ID: {}, 파일명: {}", site.getId(), file.getOriginalFilename());
            } catch (IOException e) {
                log.error("사이트 이미지 업로드 실패 - Site ID: {}, 파일명: {}", site.getId(), file.getOriginalFilename(), e);
                throw new RuntimeException("이미지 업로드 실패: " + e.getMessage(), e);
            }
        }
    }
    
    /**
     * 사이트 이미지 삭제 (S3 + DB)
     */
    private void deleteSiteImages(Site site, List<Long> deleteImageIds) {
        List<SiteImage> imagesToDelete = site.getImages().stream()
                .filter(image -> deleteImageIds.contains(image.getId()))
                .collect(Collectors.toList());
        
        for (SiteImage image : imagesToDelete) {
            try {
                // S3에서 원본 및 썸네일 이미지 삭제
                s3FileService.deleteFile(image.getOriginalUrl());
                s3FileService.deleteFile(image.getThumbnailUrl());
                
                // Site 엔티티에서 이미지 제거 (orphanRemoval = true로 인해 DB에서도 삭제됨)
                site.removeImage(image);
                
                log.info("사이트 이미지 삭제 성공 - Site ID: {}, Image ID: {}", site.getId(), image.getId());
            } catch (Exception e) {
                log.error("사이트 이미지 삭제 실패 - Site ID: {}, Image ID: {}", site.getId(), image.getId(), e);
                throw new RuntimeException("이미지 삭제 실패: " + e.getMessage(), e);
            }
        }
    }
    
    /**
     * 사이트 생성 시 기본 요금제 자동 생성
     * V9 마이그레이션과 동일한 기본 요금제 생성
     */
    private void createDefaultPricing(Site site) {
        // 기본 요금제
        SitePricing defaultPricing = SitePricing.builder()
                .site(site)
                .pricingName("기본 요금제")
                .description("사이트의 기본 1박 요금입니다.")
                .ruleType(PricingRuleType.BASE)
                .basePrice(new BigDecimal("50000.00"))
                .weekendPrice(new BigDecimal("70000.00"))
                .baseGuests(2)
                .maxGuests(4)
                .extraGuestFee(new BigDecimal("10000.00"))
                .priority(0)
                .isActive(true)
                .build();
        
        sitePricingRepository.save(defaultPricing);
    }

    /**
     * Campground별 Site 목록 조회 (페이징, Fetch Join)
     * LazyInitializationException 방지 및 N+1 문제 해결
     */
    @Transactional(readOnly = true)
    public PageResponseDto<SiteResponseDto> getSitesByCampground(Long campgroundId, Pageable pageable) {
        if (!campgroundRepository.existsById(campgroundId)) {
            throw new ResourceNotFoundException("Campground not found with id: " + campgroundId);
        }
        
        Page<Site> sitePage = siteRepository.findByCampgroundId(campgroundId, pageable);
        
        // 페이징된 Site ID 목록 추출
        List<Long> siteIds = sitePage.getContent().stream()
                .map(Site::getId)
                .collect(Collectors.toList());
        
        // Batch로 이미지 미리 로딩 (N+1 방지)
        if (!siteIds.isEmpty()) {
            List<Site> sitesWithImages = siteRepository.findAllByCampgroundIdWithImages(campgroundId);
            // 이미지가 로딩된 Site들로 교체
            Map<Long, Site> siteMap = sitesWithImages.stream()
                    .collect(Collectors.toMap(Site::getId, site -> site));
            
            sitePage.getContent().forEach(site -> {
                Site loadedSite = siteMap.get(site.getId());
                if (loadedSite != null) {
                    // 이미지 컬렉션 강제 초기화
                    loadedSite.getImages().size();
                }
            });
        }
        
        Page<SiteResponseDto> dtoPage = sitePage.map(site -> {
            // 현재 날짜에 적용 가능한 요금제 중 우선순위가 가장 높은 요금제의 basePrice 조회
            var basePrice = sitePricingRepository
                    .findBySiteIdAndIsActiveTrueOrderByPriorityDesc(site.getId())
                    .stream()
                    .filter(pricing -> pricing.isApplicableOn(java.time.LocalDate.now()))
                    .findFirst()
                    .map(SitePricing::getBasePrice)
                    .orElse(null);
            
            // 트랜잭션 내에서 이미지 데이터 추출
            List<String> thumbnailUrls = site.getImages().stream()
                    .map(img -> s3FileService.generatePublicUrl(img.getThumbnailUrl()))
                    .collect(Collectors.toList());
            
            List<String> originalUrls = site.getImages().stream()
                    .map(img -> s3FileService.generatePublicUrl(img.getOriginalUrl()))
                    .collect(Collectors.toList());
            
            List<Long> imageIds = site.getImages().stream()
                    .map(img -> img.getId())
                    .collect(Collectors.toList());
            
            return SiteResponseDto.of(site, basePrice, thumbnailUrls, originalUrls, imageIds);
        });
        return PageResponseDto.from(dtoPage);
    }

    /**
     * Site 상세 조회 (Fetch Join 사용)
     * LazyInitializationException 방지를 위해 필요한 연관관계를 미리 로딩
     */
    @Transactional(readOnly = true)
    public SiteResponseDto getSiteById(Long siteId) {
        Site site = siteRepository.findByIdWithDetails(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + siteId));
        
        // 현재 날짜에 적용 가능한 요금제 중 우선순위가 가장 높은 요금제의 basePrice 조회
        var basePrice = sitePricingRepository
                .findBySiteIdAndIsActiveTrueOrderByPriorityDesc(siteId)
                .stream()
                .filter(pricing -> pricing.isApplicableOn(java.time.LocalDate.now()))
                .findFirst()
                .map(SitePricing::getBasePrice)
                .orElse(null);
        
        // 트랜잭션 내에서 이미지 데이터 추출
        List<String> thumbnailUrls = site.getImages().stream()
                .map(img -> s3FileService.generatePublicUrl(img.getThumbnailUrl()))
                .collect(Collectors.toList());
        
        List<String> originalUrls = site.getImages().stream()
                .map(img -> s3FileService.generatePublicUrl(img.getOriginalUrl()))
                .collect(Collectors.toList());
        
        List<Long> imageIds = site.getImages().stream()
                .map(img -> img.getId())
                .collect(Collectors.toList());
        
        return SiteResponseDto.of(site, basePrice, thumbnailUrls, originalUrls, imageIds);
    }

    /**
     * Site 수정 (이미지만 Fetch Join, Campground는 접근 안 함)
     * LazyInitializationException 방지를 위해 Campground 프록시 초기화 방지
     */
    @Transactional
    @CacheEvict(value = {"sites", "campgrounds", "popularCampgrounds"}, allEntries = true)
    public SiteResponseDto updateSite(Long siteId, SiteUpdateRequestDto requestDto, List<MultipartFile> imageFiles, List<Long> deleteImageIds) {
        // 이미지만 Fetch Join으로 조회 (Campground는 건드리지 않음)
        Site site = siteRepository.findByIdWithDetails(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found with id: " + siteId));

        // 기본 정보 업데이트 (Campground 접근 없음)
        if (requestDto.siteNumber() != null && !requestDto.siteNumber().isBlank()) {
            site.setSiteNumber(requestDto.siteNumber());
        }
        if (requestDto.siteType() != null) {
            site.setSiteType(requestDto.siteType());
        }
        if (requestDto.capacity() != null) {
            site.setCapacity(requestDto.capacity());
        }
        site.setDescription(requestDto.description());
        if (requestDto.latitude() != null) {
            site.setLatitude(requestDto.latitude());
        }
        if (requestDto.longitude() != null) {
            site.setLongitude(requestDto.longitude());
        }

        // 편의시설 업데이트 (비트마스크 방식)
        if (requestDto.amenities() != null) {
            Set<AmenityType> amenityTypes = requestDto.amenities().stream()
                    .map(AmenityType::valueOf)
                    .collect(Collectors.toSet());
            site.setAmenities(amenityTypes);
        }

        // 이미지 삭제 처리 (트랜잭션 내)
        if (deleteImageIds != null && !deleteImageIds.isEmpty()) {
            deleteSiteImages(site, deleteImageIds);
        }

        // 새 이미지 업로드 처리 (트랜잭션 내)
        if (imageFiles != null && !imageFiles.isEmpty()) {
            uploadSiteImages(site, imageFiles);
        }

        // Dirty Checking으로 자동 UPDATE (명시적 save() 불필요)
        // flush()로 즉시 DB 반영 (이미지 조회 전에 변경사항 반영)
        siteRepository.flush();

        // basePrice 포함한 응답 반환 (Public URL 생성, 트랜잭션 내)
        BigDecimal basePrice = sitePricingRepository
                .findBySiteIdAndIsActiveTrueOrderByPriorityDesc(siteId)
                .stream()
                .filter(pricing -> pricing.isApplicableOn(java.time.LocalDate.now()))
                .findFirst()
                .map(SitePricing::getBasePrice)
                .orElse(null);

        // 트랜잭션 내에서 이미지 데이터 추출
        List<String> thumbnailUrls = site.getImages().stream()
                .map(img -> s3FileService.generatePublicUrl(img.getThumbnailUrl()))
                .collect(Collectors.toList());

        List<String> originalUrls = site.getImages().stream()
                .map(img -> s3FileService.generatePublicUrl(img.getOriginalUrl()))
                .collect(Collectors.toList());

        List<Long> imageIds = site.getImages().stream()
                .map(img -> img.getId())
                .collect(Collectors.toList());

        return SiteResponseDto.of(site, basePrice, thumbnailUrls, originalUrls, imageIds);
    }

    @Transactional
    @CacheEvict(value = {"sites", "campgrounds", "popularCampgrounds"}, allEntries = true)
    public void deleteSite(Long siteId) {
        if (!siteRepository.existsById(siteId)) {
            throw new ResourceNotFoundException("Site not found with id: " + siteId);
        }
        siteRepository.deleteById(siteId);
    }
}

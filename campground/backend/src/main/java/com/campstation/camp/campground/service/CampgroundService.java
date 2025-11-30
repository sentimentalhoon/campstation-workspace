package com.campstation.camp.campground.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.AmenityType;
import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.CampgroundCertification;
import com.campstation.camp.campground.domain.CampgroundImage;
import com.campstation.camp.campground.domain.CampgroundOperationType;
import com.campstation.camp.campground.dto.CampgroundResponse;
import com.campstation.camp.campground.repository.CampgroundImageRepository;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.review.repository.ReviewRepository;
import com.campstation.camp.shared.dto.PageResponse;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.user.domain.User;
import com.campstation.camp.user.dto.UserResponseDto;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.campstation.camp.user.repository.UserRepository;
import com.campstation.camp.user.service.FavoriteService;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 캠핑장 서비스
 * 캠핑장 CRUD 및 관련 비즈니스 로직을 처리하는 서비스 클래스
 * Java 21 현대적인 구문과 패턴 매칭을 활용한 완벽한 구현
 *
 * @author CampStation Team
 * @version 2.0
 * @since 2024-01-01
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CampgroundService {

    private final CampgroundRepository campgroundRepository;
    private final UserRepository userRepository;
    private final CampgroundImageRepository campgroundImageRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteService favoriteService;
    private final S3FileService s3FileService;
    private final ProfileImageRepository profileImageRepository;
    private final EntityManager entityManager;
    private final com.campstation.camp.pricing.repository.SitePricingRepository sitePricingRepository;
    @Transactional
    @CacheEvict(value = "campgrounds", allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public CampgroundResponse createCampground(String name, String description, String address,
                                               String phone, String email, String website, List<String> imageUrls,
                                               BigDecimal latitude, BigDecimal longitude,
                                               String checkInTime, String checkOutTime,
                                               String businessOwnerName, String businessName, String businessAddress,
                                               String businessEmail, String businessRegistrationNumber, String tourismBusinessNumber,
                                               CampgroundOperationType operationType, CampgroundCertification certification,
                                               Long ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new NoSuchElementException("소유자(User)를 찾을 수 없습니다. ID: " + ownerId));

        Campground campground = Campground.builder()
                .name(name)
                .description(description)
                .address(address)
                .phone(phone)
                .email(email)
                .website(website)
                .latitude(latitude)
                .longitude(longitude)
                .checkInTime(checkInTime != null ? java.time.LocalTime.parse(checkInTime) : null)
                .checkOutTime(checkOutTime != null ? java.time.LocalTime.parse(checkOutTime) : null)
                .businessOwnerName(businessOwnerName)
                .businessName(businessName)
                .businessAddress(businessAddress)
                .businessEmail(businessEmail)
                .businessRegistrationNumber(businessRegistrationNumber)
                .tourismBusinessNumber(tourismBusinessNumber)
                .operationType(operationType)
                .certification(certification)
                .owner(owner)
                .build();

        Campground savedCampground = campgroundRepository.save(campground);

        if (imageUrls != null && !imageUrls.isEmpty()) {
            List<CampgroundImage> images = new ArrayList<>();
            // imageUrls는 [thumbnail1, original1, thumbnail2, original2, ...] 형식으로 온다고 가정
            for (int i = 0; i < imageUrls.size(); i += 2) {
                if (i + 1 < imageUrls.size()) {
                    String thumbnailUrl = imageUrls.get(i);
                    String originalUrl = imageUrls.get(i + 1);

                    // URL에서 경로만 추출하여 저장 (S3FileService 공통 로직 사용)
                    String thumbnailPath = s3FileService.normalizePath(thumbnailUrl);
                    String originalPath = s3FileService.normalizePath(originalUrl);

                    CampgroundImage image = CampgroundImage.builder()
                            .campground(savedCampground)
                            .thumbnailUrl(thumbnailPath)
                            .originalUrl(originalPath)
                            .displayOrder(i / 2)
                            .isMain(i == 0) // 첫 번째 쌍을 메인으로 설정
                            .build();
                    images.add(image);
                }
            }
            campgroundImageRepository.saveAll(images);
        }

        return toCampgroundResponse(savedCampground);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')"),
        @CacheEvict(value = "campgroundImages", key = "'campground:' + #id"),
        @CacheEvict(value = "campgroundImages", key = "'mainImage:' + #id")
    })
    public CampgroundResponse updateCampground(Long id, String name, String description, String address,
                                               String phone, String email, String website, List<String> imageUrls,
                                               List<String> imagesToDelete, BigDecimal latitude, BigDecimal longitude,
                                               String checkInTime, String checkOutTime,
                                               String businessOwnerName, String businessName, String businessAddress,
                                               String businessEmail, String businessRegistrationNumber, String tourismBusinessNumber,
                                               CampgroundOperationType operationType, CampgroundCertification certification) {
        Campground campground = campgroundRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("캠핑장을 찾을 수 없습니다. ID: " + id));

        campground.updateInfo(name, description, address, phone, email, website);
        campground.updateLocation(latitude, longitude);
        
        // 체크인/체크아웃 시간 업데이트
        if (checkInTime != null) {
            campground.setCheckInTime(java.time.LocalTime.parse(checkInTime));
        }
        if (checkOutTime != null) {
            campground.setCheckOutTime(java.time.LocalTime.parse(checkOutTime));
        }
        
        // 사업자 정보 업데이트
        campground.setBusinessOwnerName(businessOwnerName);
        campground.setBusinessName(businessName);
        campground.setBusinessAddress(businessAddress);
        campground.setBusinessEmail(businessEmail);
        campground.setBusinessRegistrationNumber(businessRegistrationNumber);
        campground.setTourismBusinessNumber(tourismBusinessNumber);

        // 운영 주체 및 인증/등급 업데이트
        if (operationType != null) {
            campground.setOperationType(operationType);
        }
        if (certification != null) {
            campground.setCertification(certification);
        }

        // S3에서 삭제할 이미지 파일 배치 삭제
        if (imagesToDelete != null && !imagesToDelete.isEmpty()) {
            s3FileService.deleteFiles(imagesToDelete);
            
            // DB에서 삭제할 이미지만 제거 (imagesToDelete에 포함된 이미지만)
            List<CampgroundImage> existingImages = campground.getImages();
            existingImages.removeIf(img -> 
                imagesToDelete.contains(img.getThumbnailUrl()) || 
                imagesToDelete.contains(img.getOriginalUrl())
            );
            entityManager.flush();
        }

        // 이미지 업데이트 로직 - 새로운 이미지만 추가
        if (imageUrls != null && !imageUrls.isEmpty()) {
            // 기존 이미지 URL 추출 (썸네일만)
            List<String> existingThumbnailUrls = campground.getImages().stream()
                    .map(CampgroundImage::getThumbnailUrl)
                    .collect(Collectors.toList());

            List<CampgroundImage> newImages = new ArrayList<>();
            // imageUrls는 [thumbnail1, original1, thumbnail2, original2, ...] 형식
            for (int i = 0; i < imageUrls.size(); i += 2) {
                if (i + 1 < imageUrls.size()) {
                    String thumbnailUrl = imageUrls.get(i);
                    String originalUrl = imageUrls.get(i + 1);

                    // URL에서 경로만 추출 (S3FileService 공통 로직 사용)
                    String thumbnailPath = s3FileService.normalizePath(thumbnailUrl);
                    String originalPath = s3FileService.normalizePath(originalUrl);

                    // 기존 이미지가 아닌 경우만 추가
                    if (!existingThumbnailUrls.contains(thumbnailPath)) {
                        CampgroundImage image = CampgroundImage.builder()
                                .campground(campground)
                                .thumbnailUrl(thumbnailPath)
                                .originalUrl(originalPath)
                                .displayOrder(campground.getImages().size() + newImages.size())
                                .isMain(campground.getImages().isEmpty() && newImages.isEmpty()) // 첫 번째가 메인
                                .build();
                        newImages.add(image);
                    }
                }
            }
            
            if (!newImages.isEmpty()) {
                campgroundImageRepository.saveAll(newImages);
                log.info("새로운 이미지 {}개 추가됨", newImages.size());
            }
        }

        return toCampgroundResponse(campgroundRepository.save(campground));
    }
    
    /**
     * 캠핑장 엔티티 조회 (이미지 포함)
     * N+1 쿼리 방지를 위해 EntityGraph 사용
     */
    public Campground getCampgroundEntityById(Long id) {
        return campgroundRepository.findByIdWithImages(id)
                .orElseThrow(() -> new NoSuchElementException("캠핑장을 찾을 수 없습니다. ID: " + id));
    }

    //@Cacheable(value = "campgrounds", key = "'id:' + #id", unless = "#result == null")
    public CampgroundResponse getCampgroundById(Long id) {
        return toCampgroundResponse(getCampgroundEntityById(id));
    }

    @Cacheable(value = "campgrounds", key = "'all:' + #pageable.pageNumber + ':' + #pageable.pageSize", condition = "!@environment.acceptsProfiles('local')")
    public PageResponse<CampgroundResponse> getAllCampgrounds(Pageable pageable) {
        Page<CampgroundResponse> page = campgroundRepository.findAll(pageable)
                .map(this::toCampgroundResponse);
        return PageResponse.from(page);
    }

    @Cacheable(value = "popularCampgrounds", key = "'limit:' + #limit", condition = "!@environment.acceptsProfiles('local')")
    public List<CampgroundResponse> getPopularCampgrounds(int limit) {
        List<Campground> campgrounds = campgroundRepository.findPopularNotDeleted();
        List<Campground> limitedCampgrounds = campgrounds.stream()
                .limit(limit)
                .collect(Collectors.toList());
        // N+1 방지: 배치 변환 사용
        return toCampgroundResponsesBatch(limitedCampgrounds);
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
    public List<CampgroundResponse> getCampgroundsByMapBounds(
            BigDecimal swLat, BigDecimal swLng,
            BigDecimal neLat, BigDecimal neLng) {
        List<Campground> campgrounds = campgroundRepository.findByMapBoundsAndNotDeleted(
                swLat, swLng, neLat, neLng
        );
        // N+1 방지: 배치 변환 사용
        return toCampgroundResponsesBatch(campgrounds);
    }

    public Page<CampgroundResponse> searchCampgrounds(String keyword, BigDecimal minPrice, BigDecimal maxPrice, List<String> amenities,
                                                       List<CampgroundOperationType> operationTypes, List<CampgroundCertification> certifications,
                                                       Pageable pageable) {
        if ((keyword == null || keyword.trim().isEmpty()) && minPrice == null && maxPrice == null &&
            (amenities == null || amenities.isEmpty()) && (operationTypes == null || operationTypes.isEmpty()) &&
            (certifications == null || certifications.isEmpty())) {
            return campgroundRepository.findAll(pageable).map(this::toCampgroundResponse);
        }

        // 기본 키워드 검색
        Set<Campground> results = new java.util.HashSet<>();
        if (keyword != null && !keyword.trim().isEmpty()) {
            List<Campground> nameResults = campgroundRepository.findByNameContainingAndNotDeleted(keyword);
            List<Campground> addressResults = campgroundRepository.findByAddressContainingAndNotDeleted(keyword);
            results.addAll(nameResults);
            results.addAll(addressResults);
        } else {
            // 키워드가 없으면 모든 캠핑장을 대상으로 필터링
            results.addAll(campgroundRepository.findAllNotDeleted());
        }

        // 가격 필터링 (site_pricing 테이블 기반)
        if (minPrice != null || maxPrice != null) {
            results = results.stream()
                    .filter(campground -> {
                        // 캠핑장의 모든 사이트에 대한 기본 요금 조회
                        List<BigDecimal> prices = campground.getSites().stream()
                                .flatMap(site -> sitePricingRepository.findBySiteIdAndIsActiveTrueOrderByPriorityDesc(site.getId()).stream())
                                .map(pricing -> pricing.getBasePrice())
                                .collect(Collectors.toList());
                        if (prices.isEmpty()) return false;
                        
                        BigDecimal minSitePrice = prices.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
                        BigDecimal maxSitePrice = prices.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
                        
                        if (minPrice != null && maxSitePrice.compareTo(minPrice) < 0) return false;
                        if (maxPrice != null && minSitePrice.compareTo(maxPrice) > 0) return false;
                        return true;
                    })
                    .collect(Collectors.toSet());
        }

        // 편의시설 필터링
        if (amenities != null && !amenities.isEmpty()) {
            results = results.stream()
                    .filter(campground -> {
                        Set<String> campgroundAmenities = campground.getSites().stream()
                                .flatMap(site -> site.getAmenities().stream())
                                .map(AmenityType::name)
                                .collect(Collectors.toSet());
                        return campgroundAmenities.containsAll(amenities);
                    })
                    .collect(Collectors.toSet());
        }

        // 운영 주체 필터링
        if (operationTypes != null && !operationTypes.isEmpty()) {
            results = results.stream()
                    .filter(campground -> campground.getOperationType() != null && operationTypes.contains(campground.getOperationType()))
                    .collect(Collectors.toSet());
        }

        // 인증/등급 필터링
        if (certifications != null && !certifications.isEmpty()) {
            results = results.stream()
                    .filter(campground -> campground.getCertification() != null && certifications.contains(campground.getCertification()))
                    .collect(Collectors.toSet());
        }

        List<Campground> sortedResults = results.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        // Pageable 적용
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sortedResults.size());
        List<Campground> pageResults = sortedResults.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(
                pageResults.stream().map(this::toCampgroundResponse).collect(Collectors.toList()),
                pageable,
                sortedResults.size()
        );
    }

    @Transactional
    @CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public void deleteCampground(Long id) {
        Campground campground = campgroundRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("캠핑장을 찾을 수 없습니다. ID: " + id));
        campgroundRepository.delete(campground);
    }

    private CampgroundResponse toCampgroundResponse(Campground campground) {
        // 메인 이미지 URL을 Public URL로 변환
        String mainImageUrl = null;
        if (campground.getMainImageUrl() != null && !campground.getMainImageUrl().isBlank()) {
            mainImageUrl = s3FileService.generatePublicUrl(campground.getMainImageUrl());
        }

        // 썸네일 URL들을 Public URL로 변환
        List<String> thumbnailUrls = campground.getAllThumbnailUrls().stream()
                .map(s3FileService::generatePublicUrl)
                .toList();

        // 원본 이미지 URL들을 Public URL로 변환
        List<String> originalImageUrls = campground.getAllOriginalImageUrls().stream()
                .map(s3FileService::generatePublicUrl)
                .toList();

        // 캠핑장의 모든 사이트에서 amenities 수집 (중복 제거)
        List<String> amenities = campground.getSites().stream()
                .flatMap(site -> site.getAmenities().stream())
                .map(Enum::name)
                .distinct()
                .sorted()
                .toList();

        return new CampgroundResponse(
                campground.getId(),
                campground.getName(),
                campground.getDescription(),
                campground.getAddress(),
                campground.getPhone(),
                campground.getEmail(),
                campground.getWebsite(),
                mainImageUrl,
                thumbnailUrls,
                originalImageUrls,
                campground.getLatitude(),
                campground.getLongitude(),
                campground.getStatus(),
                campground.getOperationType(),
                campground.getCertification(),
                calculateAverageRating(campground.getId()),
                calculateReviewCount(campground.getId()),
                (int) favoriteService.getFavoriteCount(campground.getId()),
                campground.getCheckInTime() != null ? campground.getCheckInTime().toString() : null,
                campground.getCheckOutTime() != null ? campground.getCheckOutTime().toString() : null,
                campground.getBusinessOwnerName(),
                campground.getBusinessName(),
                campground.getBusinessAddress(),
                campground.getBusinessEmail(),
                campground.getBusinessRegistrationNumber(),
                campground.getTourismBusinessNumber(),
                UserResponseDto.fromEntity(campground.getOwner(), s3FileService, profileImageRepository),
                campground.getCreatedAt(),
                campground.getUpdatedAt(),
                amenities
        );
    }

    private BigDecimal calculateAverageRating(Long campgroundId) {
        Double avg = reviewRepository.findAverageRatingByCampgroundId(campgroundId);
        return avg != null ? BigDecimal.valueOf(avg).setScale(2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private Integer calculateReviewCount(Long campgroundId) {
        Campground campground = getCampgroundEntityById(campgroundId);
        return campground.getReviewCount();
    }

    /**
     * 배치로 CampgroundResponse 변환 (N+1 쿼리 방지)
     * 모든 통계 정보를 한 번의 쿼리로 가져옵니다.
     */
    private List<CampgroundResponse> toCampgroundResponsesBatch(List<Campground> campgrounds) {
        if (campgrounds == null || campgrounds.isEmpty()) {
            return List.of();
        }

        // 1. 캠핑장 ID 목록 추출
        List<Long> campgroundIds = campgrounds.stream()
                .map(Campground::getId)
                .collect(Collectors.toList());

        // 2. 통계 정보를 한 번의 쿼리로 가져오기
        var statsMap = campgroundRepository.findStatsByCampgroundIds(campgroundIds)
                .stream()
                .collect(Collectors.toMap(
                        com.campstation.camp.campground.dto.CampgroundWithStatsProjection::getCampgroundId,
                        stat -> stat
                ));

        // 3. 각 캠핑장을 Response로 변환
        return campgrounds.stream()
                .map(campground -> {
                    var stats = statsMap.get(campground.getId());

                    // Public URL 생성
                    String mainImageUrl = null;
                    if (campground.getMainImageUrl() != null && !campground.getMainImageUrl().isBlank()) {
                        mainImageUrl = s3FileService.generatePublicUrl(campground.getMainImageUrl());
                    }

                    List<String> thumbnailUrls = campground.getAllThumbnailUrls().stream()
                            .map(s3FileService::generatePublicUrl)
                            .toList();

                    List<String> originalImageUrls = campground.getAllOriginalImageUrls().stream()
                            .map(s3FileService::generatePublicUrl)
                            .toList();

                    // 캠핑장의 모든 사이트에서 amenities 수집 (중복 제거)
                    List<String> amenities = campground.getSites().stream()
                            .flatMap(site -> site.getAmenities().stream())
                            .map(Enum::name)
                            .distinct()
                            .sorted()
                            .toList();

                    // 통계 정보 사용
                    BigDecimal avgRating = stats != null
                            ? BigDecimal.valueOf(stats.getAverageRating()).setScale(2, java.math.RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    int reviewCount = stats != null ? stats.getReviewCount().intValue() : 0;
                    int favoriteCount = stats != null ? stats.getFavoriteCount().intValue() : 0;

                    return new CampgroundResponse(
                            campground.getId(),
                            campground.getName(),
                            campground.getDescription(),
                            campground.getAddress(),
                            campground.getPhone(),
                            campground.getEmail(),
                            campground.getWebsite(),
                            mainImageUrl,
                            thumbnailUrls,
                            originalImageUrls,
                            campground.getLatitude(),
                            campground.getLongitude(),
                            campground.getStatus(),
                            campground.getOperationType(),
                            campground.getCertification(),
                            avgRating,
                            reviewCount,
                            favoriteCount,
                            campground.getCheckInTime() != null ? campground.getCheckInTime().toString() : null,
                            campground.getCheckOutTime() != null ? campground.getCheckOutTime().toString() : null,
                            campground.getBusinessOwnerName(),
                            campground.getBusinessName(),
                            campground.getBusinessAddress(),
                            campground.getBusinessEmail(),
                            campground.getBusinessRegistrationNumber(),
                            campground.getTourismBusinessNumber(),
                            UserResponseDto.fromEntity(campground.getOwner(), s3FileService, profileImageRepository),
                            campground.getCreatedAt(),
                            campground.getUpdatedAt(),
                            amenities
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "campgroundImages", key = "'mainImage:' + #campgroundId")
    public CampgroundResponse setMainImage(Long campgroundId, String imageUrl) {
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new NoSuchElementException("캠핑장을 찾을 수 없습니다. ID: " + campgroundId));

        // 모든 이미지의 isMain을 false로 설정
        campground.getImages().forEach(CampgroundImage::setAsNormalImage);

        // 지정된 URL을 가진 이미지의 isMain을 true로 설정
        campground.getImages().stream()
                .filter(img -> img.getThumbnailUrl().equals(imageUrl))
                .findFirst()
                .ifPresent(CampgroundImage::setAsMainImage);

        Campground updatedCampground = campgroundRepository.save(campground);

        return toCampgroundResponse(updatedCampground);
    }

}
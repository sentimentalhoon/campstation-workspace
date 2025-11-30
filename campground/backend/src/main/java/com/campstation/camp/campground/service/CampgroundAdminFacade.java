package com.campstation.camp.campground.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.domain.CampgroundStatus;
import com.campstation.camp.campground.dto.CampgroundResponse;
import com.campstation.camp.campground.dto.CreateCampgroundRequest;
import com.campstation.camp.campground.dto.UpdateCampgroundRequest;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.review.repository.ReviewRepository;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.shared.file.S3FileService;
import com.campstation.camp.user.repository.ProfileImageRepository;
import com.campstation.camp.user.service.FavoriteService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CampgroundAdminFacade {

    private final CampgroundRepository campgroundRepository;
    private final ReviewRepository reviewRepository;
    private final FavoriteService favoriteService;
    private final S3FileService s3FileService;
    private final ProfileImageRepository profileImageRepository;

    public Page<CampgroundResponse> findAll(Pageable pageable) {
        return campgroundRepository.findAll(pageable)
                .map(this::toResponse); 
    }

    @Transactional
    @CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public CampgroundResponse create(CreateCampgroundRequest request) {
        Campground campground = Campground.builder()
                .name(request.name())
                .description(request.description())
                .address(request.address())
                .phone(request.phone())
                .email(request.email())
                .website(request.website())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .status(CampgroundStatus.ACTIVE)
                .build();

        Campground saved = campgroundRepository.save(campground);
        log.info("Campground created by admin: {}", saved.getId());
        return toResponse(saved);
    }

    @Transactional
    @CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public CampgroundResponse update(Long campgroundId, UpdateCampgroundRequest request) {
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new ResourceNotFoundException("캠핑장을 찾을 수 없습니다: " + campgroundId));

        if (request.name() != null) {
            campground.setName(request.name());
        }
        if (request.description() != null) {
            campground.setDescription(request.description());
        }
        if (request.address() != null) {
            campground.setAddress(request.address());
        }
        if (request.phone() != null) {
            campground.setPhone(request.phone());
        }
        if (request.email() != null) {
            campground.setEmail(request.email());
        }
        if (request.website() != null) {
            campground.setWebsite(request.website());
        }

        Campground updated = campgroundRepository.save(campground);
        log.info("Campground updated by admin: {}", updated.getId());
        return toResponse(updated);
    }

    @Transactional
    @CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public CampgroundResponse updateStatus(Long campgroundId, CampgroundStatus status) {
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new ResourceNotFoundException("캠핑장을 찾을 수 없습니다: " + campgroundId));
        campground.setStatus(status);
        Campground updated = campgroundRepository.save(campground);
        log.info("Campground status updated by admin: {} -> {}", campgroundId, status);
        return toResponse(updated);
    }

    @Transactional
    @CacheEvict(value = {"campgrounds", "popularCampgrounds"}, allEntries = true, condition = "!@environment.acceptsProfiles('local')")
    public void delete(Long campgroundId) {
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new ResourceNotFoundException("캠핑장을 찾을 수 없습니다: " + campgroundId));
        campgroundRepository.delete(campground);
        log.info("Campground deleted by admin: {}", campgroundId);
    }

    public long countAll() {
        return campgroundRepository.count();
    }

    public long countByStatus(CampgroundStatus status) {
        return campgroundRepository.countByStatus(status);
    }

    private CampgroundResponse toResponse(Campground campground) {
        // Public URL로 변환
        String imageUrl = null;
        if (campground.getMainImageUrl() != null) {
            imageUrl = s3FileService.generatePublicUrl(campground.getMainImageUrl());
        }

        // 썸네일 URL들을 Public URL로 변환
        List<String> thumbnailUrls = campground.getAllThumbnailUrls().stream()
                .map(s3FileService::generatePublicUrl)
                .toList();

        // 원본 이미지 URL들을 Public URL로 변환
        List<String> originalImageUrls = campground.getAllOriginalImageUrls().stream()
                .map(s3FileService::generatePublicUrl)
                .toList();

        BigDecimal rating = calculateAverageRating(campground.getId());
        Integer reviewCount = calculateReviewCount(campground.getId());
        Integer favoriteCount = (int) favoriteService.getFavoriteCount(campground.getId());
        
        // imageUrl을 첫 번째 인자로 전달
        return CampgroundResponse.fromEntity(campground, imageUrl, thumbnailUrls, originalImageUrls, rating, reviewCount, favoriteCount, s3FileService, profileImageRepository);
    }

    private BigDecimal calculateAverageRating(Long campgroundId) {
        Double avg = reviewRepository.findAverageRatingByCampgroundId(campgroundId);
        return avg != null ? BigDecimal.valueOf(avg).setScale(2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO;
    }

    private Integer calculateReviewCount(Long campgroundId) {
        Campground campground = campgroundRepository.findById(campgroundId)
                .orElseThrow(() -> new ResourceNotFoundException("캠핑장을 찾을 수 없습니다: " + campgroundId));
        return campground.getReviewCount();
    }
}

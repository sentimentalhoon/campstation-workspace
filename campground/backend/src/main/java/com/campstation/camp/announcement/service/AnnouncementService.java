package com.campstation.camp.announcement.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.announcement.domain.Announcement;
import com.campstation.camp.announcement.domain.AnnouncementImage;
import com.campstation.camp.announcement.domain.AnnouncementType;
import com.campstation.camp.announcement.dto.AnnouncementResponse;
import com.campstation.camp.announcement.dto.CreateAnnouncementRequest;
import com.campstation.camp.announcement.dto.UpdateAnnouncementRequest;
import com.campstation.camp.announcement.repository.AnnouncementRepository;
import com.campstation.camp.campground.domain.Campground;
import com.campstation.camp.campground.repository.CampgroundRepository;
import com.campstation.camp.shared.dto.ImagePairDto;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.shared.file.S3FileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 공지사항 서비스
 * 캠핑장 공지사항 관리 비즈니스 로직
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CampgroundRepository campgroundRepository;
    private final S3FileService s3FileService;

    /**
     * 캠핑장의 공지사항 목록 조회
     *
     * @param campgroundId 캠핑장 ID
     * @param type 공지사항 타입 (nullable)
     * @return 공지사항 목록
     */
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAnnouncements(Long campgroundId, AnnouncementType type) {
        log.info("Get Announcements: campgroundId={}, type={}", campgroundId, type);

        List<Announcement> announcements;
        if (type != null) {
            announcements = announcementRepository.findByCampgroundIdAndType(campgroundId, type);
        } else {
            announcements = announcementRepository.findByCampgroundId(campgroundId);
        }

        return announcements.stream()
                .map(announcement -> AnnouncementResponse.from(announcement, s3FileService))
                .collect(Collectors.toList());
    }

    /**
     * 공지사항 단건 조회
     *
     * @param announcementId 공지사항 ID
     * @return 공지사항 정보
     */
    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncement(Long announcementId) {
        Announcement announcement = announcementRepository.findByIdNotDeleted(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("공지사항을 찾을 수 없습니다: " + announcementId));

        return AnnouncementResponse.from(announcement, s3FileService);
    }

    /**
     * 공지사항 생성
     *
     * @param request 생성 요청
     * @return 생성된 공지사항 정보
     */
    public AnnouncementResponse createAnnouncement(CreateAnnouncementRequest request) {
        log.info("Create Announcement: campgroundId={}, title={}, type={}",
                request.getCampgroundId(), request.getTitle(), request.getType());

        // 캠핑장 확인
        Campground campground = campgroundRepository.findById(request.getCampgroundId())
                .orElseThrow(() -> new ResourceNotFoundException("캠핑장을 찾을 수 없습니다: " + request.getCampgroundId()));

        Announcement announcement = Announcement.builder()
                .campground(campground)
                .title(request.getTitle())
                .content(request.getContent())
                .type(request.getType())
                .isPinned(request.getIsPinned() != null ? request.getIsPinned() : false)
                .build();

        // 이미지 추가
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            if (request.getImages().size() > 5) {
                throw new IllegalArgumentException("공지사항 이미지는 최대 5개까지만 업로드 가능합니다.");
            }

            for (int i = 0; i < request.getImages().size(); i++) {
                ImagePairDto imageDto = request.getImages().get(i);
                // URL에서 경로만 추출하여 저장
                String thumbnailPath = s3FileService.normalizePath(imageDto.getThumbnailUrl());
                String originalPath = s3FileService.normalizePath(imageDto.getOriginalUrl());

                AnnouncementImage image = new AnnouncementImage(
                        announcement,
                        thumbnailPath,
                        originalPath,
                        i
                );
                announcement.addImage(image);
            }
            log.info("Added {} images to announcement", request.getImages().size());
        }

        Announcement savedAnnouncement = announcementRepository.save(announcement);
        log.info("Announcement created: announcementId={}", savedAnnouncement.getId());

        return AnnouncementResponse.from(savedAnnouncement, s3FileService);
    }

    /**
     * 공지사항 수정
     *
     * @param announcementId 공지사항 ID
     * @param request 수정 요청
     * @return 수정된 공지사항 정보
     */
    public AnnouncementResponse updateAnnouncement(Long announcementId, UpdateAnnouncementRequest request) {
        log.info("Update Announcement: announcementId={}", announcementId);

        Announcement announcement = announcementRepository.findByIdNotDeleted(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("공지사항을 찾을 수 없습니다: " + announcementId));

        announcement.update(
                request.getTitle(),
                request.getContent(),
                request.getType(),
                request.getIsPinned()
        );

        // 1. 삭제할 이미지 처리 (ID 기반)
        if (request.getImageIdsToDelete() != null && !request.getImageIdsToDelete().isEmpty()) {
            log.info("Deleting images by ID: {}", request.getImageIdsToDelete());

            for (Long imageId : request.getImageIdsToDelete()) {
                // 해당 공지사항의 이미지만 삭제하도록 검증
                announcement.getImages().stream()
                        .filter(img -> img.getId().equals(imageId))
                        .findFirst()
                        .ifPresent(image -> {
                            // S3에서 파일 삭제
                            try {
                                s3FileService.deleteFile(image.getThumbnailUrl());
                                s3FileService.deleteFile(image.getOriginalUrl());
                                log.info("Deleted image files from S3: thumbnailUrl={}, originalUrl={}",
                                        image.getThumbnailUrl(), image.getOriginalUrl());
                            } catch (Exception e) {
                                log.error("Failed to delete image files from S3: {}", e.getMessage(), e);
                            }

                            // DB에서 삭제 (orphanRemoval로 자동 삭제됨)
                            announcement.removeImage(image);
                        });
            }
        }

        // 2. 새 이미지 추가
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            // 현재 최대 displayOrder 계산
            int currentMaxOrder = announcement.getImages().stream()
                    .mapToInt(AnnouncementImage::getDisplayOrder)
                    .max()
                    .orElse(-1);

            int order = currentMaxOrder + 1;
            for (ImagePairDto imageDto : request.getImages()) {
                // URL에서 경로만 추출하여 저장
                String thumbnailPath = s3FileService.normalizePath(imageDto.getThumbnailUrl());
                String originalPath = s3FileService.normalizePath(imageDto.getOriginalUrl());

                AnnouncementImage image = new AnnouncementImage(
                        announcement,
                        thumbnailPath,
                        originalPath,
                        order++
                );
                announcement.addImage(image);
            }
            log.info("Added {} new images to announcement {}", request.getImages().size(), announcementId);
        }

        // 3. 최종 이미지 개수 검증
        if (announcement.getImages().size() > 5) {
            throw new IllegalArgumentException("공지사항 이미지는 최대 5개까지만 업로드 가능합니다.");
        }

        log.info("Announcement updated: announcementId={}", announcementId);
        return AnnouncementResponse.from(announcement, s3FileService);
    }

    /**
     * 공지사항 삭제 (소프트 삭제)
     *
     * @param announcementId 공지사항 ID
     */
    public void deleteAnnouncement(Long announcementId) {
        Announcement announcement = announcementRepository.findByIdNotDeleted(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("공지사항을 찾을 수 없습니다: " + announcementId));

        // 소프트 삭제
        announcement.markAsDeleted();
        log.info("Announcement deleted: announcementId={}", announcementId);
    }

    /**
     * 공지사항 조회수 증가
     *
     * @param announcementId 공지사항 ID
     */
    public void incrementViewCount(Long announcementId) {
        Announcement announcement = announcementRepository.findByIdNotDeleted(announcementId)
                .orElseThrow(() -> new ResourceNotFoundException("공지사항을 찾을 수 없습니다: " + announcementId));

        announcement.incrementViewCount();
        log.debug("Announcement view count incremented: announcementId={}, viewCount={}",
                announcementId, announcement.getViewCount());
    }
}

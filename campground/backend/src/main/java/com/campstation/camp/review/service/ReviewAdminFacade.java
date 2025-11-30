package com.campstation.camp.review.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campstation.camp.review.domain.Review;
import com.campstation.camp.review.dto.ReviewResponse;
import com.campstation.camp.review.repository.ReviewLikeRepository;
import com.campstation.camp.review.repository.ReviewRepository;
import com.campstation.camp.shared.dto.ImagePairDto;
import com.campstation.camp.shared.exception.ResourceNotFoundException;
import com.campstation.camp.shared.file.S3FileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ReviewAdminFacade {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final S3FileService s3FileService;
    private final com.campstation.camp.review.repository.ReviewReplyRepository reviewReplyRepository;

    public Page<ReviewResponse> findAll(Pageable pageable) {
        return reviewRepository.findAll(pageable)
                .map(review -> {
                    // ReviewImage 엔티티를 ImagePairDto로 변환 (ID 포함)
                    List<ImagePairDto> imageDtos = review.getImages().stream()
                            .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                            .map(img -> {
                                String thumbnailUrl = img.getThumbnailUrl() != null
                                    ? s3FileService.generatePublicUrl(img.getThumbnailUrl())
                                    : null;
                                String originalUrl = img.getOriginalUrl() != null
                                    ? s3FileService.generatePublicUrl(img.getOriginalUrl())
                                    : null;
                                return ImagePairDto.builder()
                                    .id(img.getId())
                                    .thumbnailUrl(thumbnailUrl)
                                    .originalUrl(originalUrl)
                                    .build();
                            })
                            .toList();

                    // 사용자 프로필 이미지를 Public URL로 변환
                    String profileImageUrl = null;
                    if (review.getUser().getProfileImage() != null && !review.getUser().getProfileImage().isBlank()) {
                        profileImageUrl = s3FileService.generatePublicUrl(review.getUser().getProfileImage());
                    }

                    // 좋아요 수 (Admin Facade에서는 현재 사용자 없으므로 isLiked는 항상 false)
                    Long likeCount = reviewLikeRepository.countByReviewId(review.getId());

                    // 운영자 답글 조회
                    com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse ownerReply = 
                        reviewReplyRepository.findByReviewId(review.getId())
                            .map(com.campstation.camp.review.dto.ReviewReplyDto.ReviewReplyResponse::from)
                            .orElse(null);

                    return new ReviewResponse(
                            review.getId(),
                            review.getUser().getId(),
                            review.getUser().getName(),
                            review.getUser().getName(),
                            review.getUser().getEmail(),
                            profileImageUrl,
                            review.getCampground().getId(),
                            review.getCampground().getName(),
                            review.getCampground().getOwner().getId(), // 캠핑장 소유자 ID
                            review.getRating(),
                            review.getComment(),
                            imageDtos,
                            likeCount,
                            false, // Admin Facade에서는 isLiked 항상 false
                            ownerReply, // 운영자 답글
                            review.getCreatedAt(),
                            review.getUpdatedAt()
                    );
                });
    }

    public long countAll() {
        return reviewRepository.count();
    }

    @Transactional
    public void delete(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("리뷰를 찾을 수 없습니다: " + reviewId));
        
        log.info("Deleting review: {}", reviewId);
        reviewRepository.delete(review);
    }
}

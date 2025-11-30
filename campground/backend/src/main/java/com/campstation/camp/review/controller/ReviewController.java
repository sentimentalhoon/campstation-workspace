package com.campstation.camp.review.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.review.dto.CreateReviewRequest;
import com.campstation.camp.review.dto.ReviewResponse;
import com.campstation.camp.review.dto.UpdateReviewRequest;
import com.campstation.camp.review.service.ReviewService;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.security.annotation.Authenticated;
import com.campstation.camp.shared.validation.InputValidator;
import com.campstation.camp.user.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 리뷰 컨트롤러
 * 
 * - 리뷰 조회: Public
 * - 리뷰 작성/수정/삭제: 인증된 사용자만, Service에서 작성자 본인 확인
 * 
 * @author CampStation Team
 * @version 1.0
 * @since 2024-01-01
 */
@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Review", description = "리뷰 관리 API")
public class ReviewController {
    
    private final ReviewService reviewService;
    private final UserService userService;
    private final InputValidator inputValidator;
    
    /**
     * 리뷰 생성
     * 
     * @param request 리뷰 생성 요청
     * @param userId 사용자 ID (헤더)
     * @return 생성된 리뷰 정보
     */
    @PostMapping
    @Authenticated
    @Operation(summary = "리뷰 생성", description = "새로운 리뷰를 생성합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "리뷰 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "409", description = "이미 리뷰가 존재함")
    })
    public ResponseEntity<ReviewResponse> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @Parameter(hidden = true) Authentication authentication) {

        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);

        log.info("Review Create Request : 리뷰 생성 요청: userId={}, campgroundId={}", userId, request.getCampgroundId());

        // 입력 데이터 검증
        if (!inputValidator.isValidTextLength(request.getComment(), 10, 2000)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ReviewResponse response = reviewService.createReview(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Review Create Failed : 리뷰 생성 실패: {}", e.getMessage());
            if (e.getMessage().contains("Already Exists Review")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 리뷰 수정
     * 
     * @param reviewId 리뷰 ID
     * @param request 리뷰 수정 요청
     * @param userId 사용자 ID (헤더)
     * @return 수정된 리뷰 정보
     */
    @PutMapping("/{reviewId}")
    @Authenticated
    @Operation(summary = "리뷰 수정", description = "기존 리뷰를 수정합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "수정 권한 없음"),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody UpdateReviewRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);

        log.info("Review Update Request : 리뷰 수정 요청: reviewId={}, userId={}", reviewId, userId);

        // 입력 데이터 검증
        if (!inputValidator.isValidTextLength(request.getComment(), 10, 2000)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            ReviewResponse response = reviewService.updateReview(reviewId, request, userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Review Update Failed : 리뷰 수정 실패: {}", e.getMessage());
            if (e.getMessage().contains("권한") || e.getMessage().contains("찾을 수 없습니다")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 리뷰 삭제
     * 
     * @param reviewId 리뷰 ID
     * @param userId 사용자 ID (헤더)
     * @return 삭제 결과
     */
    @DeleteMapping("/{reviewId}")
    @Authenticated
    @Operation(summary = "리뷰 삭제", description = "기존 리뷰를 삭제합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "리뷰 삭제 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "삭제 권한 없음"),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);
        
        log.info("Review Delete Request : 리뷰 삭제 요청: reviewId={}, userId={}", reviewId, userId);
        
        try {
            reviewService.deleteReview(reviewId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Review Delete Failed : 리뷰 삭제 실패: {}", e.getMessage());
            if (e.getMessage().contains("권한") || e.getMessage().contains("찾을 수 없습니다")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * 리뷰 단일 조회
     * 
     * @param reviewId 리뷰 ID
     * @return 리뷰 정보
     */
    @GetMapping("/{reviewId}")
    @Operation(summary = "리뷰 조회", description = "특정 리뷰 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 조회 성공"),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    public ResponseEntity<ReviewResponse> getReview(@PathVariable Long reviewId) {
        log.info("Review Get Request : 리뷰 조회 요청: reviewId={}", reviewId);
        
        try {
            ReviewResponse response = reviewService.getReview(reviewId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Review Get Failed : 리뷰 조회 실패: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 캠핑장의 리뷰 목록 조회
     * 
     * @param campgroundId 캠핑장 ID
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    @GetMapping("/campground/{campgroundId}")
    @Operation(summary = "캠핑장 리뷰 목록", description = "특정 캠핑장의 리뷰 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 목록 조회 성공")
    })
    public ResponseEntity<CommonResponse<Page<ReviewResponse>>> getCampgroundReviews(
            @PathVariable Long campgroundId,
            @PageableDefault(size = 10) Pageable pageable,
            @Parameter(hidden = true) Authentication authentication) {

        log.info("Review Get Request : 캠핑장 리뷰 목록 조회: campgroundId={}, page={}, size={}",
                campgroundId, pageable.getPageNumber(), pageable.getPageSize());
        
        // 현재 사용자 ID 가져오기 (로그인 안 한 경우 null)
        Long currentUserId = null;
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            currentUserId = userService.getUserIdByEmail(email);
        }
        
        Page<ReviewResponse> reviews = reviewService.getCampgroundReviews(campgroundId, pageable, currentUserId);
        return ResponseEntity.ok(CommonResponse.success("리뷰 목록 조회 성공", reviews));
    }
    
    /**
     * 최근 리뷰 목록 조회 (페이징 없음)
     * 
     * @param limit 조회할 개수 (기본값: 10, 최대: 50)
     * @return 최근 리뷰 목록
     */
    @GetMapping("/recent")
    @Operation(summary = "최근 리뷰 목록", description = "최근 작성된 리뷰 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 목록 조회 성공")
    })
    public ResponseEntity<CommonResponse<List<ReviewResponse>>> getRecentReviews(
            @Parameter(description = "조회할 개수 (기본값: 10, 최대: 50)")
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "10") int limit) {

        // 최대값 제한
        int actualLimit = Math.min(limit, 50);
        
        log.info("Review Get Request : 최근 리뷰 목록 조회: limit={}", actualLimit);

        List<ReviewResponse> reviews = reviewService.getRecentReviews(actualLimit);
        return ResponseEntity.ok(CommonResponse.success("최근 리뷰 목록 조회가 완료되었습니다.", reviews));
    }
    
    /**
     * 캠핑장의 전체 리뷰 목록 조회 (페이징 없음)
     * 
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 목록
     */
    @GetMapping("/campground/{campgroundId}/all")
    @Operation(summary = "캠핑장 전체 리뷰 목록", description = "특정 캠핑장의 전체 리뷰 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 목록 조회 성공")
    })
    public ResponseEntity<CommonResponse<List<ReviewResponse>>> getAllCampgroundReviews(@PathVariable Long campgroundId) {

        log.info("Review Get Request : 캠핑장 전체 리뷰 목록 조회: campgroundId={}", campgroundId);

        List<ReviewResponse> reviews = reviewService.getAllCampgroundReviews(campgroundId);
        return ResponseEntity.ok(CommonResponse.success("리뷰 목록 조회가 완료되었습니다.", reviews));
    }
    
    /**
     * 사용자의 리뷰 목록 조회
     * 
     * @param userId 사용자 ID (헤더)
     * @param pageable 페이징 정보
     * @return 리뷰 목록
     */
    @GetMapping("/my")
    @Operation(summary = "내 리뷰 목록", description = "현재 사용자의 리뷰 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 목록 조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패")
    })
    public ResponseEntity<CommonResponse<Page<ReviewResponse>>> getMyReviews(
            @Parameter(hidden = true) Authentication authentication,
            @PageableDefault(size = 10) Pageable pageable) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);

        log.info("User Review Get Request : 사용자 리뷰 목록 조회: userId={}, page={}, size={}",
                userId, pageable.getPageNumber(), pageable.getPageSize());
        
        Page<ReviewResponse> reviews = reviewService.getUserReviews(userId, pageable);
        return ResponseEntity.ok(CommonResponse.success("리뷰 목록 조회가 완료되었습니다.", reviews));
    }
    
    /**
     * 캠핑장의 리뷰 통계 조회
     * 
     * @param campgroundId 캠핑장 ID
     * @return 리뷰 통계 정보
     */
    @GetMapping("/campground/{campgroundId}/stats")
    @Operation(summary = "캠핑장 리뷰 통계", description = "특정 캠핑장의 리뷰 통계 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 통계 조회 성공")
    })
    public ResponseEntity<Map<String, Object>> getCampgroundReviewStats(@PathVariable Long campgroundId) {
        log.info("Review Get Request : 캠핑장 리뷰 통계 조회: campgroundId={}", campgroundId);
        
        Map<String, Object> stats = reviewService.getCampgroundReviewStats(campgroundId);
        return ResponseEntity.ok(stats);
    }
    
    /**
     * 사용자의 특정 캠핑장 리뷰 조회
     * 
     * @param campgroundId 캠핑장 ID
     * @param userId 사용자 ID (헤더)
     * @return 리뷰 정보 (없으면 404)
     */
    @GetMapping("/campground/{campgroundId}/my")
    @Operation(summary = "내 캠핑장 리뷰", description = "특정 캠핑장에 대한 내 리뷰를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    public ResponseEntity<ReviewResponse> getMyCampgroundReview(
            @PathVariable Long campgroundId,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);

        log.info("User Campground Review Get Request : 사용자 캠핑장 리뷰 조회: userId={}, campgroundId={}", userId, campgroundId);

        ReviewResponse review = reviewService.getUserCampgroundReview(userId, campgroundId);
        if (review != null) {
            return ResponseEntity.ok(review);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * 리뷰 좋아요
     * 
     * @param reviewId 리뷰 ID
     * @param authentication 인증 정보
     * @return 성공 응답
     */
    @PostMapping("/{reviewId}/like")
    @Authenticated
    @Operation(summary = "리뷰 좋아요", description = "리뷰에 좋아요를 추가합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "좋아요 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "이미 좋아요한 리뷰")
    })
    public ResponseEntity<Void> likeReview(
            @PathVariable Long reviewId,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);
        
        log.info("Review Like Request : 리뷰 좋아요 요청: reviewId={}, userId={}", reviewId, userId);
        
        try {
            reviewService.likeReview(reviewId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Review Like Failed : 리뷰 좋아요 실패: {}", e.getMessage());
            if (e.getMessage().contains("Already Liked Review")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            if (e.getMessage().contains("Not Found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 리뷰 좋아요 취소
     * 
     * @param reviewId 리뷰 ID
     * @param authentication 인증 정보
     * @return 성공 응답
     */
    @DeleteMapping("/{reviewId}/like")
    @Authenticated
    @Operation(summary = "리뷰 좋아요 취소", description = "리뷰 좋아요를 취소합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "좋아요 취소 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "404", description = "좋아요를 찾을 수 없음")
    })
    public ResponseEntity<Void> unlikeReview(
            @PathVariable Long reviewId,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);
        
        log.info("Review Unlike Request : 리뷰 좋아요 취소 요청: reviewId={}, userId={}", reviewId, userId);
        
        try {
            reviewService.unlikeReview(reviewId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Review Unlike Failed : 리뷰 좋아요 취소 실패: {}", e.getMessage());
            if (e.getMessage().contains("Not Found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Owner - 내 캠핑장의 모든 리뷰 조회
     * 
     * @param pageable 페이징 정보
     * @param authentication 인증 정보
     * @return 리뷰 목록 (페이징)
     */
    @GetMapping("/owner/reviews")
    @Authenticated
    @Operation(summary = "Owner - 내 캠핑장 리뷰 조회", description = "Owner의 모든 캠핑장에 달린 리뷰를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "리뷰 조회 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    public ResponseEntity<CommonResponse<Page<ReviewResponse>>> getOwnerReviews(
            @PageableDefault(size = 100) Pageable pageable,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long ownerId = userService.getUserIdByEmail(email);
        
        log.info("Owner Reviews Request: ownerId={}", ownerId);
        
        try {
            Page<ReviewResponse> reviews = reviewService.getReviewsByOwnerId(ownerId, pageable);
            return ResponseEntity.ok(CommonResponse.success(reviews));
        } catch (RuntimeException e) {
            log.error("Owner Reviews Failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * 운영자 답글 작성
     */
    @PostMapping("/{reviewId}/reply")
    @Authenticated
    @Operation(summary = "운영자 답글 작성", description = "리뷰에 운영자 답글을 작성합니다. (OWNER, ADMIN만 가능)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "답글 작성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "리뷰를 찾을 수 없음")
    })
    public ResponseEntity<?> createReply(
            @PathVariable Long reviewId,
            @Valid @RequestBody com.campstation.camp.review.dto.ReviewReplyDto.CreateReviewReplyRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);
        
        log.info("Create Review Reply Request: reviewId={}, userId={}", reviewId, userId);
        
        try {
            var response = reviewService.createReply(reviewId, request, userId);
            return ResponseEntity.ok(CommonResponse.success(response));
        } catch (RuntimeException e) {
            log.error("Create Review Reply Failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error(e.getMessage()));
        }
    }

    /**
     * 운영자 답글 수정
     */
    @PutMapping("/{reviewId}/reply/{replyId}")
    @Authenticated
    @Operation(summary = "운영자 답글 수정", description = "리뷰 답글을 수정합니다. (OWNER, ADMIN만 가능)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "답글 수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "답글을 찾을 수 없음")
    })
    public ResponseEntity<?> updateReply(
            @PathVariable Long reviewId,
            @PathVariable Long replyId,
            @Valid @RequestBody com.campstation.camp.review.dto.ReviewReplyDto.UpdateReviewReplyRequest request,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);
        
        log.info("Update Review Reply Request: reviewId={}, replyId={}, userId={}", 
                reviewId, replyId, userId);
        
        try {
            var response = reviewService.updateReply(reviewId, replyId, request, userId);
            return ResponseEntity.ok(CommonResponse.success(response));
        } catch (RuntimeException e) {
            log.error("Update Review Reply Failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error(e.getMessage()));
        }
    }

    /**
     * 운영자 답글 삭제
     */
    @DeleteMapping("/{reviewId}/reply/{replyId}")
    @Authenticated
    @Operation(summary = "운영자 답글 삭제", description = "리뷰 답글을 삭제합니다. (OWNER, ADMIN만 가능)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "답글 삭제 성공"),
        @ApiResponse(responseCode = "401", description = "인증 실패"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "답글을 찾을 수 없음")
    })
    public ResponseEntity<?> deleteReply(
            @PathVariable Long reviewId,
            @PathVariable Long replyId,
            @Parameter(hidden = true) Authentication authentication) {
        
        String email = authentication.getName();
        Long userId = userService.getUserIdByEmail(email);
        
        log.info("Delete Review Reply Request: reviewId={}, replyId={}, userId={}", 
                reviewId, replyId, userId);
        
        try {
            reviewService.deleteReply(reviewId, replyId, userId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Delete Review Reply Failed: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(CommonResponse.error(e.getMessage()));
        }
    }
}


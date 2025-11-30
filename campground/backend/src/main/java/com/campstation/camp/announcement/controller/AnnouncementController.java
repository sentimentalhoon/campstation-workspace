package com.campstation.camp.announcement.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campstation.camp.announcement.domain.AnnouncementType;
import com.campstation.camp.announcement.dto.AnnouncementResponse;
import com.campstation.camp.announcement.dto.CreateAnnouncementRequest;
import com.campstation.camp.announcement.dto.UpdateAnnouncementRequest;
import com.campstation.camp.announcement.service.AnnouncementService;
import com.campstation.camp.shared.dto.CommonResponse;
import com.campstation.camp.shared.security.annotation.OwnerOrAdmin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 공지사항 컨트롤러
 * 캠핑장 공지사항 조회 및 관리 API
 */
@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Announcement", description = "공지사항 API")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    /**
     * 공지사항 목록 조회
     *
     * @param campgroundId 캠핑장 ID
     * @param type 공지사항 타입 (옵션)
     * @return 공지사항 목록
     */
    @GetMapping
    @Operation(summary = "공지사항 목록 조회", description = "캠핑장의 공지사항 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "공지사항 목록 조회 성공")
    })
    public ResponseEntity<CommonResponse<List<AnnouncementResponse>>> getAnnouncements(
            @Parameter(description = "캠핑장 ID", required = true)
            @RequestParam Long campgroundId,
            @Parameter(description = "공지사항 타입 (NOTICE, EVENT, FACILITY, URGENT)")
            @RequestParam(required = false) AnnouncementType type) {

        log.info("Get Announcements Request: campgroundId={}, type={}", campgroundId, type);

        List<AnnouncementResponse> announcements = announcementService.getAnnouncements(campgroundId, type);

        return ResponseEntity.ok(CommonResponse.success("공지사항 목록 조회 성공", announcements));
    }

    /**
     * 공지사항 상세 조회
     *
     * @param announcementId 공지사항 ID
     * @return 공지사항 정보
     */
    @GetMapping("/{announcementId}")
    @Operation(summary = "공지사항 상세 조회", description = "특정 공지사항의 상세 정보를 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "공지사항 조회 성공"),
        @ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<AnnouncementResponse>> getAnnouncement(
            @PathVariable Long announcementId) {

        log.info("Get Announcement Request: announcementId={}", announcementId);

        AnnouncementResponse announcement = announcementService.getAnnouncement(announcementId);

        return ResponseEntity.ok(CommonResponse.success("공지사항 조회 성공", announcement));
    }

    /**
     * 공지사항 생성 (OWNER 또는 ADMIN만 가능)
     *
     * @param request 생성 요청
     * @return 생성된 공지사항 정보
     */
    @PostMapping
    @OwnerOrAdmin
    @Operation(summary = "공지사항 생성", description = "새로운 공지사항을 생성합니다. (OWNER 또는 ADMIN만 가능)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "공지사항 생성 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "캠핑장을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request) {

        log.info("Create Announcement Request: campgroundId={}, title={}",
                request.getCampgroundId(), request.getTitle());

        AnnouncementResponse announcement = announcementService.createAnnouncement(request);

        return ResponseEntity.ok(CommonResponse.success("공지사항 생성 성공", announcement));
    }

    /**
     * 공지사항 수정 (OWNER 또는 ADMIN만 가능)
     *
     * @param announcementId 공지사항 ID
     * @param request 수정 요청
     * @return 수정된 공지사항 정보
     */
    @PutMapping("/{announcementId}")
    @OwnerOrAdmin
    @Operation(summary = "공지사항 수정", description = "공지사항 정보를 수정합니다. (OWNER 또는 ADMIN만 가능)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "공지사항 수정 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable Long announcementId,
            @Valid @RequestBody UpdateAnnouncementRequest request) {

        log.info("Update Announcement Request: announcementId={}", announcementId);

        AnnouncementResponse announcement = announcementService.updateAnnouncement(announcementId, request);

        return ResponseEntity.ok(CommonResponse.success("공지사항 수정 성공", announcement));
    }

    /**
     * 공지사항 삭제 (OWNER 또는 ADMIN만 가능)
     *
     * @param announcementId 공지사항 ID
     * @return 성공 메시지
     */
    @DeleteMapping("/{announcementId}")
    @OwnerOrAdmin
    @Operation(summary = "공지사항 삭제", description = "공지사항을 삭제합니다. (OWNER 또는 ADMIN만 가능)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "공지사항 삭제 성공"),
        @ApiResponse(responseCode = "403", description = "권한 없음"),
        @ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<Void>> deleteAnnouncement(
            @PathVariable Long announcementId) {

        log.info("Delete Announcement Request: announcementId={}", announcementId);

        announcementService.deleteAnnouncement(announcementId);

        return ResponseEntity.ok(CommonResponse.success("공지사항 삭제 성공", null));
    }

    /**
     * 공지사항 조회수 증가
     *
     * @param announcementId 공지사항 ID
     * @return 성공 메시지
     */
    @PostMapping("/{announcementId}/views")
    @Operation(summary = "공지사항 조회수 증가", description = "공지사항의 조회수를 1 증가시킵니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회수 증가 성공"),
        @ApiResponse(responseCode = "404", description = "공지사항을 찾을 수 없음")
    })
    public ResponseEntity<CommonResponse<Void>> incrementViewCount(
            @PathVariable Long announcementId) {

        log.debug("Increment View Count: announcementId={}", announcementId);

        announcementService.incrementViewCount(announcementId);

        return ResponseEntity.ok(CommonResponse.success("조회수 증가 성공", null));
    }
}

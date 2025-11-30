/**
 * 캠핑장 페이지 조회 추적 훅
 *
 * @module hooks/useViewTracker
 * @description 캠핑장 페이지 방문 시 조회수를 자동으로 기록하고, 체류 시간을 추적합니다.
 */

"use client";

import { statsApi } from "@/lib/api";
import { getOrCreateSessionId } from "@/lib/utils/session";
import { useEffect, useRef } from "react";

type UseViewTrackerOptions = {
  enabled?: boolean; // 추적 활성화 여부 (기본값: true)
  trackDuration?: boolean; // 체류 시간 추적 여부 (기본값: true)
};

/**
 * 캠핑장 페이지 조회 추적 훅
 *
 * 페이지 진입 시 조회 기록을 저장하고, 페이지를 떠날 때 체류 시간을 기록합니다.
 *
 * @param campgroundId - 캠핑장 ID
 * @param options - 추적 옵션
 *
 * @example
 * ```tsx
 * function CampgroundDetailPage({ campgroundId }: Props) {
 *   useViewTracker(campgroundId); // 자동으로 조회수 추적
 *
 *   return <div>캠핑장 상세 페이지</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // 조건부 추적
 * function CampgroundDetailPage({ campgroundId, isPreview }: Props) {
 *   useViewTracker(campgroundId, { enabled: !isPreview });
 *
 *   return <div>캠핑장 상세 페이지</div>;
 * }
 * ```
 */
export function useViewTracker(
  campgroundId: number,
  options: UseViewTrackerOptions = {}
) {
  const { enabled = true, trackDuration = true } = options;

  const startTimeRef = useRef<number>(0);
  const sessionIdRef = useRef<string>("");
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // 추적 비활성화 또는 이미 기록한 경우 중단
    if (!enabled || hasTrackedRef.current) return;

    // 세션 ID 생성
    const sessionId = getOrCreateSessionId();
    sessionIdRef.current = sessionId;

    // 진입 시간 기록
    startTimeRef.current = Date.now();

    // 조회 기록 API 호출
    const trackView = async () => {
      try {
        await statsApi.recordView(campgroundId, {
          sessionId,
          referrer: document.referrer || undefined,
        });

        hasTrackedRef.current = true;
      } catch (error) {
        // 조회수 기록 실패는 사용자 경험에 영향을 주지 않으므로 조용히 처리
        console.debug("Failed to record view:", error);
      }
    };

    trackView();

    // 체류 시간 추적 비활성화 시 cleanup 함수 없음
    if (!trackDuration) return;

    // 페이지를 떠날 때 체류 시간 기록
    const handleBeforeUnload = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

      // sendBeacon을 사용하여 비동기로 전송 (페이지 언로드 시에도 보장)
      const url = `/api/v1/campgrounds/${campgroundId}/view-duration`;
      const data = JSON.stringify({ sessionId, duration });

      // navigator.sendBeacon 지원 여부 확인
      if (navigator.sendBeacon) {
        const blob = new Blob([data], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      } else {
        // Fallback: fetch with keepalive
        fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: data,
          keepalive: true, // 페이지 언로드 후에도 요청 유지
        }).catch((error) => {
          console.debug("Failed to record duration:", error);
        });
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup: 컴포넌트 언마운트 시
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // 컴포넌트 언마운트 시에도 체류 시간 기록 (SPA 내부 네비게이션)
      if (startTimeRef.current > 0) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        // 백그라운드에서 비동기 전송
        statsApi
          .recordDuration(campgroundId, {
            sessionId: sessionIdRef.current,
            duration,
          })
          .catch((error) => {
            console.debug("Failed to record duration on unmount:", error);
          });
      }
    };
  }, [campgroundId, enabled, trackDuration]);
}

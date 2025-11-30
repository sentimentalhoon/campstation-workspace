/**
 * 캠핑장 조회수 및 통계 도메인 타입
 */

/**
 * 조회 로그 기록 요청 (POST /v1/campgrounds/{id}/view-log)
 */
export type RecordViewRequest = {
  sessionId: string; // 클라이언트에서 생성한 세션 ID (쿠키)
  referrer?: string; // 유입 경로 (document.referrer)
};

/**
 * 체류 시간 기록 요청 (POST /v1/campgrounds/{id}/view-duration)
 */
export type RecordDurationRequest = {
  sessionId: string;
  duration: number; // 체류 시간 (초)
};

/**
 * 일별 통계 데이터
 */
export type DailyStats = {
  date: string; // ISO 날짜 (YYYY-MM-DD)
  uniqueVisitors: number; // 고유 방문자 수
  totalViews: number; // 총 조회수
  loggedInVisitors: number; // 로그인 사용자 방문
  anonymousVisitors: number; // 비로그인 사용자 방문
  avgViewDuration: number; // 평균 체류 시간 (초)
  reservationsCount: number; // 당일 예약 수
  conversionRate: number; // 전환율 (%)
};

/**
 * 유입 경로 정보
 */
export type ReferrerInfo = {
  source: string; // 유입 경로 (google, naver, direct, etc.)
  count: number; // 방문 횟수
  percentage: number; // 비율 (%)
};

/**
 * 캠핑장 통계 요약 (Owner Dashboard용)
 */
export type CampgroundStats = {
  campgroundId: number;
  period: string; // "최근 30일", "최근 7일" 등
  startDate: string; // ISO 날짜
  endDate: string; // ISO 날짜

  // 방문자 통계
  totalUniqueVisitors: number; // 전체 고유 방문자
  totalViews: number; // 전체 조회수
  avgDailyVisitors: number; // 일평균 방문자
  loggedInVisitorsRate: number; // 로그인 사용자 비율 (%)

  // 행동 지표
  avgViewDuration: number; // 평균 체류 시간 (초)
  bounceRate: number; // 이탈률 (%) - Phase 2

  // 예약 전환
  totalReservations: number; // 전체 예약 수
  conversionRate: number; // 전환율 (%)

  // 일별 데이터
  dailyStats: DailyStats[];

  // 유입 경로 분석
  topReferrers: ReferrerInfo[];
};

/**
 * 통계 조회 파라미터 (GET /v1/campgrounds/{id}/stats)
 */
export type StatsQueryParams = {
  days?: number; // 최근 N일 (기본값: 30)
  startDate?: string; // 시작 날짜 (YYYY-MM-DD)
  endDate?: string; // 종료 날짜 (YYYY-MM-DD)
};

/**
 * 실시간 조회수 응답
 */
export type ViewCountResponse = {
  campgroundId: number;
  viewCount: number; // 24시간 내 조회수
  period: "24h" | "7d" | "30d"; // 조회 기간
};

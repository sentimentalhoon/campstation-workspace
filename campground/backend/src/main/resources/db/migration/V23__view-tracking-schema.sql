-- ============================================================================
-- 캠핑장 조회수 추적 시스템 스키마
-- ============================================================================
-- 목적: 캠핑장 페이지 조회수, 방문자 통계, 체류 시간 추적
-- 생성일: 2025-11-17
-- 버전: V23
-- ============================================================================

-- ============================================================================
-- 1. 캠핑장 조회 로그 테이블 (Raw Data)
-- ============================================================================
-- 목적: 캠핑장 페이지의 모든 조회 기록을 저장
-- 보관 기간: 90일 (cleanup_old_view_logs 함수로 자동 삭제)
-- 데이터 활용: 일별 통계 집계, 실시간 조회수 계산
-- 성능 고려: 인덱스 최적화로 빠른 조회 보장
-- ============================================================================
CREATE TABLE campground_view_logs (
    -- 기본 키
    id BIGSERIAL PRIMARY KEY,

    -- 조회된 캠핑장 (필수)
    campground_id BIGINT NOT NULL,

    -- 조회한 사용자 (로그인한 경우만, 비로그인은 NULL)
    user_id BIGINT NULL,

    -- 세션 ID (필수, 익명 사용자 구분용, 쿠키/브라우저 기반)
    -- 용도: 중복 방문 체크 (24시간 내 같은 세션 = 1회만 카운트)
    session_id VARCHAR(255) NOT NULL,

    -- IP 주소 (IPv4: 15자, IPv6: 45자)
    -- 용도: 지역별 통계, 부정 접근 탐지
    ip_address VARCHAR(45),

    -- User-Agent (브라우저 정보)
    -- 용도: 모바일/데스크톱 비율, 브라우저 통계
    user_agent TEXT,

    -- 유입 경로 (Referrer)
    -- 용도: 검색엔진, SNS, 직접 유입 등 분석
    referrer VARCHAR(500),

    -- 페이지 체류 시간 (초 단위, 기본값 0)
    -- 업데이트: 페이지 이탈 시 sendBeacon으로 전송
    view_duration INTEGER DEFAULT 0,

    -- 조회 시각 (UTC)
    -- 인덱스에 사용되므로 타임존 변환 없이 저장
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 레코드 생성 시각 (UTC)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 외래키 제약조건
    -- 캠핑장 삭제 시 조회 로그도 함께 삭제 (CASCADE)
    CONSTRAINT fk_campground FOREIGN KEY (campground_id)
        REFERENCES campgrounds(id) ON DELETE CASCADE,

    -- 사용자 삭제 시 조회 로그는 유지하되 user_id를 NULL로 변경
    CONSTRAINT fk_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- 조회 로그 인덱스 (성능 최적화)
-- ============================================================================

-- [인덱스 1] 캠핑장별 조회 기록 조회 (시간순 정렬)
-- 용도: 특정 캠핑장의 조회 기록을 최신순으로 조회
-- 쿼리 예시: SELECT * FROM campground_view_logs WHERE campground_id = ? ORDER BY viewed_at DESC
CREATE INDEX idx_campground_viewed_at
    ON campground_view_logs(campground_id, viewed_at DESC);

-- [인덱스 2] 중복 방문 체크 (24시간 내 같은 세션)
-- 용도: 24시간 내 같은 세션의 재방문 체크
-- 쿼리 예시: SELECT * FROM campground_view_logs WHERE session_id = ? AND campground_id = ? AND viewed_at > NOW() - INTERVAL '24 hours'
CREATE INDEX idx_session_campground_viewed
    ON campground_view_logs(session_id, campground_id, viewed_at DESC);

-- [인덱스 3] 사용자별 조회 기록 (로그인 사용자만)
-- 용도: 로그인한 사용자의 조회 이력 추적
-- 부분 인덱스: user_id가 NULL이 아닌 경우만 인덱스 생성 (공간 절약)
-- 쿼리 예시: SELECT * FROM campground_view_logs WHERE user_id = ? ORDER BY viewed_at DESC
CREATE INDEX idx_user_viewed_at
    ON campground_view_logs(user_id, viewed_at DESC)
    WHERE user_id IS NOT NULL;

-- [인덱스 4] 일별 집계용 인덱스 (날짜 기준)
-- 용도: aggregate_daily_stats 함수에서 일별 통계 집계 시 사용
-- 주의: UTC 기준으로 인덱스 생성 (AT TIME ZONE은 IMMUTABLE이 아니므로 제외)
-- 쿼리 예시: SELECT * FROM campground_view_logs WHERE campground_id = ? AND DATE(viewed_at) = ?
CREATE INDEX idx_viewed_date
    ON campground_view_logs(campground_id, DATE(viewed_at));

-- ============================================================================
-- 2. 캠핑장 일별 통계 테이블 (Aggregated Data)
-- ============================================================================
-- 목적: 일별 통계를 미리 집계하여 조회 성능 향상
-- 업데이트 주기: 매일 자정 (aggregate_daily_stats 함수 실행)
-- 데이터 활용: Owner 대시보드, 통계 차트
-- 캐싱 권장: Redis 10분 TTL (실시간성 보장)
-- ============================================================================
CREATE TABLE campground_stats_daily (
    -- 기본 키
    id BIGSERIAL PRIMARY KEY,

    -- 통계 대상 캠핑장 (필수)
    campground_id BIGINT NOT NULL,

    -- 통계 날짜 (KST 기준, 예: 2025-11-17)
    -- 유니크 제약: 하나의 캠핑장 + 날짜는 1개의 레코드만 허용
    stat_date DATE NOT NULL,

    -- 고유 방문자 수 (session_id 기준 중복 제거)
    -- 예: 같은 사용자가 하루에 3번 방문 = 1명으로 카운트
    unique_visitors INTEGER DEFAULT 0,

    -- 총 조회수 (페이지뷰 수, 중복 포함)
    -- 예: 같은 사용자가 하루에 3번 방문 = 3회로 카운트
    total_views INTEGER DEFAULT 0,

    -- 로그인한 사용자의 방문 수 (user_id가 NULL이 아닌 경우)
    logged_in_visitors INTEGER DEFAULT 0,

    -- 비로그인 사용자의 방문 수 (user_id가 NULL인 경우)
    anonymous_visitors INTEGER DEFAULT 0,

    -- 평균 체류 시간 (초 단위)
    -- 계산 방식: SUM(view_duration) / COUNT(unique_visitors)
    avg_view_duration INTEGER DEFAULT 0,

    -- 당일 예약 완료 수 (Phase 2에서 구현 예정)
    -- 현재는 0으로 설정, 추후 reservations 테이블과 조인하여 계산
    reservations_count INTEGER DEFAULT 0,

    -- 예약 전환율 (예약 수 / 방문자 수 * 100)
    -- 예: 방문자 100명 중 5명 예약 = 5.00%
    -- DECIMAL(5,2): 최대 999.99까지 표현 가능
    conversion_rate DECIMAL(5,2) DEFAULT 0.00,

    -- 레코드 생성 시각 (UTC)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 레코드 수정 시각 (UTC, 통계 재집계 시 업데이트)
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 외래키 제약조건
    -- 캠핑장 삭제 시 통계도 함께 삭제 (CASCADE)
    CONSTRAINT fk_campground_stats FOREIGN KEY (campground_id)
        REFERENCES campgrounds(id) ON DELETE CASCADE,

    -- 유니크 제약: 하나의 캠핑장 + 날짜는 1개의 레코드만 존재
    -- 예: campground_id=1, stat_date='2025-11-17'은 1개만 허용
    CONSTRAINT unique_campground_date UNIQUE (campground_id, stat_date)
);

-- ============================================================================
-- 일별 통계 인덱스 (조회 성능 최적화)
-- ============================================================================

-- [인덱스 1] 캠핑장별 날짜 범위 조회 (최신순 정렬)
-- 용도: 특정 캠핑장의 기간별 통계 조회 (예: 최근 30일)
-- 쿼리 예시: SELECT * FROM campground_stats_daily WHERE campground_id = ? AND stat_date >= ? ORDER BY stat_date DESC
CREATE INDEX idx_stats_campground_date
    ON campground_stats_daily(campground_id, stat_date DESC);

-- [인덱스 2] 날짜별 전체 통계 조회
-- 용도: 특정 날짜의 전체 캠핑장 통계 조회
-- 쿼리 예시: SELECT * FROM campground_stats_daily WHERE stat_date = ? ORDER BY stat_date DESC
CREATE INDEX idx_stats_date
    ON campground_stats_daily(stat_date DESC);

-- ============================================================================
-- 3. 일별 통계 집계 함수
-- ============================================================================
-- 함수명: aggregate_daily_stats
-- 매개변수: target_date (집계 대상 날짜, KST 기준)
-- 실행 주기: 매일 자정 (Spring @Scheduled, cron: 0 0 0 * * *)
-- 처리 방식: 전날 데이터를 집계하여 campground_stats_daily에 INSERT/UPDATE
-- 멱등성: ON CONFLICT 사용으로 중복 실행 시 UPDATE (안전함)
-- 트랜잭션: 원자성 보장 (전체 성공 또는 전체 실패)
-- ============================================================================
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date DATE)
RETURNS void AS $$
BEGIN
    -- campground_stats_daily 테이블에 일별 통계 삽입 (또는 업데이트)
    INSERT INTO campground_stats_daily (
        campground_id,              -- 캠핑장 ID
        stat_date,                  -- 통계 날짜
        unique_visitors,            -- 고유 방문자 수
        total_views,                -- 총 조회수
        logged_in_visitors,         -- 로그인 방문자 수
        anonymous_visitors,         -- 익명 방문자 수
        avg_view_duration,          -- 평균 체류 시간
        reservations_count,         -- 예약 수 (Phase 2)
        conversion_rate             -- 전환율 (Phase 2)
    )
    SELECT
        l.campground_id,
        target_date,

        -- 고유 방문자 수: session_id 기준 중복 제거
        COUNT(DISTINCT l.session_id) AS unique_visitors,

        -- 총 조회수: 모든 레코드 카운트 (중복 포함)
        COUNT(*) AS total_views,

        -- 로그인 방문자 수: user_id가 NULL이 아닌 session_id
        COUNT(DISTINCT CASE WHEN l.user_id IS NOT NULL THEN l.session_id END) AS logged_in_visitors,

        -- 익명 방문자 수: user_id가 NULL인 session_id
        COUNT(DISTINCT CASE WHEN l.user_id IS NULL THEN l.session_id END) AS anonymous_visitors,

        -- 평균 체류 시간: NULL 처리 후 정수로 변환
        COALESCE(AVG(l.view_duration), 0)::INTEGER AS avg_view_duration,

        -- 예약 수: Phase 2에서 구현 예정 (현재는 0)
        -- 추후 구현 예시:
        -- (SELECT COUNT(*) FROM reservations r
        --  WHERE r.campground_id = l.campground_id
        --  AND DATE(r.created_at AT TIME ZONE 'Asia/Seoul') = target_date)
        0 AS reservations_count,

        -- 전환율: Phase 2에서 구현 예정 (현재는 0.00)
        0.00 AS conversion_rate
    FROM
        campground_view_logs l
    WHERE
        -- KST 기준으로 날짜 필터링
        -- viewed_at은 UTC로 저장되어 있으므로 'Asia/Seoul' 타임존으로 변환
        DATE(l.viewed_at AT TIME ZONE 'Asia/Seoul') = target_date
    GROUP BY
        l.campground_id

    -- 중복 시 업데이트 (멱등성 보장)
    -- unique_campground_date 제약조건에 의해 같은 campground_id + stat_date는 중복 불가
    ON CONFLICT (campground_id, stat_date)
    DO UPDATE SET
        unique_visitors = EXCLUDED.unique_visitors,
        total_views = EXCLUDED.total_views,
        logged_in_visitors = EXCLUDED.logged_in_visitors,
        anonymous_visitors = EXCLUDED.anonymous_visitors,
        avg_view_duration = EXCLUDED.avg_view_duration,
        reservations_count = EXCLUDED.reservations_count,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = CURRENT_TIMESTAMP;  -- 업데이트 시각 갱신
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. 오래된 로그 정리 함수
-- ============================================================================
-- 함수명: cleanup_old_view_logs
-- 실행 주기: 매주 일요일 자정 (Spring @Scheduled, cron: 0 0 0 * * SUN)
-- 처리 방식: 90일 이상 오래된 조회 로그 삭제
-- GDPR 준수: 개인 식별 가능 데이터(IP, User-Agent)는 90일 후 자동 삭제
-- 성능 영향: 대량 삭제 시 부하 발생 가능 (주말 새벽 실행 권장)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_old_view_logs()
RETURNS void AS $$
BEGIN
    -- 90일 이상 오래된 조회 로그 삭제
    -- viewed_at이 현재 시각 - 90일보다 이전인 레코드 삭제
    DELETE FROM campground_view_logs
    WHERE viewed_at < CURRENT_TIMESTAMP - INTERVAL '90 days';

    -- 삭제된 행 수를 로그로 출력 (PostgreSQL 로그에 기록됨)
    -- RAISE NOTICE는 애플리케이션에서 확인 가능
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 마이그레이션 완료
-- ============================================================================
-- 생성된 오브젝트:
-- - 테이블: campground_view_logs, campground_stats_daily
-- - 인덱스: 6개 (성능 최적화)
-- - 함수: aggregate_daily_stats, cleanup_old_view_logs
--
-- 다음 단계:
-- 1. 백엔드 API 배포 (POST /api/v1/campgrounds/{id}/view-log)
-- 2. 프론트엔드 배포 (useViewTracker 훅 적용)
-- 3. 스케줄러 확인 (StatsScheduler.java 실행 확인)
-- ============================================================================

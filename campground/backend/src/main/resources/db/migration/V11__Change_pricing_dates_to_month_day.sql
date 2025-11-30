-- site_pricing 테이블의 날짜 필드를 년-월-일에서 월-일로 변경
-- 기존 start_date, end_date를 start_month, start_day, end_month, end_day로 분리

-- 1. 새로운 컬럼 추가
ALTER TABLE site_pricing 
ADD COLUMN start_month INTEGER,
ADD COLUMN start_day INTEGER,
ADD COLUMN end_month INTEGER,
ADD COLUMN end_day INTEGER;

-- 2. 기존 데이터 마이그레이션 (년도 제거, 월-일만 추출)
UPDATE site_pricing 
SET 
    start_month = EXTRACT(MONTH FROM start_date),
    start_day = EXTRACT(DAY FROM start_date),
    end_month = EXTRACT(MONTH FROM end_date),
    end_day = EXTRACT(DAY FROM end_date)
WHERE start_date IS NOT NULL AND end_date IS NOT NULL;

-- 3. 기존 컬럼 삭제
ALTER TABLE site_pricing 
DROP COLUMN start_date,
DROP COLUMN end_date;

-- 4. 제약 조건 추가
ALTER TABLE site_pricing
ADD CONSTRAINT check_start_month CHECK (start_month IS NULL OR (start_month >= 1 AND start_month <= 12)),
ADD CONSTRAINT check_start_day CHECK (start_day IS NULL OR (start_day >= 1 AND start_day <= 31)),
ADD CONSTRAINT check_end_month CHECK (end_month IS NULL OR (end_month >= 1 AND end_month <= 12)),
ADD CONSTRAINT check_end_day CHECK (end_day IS NULL OR (end_day >= 1 AND end_day <= 31));

-- 5. 코멘트 추가
COMMENT ON COLUMN site_pricing.start_month IS '적용 시작 월 (1-12)';
COMMENT ON COLUMN site_pricing.start_day IS '적용 시작 일 (1-31)';
COMMENT ON COLUMN site_pricing.end_month IS '적용 종료 월 (1-12)';
COMMENT ON COLUMN site_pricing.end_day IS '적용 종료 일 (1-31)';

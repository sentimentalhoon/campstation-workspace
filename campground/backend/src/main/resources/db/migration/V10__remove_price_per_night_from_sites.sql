-- V10: sites 테이블에서 price_per_night 컬럼 제거
-- 이제 요금은 site_pricing 테이블에서 관리됨

ALTER TABLE sites DROP COLUMN price_per_night;

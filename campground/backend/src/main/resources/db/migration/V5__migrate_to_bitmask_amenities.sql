-- Migration: Bitmask 방식으로 편의시설 관리 전환
-- V5__migrate_to_bitmask_amenities.sql

-- 1단계: sites 테이블에 amenities_flags 컬럼 추가
ALTER TABLE sites ADD COLUMN amenities_flags BIGINT NOT NULL DEFAULT 0;

-- 2단계: 기존 site_amenities 데이터를 비트마스크로 변환
-- 각 AmenityType의 ordinal 값을 사용하여 비트 플래그 계산
UPDATE sites s
SET amenities_flags = COALESCE((
    SELECT SUM(POWER(2, 
        CASE sa.amenity_type
            -- 기본 인프라 (0-7)
            WHEN 'ELECTRICITY' THEN 0
            WHEN 'WATER' THEN 1
            WHEN 'SEWER' THEN 2
            WHEN 'WIFI' THEN 3
            WHEN 'INTERNET' THEN 4
            WHEN 'PHONE' THEN 5
            -- 위생 시설 (8-15)
            WHEN 'TOILET' THEN 8
            WHEN 'SHOWER' THEN 9
            WHEN 'SINK' THEN 10
            WHEN 'LAUNDRY' THEN 11
            WHEN 'WASHING_MACHINE' THEN 12
            WHEN 'DRYER' THEN 13
            -- 취사 시설 (16-23)
            WHEN 'BBQ' THEN 16
            WHEN 'FIRE_PIT' THEN 17
            WHEN 'KITCHEN' THEN 18
            WHEN 'MICROWAVE' THEN 19
            WHEN 'REFRIGERATOR' THEN 20
            WHEN 'COOKING_UTENSILS' THEN 21
            WHEN 'FIREWOOD' THEN 22
            -- 냉난방 (24-27)
            WHEN 'HEATING' THEN 24
            WHEN 'AIR_CONDITIONING' THEN 25
            -- 숙박 편의 (28-35)
            WHEN 'TENT' THEN 28
            WHEN 'BEDDING' THEN 29
            WHEN 'TV' THEN 30
            -- 접근성 (36-39)
            WHEN 'VEHICLE_ACCESS' THEN 36
            WHEN 'PARKING' THEN 37
            -- 안전/보안 (40-43)
            WHEN 'SECURITY' THEN 40
            WHEN 'CCTV' THEN 41
            WHEN 'FIRST_AID' THEN 42
            WHEN 'FIRE_EXTINGUISHER' THEN 43
            -- 부대시설 (44-51)
            WHEN 'STORE' THEN 44
            WHEN 'RESTAURANT' THEN 45
            WHEN 'PLAYGROUND' THEN 46
            -- 레저 시설 (52-59)
            WHEN 'POOL' THEN 52
            WHEN 'GYM' THEN 53
            -- 기타 (60-63)
            WHEN 'PET_FRIENDLY' THEN 60
            WHEN 'GENERATOR' THEN 61
            ELSE -1  -- 지원하지 않는 타입은 무시
        END
    ))
    FROM site_amenities sa
    WHERE sa.site_id = s.id
      AND sa.available = true
      AND CASE sa.amenity_type
            WHEN 'ELECTRICITY' THEN 0
            WHEN 'WATER' THEN 1
            WHEN 'SEWER' THEN 2
            WHEN 'WIFI' THEN 3
            WHEN 'INTERNET' THEN 4
            WHEN 'PHONE' THEN 5
            WHEN 'TOILET' THEN 8
            WHEN 'SHOWER' THEN 9
            WHEN 'SINK' THEN 10
            WHEN 'LAUNDRY' THEN 11
            WHEN 'WASHING_MACHINE' THEN 12
            WHEN 'DRYER' THEN 13
            WHEN 'BBQ' THEN 16
            WHEN 'FIRE_PIT' THEN 17
            WHEN 'KITCHEN' THEN 18
            WHEN 'MICROWAVE' THEN 19
            WHEN 'REFRIGERATOR' THEN 20
            WHEN 'COOKING_UTENSILS' THEN 21
            WHEN 'FIREWOOD' THEN 22
            WHEN 'HEATING' THEN 24
            WHEN 'AIR_CONDITIONING' THEN 25
            WHEN 'TENT' THEN 28
            WHEN 'BEDDING' THEN 29
            WHEN 'TV' THEN 30
            WHEN 'VEHICLE_ACCESS' THEN 36
            WHEN 'PARKING' THEN 37
            WHEN 'SECURITY' THEN 40
            WHEN 'CCTV' THEN 41
            WHEN 'FIRST_AID' THEN 42
            WHEN 'FIRE_EXTINGUISHER' THEN 43
            WHEN 'STORE' THEN 44
            WHEN 'RESTAURANT' THEN 45
            WHEN 'PLAYGROUND' THEN 46
            WHEN 'POOL' THEN 52
            WHEN 'GYM' THEN 53
            WHEN 'PET_FRIENDLY' THEN 60
            WHEN 'GENERATOR' THEN 61
            ELSE -1
        END >= 0
), 0);

-- 3단계: site_amenities 테이블 백업 (롤백 대비)
ALTER TABLE site_amenities RENAME TO site_amenities_backup;

-- 4단계: 인덱스 생성 (비트 연산 쿼리 최적화)
CREATE INDEX idx_sites_amenities_flags ON sites(amenities_flags);

-- 마이그레이션 완료 확인 쿼리 (수동 실행)
-- SELECT id, site_number, amenities_flags FROM sites LIMIT 10;
-- SELECT COUNT(*) FROM site_amenities_backup;

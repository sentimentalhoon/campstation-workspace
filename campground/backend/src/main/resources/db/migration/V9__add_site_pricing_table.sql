-- V9__add_site_pricing_table.sql
-- 사이트별 다양한 요금제 관리 테이블 추가

-- site_pricing 테이블 생성
CREATE TABLE site_pricing (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    
    -- 기본 정보
    pricing_name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    rule_type VARCHAR(20) NOT NULL DEFAULT 'BASE',
    
    -- 기본 요금
    base_price DECIMAL(10,2) NOT NULL,
    weekend_price DECIMAL(10,2),
    day_multipliers TEXT,
    
    -- 인원 정책
    base_guests INTEGER NOT NULL DEFAULT 2,
    max_guests INTEGER NOT NULL DEFAULT 4,
    extra_guest_fee DECIMAL(10,2),
    
    -- 시즌/기간 설정
    season_type VARCHAR(20),
    start_date DATE,
    end_date DATE,
    
    -- 할인 정책
    long_stay_discount_rate DECIMAL(5,2),
    long_stay_min_nights INTEGER DEFAULT 3,
    extended_stay_discount_rate DECIMAL(5,2),
    extended_stay_min_nights INTEGER DEFAULT 7,
    early_bird_discount_rate DECIMAL(5,2),
    early_bird_min_days INTEGER DEFAULT 30,
    
    -- 우선순위 및 상태
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- BaseEntity 컬럼
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_site_pricing_site_id ON site_pricing(site_id);
CREATE INDEX idx_site_pricing_dates ON site_pricing(start_date, end_date);
CREATE INDEX idx_site_pricing_priority ON site_pricing(priority DESC);
CREATE INDEX idx_site_pricing_active ON site_pricing(is_active);
CREATE INDEX idx_site_pricing_rule_type ON site_pricing(rule_type);

-- 기존 사이트에 기본 요금제 추가 (50,000원)
-- 모든 사이트에 BASE 타입의 기본 요금제 생성
INSERT INTO site_pricing (
    site_id,
    pricing_name,
    description,
    rule_type,
    base_price,
    weekend_price,
    base_guests,
    max_guests,
    extra_guest_fee,
    priority,
    is_active
)
SELECT 
    id,
    '기본 요금제',
    '사이트의 기본 1박 요금입니다.',
    'BASE',
    50000.00,
    70000.00, -- 주말 요금 (금토) 40% 할증
    2,
    4,
    10000.00, -- 추가 인원당 10,000원
    0,
    true
FROM sites
WHERE deleted_at IS NULL;

-- 성수기 요금제 예시 (7~8월)
-- 모든 사이트에 SEASONAL 타입의 성수기 요금제 생성
INSERT INTO site_pricing (
    site_id,
    pricing_name,
    description,
    rule_type,
    base_price,
    weekend_price,
    base_guests,
    max_guests,
    extra_guest_fee,
    season_type,
    long_stay_discount_rate,
    long_stay_min_nights,
    priority,
    is_active
)
SELECT 
    id,
    '여름 성수기 요금',
    '7~8월 여름 휴가철 성수기 요금입니다.',
    'SEASONAL',
    80000.00,
    100000.00, -- 주말 25% 할증
    2,
    4,
    15000.00, -- 추가 인원당 15,000원
    'PEAK',
    5.00, -- 3박 이상 5% 할인
    3,
    10, -- 기본 요금제보다 높은 우선순위
    true
FROM sites
WHERE deleted_at IS NULL;

-- 코멘트 추가
COMMENT ON TABLE site_pricing IS '사이트별 요금제 관리 테이블';
COMMENT ON COLUMN site_pricing.rule_type IS '요금 규칙 타입: BASE(기본), SEASONAL(시즌별), DATE_RANGE(기간지정), SPECIAL_EVENT(특별이벤트)';
COMMENT ON COLUMN site_pricing.season_type IS '시즌 타입: PEAK(성수기), HIGH(준성수기), NORMAL(평시), LOW(비수기)';
COMMENT ON COLUMN site_pricing.priority IS '우선순위 (높을수록 우선 적용)';
COMMENT ON COLUMN site_pricing.day_multipliers IS '요일별 가격 배율 (JSON 형식)';

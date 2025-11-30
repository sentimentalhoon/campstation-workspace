-- V10: 예약 가격 상세 내역 추가
-- 1. reservations 테이블에 price_breakdown JSONB 컬럼 추가
-- 2. reservation_price_items 테이블 생성 (분석/리포팅용)

-- 1. reservations 테이블에 JSONB 컬럼 추가
ALTER TABLE reservations
ADD COLUMN price_breakdown JSONB;

COMMENT ON COLUMN reservations.price_breakdown IS '가격 상세 내역 스냅샷 (JSON)';

-- 2. reservation_price_items 테이블 생성
CREATE TABLE reservation_price_items (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1.0,
    unit_price DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    display_order INT DEFAULT 0,
    applied_pricing_id BIGINT REFERENCES site_pricing(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_reservation_price_items_reservation_id ON reservation_price_items(reservation_id);
CREATE INDEX idx_reservation_price_items_item_type ON reservation_price_items(item_type);
CREATE INDEX idx_reservation_price_items_created_at ON reservation_price_items(created_at);

-- 코멘트 추가
COMMENT ON TABLE reservation_price_items IS '예약 가격 항목 상세 (분석/리포팅용)';
COMMENT ON COLUMN reservation_price_items.item_type IS '항목 타입 (BASE_PRICE, WEEKEND_SURCHARGE, etc.)';
COMMENT ON COLUMN reservation_price_items.item_name IS '항목 표시 이름';
COMMENT ON COLUMN reservation_price_items.quantity IS '수량 (박수, 인원 등)';
COMMENT ON COLUMN reservation_price_items.unit_price IS '단가';
COMMENT ON COLUMN reservation_price_items.amount IS '총액 (할인은 음수)';
COMMENT ON COLUMN reservation_price_items.display_order IS '화면 표시 순서';
COMMENT ON COLUMN reservation_price_items.applied_pricing_id IS '적용된 요금제 ID (참조용)';

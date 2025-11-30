-- V15: Add reservation_id to reviews table
-- 예약별 리뷰 작성을 위한 reservation_id 컬럼 추가
-- nullable=true (기존 리뷰 데이터 호환성)

ALTER TABLE reviews
ADD COLUMN reservation_id BIGINT;

-- Foreign key constraint
ALTER TABLE reviews
ADD CONSTRAINT fk_reviews_reservation
FOREIGN KEY (reservation_id)
REFERENCES reservations(id)
ON DELETE SET NULL;

-- Index for performance
CREATE INDEX idx_reviews_reservation_id ON reviews(reservation_id);
CREATE INDEX idx_reviews_user_reservation ON reviews(user_id, reservation_id);

-- Comment
COMMENT ON COLUMN reviews.reservation_id IS '예약 ID (여러 번 방문 시 각 예약마다 리뷰 작성 가능)';

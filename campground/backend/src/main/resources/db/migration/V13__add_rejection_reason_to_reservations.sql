-- V13: 예약 거부 사유 필드 추가
-- Author: CampStation Team
-- Date: 2025-11-04

ALTER TABLE reservations ADD COLUMN rejection_reason VARCHAR(500);

COMMENT ON COLUMN reservations.rejection_reason IS '예약 거부 사유 (최대 500자)';

-- =====================================================
-- Add operation type and certification to campgrounds table
-- Version: 22.0
-- Date: 2025-11-17
-- =====================================================

-- Add operation_type and certification columns
ALTER TABLE campgrounds
ADD COLUMN operation_type VARCHAR(20),
ADD COLUMN certification VARCHAR(20);

-- Column comments
COMMENT ON COLUMN campgrounds.operation_type IS '운영 주체 (DIRECT: 직영, PARTNER: 제휴, PRIVATE: 개인, FRANCHISE: 프랜차이즈) / Operation type';
COMMENT ON COLUMN campgrounds.certification IS '인증/등급 (PREMIUM: 프리미엄, CERTIFIED: 공식 인증, STANDARD: 일반, NEW: 신규) / Certification level';

-- Indexes for filtering performance
CREATE INDEX idx_campgrounds_operation_type ON campgrounds(operation_type);
CREATE INDEX idx_campgrounds_certification ON campgrounds(certification);

-- Check constraints for data integrity
ALTER TABLE campgrounds
ADD CONSTRAINT chk_campgrounds_operation_type
CHECK (operation_type IN ('DIRECT', 'PARTNER', 'PRIVATE', 'FRANCHISE') OR operation_type IS NULL);

ALTER TABLE campgrounds
ADD CONSTRAINT chk_campgrounds_certification
CHECK (certification IN ('PREMIUM', 'CERTIFIED', 'STANDARD', 'NEW') OR certification IS NULL);

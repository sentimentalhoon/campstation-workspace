-- =====================================================
-- Add check-in/check-out times and business information to campgrounds table
-- Version: 4.0
-- Date: 2025-11-01
-- =====================================================

-- Add check-in and check-out time columns
ALTER TABLE campgrounds
ADD COLUMN check_in_time TIME DEFAULT '14:00:00',
ADD COLUMN check_out_time TIME DEFAULT '11:00:00';

-- Add business information columns
ALTER TABLE campgrounds
ADD COLUMN business_owner_name VARCHAR(100),
ADD COLUMN business_name VARCHAR(200),
ADD COLUMN business_address VARCHAR(300),
ADD COLUMN business_email VARCHAR(100),
ADD COLUMN business_registration_number VARCHAR(50),
ADD COLUMN tourism_business_number VARCHAR(50);

-- Column comments for check-in/check-out
COMMENT ON COLUMN campgrounds.check_in_time IS '체크인 시간 / Check-in time';
COMMENT ON COLUMN campgrounds.check_out_time IS '체크아웃 시간 / Check-out time';

-- Column comments for business information
COMMENT ON COLUMN campgrounds.business_owner_name IS '대표자명 / Business owner name';
COMMENT ON COLUMN campgrounds.business_name IS '상호명 / Business name';
COMMENT ON COLUMN campgrounds.business_address IS '사업자 주소 / Business address';
COMMENT ON COLUMN campgrounds.business_email IS '사업자 이메일 / Business email';
COMMENT ON COLUMN campgrounds.business_registration_number IS '사업자 등록번호 / Business registration number';
COMMENT ON COLUMN campgrounds.tourism_business_number IS '관광사업(야영장) 등록번호 / Tourism business (camping) registration number';

-- 이미지 저장 방식 통일: 모두 별도 테이블로 관리
-- Campground는 이미 campground_images 테이블 사용 중

-- 1. 리뷰 이미지 테이블 생성
CREATE TABLE IF NOT EXISTS review_images (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_images_review_id ON review_images(review_id);

-- 2. 프로필 이미지 테이블 생성
CREATE TABLE IF NOT EXISTS profile_images (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    thumbnail_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_images_user_id ON profile_images(user_id);

-- 3. 기존 데이터 마이그레이션
-- reviews 테이블의 images (jsonb) 컬럼에서 데이터 추출하여 review_images 테이블로 이동
-- Note: 실제 데이터가 있다면 수동으로 마이그레이션 스크립트 작성 필요

-- 4. users 테이블의 profile_image 컬럼에서 데이터 추출하여 profile_images 테이블로 이동
-- Note: 실제 데이터가 있다면 수동으로 마이그레이션 스크립트 작성 필요

-- 5. 기존 컬럼 삭제
ALTER TABLE reviews DROP COLUMN IF EXISTS images;
ALTER TABLE users DROP COLUMN IF EXISTS profile_image;

COMMENT ON TABLE review_images IS '리뷰 이미지 (원본 + 썸네일)';
COMMENT ON TABLE profile_images IS '프로필 이미지 (원본 + 썸네일)';

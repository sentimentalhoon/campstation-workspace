-- V17: 사이트 이미지 테이블 추가
-- 설명: 각 캠핑장 사이트(구역)에 여러 이미지를 추가할 수 있도록 site_images 테이블 생성

CREATE TABLE IF NOT EXISTS site_images (
    id BIGSERIAL PRIMARY KEY,
    site_id BIGINT NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_site_images_site FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_site_images_site_id ON site_images(site_id);
CREATE INDEX IF NOT EXISTS idx_site_images_display_order ON site_images(display_order);

-- updated_at 자동 업데이트를 위한 트리거 함수 생성
CREATE OR REPLACE FUNCTION update_site_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 생성
CREATE TRIGGER trigger_update_site_images_updated_at
    BEFORE UPDATE ON site_images
    FOR EACH ROW
    EXECUTE FUNCTION update_site_images_updated_at();

-- 테이블 코멘트
COMMENT ON TABLE site_images IS '사이트 이미지 정보';
COMMENT ON COLUMN site_images.original_url IS '원본 이미지 S3 URL';
COMMENT ON COLUMN site_images.thumbnail_url IS '썸네일 이미지 S3 URL';
COMMENT ON COLUMN site_images.file_name IS '원본 파일명';
COMMENT ON COLUMN site_images.file_size IS '파일 크기 (bytes)';
COMMENT ON COLUMN site_images.content_type IS 'MIME 타입 (image/jpeg, image/png 등)';
COMMENT ON COLUMN site_images.display_order IS '표시 순서 (0부터 시작)';
COMMENT ON COLUMN site_images.created_at IS '생성 일시';
COMMENT ON COLUMN site_images.updated_at IS '수정 일시';

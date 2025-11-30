-- =====================================================
-- Announcement Images Table (공지사항 이미지 테이블)
-- PostgreSQL Migration Script
-- =====================================================

-- 공지사항 이미지 테이블 생성
CREATE TABLE IF NOT EXISTS announcement_images (
    id BIGSERIAL PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    original_url VARCHAR(500) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_announcement_images_announcement
        FOREIGN KEY (announcement_id)
        REFERENCES announcements(id)
        ON DELETE CASCADE
);

-- Table comment
COMMENT ON TABLE announcement_images IS '공지사항 이미지 (원본 + 썸네일) / Announcement images (original + thumbnail)';

-- Column comments
COMMENT ON COLUMN announcement_images.id IS '이미지 고유 ID / Image unique ID';
COMMENT ON COLUMN announcement_images.announcement_id IS '공지사항 ID / Announcement ID';
COMMENT ON COLUMN announcement_images.thumbnail_url IS '썸네일 이미지 URL / Thumbnail image URL';
COMMENT ON COLUMN announcement_images.original_url IS '원본 이미지 URL / Original image URL';
COMMENT ON COLUMN announcement_images.display_order IS '표시 순서 / Display order';
COMMENT ON COLUMN announcement_images.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN announcement_images.updated_at IS '수정 일시 / Updated timestamp';

-- Indexes for announcement_images table
CREATE INDEX idx_announcement_images_announcement_id ON announcement_images(announcement_id);
CREATE INDEX idx_announcement_images_display_order ON announcement_images(display_order);

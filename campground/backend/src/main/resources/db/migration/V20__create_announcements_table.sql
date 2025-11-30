-- =====================================================
-- Announcement Table (공지사항 테이블)
-- PostgreSQL Migration Script
-- =====================================================

-- 공지사항 테이블 생성
CREATE TABLE IF NOT EXISTS announcements (
    id BIGSERIAL PRIMARY KEY,
    campground_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    view_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign key constraint
    CONSTRAINT fk_announcements_campground
        FOREIGN KEY (campground_id)
        REFERENCES campgrounds(id)
        ON DELETE CASCADE
);

-- Table comment
COMMENT ON TABLE announcements IS '캠핑장 공지사항 / Campground announcements';

-- Column comments
COMMENT ON COLUMN announcements.id IS '공지사항 고유 ID / Announcement unique ID';
COMMENT ON COLUMN announcements.campground_id IS '캠핑장 ID / Campground ID';
COMMENT ON COLUMN announcements.title IS '공지사항 제목 / Announcement title';
COMMENT ON COLUMN announcements.content IS '공지사항 내용 / Announcement content';
COMMENT ON COLUMN announcements.type IS '공지사항 타입 (NOTICE, EVENT, FACILITY, URGENT) / Announcement type';
COMMENT ON COLUMN announcements.is_pinned IS '상단 고정 여부 / Whether pinned to top';
COMMENT ON COLUMN announcements.view_count IS '조회수 / View count';
COMMENT ON COLUMN announcements.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN announcements.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN announcements.deleted_at IS '삭제 일시 (소프트 삭제) / Deleted timestamp';

-- Indexes for announcements table
CREATE INDEX idx_announcements_campground_id ON announcements(campground_id);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_is_pinned ON announcements(is_pinned);
CREATE INDEX idx_announcements_created_at ON announcements(created_at);
CREATE INDEX idx_announcements_deleted_at ON announcements(deleted_at);

-- Composite index for common query patterns (캠핑장별 + 삭제되지 않은 + 정렬)
CREATE INDEX idx_announcements_campground_active
    ON announcements(campground_id, deleted_at, is_pinned DESC, created_at DESC);

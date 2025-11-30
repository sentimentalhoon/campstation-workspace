-- =====================================================
-- Banner Table (배너 테이블)
-- PostgreSQL Migration Script
-- =====================================================

-- 배너 테이블 생성
CREATE TABLE IF NOT EXISTS banners (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500),
    link_target VARCHAR(20),
    display_order INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'INACTIVE',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    view_count BIGINT NOT NULL DEFAULT 0,
    click_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Table comment
COMMENT ON TABLE banners IS '배너 정보 / Banner information';

-- Column comments
COMMENT ON COLUMN banners.id IS '배너 고유 ID / Banner unique ID';
COMMENT ON COLUMN banners.title IS '배너 제목 / Banner title';
COMMENT ON COLUMN banners.description IS '배너 설명 / Banner description';
COMMENT ON COLUMN banners.type IS '배너 타입 (PROMOTION, EVENT, ANNOUNCEMENT, NOTICE) / Banner type';
COMMENT ON COLUMN banners.image_url IS '이미지 URL / Image URL';
COMMENT ON COLUMN banners.thumbnail_url IS '썸네일 URL / Thumbnail URL';
COMMENT ON COLUMN banners.link_url IS '링크 URL / Link URL';
COMMENT ON COLUMN banners.link_target IS '링크 타겟 (_blank, _self) / Link target';
COMMENT ON COLUMN banners.display_order IS '표시 순서 / Display order';
COMMENT ON COLUMN banners.status IS '활성화 상태 (ACTIVE, INACTIVE, SCHEDULED) / Status';
COMMENT ON COLUMN banners.start_date IS '시작 일시 / Start date';
COMMENT ON COLUMN banners.end_date IS '종료 일시 / End date';
COMMENT ON COLUMN banners.view_count IS '조회수 / View count';
COMMENT ON COLUMN banners.click_count IS '클릭수 / Click count';
COMMENT ON COLUMN banners.created_at IS '생성 일시 / Created timestamp';
COMMENT ON COLUMN banners.updated_at IS '수정 일시 / Updated timestamp';
COMMENT ON COLUMN banners.deleted_at IS '삭제 일시 (소프트 삭제) / Deleted timestamp';

-- Indexes for banners table
CREATE INDEX idx_banners_status ON banners(status);
CREATE INDEX idx_banners_type ON banners(type);
CREATE INDEX idx_banners_display_order ON banners(display_order);
CREATE INDEX idx_banners_created_at ON banners(created_at);
CREATE INDEX idx_banners_start_date ON banners(start_date);
CREATE INDEX idx_banners_end_date ON banners(end_date);
CREATE INDEX idx_banners_deleted_at ON banners(deleted_at);

-- 초기 테스트 데이터 삽입 (옵션)
INSERT INTO banners (title, description, type, image_url, thumbnail_url, link_url, link_target, display_order, status, start_date, end_date)
VALUES 
    ('신규 캠핑장 오픈 이벤트', '강원도 속초에 새로운 캠핑장이 오픈했습니다!', 'PROMOTION', 
     'https://via.placeholder.com/1200x400', 'https://via.placeholder.com/600x200', 
     '/campgrounds/1', '_self', 1, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days'),
    
    ('겨울 캠핑 할인 프로모션', '12월 한정 특가! 최대 30% 할인', 'EVENT', 
     'https://via.placeholder.com/1200x400', 'https://via.placeholder.com/600x200', 
     '/events/winter-sale', '_self', 2, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '60 days'),
    
    ('캠핑장 이용 안내', '안전하고 즐거운 캠핑을 위한 이용수칙을 확인하세요', 'ANNOUNCEMENT', 
     'https://via.placeholder.com/1200x400', 'https://via.placeholder.com/600x200', 
     '/guide', '_blank', 3, 'ACTIVE', CURRENT_TIMESTAMP, NULL);


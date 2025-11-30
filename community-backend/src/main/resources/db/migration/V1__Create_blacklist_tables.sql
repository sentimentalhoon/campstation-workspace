-- Create blacklists table
CREATE TABLE IF NOT EXISTS blacklists (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    masked_name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    masked_phone VARCHAR(20) NOT NULL,
    region VARCHAR(50) NOT NULL,
    pc_cafe VARCHAR(200) NOT NULL,
    danger_level VARCHAR(20) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    reported_by VARCHAR(100) NOT NULL,
    report_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT '검토 중',
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table comments
COMMENT ON TABLE blacklists IS 'PC방 블랙리스트 정보를 저장하는 테이블';

-- Column comments for blacklists table
COMMENT ON COLUMN blacklists.id IS '블랙리스트 고유 식별자 (UUID)';
COMMENT ON COLUMN blacklists.name IS '원본 이름 (마스킹 전)';
COMMENT ON COLUMN blacklists.masked_name IS '마스킹된 이름 (예: 홍**)';
COMMENT ON COLUMN blacklists.age IS '나이';
COMMENT ON COLUMN blacklists.gender IS '성별 (남성/여성/기타)';
COMMENT ON COLUMN blacklists.phone IS '원본 전화번호';
COMMENT ON COLUMN blacklists.masked_phone IS '마스킹된 전화번호 (예: 010-****-5678)';
COMMENT ON COLUMN blacklists.region IS '지역 (서울, 경기, 부산 등)';
COMMENT ON COLUMN blacklists.pc_cafe IS 'PC방 이름';
COMMENT ON COLUMN blacklists.danger_level IS '위험도 (위험/경고/주의)';
COMMENT ON COLUMN blacklists.reason IS '신고 사유 카테고리';
COMMENT ON COLUMN blacklists.description IS '상세 설명';
COMMENT ON COLUMN blacklists.reported_by IS '신고자 이름 또는 ID';
COMMENT ON COLUMN blacklists.report_date IS '신고 날짜';
COMMENT ON COLUMN blacklists.status IS '처리 상태 (검토 중/승인/거부)';
COMMENT ON COLUMN blacklists.verified IS '검증 완료 여부';
COMMENT ON COLUMN blacklists.views IS '조회수';
COMMENT ON COLUMN blacklists.created_at IS '레코드 생성 시각';
COMMENT ON COLUMN blacklists.updated_at IS '레코드 수정 시각';

-- Create blacklist_images table
CREATE TABLE IF NOT EXISTS blacklist_images (
    id UUID PRIMARY KEY,
    blacklist_id UUID NOT NULL REFERENCES blacklists(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table comments
COMMENT ON TABLE blacklist_images IS '블랙리스트 증거 이미지 URL을 저장하는 테이블';

-- Column comments for blacklist_images table
COMMENT ON COLUMN blacklist_images.id IS '이미지 레코드 고유 식별자 (UUID)';
COMMENT ON COLUMN blacklist_images.blacklist_id IS '블랙리스트 ID (외래키)';
COMMENT ON COLUMN blacklist_images.image_url IS '이미지 URL (S3 또는 외부 스토리지)';
COMMENT ON COLUMN blacklist_images.created_at IS '이미지 업로드 시각';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blacklists_region ON blacklists(region);
CREATE INDEX IF NOT EXISTS idx_blacklists_danger_level ON blacklists(danger_level);
CREATE INDEX IF NOT EXISTS idx_blacklists_created_at ON blacklists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blacklists_views ON blacklists(views DESC);
CREATE INDEX IF NOT EXISTS idx_blacklist_images_blacklist_id ON blacklist_images(blacklist_id);

-- Index comments
COMMENT ON INDEX idx_blacklists_region IS '지역별 검색 성능 향상을 위한 인덱스';
COMMENT ON INDEX idx_blacklists_danger_level IS '위험도별 필터링 성능 향상을 위한 인덱스';
COMMENT ON INDEX idx_blacklists_created_at IS '최신순 정렬 성능 향상을 위한 인덱스';
COMMENT ON INDEX idx_blacklists_views IS '조회수순 정렬 성능 향상을 위한 인덱스';
COMMENT ON INDEX idx_blacklist_images_blacklist_id IS '블랙리스트별 이미지 조회 성능 향상을 위한 인덱스';

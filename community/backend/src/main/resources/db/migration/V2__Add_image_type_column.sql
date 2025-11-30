-- Add image_type column to blacklist_images table
ALTER TABLE blacklist_images 
ADD COLUMN image_type VARCHAR(20) NOT NULL DEFAULT 'original';

-- Add comment for new column
COMMENT ON COLUMN blacklist_images.image_type IS '이미지 타입 (thumbnail/original/medium 등)';

-- Create index for image type filtering
CREATE INDEX IF NOT EXISTS idx_blacklist_images_type ON blacklist_images(blacklist_id, image_type);

COMMENT ON INDEX idx_blacklist_images_type IS '블랙리스트별 이미지 타입 조회 성능 향상을 위한 인덱스';

-- =====================================================
-- Review Likes Table Migration
-- Version: 14
-- Date: 2025-11-10
-- Description: Add review_likes table for like functionality
-- =====================================================

-- =====================================================
-- REVIEW_LIKES TABLE (리뷰 좋아요 테이블)
-- =====================================================
CREATE TABLE IF NOT EXISTS review_likes (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_review_likes_review FOREIGN KEY (review_id) 
        REFERENCES reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_likes_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint: 한 사용자는 하나의 리뷰에 한 번만 좋아요
    CONSTRAINT uk_review_user UNIQUE (review_id, user_id)
);

-- Table comment
COMMENT ON TABLE review_likes IS '리뷰 좋아요 정보 / Review like information';

-- Column comments
COMMENT ON COLUMN review_likes.id IS '좋아요 고유 ID / Like unique ID';
COMMENT ON COLUMN review_likes.review_id IS '리뷰 ID / Review ID';
COMMENT ON COLUMN review_likes.user_id IS '사용자 ID / User ID';
COMMENT ON COLUMN review_likes.created_at IS '좋아요 생성 일시 / Like created timestamp';

-- Indexes for performance
CREATE INDEX idx_review_likes_review_id ON review_likes(review_id);
CREATE INDEX idx_review_likes_user_id ON review_likes(user_id);
CREATE INDEX idx_review_likes_created_at ON review_likes(created_at);

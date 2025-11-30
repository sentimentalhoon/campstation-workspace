-- V18: 리뷰 답글 테이블 생성
-- 운영자(OWNER) 및 관리자(ADMIN)가 리뷰에 답글을 작성할 수 있는 기능 추가

CREATE TABLE review_replies (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    CONSTRAINT fk_review_reply_review FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reply_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table comment
COMMENT ON TABLE review_replies IS '리뷰 답글 (운영자/관리자 전용)';
COMMENT ON COLUMN review_replies.id IS '답글 ID';
COMMENT ON COLUMN review_replies.review_id IS '리뷰 ID (1:1 관계)';
COMMENT ON COLUMN review_replies.user_id IS '답글 작성자 ID (OWNER 또는 ADMIN)';
COMMENT ON COLUMN review_replies.comment IS '답글 내용';
COMMENT ON COLUMN review_replies.created_at IS '생성일시';
COMMENT ON COLUMN review_replies.updated_at IS '수정일시';
COMMENT ON COLUMN review_replies.deleted_at IS '삭제일시 (소프트 삭제)';

-- Indexes
CREATE INDEX idx_review_reply_review_id ON review_replies(review_id);
CREATE INDEX idx_review_reply_user_id ON review_replies(user_id);
CREATE INDEX idx_review_reply_created_at ON review_replies(created_at);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_review_replies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_replies_updated_at
    BEFORE UPDATE ON review_replies
    FOR EACH ROW
    EXECUTE FUNCTION update_review_replies_updated_at();


-- Add review_count column to campgrounds table for performance optimization
-- This denormalized counter eliminates the need for COUNT queries on the reviews table

-- Step 1: Add the column with default value 0
ALTER TABLE campgrounds ADD COLUMN review_count INT NOT NULL DEFAULT 0;

-- Step 2: Initialize review_count with actual counts from reviews table
UPDATE campgrounds c
SET review_count = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.campground_id = c.id AND r.deleted_at IS NULL
);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN campgrounds.review_count IS '리뷰 수 (성능 최적화를 위한 비정규화 카운터)';

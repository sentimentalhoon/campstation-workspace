-- Add favorite_count column to campgrounds table for performance optimization
-- This denormalized counter eliminates the need for COUNT queries on the favorites table

-- Step 1: Add the column with default value 0
ALTER TABLE campgrounds ADD COLUMN favorite_count INT NOT NULL DEFAULT 0;

-- Step 2: Initialize favorite_count with actual counts from favorites table
UPDATE campgrounds c
SET favorite_count = (
    SELECT COUNT(*)
    FROM favorites f
    WHERE f.campground_id = c.id
);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN campgrounds.favorite_count IS '즐겨찾기 수 (성능 최적화를 위한 비정규화 카운터)';

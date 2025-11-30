-- -----------------------------------------------------------------------------
-- Test Data Loader for site_amenities and reviews tables
-- -----------------------------------------------------------------------------
-- This script populates representative records for the site_amenities and reviews
-- tables while respecting existing foreign-key relationships. Execute it in a
-- PostgreSQL session connected to the CampStation database. The script assumes
-- that at least one site, campground, and user already exist. Feel free to tweak
-- the VALUES blocks below to better match your local dataset.
-- -----------------------------------------------------------------------------

BEGIN;

-- Snapshot of reference entities (limited for deterministic test data)
CREATE TEMP TABLE tmp_sites AS
SELECT id,
       site_number,
       ROW_NUMBER() OVER (ORDER BY id) AS rn
FROM sites
WHERE deleted_at IS NULL
ORDER BY id
LIMIT 5;

CREATE TEMP TABLE tmp_users AS
SELECT id,
       ROW_NUMBER() OVER (ORDER BY id) AS rn
FROM users
WHERE deleted_at IS NULL
ORDER BY id
LIMIT 5;

CREATE TEMP TABLE tmp_campgrounds AS
SELECT id,
       ROW_NUMBER() OVER (ORDER BY id) AS rn
FROM campgrounds
WHERE deleted_at IS NULL
ORDER BY id
LIMIT 5;

-- 1) Seed site_amenities for the earliest available sites
WITH amenities_template(site_rn, amenity_type, available) AS (
    VALUES
        (1, 'ELECTRICITY', TRUE),
        (1, 'WIFI', TRUE),
        (1, 'WATER', TRUE),
        (2, 'BBQ', TRUE),
        (2, 'PET_FRIENDLY', FALSE),
        (3, 'SHOWER', TRUE),
        (3, 'FIRE_PIT', TRUE),
        (4, 'PARKING', TRUE),
        (4, 'SECURITY', TRUE),
        (5, 'PLAYGROUND', TRUE)
)
INSERT INTO site_amenities (site_id, amenity_type, available)
SELECT ts.id, at.amenity_type, at.available
FROM amenities_template at
JOIN tmp_sites ts ON ts.rn = at.site_rn
WHERE NOT EXISTS (
    SELECT 1
    FROM site_amenities sa
    WHERE sa.site_id = ts.id
      AND sa.amenity_type = at.amenity_type
);

-- Optional check: view the amenities we just inserted
SELECT sa.site_id,
       ts.site_number,
       sa.amenity_type,
       sa.available
FROM site_amenities sa
JOIN tmp_sites ts ON ts.id = sa.site_id
ORDER BY sa.site_id, sa.amenity_type;

-- 2) Seed reviews leveraging existing users & campgrounds
WITH review_template(user_rn, campground_rn, rating, comment, images_json) AS (
    VALUES
        (1, 1, 5, '시설이 깨끗하고 직원분들이 친절했어요!', '["https://example.com/review/1.jpg"]'),
        (2, 1, 4, '야경이 정말 아름답습니다. 다만 밤에 조금 추워요.', '[]'),
        (3, 2, 3, '주변 편의시설이 더 있으면 좋겠어요.', '["https://example.com/review/3-1.jpg","https://example.com/review/3-2.jpg"]'),
        (4, 3, 5, '아이들과 함께하기에 최고였어요!', '[]'),
        (5, 4, 4, '조용하고 여유로운 시간을 보냈습니다.', '["https://example.com/review/5.jpg"]')
)
INSERT INTO reviews (user_id, campground_id, rating, comment, images)
SELECT u.id, c.id, rt.rating, rt.comment, rt.images_json
FROM review_template rt
JOIN tmp_users u ON u.rn = rt.user_rn
JOIN tmp_campgrounds c ON c.rn = rt.campground_rn
WHERE NOT EXISTS (
    SELECT 1
    FROM reviews r
    WHERE r.user_id = u.id
      AND r.campground_id = c.id
);

-- Optional check: view inserted reviews for the mapped pairs
SELECT r.id,
       r.user_id,
       u.rn AS user_row,
       r.campground_id,
       cg.rn AS campground_row,
       r.rating,
       r.comment,
       r.images,
       r.created_at
FROM reviews r
JOIN tmp_users u ON u.id = r.user_id
JOIN tmp_campgrounds cg ON cg.id = r.campground_id
ORDER BY r.created_at DESC;

COMMIT;

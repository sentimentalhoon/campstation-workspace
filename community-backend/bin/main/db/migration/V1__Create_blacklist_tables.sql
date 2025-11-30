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

-- Create blacklist_images table
CREATE TABLE IF NOT EXISTS blacklist_images (
    id UUID PRIMARY KEY,
    blacklist_id UUID NOT NULL REFERENCES blacklists(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blacklists_region ON blacklists(region);
CREATE INDEX IF NOT EXISTS idx_blacklists_danger_level ON blacklists(danger_level);
CREATE INDEX IF NOT EXISTS idx_blacklists_created_at ON blacklists(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blacklists_views ON blacklists(views DESC);
CREATE INDEX IF NOT EXISTS idx_blacklist_images_blacklist_id ON blacklist_images(blacklist_id);

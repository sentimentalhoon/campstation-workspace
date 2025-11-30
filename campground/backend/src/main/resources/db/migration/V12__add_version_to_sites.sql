-- Add version column to sites table for JPA Optimistic Locking
-- This enables concurrent reservation conflict prevention

ALTER TABLE sites ADD COLUMN version BIGINT DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN sites.version IS 'JPA Optimistic Locking version field for concurrent reservation prevention';

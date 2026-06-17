-- Create job_seekers table if it doesn't exist
-- This table stores job seeker profile information linked to users

CREATE TABLE IF NOT EXISTS job_seekers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    national_id VARCHAR(20),
    phone VARCHAR(20),
    education_level VARCHAR(100),
    skills TEXT,
    experience_years INTEGER DEFAULT 0,
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    sector VARCHAR(200),
    description TEXT,
    profile_picture TEXT,
    employment_status VARCHAR(50)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_job_seekers_user_id ON job_seekers(user_id);

-- Create index on sector for filtering
CREATE INDEX IF NOT EXISTS idx_job_seekers_sector ON job_seekers(sector);

-- Create index on region for filtering
CREATE INDEX IF NOT EXISTS idx_job_seekers_region ON job_seekers(region);

-- Add missing columns if table already exists
ALTER TABLE job_seekers ADD COLUMN IF NOT EXISTS national_id VARCHAR(20);
ALTER TABLE job_seekers ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE job_seekers ADD COLUMN IF NOT EXISTS education_level VARCHAR(100);
ALTER TABLE job_seekers ADD COLUMN IF NOT EXISTS profile_picture TEXT;
ALTER TABLE job_seekers ADD COLUMN IF NOT EXISTS employment_status VARCHAR(50);

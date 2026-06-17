-- Add file upload path, file type, and admin uploader metadata to publications
ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS file_path TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by INTEGER REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP DEFAULT NOW();

-- Optional: keep existing file_url for backward compatibility
ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS file_url TEXT;

CREATE TABLE IF NOT EXISTS statistics_uploads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  category VARCHAR(255) DEFAULT 'Statistics',
  year VARCHAR(20) DEFAULT '',
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_by INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_statistics_uploads_category ON statistics_uploads(category);
CREATE INDEX IF NOT EXISTS idx_statistics_uploads_year ON statistics_uploads(year);

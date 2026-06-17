CREATE TABLE IF NOT EXISTS statistical_data (
  id SERIAL PRIMARY KEY,
  year VARCHAR(20) NOT NULL,
  category VARCHAR(255) NOT NULL,
  industry VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  value NUMERIC(14,4) NOT NULL,
  upload_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_statistical_data_year ON statistical_data(year);
CREATE INDEX IF NOT EXISTS idx_statistical_data_region ON statistical_data(region);
CREATE INDEX IF NOT EXISTS idx_statistical_data_category ON statistical_data(category);

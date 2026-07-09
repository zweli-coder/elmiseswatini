CREATE TABLE IF NOT EXISTS economic_sectors (
  id SERIAL PRIMARY KEY,
  sector_name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO economic_sectors (sector_name, description)
VALUES
  ('Agriculture', 'Farming, livestock, and forestry'),
  ('Manufacturing', 'Factory production and processing'),
  ('Retail & Trade', 'Wholesale and retail commerce'),
  ('Tourism & Hospitality', 'Hotels, restaurants, and tourism services'),
  ('Healthcare', 'Medical services and pharmaceuticals'),
  ('Education', 'Schools, universities, and training institutions'),
  ('Finance & Banking', 'Financial services and banking'),
  ('Technology & IT', 'Information technology and software'),
  ('Construction', 'Building and infrastructure development'),
  ('Energy & Utilities', 'Power, water, and utilities'),
  ('Transportation & Logistics', 'Transport and supply chain'),
  ('Public Administration', 'Government and public sector')
ON CONFLICT (sector_name) DO NOTHING;

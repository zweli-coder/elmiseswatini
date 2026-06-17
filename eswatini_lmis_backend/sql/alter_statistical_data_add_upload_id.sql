ALTER TABLE statistical_data
  ADD COLUMN IF NOT EXISTS upload_id INTEGER;

-- Optional: if you want a foreign key constraint, uncomment the following line.
-- ALTER TABLE statistical_data
--   ADD CONSTRAINT statistical_data_upload_id_fkey FOREIGN KEY (upload_id)
--   REFERENCES statistics_uploads(id);

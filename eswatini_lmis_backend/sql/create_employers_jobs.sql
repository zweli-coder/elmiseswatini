CREATE TABLE IF NOT EXISTS employers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  location TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER NOT NULL,
  organisation_name TEXT,
  sector TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  salary TEXT,
  requirements TEXT,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  application_deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
);

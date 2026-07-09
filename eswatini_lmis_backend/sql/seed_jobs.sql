-- First ensure we have a user for the employer
INSERT INTO users (full_name, email, password_hash, role_id)
SELECT 'Test Employer', 'employer@test.com', 'hashed_password', 2
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'employer@test.com');

-- Insert sample employer
INSERT INTO employers (user_id, company_name, industry, location)
SELECT u.id, 'TechCorp Eswatini', 'Technology & IT', 'Mbabane'
FROM users u WHERE u.email = 'employer@test.com'
ON CONFLICT DO NOTHING;

-- Insert sample jobs
INSERT INTO jobs (employer_id, organisation_name, sector, title, description, location, job_type, status, created_at)
SELECT e.id, 'TechCorp Eswatini', 'Technology & IT', 'Junior Developer', 'Seeking a talented junior developer with JavaScript experience', 'Mbabane', 'Full-time', 'open', NOW()
FROM employers e WHERE e.company_name = 'TechCorp Eswatini'
ON CONFLICT DO NOTHING;

INSERT INTO jobs (employer_id, organisation_name, sector, title, description, location, job_type, status, created_at)
SELECT e.id, 'TechCorp Eswatini', 'Technology & IT', 'Project Manager', 'Project management role for web applications', 'Mbabane', 'Full-time', 'open', NOW()
FROM employers e WHERE e.company_name = 'TechCorp Eswatini'
ON CONFLICT DO NOTHING;

INSERT INTO jobs (employer_id, organisation_name, sector, title, description, location, job_type, status, created_at)
SELECT e.id, 'TechCorp Eswatini', 'Technology & IT', 'UX/UI Designer', 'Design roles for digital products', 'Remote', 'Full-time', 'open', NOW()
FROM employers e WHERE e.company_name = 'TechCorp Eswatini'
ON CONFLICT DO NOTHING;

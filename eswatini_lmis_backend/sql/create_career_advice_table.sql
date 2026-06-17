-- Create career_advice table for LMIS
CREATE TABLE IF NOT EXISTS career_advice (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  body TEXT,
  category TEXT,
  icon TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default career advice entry if the table is empty
INSERT INTO career_advice (slug, title, summary, body, category, icon, created_at)
SELECT 'growing-your-career',
       'Growing Your Career in the LMIS Economy',
       'Learn how to plan career steps, build transferable skills, and navigate high-demand sectors in Eswatini.',
       'This guide helps learners and job seekers identify opportunities, build practical skills, and thrive in Eswatini’s labour market.',
       'Career Planning',
       'briefcase',
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM career_advice);

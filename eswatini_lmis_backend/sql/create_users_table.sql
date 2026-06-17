-- Create the users table for LMIS authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create or fix user roles table for access control
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'roles'
  ) THEN
    CREATE TABLE roles (
      id SERIAL PRIMARY KEY,
      role_name TEXT UNIQUE NOT NULL
    );
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'roles' AND column_name = 'role_name'
    ) THEN
      ALTER TABLE roles ADD COLUMN role_name TEXT;
    END IF;
  END IF;
END$$;

-- Copy existing role names if an older column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roles' AND column_name = 'name'
  ) THEN
    UPDATE roles
    SET role_name = name
    WHERE role_name IS NULL;
  END IF;
END$$;

ALTER TABLE roles
  ADD CONSTRAINT IF NOT EXISTS roles_role_name_unique UNIQUE (role_name);

-- Seed default roles
INSERT INTO roles (role_name)
VALUES
  ('admin'),
  ('employer'),
  ('employee')
ON CONFLICT (role_name) DO NOTHING;

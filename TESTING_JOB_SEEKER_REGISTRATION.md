# Job Seeker Registration - Testing Guide

## What Was Fixed

### Problem
Job seekers couldn't register to the system because:
1. The POST /api/employees endpoint required authentication (`verifyEmployee` middleware)
2. The registration required a two-step process (create user, then create profile)
3. No unified endpoint for public registration

### Solution Implemented
1. **Removed authentication** from GET /api/employees - now anyone can browse the talent pool
2. **Created new public POST /api/employees** endpoint that:
   - Accepts full registration data (user + profile in one request)
   - Creates user account and job seeker profile atomically
   - Returns error if email already exists
   - Securely hashes passwords using bcryptjs
3. **Created new PUT /api/employees/:id** endpoint for authenticated profile updates
4. **Updated frontend** to use the single unified registration endpoint

## Database Setup

### Step 1: Run Migration
Execute this SQL on your PostgreSQL database:

```sql
-- Create job_seekers table if it doesn't exist
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_seekers_user_id ON job_seekers(user_id);
CREATE INDEX IF NOT EXISTS idx_job_seekers_sector ON job_seekers(sector);
CREATE INDEX IF NOT EXISTS idx_job_seekers_region ON job_seekers(region);
```

Or run the SQL file:
```bash
psql -U postgres -d eswatini_lmis -f eswatini_lmis_backend/sql/create_job_seekers_table.sql
```

## Testing the Registration Flow

### Step 1: Start Backend
```bash
cd eswatini_lmis_backend
npm install  # If not already installed
npm start
```

### Step 2: Start Frontend
```bash
cd eswatini_lmis_frontend
npm install  # If not already installed
npm start
```

### Step 3: Test Registration

1. Go to http://localhost:3000
2. Click "New Job Seeker" button
3. Fill in the form with:
   - **Full Name**: Your Name
   - **Email**: yourname@example.com (must be unique)
   - **Password**: AnyPassword123
   - **Years of Experience**: 3
   - **Sector**: Choose any sector
   - **Professional Summary**: Describe yourself
   - **Region**: Choose a region
   - **Skills**: JavaScript, Project Management
   - **Profile Picture** (optional): Upload an image
4. Click "Register"
5. You should see: "Registration successful! Please login."
6. Click "Portal Login" and login with your credentials
7. You should now see yourself in the Talent Pool

### Step 4: Test Data Format

The job seeker should be saved with this structure:
```json
{
  "id": 1,
  "user_id": 9,
  "full_name": "Your Name",
  "email": "yourname@example.com",
  "sector": "Accommodation and Food Service Activities",
  "region": "Manzini",
  "description": "Your description here",
  "employment_status": null,
  "skills": "JavaScript, Project Management",
  "experience_years": 3,
  "profile_picture": "data:image/jpeg;base64,...",
  "created_at": "2026-06-02T10:30:00.000Z",
  "updated_at": "2026-06-02T10:30:00.000Z"
}
```

## API Reference

### GET /api/employees
**Description**: Get all job seekers (public endpoint)
**Authentication**: Not required
**Response**: Array of job seekers with user info

```bash
curl http://localhost:3001/api/employees
```

### POST /api/employees
**Description**: Register a new job seeker (public endpoint)
**Authentication**: Not required
**Request Body**:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "description": "Experienced professional...",
  "region": "Manzini",
  "sector": "Construction",
  "skills": "Project Management",
  "experience_years": 5,
  "profile_picture": "data:image/jpeg;base64,..." (optional)
}
```

**Response**:
```json
{
  "message": "Job seeker profile created successfully!",
  "profile": { ... },
  "user_id": 9
}
```

### PUT /api/employees/:id
**Description**: Update job seeker profile (requires authentication)
**Authentication**: Required (Bearer token)
**Request Body**: Same fields as POST (all optional)

## Troubleshooting

### Error: "Email already registered"
- The email is already in use by another account
- Try with a different email

### Error: "Missing required fields"
- Ensure full_name, email, password, and description are provided
- All marked with (*) in the form are required

### Error: "Failed to create profile"
- Check backend logs for more details
- Ensure PostgreSQL is running
- Verify database and tables exist

### No job seekers showing up
- Check that job_seekers table exists and has data
- Verify the connection string in config/db.js
- Check browser console for API errors

## Files Modified

1. **Backend**:
   - `/eswatini_lmis_backend/routes/employeeRoutes.js` - Updated endpoints

2. **Frontend**:
   - `/eswatini_lmis_frontend/src/pages/JobSeekers.js` - Simplified registration

3. **Database**:
   - `/eswatini_lmis_backend/sql/create_job_seekers_table.sql` - New migration file

## Next Steps

After successful registration, you can:
1. View all job seekers on the Talent Pool page
2. Filter by region and sector
3. Search by name
4. Update your profile by logging in and using the protected PUT endpoint
5. Apply for jobs (via /api/employees/jobs/:job_id/apply)

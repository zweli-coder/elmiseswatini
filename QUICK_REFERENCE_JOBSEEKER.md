# Quick Reference - Job Seeker Registration

## What's Fixed

✅ **Registration is now PUBLIC** - No login required to register as a job seeker
✅ **Single unified endpoint** - POST /api/employees handles everything
✅ **Atomic transactions** - User account + profile created together
✅ **All fields saved** - id, user_id, national_id, phone, education_level, skills, experience_years, region, sector, description, profile_picture, employment_status

## Quick Start

### 1. Database
```bash
psql -U postgres -d eswatini_lmis -f eswatini_lmis_backend/sql/create_job_seekers_table.sql
```

### 2. Backend
```bash
cd eswatini_lmis_backend
npm start
```

### 3. Frontend
```bash
cd eswatini_lmis_frontend
npm start
```

### 4. Register
- Open http://localhost:3000
- Click "New Job Seeker"
- Fill form:
  - Full Name ✓
  - Email ✓
  - Password ✓ (NEW - now required)
  - Years of Experience
  - Sector ✓
  - Professional Summary ✓
  - Region ✓
  - Profile Picture (optional)
  - Skills
- Click Register
- Login with credentials
- See yourself in Talent Pool

## API Endpoint

### POST /api/employees - Register Job Seeker

**URL**: `http://localhost:3001/api/employees`

**Method**: POST

**No Authentication Required**

**Request Body**:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "description": "Experienced professional with good communication skills",
  "region": "Manzini",
  "sector": "Construction",
  "skills": "Project Management, Leadership",
  "experience_years": 3,
  "profile_picture": "data:image/jpeg;base64,..." (optional)
}
```

**Successful Response** (200):
```json
{
  "message": "Job seeker profile created successfully!",
  "user_id": 9,
  "profile": {
    "id": 1,
    "user_id": 9,
    "description": "Experienced professional...",
    "region": "Manzini",
    "sector": "Construction",
    "skills": "Project Management, Leadership",
    "experience_years": 3,
    "profile_picture": "data:image/jpeg;base64,...",
    "created_at": "2026-06-02T10:30:00.000Z"
  }
}
```

**Error Responses**:
```json
{ "error": "Missing required fields: full_name, email, password, description" }
{ "error": "Email already registered" }
{ "error": "Failed to create profile", "details": "..." }
```

## Data Saved to Database

```
TABLE: job_seekers
├─ id: 1 (auto-increment)
├─ user_id: 9 (foreign key)
├─ national_id: null (optional)
├─ phone: null (optional)
├─ education_level: null (optional)
├─ skills: "Project Management, Leadership"
├─ experience_years: 3
├─ region: "Manzini"
├─ sector: "Construction"
├─ description: "Experienced professional..."
├─ profile_picture: "data:image/jpeg;base64,..."
├─ employment_status: null (optional)
├─ created_at: 2026-06-02 10:30:00
└─ updated_at: 2026-06-02 10:30:00

TABLE: users
├─ id: 9 (auto-increment)
├─ full_name: "John Doe"
├─ email: "john@example.com"
├─ password_hash: "$2a$10$..." (bcrypt)
├─ role_id: 3 (employee)
├─ created_at: 2026-06-02 10:30:00
└─ updated_at: 2026-06-02 10:30:00
```

## Files Changed

1. `eswatini_lmis_backend/routes/employeeRoutes.js` - Endpoints
2. `eswatini_lmis_frontend/src/pages/JobSeekers.js` - Registration form
3. `eswatini_lmis_backend/sql/create_job_seekers_table.sql` - Database schema

## Test Data

You can now register job seekers like your examples:

**Job Seeker 1**:
```
Name: John Mkhize
Email: john.mkhize@example.com
Password: Password123
Skills: Good communication skills
Experience: 3 years
Region: Manzini
Sector: Accommodation and Food Service Activities
Description: fxdxdxdxdjcytkxcfgjnxstgdjnhyn
```

**Job Seeker 2**:
```
Name: Sarah Sikhosana
Email: sarah.sikhosana@example.com
Password: Password123
Skills: Project Management
Experience: 4 years
Region: Hhohho
Sector: Construction
Description: sdfghnynnnng
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Email already registered" | Use a different email address |
| "Missing required fields" | Ensure all (*) fields are filled |
| No job seekers in list | Check database migration ran successfully |
| Login fails after registration | Make sure you used correct email/password |
| Profile picture not showing | Ensure file is valid image (<5MB) |

## Related Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | /api/employees | No | Browse all job seekers |
| POST | /api/employees | No | Register new job seeker |
| PUT | /api/employees/:id | Yes | Update own profile |
| POST | /api/auth/login | No | Login |
| POST | /api/auth/register | No | (Deprecated - use POST /employees) |

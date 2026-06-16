# Employer Dashboard Testing Guide

## Quick Start

### 1. Start the Backend Server
```bash
cd eswatini_lmis_backend
npm install  # if needed
npm start
```

Expected output:
```
Server is running on port 3001
📁 Uploads folder: [path]/uploads
Configured routes: /api/employers, /api/auth, /api/jobs, etc.
```

### 2. Start the Frontend Development Server
```bash
cd eswatini_lmis_frontend
npm install  # if needed
npm start
```

Expected output:
```
Compiled successfully!
Webpack compiled with X warning
You can now view the app in the browser.
  Local:            http://localhost:3000
```

### 3. Run API Tests
```bash
# From root directory
node employer_dashboard_test.js
```

This will:
- Test employer login
- Verify role-based access
- Fetch employer jobs
- Create a test job
- Fetch applications
- Test error handling

### 4. Run Playwright Tests
```bash
# Install Playwright if needed
npm install --save-dev @playwright/test

# Run tests
npx playwright test employer_dashboard.spec.js

# Run in headed mode (see browser)
npx playwright test employer_dashboard.spec.js --headed

# Run specific test
npx playwright test employer_dashboard.spec.js -g "should display dashboard heading"
```

### 5. Manual Testing
Use the checklist in `EMPLOYER_DASHBOARD_TEST_CHECKLIST.md` to manually test:
1. Authentication flows
2. Dashboard layout
3. Data display
4. Navigation
5. Error scenarios

---

## Test Data Setup

Before running tests, ensure you have:

### Test Employer Account
```sql
-- Create in database or use existing
INSERT INTO users (email, password_hash, full_name, role_id, created_at)
VALUES ('employer@test.com', '[hashed_password]', 'Test Employer', 2, NOW());

-- Create employer profile
INSERT INTO employers (user_id, company_name)
VALUES ([user_id], 'Test Company');
```

### Test Jobs (Optional)
```sql
INSERT INTO jobs (employer_id, title, description, location, salary, status, created_at)
VALUES 
  ([employer_id], 'Software Engineer', 'Test position', 'Mbabane', 45000, 'open', NOW()),
  ([employer_id], 'Manager', 'Management role', 'Manzini', 55000, 'open', NOW());
```

---

## Endpoints Being Tested

### Authentication
- `POST /api/auth/login` - Login endpoint
- `GET /api/auth/me` - Get current user info

### Employer Routes
- `GET /api/employers/jobs` - Get jobs posted by employer
- `POST /api/employers/jobs` - Create new job posting
- `GET /api/employers/applications` - Get all applications
- `GET /api/employers/jobs/:job_id/applications` - Get job-specific applications

### Jobs Routes
- `GET /api/jobs` - Get all available jobs

---

## Frontend Component Test Coverage

### EmployerDashboard.js
- ✅ Token validation
- ✅ Role-based access (employer = role_id 2)
- ✅ Load employer jobs
- ✅ Load all vacancies
- ✅ Display statistics
- ✅ Navigation links
- ✅ Error handling
- ✅ Logout functionality

### Features Tested
1. **Authentication Check**
   - Valid token → Loads dashboard
   - Expired token → Redirects to login
   - Invalid role → Shows forbidden

2. **Data Loading**
   - Employer jobs loaded from `/api/employers/jobs`
   - All vacancies loaded from `/api/jobs`
   - Application stats calculated

3. **UI Interactions**
   - Navigate to vacancies
   - Navigate to post job
   - Navigate to applications
   - Logout

---

## Troubleshooting

### Backend Not Starting
```bash
# Check if port 3001 is in use
netstat -an | grep 3001

# Kill process on port 3001
# On Windows:
netsh int ipv4 show tcpconnections | findstr :3001
taskkill /PID [PID] /F

# On Mac/Linux:
lsof -i :3001
kill -9 [PID]
```

### Frontend Not Loading
```bash
# Clear cache and node_modules
rm -rf node_modules package-lock.json
npm install

# Clear browser cache
# DevTools → Application → Storage → Clear Site Data

# Try different port
PORT=3002 npm start
```

### Database Connection Issues
```bash
# Check database is running
# Verify connection string in config/db.js
# Check credentials in .env file
```

### API Tests Failing
- Verify backend is running: `curl http://localhost:3001/api/jobs`
- Check authentication token format
- Verify test user exists in database
- Check error response in console

### Playwright Tests Issues
```bash
# Install browsers if missing
npx playwright install

# Run with debug output
PWDEBUG=1 npx playwright test employer_dashboard.spec.js

# Generate report
npx playwright show-report
```

---

## Expected Results

### Successful API Test Output
```
🚀 EMPLOYER DASHBOARD TEST SUITE

Testing: http://localhost:3001/api

60 ==========================================

📋 TEST SUITE 1: AUTHENTICATION

Test 1.1: Login as Employer
✅ Employer login successful
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI...

Test 1.2: Verify Token Validity
✅ Token verified - User is an employer (role_id: 2)
   User: Test Employer (employer@test.com)

...

✅ TEST SUITE COMPLETED
```

### Successful Frontend Load
```
- Dashboard displays with employer info
- Statistics cards show application counts
- Navigation links are visible and clickable
- Jobs list displays employer's postings
- No console errors
```

---

## Performance Benchmarks

| Metric | Target | Acceptable | Current |
|--------|--------|-----------|---------|
| Page Load | < 2s | < 3s | ___ |
| API Response | < 500ms | < 1s | ___ |
| Navigation | < 500ms | < 1s | ___ |
| Memory (initial) | < 50MB | < 100MB | ___ |
| Memory (after 5min) | +10% | +25% | ___ |

---

## Next Steps

- [ ] Set up test database fixtures
- [ ] Configure CI/CD pipeline
- [ ] Automate test runs on commits
- [ ] Generate test coverage reports
- [ ] Document known issues
- [ ] Set up performance monitoring

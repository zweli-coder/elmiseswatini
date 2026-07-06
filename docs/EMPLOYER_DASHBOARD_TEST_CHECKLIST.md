# Employer Dashboard - Manual Testing Checklist

## Prerequisites
- [ ] Backend server running on `http://localhost:3001`
- [ ] Frontend development server running on `http://localhost:3000`
- [ ] Database populated with test data
- [ ] Test employer account created (email: employer@test.com)

## Test Scenarios

### 1. Authentication & Authorization
- [ ] **Unauthenticated Access**: Navigate to `/employer/dashboard` without login
  - Expected: Redirected to login or shown login form
  - Actual: _______________

- [ ] **Job Seeker Access**: Login as job seeker, try to access `/employer/dashboard`
  - Expected: Show "Forbidden" or redirect to appropriate dashboard
  - Actual: _______________

- [ ] **Employer Access**: Login as employer
  - Expected: Dashboard loads successfully
  - Actual: _______________

- [ ] **Token Expiration**: Wait for token to expire (check JWT exp time)
  - Expected: Automatic logout or redirect to login
  - Actual: _______________

### 2. Dashboard Layout & Display
- [ ] **Header/Navbar**: Visible with employer name and logo
  - Present: Yes / No
  - Shows: _______________

- [ ] **Main Heading**: "Employer Dashboard" or similar visible
  - Present: Yes / No
  - Text: _______________

- [ ] **Navigation Menu**: Links for main sections
  - View Vacancies: _______________
  - Post Vacancy: _______________
  - Applications: _______________
  - Logout: _______________

- [ ] **Statistics Cards**: Shows application summary
  - Total Applications: _____ (Count: _____)
  - Pending: _____ (Count: _____)
  - Accepted: _____ (Count: _____)
  - Rejected: _____ (Count: _____)

### 3. Employer Jobs Display
- [ ] **Jobs List/Table**: Displays all jobs posted by employer
  - Number of jobs shown: _____
  - Columns/Fields visible:
    - [ ] Job Title
    - [ ] Location
    - [ ] Posting Date
    - [ ] Applications Count
    - [ ] Status

- [ ] **Job Details**: Can view job details
  - Click job → Details visible: Yes / No
  - Displays: _______________

- [ ] **Empty State**: When no jobs exist
  - Message shown: _______________
  - "Post Vacancy" button visible: Yes / No

### 4. All Vacancies Display
- [ ] **Vacancies Section**: Shows all available jobs (not just employer's)
  - Number of jobs shown: _____
  - Different from employer jobs: Yes / No
  - Reason if same: _______________

- [ ] **Job Filtering**: Can filter vacancies
  - Filter options: _______________
  - Works correctly: Yes / No

### 5. Navigation & Links
- [ ] **View Vacancies Button/Link**
  - Click → Navigates to: _____
  - URL: _______________
  - Page loads: Yes / No

- [ ] **Post Vacancy Button/Link**
  - Click → Navigates to: _____
  - URL: _______________
  - Form appears: Yes / No

- [ ] **Applications Button/Link**
  - Click → Navigates to: _____
  - URL: _______________
  - Applications list appears: Yes / No

- [ ] **Logout Button**
  - Click → Logs out user: Yes / No
  - Redirected to: _______________
  - Token cleared: Yes / No

### 6. Error Handling
- [ ] **Network Error**: Disable network and reload
  - Error message shown: _______________
  - User can retry: Yes / No

- [ ] **Failed API Call**: Mock 500 error from backend
  - Error message shown: _______________
  - Message is user-friendly: Yes / No

- [ ] **Timeout**: Simulate slow network
  - Loading indicator shown: Yes / No
  - Timeout handled gracefully: Yes / No

### 7. Data Loading & Updates
- [ ] **Initial Load**: Page loads and displays data
  - Time to load: _____ seconds
  - Loading indicator visible: Yes / No

- [ ] **Refresh**: Click refresh or manually refresh page
  - Data reloads: Yes / No
  - Loading state shown: Yes / No

- [ ] **Real-time Updates**: Create new job/application in another window
  - Auto-updates on dashboard: Yes / No
  - Manual refresh required: Yes / No

### 8. Responsive Design
- [ ] **Desktop (1920x1080)**: Layout looks good
  - All elements visible: Yes / No
  - No overlapping: Yes / No

- [ ] **Tablet (768px)**: Responsive layout works
  - Layout adapts: Yes / No
  - Navigation collapsed: Yes / No
  - Readable: Yes / No

- [ ] **Mobile (375px)**: Mobile layout works
  - All elements visible: Yes / No
  - Touch-friendly: Yes / No
  - No horizontal scroll: Yes / No

### 9. Performance
- [ ] **Page Load Time**: Should be < 3 seconds
  - Actual: _____ seconds

- [ ] **Component Render**: Smooth without lag
  - Lag observed: Yes / No

- [ ] **Memory Leak Test**: Leave dashboard open for 5 minutes
  - Memory usage increases: Yes / No
  - Still responsive: Yes / No

### 10. Browser Compatibility
- [ ] **Chrome**: Works correctly
  - Issues: _______________

- [ ] **Firefox**: Works correctly
  - Issues: _______________

- [ ] **Edge**: Works correctly
  - Issues: _______________

- [ ] **Safari** (if on Mac): Works correctly
  - Issues: _______________

## API Endpoint Verification

### GET /api/employers/jobs
- [ ] **Status**: 200 OK
- [ ] **Response Format**: Valid JSON array
- [ ] **Fields Present**:
  - [ ] id
  - [ ] title
  - [ ] description
  - [ ] location
  - [ ] applications_count
  - [ ] pending_count
  - [ ] accepted_count
  - [ ] rejected_count

### GET /api/employers/applications
- [ ] **Status**: 200 OK
- [ ] **Response Format**: Valid JSON array
- [ ] **Fields Present**:
  - [ ] id
  - [ ] job_title
  - [ ] applicant_name
  - [ ] applicant_email
  - [ ] status
  - [ ] applied_at

### POST /api/employers/jobs
- [ ] **Valid Data**: Returns 200 OK and created job
- [ ] **Invalid Data**: Returns 400 Bad Request
- [ ] **Missing Auth**: Returns 401 Unauthorized

## Issues Found

| # | Issue | Severity | Steps to Reproduce | Expected | Actual | Status |
|---|-------|----------|-------------------|----------|--------|--------|
| 1 | | High/Med/Low | | | | Open/Fixed |
| 2 | | High/Med/Low | | | | Open/Fixed |

## Notes & Observations

_______________________________________________________________________________

_______________________________________________________________________________

_______________________________________________________________________________

## Sign-Off

- **Tester**: ________________
- **Date**: ________________
- **Overall Status**: ☐ Pass ☐ Fail ☐ Conditional Pass
- **Comments**: _______________________________________________________________________________

# 🧪 Employer Dashboard Testing Suite

Complete testing package for the Employer Dashboard component of the LMIS system.

## 📋 Quick Navigation

### 📚 Documentation
1. **[EMPLOYER_DASHBOARD_TESTING_OVERVIEW.md](./EMPLOYER_DASHBOARD_TESTING_OVERVIEW.md)** - START HERE
   - Overview of what's being tested
   - File guide
   - How to run tests
   - Expected results

2. **[EMPLOYER_DASHBOARD_TESTING_GUIDE.md](./EMPLOYER_DASHBOARD_TESTING_GUIDE.md)** - SETUP & EXECUTION
   - Server startup commands
   - Database setup
   - Test execution steps
   - Troubleshooting guide
   - Performance benchmarks

3. **[EMPLOYER_DASHBOARD_TEST_CHECKLIST.md](./EMPLOYER_DASHBOARD_TEST_CHECKLIST.md)** - MANUAL TESTING
   - Authentication tests
   - Layout & display tests
   - Data loading tests
   - Navigation tests
   - Error handling tests
   - Responsive design tests
   - API endpoint verification

4. **[EMPLOYER_DASHBOARD_VISUAL_TESTING.md](./EMPLOYER_DASHBOARD_VISUAL_TESTING.md)** - VISUAL & UX
   - Component structure diagrams
   - Expected layouts
   - Responsive behavior
   - Animation & transitions
   - Accessibility requirements
   - Screenshot points

### 🤖 Automated Tests

5. **[employer_dashboard_test.js](./employer_dashboard_test.js)** - API TESTS
   ```bash
   node employer_dashboard_test.js
   ```
   - Authentication testing
   - Employer route validation
   - Job creation & retrieval
   - Application fetching
   - Error handling

6. **[employer_dashboard.spec.js](./employer_dashboard.spec.js)** - UI TESTS (Playwright)
   ```bash
   npx playwright test employer_dashboard.spec.js
   ```
   - Component rendering
   - User interactions
   - Navigation flows
   - Responsive layouts
   - API integration

## 🚀 Quick Start

### Option 1: Just Run Tests (5 min)
```bash
# Terminal 1: Start Backend
cd eswatini_lmis_backend && npm start

# Terminal 2: Start Frontend
cd eswatini_lmis_frontend && npm start

# Terminal 3: Run API Tests
node employer_dashboard_test.js
```

### Option 2: Full Manual Testing (30 min)
```bash
# Start servers (as above)

# Use the checklists:
# 1. EMPLOYER_DASHBOARD_TEST_CHECKLIST.md - for functional testing
# 2. EMPLOYER_DASHBOARD_VISUAL_TESTING.md - for UI/UX testing

# Open http://localhost:3000/employer/dashboard and test manually
```

### Option 3: Automated + Manual (60 min)
```bash
# 1. Run API tests (see Option 1)
# 2. Run Playwright tests
npx playwright test employer_dashboard.spec.js --headed

# 3. Complete manual checklists
# 4. Capture screenshots and videos
```

## 📊 Test Coverage

### Tested Components
- ✅ EmployerDashboard.js (Frontend)
- ✅ employerRoutes.js (Backend)
- ✅ Authentication middleware
- ✅ API integration
- ✅ Error handling
- ✅ Responsive design

### Tested Scenarios
- ✅ Authentication & authorization
- ✅ Dashboard data loading
- ✅ Navigation & links
- ✅ Statistics calculation
- ✅ Error states
- ✅ Empty states
- ✅ Mobile responsiveness

### API Endpoints Tested
- ✅ GET /api/employers/jobs
- ✅ POST /api/employers/jobs
- ✅ GET /api/employers/applications
- ✅ GET /api/employers/jobs/:id/applications
- ✅ GET /api/jobs (all vacancies)
- ✅ GET /api/auth/me
- ✅ POST /api/auth/login

## 🎯 Test Objectives

| Objective | Priority | Status |
|-----------|----------|--------|
| Verify authentication works | HIGH | ⭕ |
| Dashboard loads correctly | HIGH | ⭕ |
| Data displays accurately | HIGH | ⭕ |
| Navigation functions | MEDIUM | ⭕ |
| Error handling works | MEDIUM | ⭕ |
| Mobile responsive | MEDIUM | ⭕ |
| Performance acceptable | MEDIUM | ⭕ |
| Accessibility compliant | LOW | ⭕ |

## 📈 Performance Targets

- Page Load: < 3 seconds
- API Response: < 1 second
- Navigation: < 500ms
- Memory Usage: < 100MB

## 🐛 Known Issues

(To be filled during testing)

| Issue | Severity | Status |
|-------|----------|--------|
| | HIGH | 🔴 |
| | MEDIUM | 🟡 |
| | LOW | 🟢 |

## 📝 Test Results Template

```
Date: _______________
Tester: _______________
Environment: _______________

API Tests:
- Authentication: ✅ PASS / ❌ FAIL
- Job Routes: ✅ PASS / ❌ FAIL
- Error Handling: ✅ PASS / ❌ FAIL

Frontend Tests:
- Loading: ✅ PASS / ❌ FAIL
- Display: ✅ PASS / ❌ FAIL
- Navigation: ✅ PASS / ❌ FAIL
- Mobile: ✅ PASS / ❌ FAIL

Overall Status: 
☐ PASS
☐ FAIL
☐ CONDITIONAL PASS

Issues Found: _______________
```

## 🔄 Test Execution Flow

```
1. Setup & Prerequisites
   ├─ Database configured
   ├─ Test data created
   └─ Servers started

2. Automated Tests
   ├─ API Tests (node)
   ├─ UI Tests (Playwright)
   └─ Coverage report

3. Manual Testing
   ├─ Functional Checklist
   ├─ Visual Testing
   └─ Accessibility Check

4. Results & Sign-Off
   ├─ Log all findings
   ├─ Prioritize issues
   └─ Get approval

5. Regression (if bugs fixed)
   └─ Re-run affected tests
```

## 🛠️ Troubleshooting

### Tests Won't Run?
See **EMPLOYER_DASHBOARD_TESTING_GUIDE.md** → Troubleshooting section

### Tests Failing?
1. Check servers are running on correct ports (3000, 3001)
2. Verify database has test data
3. Check console for error messages
4. Review the specific test output

### Can't Access Dashboard?
1. Ensure frontend server is running (`http://localhost:3000`)
2. Check you're logged in as an employer (role_id: 2)
3. Verify authentication token in localStorage
4. Check browser console for errors

## 📚 Related Files

- Backend: `eswatini_lmis_backend/routes/employerRoutes.js`
- Frontend: `eswatini_lmis_frontend/src/pages/EmployerDashboard.js`
- API: `eswatini_lmis_frontend/src/services/api.js`
- Middleware: `eswatini_lmis_backend/authMiddleware.js`

## 🎓 Key Concepts Tested

### Authentication Flow
```
User Input (email/password)
    ↓
POST /api/auth/login
    ↓
Return JWT Token
    ↓
Store in localStorage
    ↓
Send with subsequent requests
```

### Authorization Check
```
Request to /api/employers/jobs
    ↓
Check JWT validity
    ↓
Verify role_id === 2 (employer)
    ↓
If valid → Fetch employer's jobs
If not → Return 401 or 403 error
```

### Dashboard Data Flow
```
Component Mount
    ↓
Check localStorage for token
    ↓
Decode and validate token
    ↓
Fetch /api/employers/jobs
    ↓
Fetch /api/jobs (all vacancies)
    ↓
Calculate statistics
    ↓
Render UI with data
```

## ✅ Pre-Testing Checklist

- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Database connected and ready
- [ ] Test employer account created (employer@test.com)
- [ ] Test data populated in database
- [ ] Browser dev tools open to check console
- [ ] Network tab available to monitor API calls
- [ ] Node.js and npm installed globally

## 📞 Support

For issues or questions:
1. Check the troubleshooting section in **EMPLOYER_DASHBOARD_TESTING_GUIDE.md**
2. Review test output and console errors
3. Check browser DevTools (F12)
4. Review component source code

---

**Testing Package Version:** 1.0  
**Last Updated:** 2026-06-11  
**Status:** Ready for Testing  

Start with **EMPLOYER_DASHBOARD_TESTING_OVERVIEW.md** →

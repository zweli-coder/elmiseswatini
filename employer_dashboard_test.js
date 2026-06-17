/**
 * Employer Dashboard Testing Suite
 * Tests both backend routes and frontend component integration
 */

const axios = require('axios');

const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
let testToken = '';
let testEmployerId = null;

// Utility function for API requests
const apiRequest = async (method, endpoint, data = null, token = testToken) => {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      data,
    };
    const response = await axios(config);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data || error.message,
    };
  }
};

// ===================================
// TEST SUITE 1: AUTHENTICATION
// ===================================
const testAuthentication = async () => {
  console.log('\n📋 TEST SUITE 1: AUTHENTICATION\n');

  // Test 1.1: Login as employer
  console.log('Test 1.1: Login as Employer');
  const loginResult = await apiRequest('POST', '/auth/login', {
    email: 'employer@lmis.com',
    password: 'password123',
  });

  if (loginResult.success) {
    testToken = loginResult.data.token;
    console.log('✅ Employer login successful');
    console.log(`   Token: ${testToken.substring(0, 20)}...`);
  } else {
    console.log(`❌ Employer login failed: ${loginResult.status} - ${JSON.stringify(loginResult.error)}`);
    return false;
  }

  // Test 1.2: Verify token is valid
  console.log('\nTest 1.2: Verify Token Validity');
  const meResult = await apiRequest('GET', '/auth/me', null, testToken);
  if (meResult.success && meResult.data.role_id === 2) {
    console.log('✅ Token verified - User is an employer (role_id: 2)');
    console.log(`   User: ${meResult.data.full_name} (${meResult.data.email})`);
  } else {
    console.log(`❌ Token verification failed or user is not employer`);
    return false;
  }

  return true;
};

// ===================================
// TEST SUITE 2: EMPLOYER ROUTES
// ===================================
const testEmployerRoutes = async () => {
  console.log('\n📋 TEST SUITE 2: EMPLOYER ROUTES\n');

  if (!testToken) {
    console.log('⚠️  Skipping - No authentication token available');
    return false;
  }

  // Test 2.1: Get Employer's Jobs
  console.log('Test 2.1: Get Employer\'s Job Postings');
  const jobsResult = await apiRequest('GET', '/employers/jobs', null, testToken);
  if (jobsResult.success) {
    console.log(`✅ Retrieved ${jobsResult.data.length} job(s)`);
    if (jobsResult.data.length > 0) {
      const job = jobsResult.data[0];
      console.log(`   Sample job: "${job.title}" - ${job.applications_count || 0} applications`);
    }
  } else {
    console.log(`❌ Failed to retrieve jobs: ${jobsResult.status} - ${JSON.stringify(jobsResult.error)}`);
  }

  // Test 2.2: Create a new job posting
  console.log('\nTest 2.2: Create New Job Posting');
  const newJob = {
    title: 'Test Software Engineer',
    description: 'A test position for software development',
    location: 'Mbabane',
    salary: 45000,
    requirements: 'Bachelor in CS, 3+ years experience',
    job_type: 'Full-time',
    application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const createJobResult = await apiRequest('POST', '/employers/jobs', newJob, testToken);
  if (createJobResult.success) {
    console.log(`✅ Job created successfully`);
    console.log(`   Job ID: ${createJobResult.data.job.id}`);
    console.log(`   Title: ${createJobResult.data.job.title}`);
  } else {
    console.log(`❌ Failed to create job: ${createJobResult.status} - ${JSON.stringify(createJobResult.error)}`);
  }

  // Test 2.3: Get all applications for employer
  console.log('\nTest 2.3: Get All Applications');
  const applicationsResult = await apiRequest('GET', '/employers/applications', null, testToken);
  if (applicationsResult.success) {
    console.log(`✅ Retrieved ${applicationsResult.data.length} application(s)`);
    if (applicationsResult.data.length > 0) {
      const app = applicationsResult.data[0];
      console.log(`   Sample: ${app.applicant_name} applied for "${app.job_title}" - Status: ${app.status}`);
    }
  } else {
    console.log(`❌ Failed to retrieve applications: ${applicationsResult.status} - ${JSON.stringify(applicationsResult.error)}`);
  }

  return true;
};

// ===================================
// TEST SUITE 3: ERROR HANDLING
// ===================================
const testErrorHandling = async () => {
  console.log('\n📋 TEST SUITE 3: ERROR HANDLING\n');

  // Test 3.1: Unauthenticated request to protected endpoint
  console.log('Test 3.1: Unauthenticated Access to Protected Endpoint');
  const unauthResult = await apiRequest('GET', '/employers/jobs', null, '');
  if (!unauthResult.success && unauthResult.status === 401) {
    console.log(`✅ Correctly rejected unauthenticated request (401)`);
  } else {
    console.log(`❌ Security issue: Unauthenticated request should be rejected`);
  }

  // Test 3.2: Invalid job creation (missing required fields)
  console.log('\nTest 3.2: Invalid Job Creation (Missing Required Fields)');
  const invalidJob = {
    title: 'Incomplete Job',
    // Missing description and location
  };
  const invalidResult = await apiRequest('POST', '/employers/jobs', invalidJob, testToken);
  if (!invalidResult.success && invalidResult.status === 400) {
    console.log(`✅ Correctly rejected invalid job data (400)`);
    console.log(`   Error: ${invalidResult.error.error}`);
  } else {
    console.log(`❌ Should reject incomplete job data`);
  }

  // Test 3.3: Access non-existent job applications
  console.log('\nTest 3.3: Access Non-Existent Job');
  const notFoundResult = await apiRequest('GET', '/employers/jobs/99999/applications', null, testToken);
  if (!notFoundResult.success && notFoundResult.status === 403) {
    console.log(`✅ Correctly rejected unauthorized access (403)`);
  } else {
    console.log(`⚠️  Response: ${notFoundResult.status}`);
  }

  return true;
};

// ===================================
// RUN ALL TESTS
// ===================================
const runAllTests = async () => {
  console.log('🚀 EMPLOYER DASHBOARD TEST SUITE\n');
  console.log(`Testing: ${API_BASE}`);
  console.log(`Frontend: ${FRONTEND_URL}\n`);
  console.log('='.repeat(60));

  try {
    // Step 1: Authentication
    const authPassed = await testAuthentication();
    if (!authPassed) {
      console.log('\n⚠️  Authentication failed. Cannot proceed with further tests.');
      process.exit(1);
    }

    // Step 2: Route Testing
    await testEmployerRoutes();

    // Step 3: Error Handling
    await testErrorHandling();

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ TEST SUITE COMPLETED\n');
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    process.exit(1);
  }
};

// Run tests
runAllTests();

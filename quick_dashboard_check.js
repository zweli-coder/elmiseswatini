#!/usr/bin/env node

const axios = require('axios');

const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';
// Test registration and login
const testRegistration = async () => {
  try {
    console.log('🧪 Testing Employer Dashboard - Quick Check\n');
    
    // 1. Try to register a test employer
    console.log('Step 1: Registering test employer...');
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      full_name: 'Test Employer Dashboard',
      email: 'test_employer_dashboard@lmis.com',
      password: 'TestPass123!',
      role_id: 2
    }).catch(err => {
      if (err.response?.status === 400 && err.response?.data?.error?.includes('already exists')) {
        console.log('   ⓘ User already exists (that\'s fine)');
        return null;
      }
      throw err;
    });
    
    if (registerRes) {
      console.log('   ✅ Registered:', registerRes.data.email);
    }
    
    // 2. Login with test credentials
    console.log('\nStep 2: Logging in...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test_employer_dashboard@lmis.com',
      password: 'TestPass123!'
    });
    
    console.log('   ✅ Login successful');
    const token = loginRes.data.token;
    console.log('   Token:', token.substring(0, 20) + '...');
    
    // 3. Get user info
    console.log('\nStep 3: Fetching user info...');
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('   ✅ User info retrieved');
    console.log(`   Name: ${meRes.data.full_name}`);
    console.log(`   Email: ${meRes.data.email}`);
    console.log(`   Role ID: ${meRes.data.role_id} (2 = Employer)`);
    
    // 4. Get employer jobs
    console.log('\nStep 4: Fetching employer jobs...');
    const jobsRes = await axios.get(`${API_BASE}/employers/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   ✅ Retrieved ${jobsRes.data.length} jobs`);
    if (jobsRes.data.length > 0) {
      console.log(`   Sample: ${jobsRes.data[0].title} (${jobsRes.data[0].applications_count} applications)`);
    }
    
    // 5. Get all vacancies
    console.log('\nStep 5: Fetching all vacancies...');
    const vacanciesRes = await axios.get(`${API_BASE}/jobs`);
    
    console.log(`   ✅ Retrieved ${vacanciesRes.data.length} total vacancies in system`);
    
    // 6. Get applications
    console.log('\nStep 6: Fetching applications...');
    const appsRes = await axios.get(`${API_BASE}/employers/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`   ✅ Retrieved ${appsRes.data.length} applications`);
    if (appsRes.data.length > 0) {
      console.log(`   Sample: ${appsRes.data[0].applicant_name} applied for "${appsRes.data[0].job_title}"`);
    }
    
    console.log('\n✅ ALL TESTS PASSED - DASHBOARD IS WORKING!\n');
    console.log('Summary:');
    console.log('  • Authentication: ✅');
    console.log('  • Jobs API: ✅');
    console.log('  • Vacancies API: ✅');
    console.log('  • Applications API: ✅');
    console.log('\n📌 Test Credentials:');
    console.log('  Email: test_employer_dashboard@lmis.com');
    console.log('  Password: TestPass123!');
    
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
  }
};

testRegistration();

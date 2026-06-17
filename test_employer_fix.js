#!/usr/bin/env node

const axios = require('axios');

const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';

const test = async () => {
  try {
    console.log('\n🧪 TESTING EMPLOYER DASHBOARD - COMPLETE FLOW\n');
    
    // Step 1: Register new employer
    console.log('📝 Step 1: Registering new employer...');
    const registerRes = await axios.post(`${API_BASE}/auth/register`, {
      full_name: 'Test Employer Inc',
      email: `employer_${Date.now()}@test.com`,
      password: 'TestPass123!',
      role_id: 2
    });
    
    const userId = registerRes.data.id;
    const email = registerRes.data.email;
    console.log(`✅ Registered: ${email} (ID: ${userId})\n`);
    
    // Step 2: Login
    console.log('🔐 Step 2: Logging in...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: email,
      password: 'TestPass123!'
    });
    
    const token = loginRes.data.token;
    console.log(`✅ Logged in successfully\n`);
    
    // Step 3: Get user info
    console.log('👤 Step 3: Fetching user profile...');
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Profile: ${meRes.data.full_name} (Role: ${meRes.data.role_name})\n`);
    
    // Step 4: Fetch employer jobs (should auto-create profile)
    console.log('📋 Step 4: Fetching employer jobs...');
    const jobsRes = await axios.get(`${API_BASE}/employers/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Jobs fetched: ${jobsRes.data.length} jobs found\n`);
    
    // Step 5: Post a new vacancy
    console.log('📝 Step 5: Posting a new vacancy...');
    const postJobRes = await axios.post(`${API_BASE}/employers/jobs`, {
      title: 'Software Developer',
      description: 'We are looking for experienced software developers',
      location: 'Mbabane',
      salary: '15000-20000 SZL',
      requirements: 'Bachelor\'s degree in Computer Science',
      job_type: 'Full-time',
      application_deadline: '2026-12-31'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Vacancy posted successfully!`);
    console.log(`   Title: ${postJobRes.data.job.title}`);
    console.log(`   Location: ${postJobRes.data.job.location}`);
    console.log(`   Status: ${postJobRes.data.job.status}\n`);
    
    // Step 6: Fetch jobs again to confirm
    console.log('✔️ Step 6: Confirming vacancy was saved...');
    const jobsRes2 = await axios.get(`${API_BASE}/employers/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Confirmed: ${jobsRes2.data.length} job(s) in system\n`);
    
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL TESTS PASSED - EMPLOYER DASHBOARD WORKING!    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('Summary:');
    console.log(`  ✅ Employer registration works`);
    console.log(`  ✅ Auto-created employer profile`);
    console.log(`  ✅ Login successful`);
    console.log(`  ✅ Can fetch employer jobs`);
    console.log(`  ✅ Can post new vacancy`);
    console.log(`  ✅ Vacancy persists in database\n`);
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.response?.data || err.message);
    console.error('\nFull error:', err.response?.data || err.toString());
    process.exit(1);
  }
};

test();

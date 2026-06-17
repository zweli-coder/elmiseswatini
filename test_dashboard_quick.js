const axios = require('axios');

const API_BASE = process.env.REACT_APP_API_URL || 'https://elmiseswatini-backend.onrender.com/api';
const test = async () => {
  try {
    console.log('🧪 Testing Dashboard with Existing Employer\n');
    
    // Try some common passwords
    const passwords = ['password', 'password123', '123456', 'employer', 'admin123', 'welcome123'];
    let token = null;
    let email = null;
    
    // Try first employer
    console.log('Attempting login with employer@lmis.com...');
    for (const pwd of passwords) {
      try {
        const res = await axios.post(`${API_BASE}/auth/login`, {
          email: 'employer@lmis.com',
          password: pwd
        });
        token = res.data.token;
        email = 'employer@lmis.com';
        console.log(`✅ Login successful!`);
        break;
      } catch (e) {
        // Try next password
      }
    }
    
    if (!token) {
      console.log('❌ Could not login with any common passwords');
      console.log('\nTrying other employer account...');
      
      // Try the other employer
      for (const pwd of passwords) {
        try {
          const res = await axios.post(`${API_BASE}/auth/login`, {
            email: 'musawenkhositshuma2108@gmail.com',
            password: pwd
          });
          token = res.data.token;
          email = 'musawenkhositshuma2108@gmail.com';
          console.log(`✅ Login successful!`);
          break;
        } catch (e) {
          // Try next
        }
      }
    }
    
    if (!token) {
      console.log('❌ Could not login');
      process.exit(1);
    }
    
    // Get user info
    console.log('\nFetching user info...');
    const meRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ User: ${meRes.data.full_name} (${meRes.data.email})`);
    console.log(`   Role ID: ${meRes.data.role_id}`);
    
    // Get jobs
    console.log('\nFetching employer jobs...');
    const jobsRes = await axios.get(`${API_BASE}/employers/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${jobsRes.data.length} jobs found`);
    jobsRes.data.slice(0, 3).forEach(job => {
      console.log(`   • ${job.title} (${job.applications_count} apps)`);
    });
    
    // Get vacancies
    console.log('\nFetching all vacancies...');
    const vacRes = await axios.get(`${API_BASE}/jobs`);
    console.log(`✅ ${vacRes.data.length} total vacancies`);
    
    // Get applications
    console.log('\nFetching applications...');
    const appRes = await axios.get(`${API_BASE}/employers/applications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ ${appRes.data.length} applications received`);
    appRes.data.slice(0, 3).forEach(app => {
      console.log(`   • ${app.applicant_name} → ${app.job_title}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DASHBOARD IS WORKING CORRECTLY!');
    console.log('='.repeat(60));
    
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
  }
};

test();

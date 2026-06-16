#!/usr/bin/env node

const pool = require('./eswatini_lmis_backend/config/db');

const setupEmployer = async () => {
  try {
    console.log('Setting up employer profile for test user...\n');
    
    // Get the user
    const userRes = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      ['test_employer_dashboard@lmis.com']
    );
    
    if (userRes.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    const userId = userRes.rows[0].id;
    console.log(`✅ Found user ID: ${userId}`);
    
    // Check if employer profile exists
    const empRes = await pool.query(
      'SELECT id FROM employers WHERE user_id = $1',
      [userId]
    );
    
    if (empRes.rows.length > 0) {
      console.log('✅ Employer profile already exists');
      process.exit(0);
    }
    
    // Create employer profile
    const createRes = await pool.query(
      'INSERT INTO employers (user_id, company_name) VALUES ($1, $2) RETURNING id',
      [userId, 'Test Company Dashboard']
    );
    
    console.log(`✅ Created employer profile (ID: ${createRes.rows[0].id})`);
    console.log('\nEmployer setup complete!');
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

setupEmployer();

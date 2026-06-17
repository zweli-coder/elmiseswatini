// employeeRoutes.js - COMPLETE FIXED VERSION
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyJobSeeker } = require('../authMiddleware');
const MAX_PROFILE_PIC_BASE64_LENGTH = 9 * 1024 * 1024; // ~9MB base64 encoded image

// ============================================
// GET /api/employees - Get all job seekers (for JobSeekers page)
// ============================================
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                js.id,
                js.user_id,
                js.national_id,
                js.phone,
                js.education_level,
                js.skills,
                js.experience_years,
                js.region,
                js.created_at,
                js.sector,
                js.employment_status,
                js.description,
                u.full_name AS fullname,
                js.profile_picture
            FROM job_seekers js
            INNER JOIN users u ON js.user_id = u.id
            ORDER BY js.created_at DESC
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching job seekers:', err); // Already good
        res.status(500).json({ 
            error: 'Failed to fetch job seekers',
            details: err.message 
        });
    }
});

// ============================================
// GET /api/employees/:id - Get single job seeker by ID
// ============================================
router.get('/:id(\\d+)', verifyJobSeeker, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT
                js.id,
                js.user_id,
                js.national_id,
                js.phone,
                js.education_level,
                js.skills,
                js.experience_years,
                js.region,
                js.created_at,
                js.sector,
                js.employment_status,
                js.description,
                u.full_name AS fullname,
                js.profile_picture
            FROM job_seekers js
            INNER JOIN users u ON js.user_id = u.id
            WHERE js.id = $1
        `, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job seeker not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('GET single job seeker error:', err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// POST /api/employees - Create job seeker (PUBLIC - for registration)
// ============================================
router.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { 
            full_name, 
            email, 
            password,
            national_id,
            description, 
            phone,
            education_level,
            region, 
            sector,
            skills,
            experience_years,
            profile_picture,
            employment_status
        } = req.body;
        
        if (profile_picture && profile_picture.length > MAX_PROFILE_PIC_BASE64_LENGTH) {
            return res.status(413).json({
                error: 'Profile picture payload too large. Please choose a smaller image.'
            });
        }

        // Validate required fields (password optional)
        if (!full_name || !email || !description) {
            return res.status(400).json({ 
                error: 'Missing required fields: full_name, email, description' 
            });
        }

        await client.query('BEGIN');

        // Step 1: Check if user already exists
        const userExists = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        let user_id;

        if (userExists.rows.length > 0) {
            // If user exists, reuse the user id (frontend registers first)
            user_id = userExists.rows[0].id;
            // If profile already exists, abort
            const profileExists = await client.query(
                'SELECT id FROM job_seekers WHERE user_id = $1',
                [user_id]
            );

            if (profileExists.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Job seeker profile already exists for this user' });
            }
        } else {
            // Step 2: Create user account (if not created by frontend)
            const bcrypt = require('bcryptjs');
            const crypto = require('crypto');
            const plainPassword = password || crypto.randomBytes(8).toString('hex');
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            const userResult = await client.query(`
                INSERT INTO users (full_name, email, password_hash, role_id, created_at)
                VALUES ($1, $2, $3, 3, NOW())
                RETURNING id
            `, [full_name, email, hashedPassword]);

            user_id = userResult.rows[0].id;
        }

        // Step 3: Create job seeker profile
        const result = await client.query(`
            INSERT INTO job_seekers (
                user_id,
                national_id,
                description,
                phone,
                education_level,
                region,
                sector,
                skills,
                experience_years,
                profile_picture,
                employment_status,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            RETURNING *
        `, [
            user_id,
            national_id || null,
            description,
            phone || null,
            education_level || null,
            region,
            sector,
            skills,
            experience_years || 0,
            profile_picture || null,
            employment_status || null
        ]);

        await client.query('COMMIT');

        res.json({ 
            message: 'Job seeker profile created successfully!', 
            profile: result.rows[0],
            user: {
                id: user_id,
                full_name,
                email
            }
        });
        
    } catch (err) {
        await client.query('ROLLBACK'); // Already good
        console.error('Profile creation error:', err); // Already good
        res.status(500).json({ 
            error: 'Failed to create profile',
            details: err.message 
        });
    } finally {
        client.release();
    }
});

// ============================================
// PUT /api/employees/:id - Update job seeker profile (PROTECTED - requires auth)
// ============================================
router.put('/:id(\\d+)', verifyJobSeeker, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            full_name, 
            email, 
            description, 
            region, 
            sector,
            employment_status,
            skills,
            experience_years,
            profile_picture
        } = req.body;
        
        const user_id = req.user.id; // From JWT token

        // Step 1: Update the users table with name and email
        await pool.query(`
            UPDATE users 
            SET full_name = $1, email = $2, updated_at = NOW()
            WHERE id = $3
        `, [full_name, email, user_id]);

        // Step 2: Update job seeker profile
        const result = await pool.query(`
            UPDATE job_seekers 
            SET 
                description = $1,
                region = $2,
                sector = $3,
                employment_status = $4,
                skills = $5,
                experience_years = $6,
                profile_picture = COALESCE($7, profile_picture),
                updated_at = NOW()
            WHERE id = $8 
            RETURNING *
        `, [description, region, sector, employment_status, skills, experience_years, profile_picture || null, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Job seeker profile not found' });
        }

        res.json({ 
            message: 'Profile updated successfully!', 
            profile: result.rows[0] 
        });
        
    } catch (err) {
        console.error('Profile update error:', err); // Already good
        res.status(500).json({ 
            error: 'Failed to update profile',
            details: err.message 
        });
    }
});

module.exports = router;
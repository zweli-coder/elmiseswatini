// employerRoutes.js - COMPLETE FIXED VERSION
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyEmployer } = require('../authMiddleware');

async function getEmployerId(userId) {
    let result = await pool.query(
        'SELECT id FROM employers WHERE user_id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        // Auto-create employer profile if it doesn't exist
        try {
            const user = await pool.query(
                'SELECT full_name FROM users WHERE id = $1',
                [userId]
            );
            
            if (user.rows.length === 0) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }

            const createResult = await pool.query(
                `INSERT INTO employers (user_id, company_name, industry, location)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id`,
                [userId, user.rows[0].full_name + " Company", "General", "Mbabane"]
            );
            
            console.log(`✅ Auto-created employer profile for user ${userId}`);
            return createResult.rows[0].id;
        } catch (err) {
            console.error('Failed to auto-create employer profile:', err);
            const error = new Error('Employer profile not found and could not be created');
            error.status = 404;
            throw error;
        }
    }

    return result.rows[0].id;
}

// ============================================
// POST /api/employers/jobs - Create a new job posting
// ============================================
router.post('/jobs', verifyEmployer, async (req, res) => {
    try {
        const { 
            title, 
            description, 
            location, 
            salary,
            requirements,
            job_type,
            application_deadline
        } = req.body;
        
        const employer_id = await getEmployerId(req.user.id);

        // Validate required fields
        if (!title || !description || !location) {
            return res.status(400).json({ 
                error: 'Title, description, and location are required' 
            });
        }

        const result = await pool.query(`
            INSERT INTO jobs (
                employer_id, 
                title, 
                description, 
                location, 
                salary,
                requirements,
                job_type,
                status,
                application_deadline,
                created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'open', $8, NOW())
            RETURNING *
        `, [employer_id, title, description, location, salary, requirements, job_type, application_deadline]);

        res.json({ 
            message: 'Job posted successfully!', 
            job: result.rows[0] 
        });
        
    } catch (err) {
        if (err.status === 404) {
            return res.status(404).json({ error: err.message });
        }
        console.error('Job posting error:', err);
        res.status(500).json({ 
            error: 'Failed to post job',
            details: err.message 
        });
    }
});

// ============================================
// GET /api/employers/jobs - Get all jobs posted by this employer
// ============================================
router.get('/jobs', verifyEmployer, async (req, res) => {
    try {
        const employer_id = await getEmployerId(req.user.id);

        const result = await pool.query(`
            SELECT 
                j.*,
                COUNT(a.id) AS applications_count,
                COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_count,
                COUNT(CASE WHEN a.status = 'accepted' THEN 1 END) AS accepted_count,
                COUNT(CASE WHEN a.status = 'rejected' THEN 1 END) AS rejected_count
            FROM jobs j
            LEFT JOIN applications a ON j.id = a.job_id
            WHERE j.employer_id = $1
            GROUP BY j.id
            ORDER BY j.created_at DESC
        `, [employer_id]);

        res.json(result.rows);
    } catch (err) {
        if (err.status === 404) {
            return res.status(404).json({ error: err.message });
        }
        console.error('Employer jobs error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch your jobs',
            details: err.message 
        });
    }
});

// ============================================
// GET /api/employers/applications - Get all applications for this employer's jobs
// ============================================
router.get('/applications', verifyEmployer, async (req, res) => {
    try {
        const employer_id = await getEmployerId(req.user.id);

        const result = await pool.query(`
            SELECT 
                a.id,
                a.job_id,
                a.employee_id,
                a.status,
                a.applied_at,
                a.cover_letter,
                a.cv_file_path,
                a.cover_letter_file_path,
                j.title AS job_title,
                u.full_name AS applicant_name,
                u.email AS applicant_email,
                js.experience_years
            FROM applications a
            INNER JOIN jobs j ON a.job_id = j.id
            LEFT JOIN users u ON COALESCE(a.employee_id, a.user_id) = u.id
            LEFT JOIN job_seekers js ON u.id = js.user_id
            WHERE j.employer_id = $1
            ORDER BY a.applied_at DESC
        `, [employer_id]);

        res.json(result.rows);
    } catch (err) {
        if (err.status === 404) {
            return res.status(404).json({ error: err.message });
        }
        console.error('Employer overall applications error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch all applications',
            details: err.message 
        });
    }
});

// ============================================
// GET /api/employers/jobs/:job_id/applications - View applications for a specific job
// ============================================
router.get('/jobs/:job_id/applications', verifyEmployer, async (req, res) => {
    try {
        const { job_id } = req.params;
        const employer_id = await getEmployerId(req.user.id);

        // First verify this job belongs to this employer
        const jobCheck = await pool.query(`
            SELECT id FROM jobs 
            WHERE id = $1 AND employer_id = $2
        `, [job_id, employer_id]);

        if (jobCheck.rows.length === 0) {
            return res.status(403).json({ 
                error: 'You do not have access to this job\'s applications' 
            });
        }

        const result = await pool.query(`
            SELECT 
                a.id,
                a.status,
                a.applied_at,
                u.id AS applicant_id,
                u.full_name AS applicant_name,
                u.email AS applicant_email,
                js.sector,
                js.region,
                js.description AS applicant_profile,
                js.skills,
                js.experience_years
            FROM applications a
            INNER JOIN users u ON a.employee_id = u.id
            LEFT JOIN job_seekers js ON u.id = js.user_id
            WHERE a.job_id = $1
            ORDER BY a.applied_at DESC
        `, [job_id]);

        res.json(result.rows);
    } catch (err) {
        if (err.status === 404) {
            return res.status(404).json({ error: err.message });
        }
        console.error('Applications fetch error:', err);
        res.status(500).json({ 
            error: 'Failed to fetch applications',
            details: err.message 
        });
    }
});

// ============================================
// PUT /api/employers/applications/:app_id - Update application status
// ============================================
router.put('/applications/:app_id', verifyEmployer, async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { app_id } = req.params;
        const { status } = req.body;
        const employer_id = await getEmployerId(req.user.id);

        // Validate status
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ 
                error: 'Status must be "accepted" or "rejected"' 
            });
        }

        await client.query('BEGIN');

        // Verify this application belongs to a job owned by this employer
        const authCheck = await client.query(`
            SELECT a.id, a.job_id, a.status AS current_status
            FROM applications a
            INNER JOIN jobs j ON a.job_id = j.id
            WHERE a.id = $1 AND j.employer_id = $2
        `, [app_id, employer_id]);

        if (authCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ 
                error: 'You do not have permission to update this application' 
            });
        }

        // Don't allow updating already processed applications
        const currentStatus = authCheck.rows[0].current_status;
        if (currentStatus !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: `This application has already been ${currentStatus}` 
            });
        }

        // Update the application
        const result = await client.query(`
            UPDATE applications 
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING *
        `, [status, app_id]);

        // If accepting, optionally close the job position
        if (status === 'accepted') {
            await client.query(`
                UPDATE jobs 
                SET status = 'closed', updated_at = NOW()
                WHERE id = $1 AND status = 'open'
            `, [authCheck.rows[0].job_id]);
        }

        await client.query('COMMIT');

        res.json({ 
            message: `Application ${status} successfully`, 
            application: result.rows[0] 
        });
        
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.status === 404) {
            return res.status(404).json({ error: err.message });
        }
        console.error('Application update error:', err);
        res.status(500).json({ 
            error: 'Failed to update application',
            details: err.message 
        });
    } finally {
        client.release();
    }
});

// ============================================
// PUT /api/employers/jobs/:job_id/close - Close a job posting
// ============================================
router.put('/jobs/:job_id/close', verifyEmployer, async (req, res) => {
    try {
        const { job_id } = req.params;
        const employer_id = await getEmployerId(req.user.id);

        const result = await pool.query(`
            UPDATE jobs 
            SET status = 'closed', updated_at = NOW()
            WHERE id = $1 AND employer_id = $2 AND status = 'open'
            RETURNING *
        `, [job_id, employer_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Job not found, already closed, or you do not own it' 
            });
        }

        res.json({ 
            message: 'Job closed successfully', 
            job: result.rows[0] 
        });
        
    } catch (err) {
        if (err.status === 404) {
            return res.status(404).json({ error: err.message });
        }
        console.error('Job close error:', err);
        res.status(500).json({ 
            error: 'Failed to close job',
            details: err.message 
        });
    }
});

module.exports = router;
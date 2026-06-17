const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyEmployer } = require('../authMiddleware');

//
// CREATE VACANCY
//
router.post('/', verifyEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;

    const {
      title,
      description,
      location,
      job_type,
      sector,
      organisation_name
    } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({
        error: 'Title, description and location are required'
      });
    }

    const result = await pool.query(
      `
      INSERT INTO jobs
      (
        employer_id,
        title,
        description,
        location,
        job_type,
        sector,
        organisation_name,
        status,
        created_at
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,'open',NOW()
      )
      RETURNING *
      `,
      [
        employerId,
        title,
        description,
        location,
        job_type,
        sector,
        organisation_name
      ]
    );

    res.status(201).json({
      message: 'Vacancy created successfully',
      vacancy: result.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

//
// GET MY VACANCIES
//
router.get('/', verifyEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;

    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE employer_id = $1
      ORDER BY created_at DESC
      `,
      [employerId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

//
// GET SINGLE VACANCY
//
router.get('/:id', verifyEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE id = $1
      AND employer_id = $2
      `,
      [id, employerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Vacancy not found'
      });
    }

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

//
// UPDATE VACANCY
//
router.put('/:id', verifyEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;
    const { id } = req.params;

    const {
      title,
      description,
      location,
      job_type,
      sector,
      organisation_name,
      status
    } = req.body;

    const result = await pool.query(
      `
      UPDATE jobs
      SET
        title = $1,
        description = $2,
        location = $3,
        job_type = $4,
        sector = $5,
        organisation_name = $6,
        status = $7
      WHERE id = $8
      AND employer_id = $9
      RETURNING *
      `,
      [
        title,
        description,
        location,
        job_type,
        sector,
        organisation_name,
        status,
        id,
        employerId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Vacancy not found'
      });
    }

    res.json({
      message: 'Vacancy updated successfully',
      vacancy: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

//
// DELETE VACANCY
//
router.delete('/:id', verifyEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM jobs
      WHERE id = $1
      AND employer_id = $2
      RETURNING *
      `,
      [id, employerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Vacancy not found'
      });
    }

    res.json({
      message: 'Vacancy deleted successfully'
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

//
// VIEW APPLICATIONS FOR MY VACANCIES
//
router.get('/applications', verifyEmployer, async (req, res) => {
  try {
    const employerId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.applied_at,
        j.title,
        u.full_name,
        u.email
      FROM applications a
      INNER JOIN jobs j
        ON a.job_id = j.id
      INNER JOIN users u
        ON a.employee_id = u.id
      WHERE j.employer_id = $1
      ORDER BY a.applied_at DESC
      `,
      [employerId]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

//
// ACCEPT APPLICATION
//
router.put(
  '/applications/:id/accept',
  verifyEmployer,
  async (req, res) => {
    try {
      const employerId = req.user.id;
      const applicationId = req.params.id;

      const result = await pool.query(
        `
        UPDATE applications a
        SET status = 'accepted'
        FROM jobs j
        WHERE a.job_id = j.id
        AND j.employer_id = $1
        AND a.id = $2
        RETURNING a.*
        `,
        [employerId, applicationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Application not found'
        });
      }

      res.json({
        message: 'Application accepted'
      });

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

//
// REJECT APPLICATION
//
router.put(
  '/applications/:id/reject',
  verifyEmployer,
  async (req, res) => {
    try {
      const employerId = req.user.id;
      const applicationId = req.params.id;

      const result = await pool.query(
        `
        UPDATE applications a
        SET status = 'rejected'
        FROM jobs j
        WHERE a.job_id = j.id
        AND j.employer_id = $1
        AND a.id = $2
        RETURNING a.*
        `,
        [employerId, applicationId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Application not found'
        });
      }

      res.json({
        message: 'Application rejected'
      });

    } catch (err) {
      res.status(500).json({
        error: err.message
      });
    }
  }
);

module.exports = router;
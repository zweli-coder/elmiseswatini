// statisticsRoutes.js — FIXED
// Public-facing statistics API.
// Replaces the original file entirely.

const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const pool    = require('../config/db');

const statisticsUploadDirectory = path.resolve(__dirname, '..', 'uploads', 'statistics');
if (!fs.existsSync(statisticsUploadDirectory)) {
  fs.mkdirSync(statisticsUploadDirectory, { recursive: true });
}

const buildStatisticsFileMetadata = (fileName) => {
  const fileType = path.extname(fileName).toLowerCase().replace('.', '');
  const matches  = fileName.match(/^(\d+)-(.+)$/);
  return {
    id:           fileName,
    filename:     fileName,
    originalName: matches ? matches[2] : fileName,
    fileType,
    uploadedAt:   matches ? new Date(parseInt(matches[1])) : new Date(),
    filePath:     `/uploads/statistics/${fileName}`,
    uploadPath:   `/uploads/statistics/${fileName}`,
  };
};

// ── GET /api/statistics ───────────────────────────────────────
// High-level counts used by the home-page / dashboard widgets.
router.get('/', async (_req, res) => {
  try {
    await pool.query('SELECT NOW()');

    const employerResult = await pool.query(`SELECT COUNT(*) AS total FROM employers`);

    let jobSeekerCount = 0;
    try {
      const r = await pool.query(`SELECT COUNT(*) AS total FROM job_seekers`);
      jobSeekerCount = parseInt(r.rows[0]?.total || 0);
    } catch (_) { /* table may not exist yet */ }

    const jobsResult         = await pool.query(`SELECT COUNT(*) AS total FROM jobs WHERE status = 'open'`);
    const publicationsResult = await pool.query(`SELECT COUNT(*) AS total FROM publications`);

    res.status(200).json({
      status: 'success',
      data: {
        totalEmployers:   parseInt(employerResult.rows[0]?.total || 0),
        totalJobSeekers:  jobSeekerCount,
        activeJobs:       parseInt(jobsResult.rows[0]?.total || 0),
        totalPublications: parseInt(publicationsResult.rows[0]?.total || 0),
      },
    });
  } catch (err) {
    console.error('Statistics error:', err);
    res.status(500).json({ status: 'error', error: 'Failed to fetch statistics', details: err.message });
  }
});

// ── GET /api/statistics/raw ───────────────────────────────────
// Returns ALL rows from statistical_data, newest first.
// Used by the public Statistics page to populate cards and charts.
router.get('/raw', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT sd.id,
              sd.year,
              sd.category,
              sd.industry,
              sd.region,
              sd.value,
              sd.upload_id,
              sd.created_at,
              su.title AS upload_title,
              su.description AS upload_description,
              su.category AS upload_category,
              su.year AS upload_year
       FROM   statistical_data sd
       LEFT JOIN statistics_uploads su ON sd.upload_id = su.id
       ORDER  BY sd.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('raw stats error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/statistics/charts ────────────────────────────────
// Builds Chart.js-ready chartData from statistical_data.
// Falls back to empty structure when the table is empty.
router.get('/charts', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT year, category, industry, region, CAST(value AS FLOAT) AS value
       FROM   statistical_data
       ORDER  BY year ASC`
    );

    if (rows.length === 0) {
      return res.json({ chartData: { labels: [], datasets: [] }, treemap: { tree: [] } });
    }

    // unique lists
    const regions    = [...new Set(rows.map(r => r.region).filter(Boolean))];
    const industries = [...new Set(rows.map(r => r.industry).filter(Boolean))];
    const labels     = industries.length ? industries : [...new Set(rows.map(r => r.year))];

    // one dataset per region, values averaged per label bucket
    const PALETTE = ['#3b82f6','#f97316','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#ef4444'];
    const datasets = regions.map((region, idx) => {
      const data = labels.map(label => {
        const matches = rows.filter(r =>
          r.region === region && (r.industry === label || r.year === label)
        );
        if (!matches.length) return 0;
        const sum = matches.reduce((acc, r) => acc + (parseFloat(r.value) || 0), 0);
        return parseFloat((sum / matches.length).toFixed(4));
      });
      return {
        label: region,
        data,
        backgroundColor: PALETTE[idx % PALETTE.length],
        borderColor:     PALETTE[idx % PALETTE.length],
      };
    });

    const treemap = {
      tree: rows.map(r => ({ v: parseFloat(r.value) || 0, label: r.industry || r.region || r.category })),
    };

    res.status(200).json({ chartData: { labels, datasets }, treemap });
  } catch (err) {
    console.error('charts error:', err.message);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// ── GET /api/statistics/summary ───────────────────────────────
router.get('/summary', async (_req, res) => {
  try {
    let employersByIndustry  = [];
    let employmentByStatus   = [];
    let jobsByMonth          = [];
    let applicationStatus    = [];

    try {
      const r = await pool.query(`
        SELECT COALESCE(industry, 'Not Specified') AS name, COUNT(*) AS value
        FROM   employers
        GROUP  BY industry ORDER BY value DESC
      `);
      employersByIndustry = r.rows.map(row => ({ name: row.name, value: parseInt(row.value) }));
    } catch (_) {}

    try {
      const r = await pool.query(`
        SELECT COALESCE(employment_status, 'Active Seeking') AS name, COUNT(*) AS value
        FROM   job_seekers GROUP BY employment_status
      `);
      employmentByStatus = r.rows.map(row => ({ name: row.name, value: parseInt(row.value) }));
    } catch (_) {}

    try {
      const r = await pool.query(`
        SELECT TO_CHAR(created_at, 'Mon YYYY') AS month, COUNT(*) AS count
        FROM   jobs
        WHERE  created_at >= NOW() - INTERVAL '6 months'
        GROUP  BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
        ORDER  BY DATE_TRUNC('month', created_at) ASC
      `);
      jobsByMonth = r.rows.map(row => ({ month: row.month, count: parseInt(row.count) }));
    } catch (_) {}

    try {
      const r = await pool.query(`SELECT status, COUNT(*) AS count FROM applications GROUP BY status`);
      applicationStatus = r.rows.map(row => ({ status: row.status, count: parseInt(row.count) }));
    } catch (_) {}

    res.status(200).json({
      status: 'success',
      data: { employersByIndustry, employmentByStatus, jobsByMonth, applicationStatus },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: 'Failed to fetch summary statistics', details: err.message });
  }
});

// ── GET /api/statistics/uploaded-files ────────────────────────
router.get('/uploaded-files', async (_req, res) => {
  try {
    if (!fs.existsSync(statisticsUploadDirectory)) return res.json([]);

    const files = fs.readdirSync(statisticsUploadDirectory)
      .filter(f => ['.csv','.xlsx','.xls','.json'].includes(path.extname(f).toLowerCase()))
      .map(fileName => {
        const filePath = path.join(statisticsUploadDirectory, fileName);
        const stats    = fs.statSync(filePath);
        return { ...buildStatisticsFileMetadata(fileName), fileSize: stats.size };
      })
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    res.json(files);
  } catch (err) {
    console.error('Error listing statistics uploads:', err);
    res.status(500).json({ error: 'Failed to list statistics uploads.' });
  }
});

module.exports = router;
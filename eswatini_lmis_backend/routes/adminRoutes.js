const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { verifyAdmin } = require('../authMiddleware');

// =============================================================
//  Upload folder setup
// =============================================================
const uploadDir = path.resolve(__dirname, '..', 'uploads', 'statistics');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

const normalizeKey = (key = '') => String(key || '')
  .replace(/\uFEFF/g, '')
  .trim()
  .replace(/\s+/g, ' ')
  .replace(/[_-]/g, ' ')
  .toLowerCase();

const parseStatisticalValue = (rawValue) => {
  if (rawValue === '' || rawValue == null) return null;
  let text = String(rawValue).trim();
  if (!text) return null;
  text = text.replace(/,/g, '').replace(/\u2011|\u202F/g, '');
  if (/^(n\/a|na|null|undefined|not available)$/i.test(text)) return null;
  const number = Number(text);
  return Number.isNaN(number) ? null : number;
};

const isLikelyYear = (value) => {
  const text = String(value || '').trim();
  return /^\d{4}$/.test(text) || /^\d{2}$/.test(text);
};

const isHeaderRow = (row) => {
  if (!Array.isArray(row)) return false;
  const low = row.map((cell) => String(cell || '').trim().toLowerCase());
  const keywords = ['year', 'category', 'industry', 'region', 'value', 'amount', 'figure', 'sector', 'indicator'];
  const matches = low.filter((cell) => keywords.some((key) => cell.includes(key)));
  return matches.length >= 2;
};

const isGenericHeaderRow = (row, nextRow) => {
  if (!Array.isArray(row)) return false;
  const normalized = row.map((cell) => String(cell || '').trim().toLowerCase()).join(' ');
  const genericHeader = ['column', 'field', 'header', 'name', 'code'].some((keyword) => normalized.includes(keyword));
  if (!genericHeader) return false;
  if (!Array.isArray(nextRow)) return false;
  return nextRow.some((cell) => parseStatisticalValue(cell) !== null || isLikelyYear(cell));
};

const shouldSkipRow = (row) => {
  if (!Array.isArray(row)) return false;
  const meaningful = row.map((cell) => String(cell || '').trim()).filter((text) => text !== '');
  if (meaningful.length === 0) return true;
  if (meaningful.length === 1 && !isLikelyYear(meaningful[0]) && parseStatisticalValue(meaningful[0]) == null) return true;
  return false;
};

const buildHeaders = (row) => row.map((cell, index) => {
  const text = String(cell || '').trim();
  return text || `column_${index + 1}`;
});

const buildRowObjects = (headers, rows) => rows
  .filter((row) => Array.isArray(row) && row.some((cell) => cell !== ''))
  .map((row) => {
    const rowObj = {};
    headers.forEach((header, index) => {
      rowObj[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : '';
    });
    return rowObj;
  });

const parseSheetFile = (filePath) => {
  const workbook = XLSX.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1, blankrows: false });
  const rows = rawRows.map((row) => Array.isArray(row) ? row : [row]);

  const headerRowIndex = rows.findIndex((row, index) => index < 5 && (isHeaderRow(row) || isGenericHeaderRow(row, rows[index + 1])));
  const headers = headerRowIndex !== -1
    ? buildHeaders(rows[headerRowIndex])
    : Array.from({ length: rows.reduce((max, row) => Math.max(max, Array.isArray(row) ? row.length : 0), 0) }, (_v, idx) => `column_${idx + 1}`);

  let dataRows = headerRowIndex !== -1 ? rows.slice(headerRowIndex + 1) : rows;
  if (headerRowIndex === -1) {
    const firstDataRow = rows.findIndex((row) => !shouldSkipRow(row));
    if (firstDataRow > 0) {
      dataRows = rows.slice(firstDataRow);
    }
  }

  const parsedRows = buildRowObjects(headers, dataRows);

  return {
    headers,
    rows: parsedRows,
    rowCount: parsedRows.length,
    sampleRows: parsedRows.slice(0, 10)
  };
};

const tryNormalizeRowByPosition = (row, metadata = {}) => {
  if (!row || typeof row !== 'object') return null;
  const values = Object.values(row)
    .map((v) => (v === undefined || v === null ? '' : String(v).trim()))
    .filter((v) => v !== '');

  if (values.length < 2) return null;
  const lastValue = parseStatisticalValue(values[values.length - 1]);
  if (lastValue == null) return null;

  if (values.length === 2) {
    if (isLikelyYear(values[0])) {
      return { year: values[0], category: '', industry: '', region: '', value: lastValue };
    }
    return { year: metadata.year || null, category: metadata.category || '', industry: '', region: values[0], value: lastValue };
  }

  if (values.length === 3) {
    if (isLikelyYear(values[0])) {
      return { year: values[0], category: values[1], industry: '', region: '', value: lastValue };
    }
    return { year: metadata.year || null, category: '', industry: '', region: values[0], value: lastValue };
  }

  if (values.length === 4) {
    if (isLikelyYear(values[0])) {
      return { year: values[0], category: values[1], industry: values[2], region: '', value: lastValue };
    }
    return { year: metadata.year || null, category: values[0], industry: values[1], region: values[2], value: lastValue };
  }

  if (values.length >= 5 && isLikelyYear(values[0])) {
    return { year: values[0], category: values[1], industry: values[2], region: values[3], value: lastValue };
  }

  return null;
};

const normalizeUploadRow = (row, metadata = {}) => {
  if (!row || typeof row !== 'object') return null;

  const map = {};
  Object.entries(row).forEach(([key, value]) => {
    map[normalizeKey(String(key))] = value;
  });

  const getValue = (keys) => keys.reduce((result, key) => {
    if (result !== undefined) return result;
    return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
  }, undefined);

  const rawYear = getValue(['year', 'yr', 'fiscal year', 'financial year', 'period']);
  const rawCategory = getValue(['category', 'cat', 'statistics category', 'data category', 'indicator', 'group', 'sub category', 'sub-category']);
  const rawIndustry = getValue(['industry', 'sector', 'industry group', 'industry_group', 'economic sector', 'sector name']);
  const rawRegion = getValue(['region', 'area', 'province', 'district', 'region name', 'location', 'state']);
  const rawValue = getValue(['value', 'val', 'amount', 'count', 'figure', 'quantity', 'total', 'number', 'percent', 'percentage']);

  const parsedValue = parseStatisticalValue(rawValue);
  const fallback = tryNormalizeRowByPosition(row, metadata);

  const year = rawYear ?? metadata.year ?? fallback?.year;
  const category = rawCategory ?? metadata.category ?? fallback?.category ?? '';
  const industry = rawIndustry ?? fallback?.industry ?? '';
  const region = rawRegion ?? fallback?.region ?? '';
  const value = parsedValue == null ? fallback?.value : parsedValue;

  if (!year || value == null || !isLikelyYear(year)) return null;

  return {
    year: String(year).trim(),
    category: category == null ? '' : String(category).trim(),
    industry: industry == null ? '' : String(industry).trim(),
    region: region == null ? '' : String(region).trim(),
    value
  };
};

const safeCreateTable = async (sql) => {
  try {
    await pool.query(sql);
  } catch (err) {
    if (err.code === '23505' && err.message.includes('pg_class_relname_nsp_index')) {
      console.warn('Skipping create table because a matching sequence already exists.');
      return;
    }
    throw err;
  }
};

const ensureTables = async () => {
  await safeCreateTable(`
    CREATE TABLE IF NOT EXISTS statistical_data (
      id SERIAL PRIMARY KEY,
      year VARCHAR(20),
      category VARCHAR(255),
      industry VARCHAR(255),
      region VARCHAR(255),
      value NUMERIC,
      upload_id INTEGER,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await safeCreateTable(`
    CREATE TABLE IF NOT EXISTS statistics_uploads (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      category VARCHAR(255),
      year VARCHAR(20),
      file_path TEXT,
      file_type VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS title VARCHAR(255)`);
  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS description TEXT`);
  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS category VARCHAR(255)`);
  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS year VARCHAR(20)`);
  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS file_path TEXT`);
  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS file_type VARCHAR(50)`);
  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'`);
  await pool.query(`ALTER TABLE statistics_uploads ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`);
};

ensureTables().catch((err) => {
  console.error('Failed to ensure statistics tables:', err);
});

// =============================================================
//  UPLOAD FILE METADATA ONLY
// =============================================================
router.post('/statistics-file', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { title, description, category, year } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO statistics_uploads (title, description, category, year, file_path, file_type, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')
       RETURNING *`,
      [title, description, category || null, year || null, `/uploads/statistics/${req.file.filename}`, path.extname(req.file.originalname)]
    );
    const upload = result.rows[0];
    res.json({ message: 'File uploaded successfully. Processing pending.', upload, inserted_rows: 0 });
  } catch (err) {
    console.error('Statistics file upload error:', err);
    res.status(500).json({ error: 'Failed to upload statistics file', details: err.message });
  }
});

// =============================================================
//  GET ALL STATISTICS
// =============================================================
router.get('/statistics', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM statistical_data ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET statistics error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics', details: err.message });
  }
});

// =============================================================
// 🗑 DELETE ROW
// =============================================================
router.delete('/statistics/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM statistical_data WHERE id=$1 RETURNING id',
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('DELETE statistics error:', err);
    res.status(500).json({ error: 'Failed to delete statistics entry', details: err.message });
  }
});

// =============================================================
//  GET UPLOAD LIST
// =============================================================
router.get('/statistics-uploads-list', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM statistics_uploads ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET statistics uploads list error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics uploads list', details: err.message });
  }
});

router.get('/statistics-uploads/:id', async (req, res) => {
  const uploadId = Number(req.params.id);
  if (!uploadId) {
    return res.status(400).json({ error: 'Upload ID is required.' });
  }

  try {
    const uploadResult = await pool.query(
      `SELECT * FROM statistics_uploads WHERE id = $1`,
      [uploadId]
    );

    if (!uploadResult.rows.length) {
      return res.status(404).json({ error: 'Upload not found.' });
    }

    const upload = uploadResult.rows[0];
    const diskPath = path.resolve(__dirname, '..', upload.file_path.replace(/^\//, ''));

    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({ error: 'Uploaded file is missing on disk.' });
    }

    const parsed = parseSheetFile(diskPath);
    return res.json({ upload, rowCount: parsed.rowCount, headers: parsed.headers, rows: parsed.rows });
  } catch (err) {
    console.error('Upload details error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/statistics-uploads/:id/process', async (req, res) => {
  const uploadId = Number(req.params.id);
  if (!uploadId) return res.status(400).json({ error: 'Upload ID is required.' });

  try {
    const uploadResult = await pool.query(
      `SELECT * FROM statistics_uploads WHERE id = $1`,
      [uploadId]
    );

    if (!uploadResult.rows.length) {
      return res.status(404).json({ error: 'Upload not found.' });
    }

    const upload = uploadResult.rows[0];
    const diskPath = path.resolve(__dirname, '..', upload.file_path.replace(/^\//, ''));

    if (!fs.existsSync(diskPath)) {
      return res.status(404).json({ error: 'Uploaded file is missing on disk.' });
    }

    if (upload.status === 'processed') {
      return res.status(400).json({ error: 'This upload has already been processed.', inserted_rows: 0, parsed_rows: 0 });
    }

    const parsed = parseSheetFile(diskPath);
    const normalizedRows = parsed.rows.map((row) => normalizeUploadRow(row, upload)).filter(Boolean);

    if (!normalizedRows.length) {
      return res.status(400).json({ error: 'No valid rows available to process.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE statistics_uploads SET status = $1 WHERE id = $2', ['processing', uploadId]);
      const insertQuery = `
        INSERT INTO statistical_data (year, category, industry, region, value, upload_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `;
      for (const row of normalizedRows) {
        await client.query(insertQuery, [row.year, row.category, row.industry, row.region, row.value, uploadId]);
      }
      await client.query('UPDATE statistics_uploads SET status = $1 WHERE id = $2', ['processed', uploadId]);
      await client.query('COMMIT');
      return res.json({ inserted_rows: normalizedRows.length, parsed_rows: parsed.rowCount });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Process upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/statistics', async (req, res) => {
  const rows = Array.isArray(req.body.data) ? req.body.data : [];
  const uploadId = req.body.upload_id || null;

  if (!rows.length) {
    return res.status(400).json({ error: 'No rows provided.' });
  }

  let uploadMetadata = {};
  if (uploadId) {
    const uploadResult = await pool.query(
      `SELECT year, category FROM statistics_uploads WHERE id = $1`,
      [uploadId]
    );
    uploadMetadata = uploadResult.rows[0] || {};
  }

  const normalizedRows = rows
    .map((row) => normalizeUploadRow(row, uploadMetadata))
    .filter((row) => row && row.year && row.value != null);

  if (!normalizedRows.length) {
    return res.status(400).json({ error: 'No valid rows to insert.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertQuery = `
      INSERT INTO statistical_data (year, category, industry, region, value, upload_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    for (const row of normalizedRows) {
      await client.query(insertQuery, [row.year, row.category, row.industry, row.region, row.value, uploadId]);
    }
    await client.query('COMMIT');
    return res.json({ inserted_rows: normalizedRows.length });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Insert statistics error:', err.message);
    res.status(500).json({ error: 'Failed to save statistical rows.', details: err.message });
  } finally {
    client.release();
  }
});

// --- Admin user management -----------------------------------------------

/**
 * GET /api/admin/applications
 * Fetches all job applications from the database for the admin dashboard.
 */
router.get('/applications', verifyAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         a.id,
         a.job_id,
         a.employee_id,
         a.user_id,
         COALESCE(a.full_name, u.full_name) AS applicant_full_name,
         COALESCE(a.email, u.email) AS applicant_email,
         COALESCE(a.phone, '') AS applicant_phone,
         a.cover_letter,
         a.cv_file_path,
         a.cover_letter_file_path,
         a.other_file_path,
         j.title AS job_title,
         j.location AS job_location,
         a.status,
         a.applied_at
       FROM applications a
       LEFT JOIN jobs j ON j.id = a.job_id
       LEFT JOIN users u ON u.id = COALESCE(a.employee_id, a.user_id)
       ORDER BY a.applied_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('GET applications error:', err);
    res.status(500).json({ error: 'Failed to fetch applications', details: err.message });
  }
});

router.put('/applications/:id/status', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const normalizedStatus = String(status || '').trim().toLowerCase();
  const allowedStatuses = ['pending', 'accepted', 'rejected'];

  if (!allowedStatuses.includes(normalizedStatus)) {
    return res.status(400).json({
      error: 'Invalid status. Allowed values are pending, accepted, or rejected.'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE applications SET status = $1 WHERE id = $2 RETURNING *`,
      [normalizedStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Application status update error:', err);
    res.status(500).json({ error: 'Failed to update application status', details: err.message });
  }
});

router.get('/stats', verifyAdmin, async (_req, res) => {
  try {
    const [userCounts, jobCounts, applicationCounts] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE role_id = 1) AS admins,
          COUNT(*) FILTER (WHERE role_id = 2) AS employers,
          COUNT(*) FILTER (WHERE role_id = 3) AS jobseekers,
          COUNT(*) AS total_users
        FROM users
      `),
      pool.query(`SELECT COUNT(*) AS total_jobs, COUNT(*) FILTER (WHERE status = 'open') AS open_jobs FROM jobs`),
      pool.query(`
        SELECT
          COUNT(*) AS total_applications,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_applications,
          COUNT(*) FILTER (WHERE status = 'accepted') AS accepted_applications,
          COUNT(*) FILTER (WHERE status = 'rejected') AS rejected_applications
        FROM applications
      `)
    ]);

    res.json({
      total_users: parseInt(userCounts.rows[0]?.total_users || 0, 10),
      admins: parseInt(userCounts.rows[0]?.admins || 0, 10),
      employers: parseInt(userCounts.rows[0]?.employers || 0, 10),
      jobseekers: parseInt(userCounts.rows[0]?.jobseekers || 0, 10),
      total_jobs: parseInt(jobCounts.rows[0]?.total_jobs || 0, 10),
      open_jobs: parseInt(jobCounts.rows[0]?.open_jobs || 0, 10),
      total_applications: parseInt(applicationCounts.rows[0]?.total_applications || 0, 10),
      pending_applications: parseInt(applicationCounts.rows[0]?.pending_applications || 0, 10),
      accepted_applications: parseInt(applicationCounts.rows[0]?.accepted_applications || 0, 10),
      rejected_applications: parseInt(applicationCounts.rows[0]?.rejected_applications || 0, 10),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

router.get('/users', verifyAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.role_id,
              COALESCE(r.role_name, 'unknown') AS role_name,
              u.created_at
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error('GET users error:', err);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

router.put('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { full_name, email, role_id } = req.body;

  if (!full_name || !email || ![1, 2, 3].includes(Number(role_id))) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND id <> $2',
      [email.trim().toLowerCase(), id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use by another account' });
    }

    const result = await pool.query(
      `UPDATE users SET full_name = $1, email = $2, role_id = $3
       WHERE id = $4 RETURNING id, full_name, email, role_id`,
      [full_name.trim(), email.trim().toLowerCase(), role_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT user error:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
});

router.delete('/users/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {
      return res.status(409).json({
        error: 'Cannot delete user while related job seeker or employer records exist. Remove or reassign the related records first.'
      });
    }
    console.error('DELETE user error:', err);
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
});

module.exports = router;
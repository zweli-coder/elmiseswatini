const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const pool = require('../config/db');
const { verifyAdmin } = require('../authMiddleware');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'publications');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExt = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF or Word documents are allowed'));
    }
  }
});

const buildPublicationFromFile = (fileName) => {
  const fileType = path.extname(fileName).toLowerCase().replace('.', '');
  const title = fileName
    .replace(/^\d+-/, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ')
    .trim();

  return {
    id: fileName,
    title: title,
    description: 'Uploaded publication available for download.',
    category: 'Publication',
    year: '',
    file_url: `/uploads/publications/${fileName}`,
    file_type: fileType,
    size: '',
    uploaded_from_uploads: true
  };
};

const getPublicationsFromUploads = () => {
  if (!fs.existsSync(uploadDirectory)) return [];

  return fs.readdirSync(uploadDirectory)
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.pdf', '.doc', '.docx'].includes(ext);
    })
    .map(buildPublicationFromFile);
};

// ===========================================
// GET ALL PUBLICATIONS (PUBLIC)
// ===========================================

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM publications
      ORDER BY created_at DESC
    `);

    let publications = result.rows.map(pub => {
      const storedPath = pub.file_path || pub.file_url;
      return {
        ...pub,
        file_url: storedPath
      };
    });

    if (publications.length === 0) {
      publications = getPublicationsFromUploads();
    }

    res.json(publications);

  } catch (err) {
    console.error(err);
    const publications = getPublicationsFromUploads();
    return res.json(publications);
  }
});

// ===========================================
// GET SINGLE PUBLICATION
// ===========================================

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM publications WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    const storedPath = result.rows[0].file_path || result.rows[0].file_url;
    const publication = {
      ...result.rows[0],
      file_url: storedPath
    };

    res.json(publication);

  } catch (err) {
    console.error('GET publication error:', err);
    res.status(500).json({ error: 'Failed to fetch publication', details: err.message });
  }
});

// ===========================================
// CREATE PUBLICATION (ADMIN ONLY)
// ===========================================

router.post('/', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, year } = req.body;
    const adminId = req.user?.id;

    if (!title || !req.file) {
      return res.status(400).json({
        error: 'Title and file upload are required'
      });
    }

    const filePath = `/uploads/publications/${req.file.filename}`;
    const fileType = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const result = await pool.query(
      `INSERT INTO publications
       (title, description, category, year, file_path, file_type, uploaded_by, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [title, description, category, year, filePath, fileType, adminId]
    );

    res.status(201).json({
      message: 'Publication uploaded successfully!',
      publication: result.rows[0]
    });

  } catch (err) {
    console.error('POST publication error:', err);
    res.status(500).json({ error: 'Failed to upload publication', details: err.message });
  }
});

// ===========================================
// DELETE PUBLICATION (ADMIN ONLY)
// ===========================================

router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const check = await pool.query(
      `SELECT * FROM publications WHERE id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }

    await pool.query(
      `DELETE FROM publications WHERE id = $1`,
      [id]
    );

    res.json({ message: 'Publication deleted successfully' });

  } catch (err) {
    console.error('DELETE publication error:', err);
    res.status(500).json({ error: 'Failed to delete publication', details: err.message });
  }
});

module.exports = router;
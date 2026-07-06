// ===========================================
// server.js - COMPLETE LMIS BACKEND
// ===========================================

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

// Ensure a JWT secret exists (fallback to legacy value if not set)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'lmis_secret_key_2026';

// DATABASE
const pool = require('./config/db');

// ROUTES
const publicationsRoutes =
require('./routes/publicationsRoutes');

const statisticsRoutes = require('./routes/statisticsRoutes');

const adminRoutes = require('./routes/adminRoutes');
const economicSectorRoutes =
require('./routes/economicSectors');

const educationTrainingRoutes =
require('./routes/educationTraining');

const careerAdviceRoutes = require('./routes/careerAdvice');

const employeeRoutes = require('./routes/employeeRoutes');
const employerRoutes = require('./routes/employerRoutes');

// EXPRESS APP
const app = express();

// ===========================================
// MIDDLEWARE
// ===========================================

// CORS
app.use(cors({
    origin: [
        'https://elmis-eswatini-qzwo.onrender.com', // Production frontend
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002', // Frontend dev server
        'http://localhost:3003', // Allow the new frontend port
        'http://127.0.0.1:3000', // Keep for legacy
        'http://127.0.0.1:3001', // Backend API access
        'http://127.0.0.1:3002', // Frontend dev server
        'http://192.168.100.169:3000', // Development network access (old IP)
        'http://192.168.100.169:3001', // Development network access (old IP)
        'http://192.168.100.214:3000', // Your network IP - Frontend
        'http://192.168.100.214:3001'  // Your network IP - Backend API
    ],
    credentials: true
}));

// BODY PARSER
app.use(express.json({ limit: '200mb' }));

app.use(express.urlencoded({
    extended: true,
    limit: '200mb',
    parameterLimit: 1000000
}));

// JSON parse / payload error handler
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({ error: 'Payload too large. Please upload a smaller file or reduce request size.' });
  }
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload.' });
  }
  next(err);
});

// ===========================================
// STATIC FILES
// ===========================================

const uploadsPath = path.join(
    __dirname,
    'uploads'
);

const applicationsUploadPath = path.join(uploadsPath, 'applications');
if (!fs.existsSync(applicationsUploadPath)) {
  fs.mkdirSync(applicationsUploadPath, { recursive: true });
}

console.log(
    '📁 Uploads folder:',
    uploadsPath
);

// ACCESS UPLOADS
app.use(
    '/uploads',
    express.static(uploadsPath)
);

const allowedApplicationFileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const applicationStorage = multer.diskStorage({
  destination: applicationsUploadPath,
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${Date.now()}-${file.fieldname}-${safeName}`);
  }
});

const applicationUpload = multer({
  storage: applicationStorage,
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (allowedApplicationFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, Word, and text files are allowed.'));
    }
  }
});

const ensureApplicationsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL,
        employee_id INTEGER,
        status TEXT,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        full_name TEXT,
        email TEXT,
        phone TEXT,
        company TEXT,
        location TEXT,
        sector TEXT,
        job_type TEXT,
        cover_letter TEXT,
        cv_file_path TEXT,
        cover_letter_file_path TEXT,
        other_file_path TEXT
      )
    `);

    await pool.query(`
      ALTER TABLE applications
      ADD COLUMN IF NOT EXISTS employee_id INTEGER,
      ADD COLUMN IF NOT EXISTS user_id INTEGER,
      ADD COLUMN IF NOT EXISTS status TEXT,
      ADD COLUMN IF NOT EXISTS full_name TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS company TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS sector TEXT,
      ADD COLUMN IF NOT EXISTS job_type TEXT,
      ADD COLUMN IF NOT EXISTS cover_letter TEXT,
      ADD COLUMN IF NOT EXISTS cv_file_path TEXT,
      ADD COLUMN IF NOT EXISTS cover_letter_file_path TEXT,
      ADD COLUMN IF NOT EXISTS other_file_path TEXT
    `);
  } catch (err) {
    console.log('❌ Failed to initialize applications table:', err.message);
  }
};

ensureApplicationsTable();

// ===========================================
// ROUTES
// ===========================================

// PUBLICATIONS
app.use(
    '/api/publications',
    publicationsRoutes
);

// STATISTICS (PUBLIC)
app.use('/api/statistics', statisticsRoutes);

// ADMIN ROUTES
app.use('/api/admin', adminRoutes);

// ECONOMIC SECTORS
app.use(
    '/api/economic-sectors',
    economicSectorRoutes
);
// EDUCATION & TRAINING
app.use(
    '/api/education-training',
    educationTrainingRoutes
);

// CAREER ADVICE
app.use(
    '/api/career-advice',
    careerAdviceRoutes
);

// EMPLOYEES
app.use(
    '/api/employees',
    employeeRoutes
);

// EMPLOYERS (employer-specific job management and applications)
app.use(
  '/api/employers',
  employerRoutes
);

// AUTH (login/register/me)
app.use('/api/auth', require('./routes/authRoutes'));

// ===========================================
// HEALTH CHECK
// ===========================================

app.get('/health', (req, res) => {

    res.json({
        success: true,
        message: 'LMIS Backend Running'
    });

});

// ===========================================
// DEBUG ROUTE
// ===========================================

app.get('/api/debug/users', async (req, res) => {

  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.role_id,
        r.role_name
      FROM users u
      LEFT JOIN roles r
        ON r.id = u.role_id
      ORDER BY u.id
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }

});

// ===========================================
// JOBS API
// ===========================================

// GET JOBS
app.get('/api/jobs', async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM jobs
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Failed to fetch jobs'
        });

    }

});

// CREATE JOB
app.post('/api/jobs', async (req, res) => {

    try {

        const {
            organisation_name,
            sector,
            title,
            description,
            location,
            job_type
        } = req.body;

        if (
            !organisation_name ||
            !sector ||
            !title ||
            !description ||
            !location ||
            !job_type
        ) {

            return res.status(400).json({
                error: 'All fields are required'
            });

        }

        const result = await pool.query(
            `
            INSERT INTO jobs (
                organisation_name,
                sector,
                title,
                description,
                location,
                job_type,
                status,
                created_at
            )
            VALUES (
                $1,$2,$3,$4,$5,$6,
                'open',
                NOW()
            )
            RETURNING *
            `,
            [
                organisation_name,
                sector,
                title,
                description,
                location,
                job_type
            ]
        );

        res.status(201).json(
            result.rows[0]
        );

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Failed to create job'
        });

    }

});

// ===========================================
// APPLY FOR JOB
// ===========================================

app.post('/api/apply', (req, res, next) => {
  const uploadFields = applicationUpload.fields([
    { name: 'cv_file', maxCount: 1 },
    { name: 'cover_letter_file', maxCount: 1 },
    { name: 'other_file', maxCount: 1 }
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err.message || err);
      return res.status(400).json({ error: err.message || 'File upload failed.' });
    }
    next();
  });
}, async (req, res) => {

    try {

        let {
            job_id,
            user_id,
            full_name,
            email,
            phone,
            cover_letter
        } = req.body;

        // Multipart form data may send fields as strings, ensure fallback parsing.
        job_id = job_id || req.body.jobId || req.body.job_id;
        user_id = user_id || req.body.employee_id;

        // Fallback to JWT token if the client did not send explicit user_id.
        if (!user_id) {
          const authHeader = req.headers.authorization || req.headers.Authorization;
          let token = authHeader;
          if (typeof token === 'string' && token.startsWith('Bearer ')) {
            token = token.slice(7);
          }
          if (token) {
            try {
              user_id = jwt.verify(token, process.env.JWT_SECRET || 'lmis_secret_key_2026').id;
            } catch (err) {
              try {
                user_id = jwt.verify(token, 'lmis_secret_key_2026').id;
              } catch (_e) {
                // ignore fallback failure; user_id remains unset
              }
            }
          }
        }

        if (!job_id || !user_id) {
            return res.status(400).json({
                error: 'job_id and user_id required'
            });
        }

        if (!cover_letter || !cover_letter.trim()) {
            return res.status(400).json({
                error: 'Cover letter text is required.'
            });
        }

        const cvFile = req.files?.cv_file?.[0];
        if (!cvFile) {
            return res.status(400).json({
                error: 'CV file is required to submit an application.'
            });
        }

        const coverLetterFile = req.files?.cover_letter_file?.[0];
        const otherFile = req.files?.other_file?.[0];

        const existing = await pool.query(
            `
            SELECT *
            FROM applications
            WHERE job_id = $1
            AND (
              employee_id = $2 OR user_id = $2
            )
            `,
            [job_id, user_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                error: 'Already applied'
            });
        }

        const result = await pool.query(
            `
            INSERT INTO applications (
                job_id,
                employee_id,
                full_name,
                email,
                phone,
                company,
                location,
                sector,
                job_type,
                cover_letter,
                cv_file_path,
                cover_letter_file_path,
                other_file_path,
                status,
                applied_at
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13,
                'pending',
                NOW()
            )
            RETURNING *
            `,
            [
                job_id,
                user_id,
                full_name || null,
                email || null,
                phone || null,
                req.body.company || null,
                req.body.location || null,
                req.body.sector || null,
                req.body.job_type || null,
                cover_letter || null,
                `/uploads/applications/${cvFile.filename}`,
                coverLetterFile ? `/uploads/applications/${coverLetterFile.filename}` : null,
                otherFile ? `/uploads/applications/${otherFile.filename}` : null
            ]
        );

        res.status(201).json({
            message: 'Application successful',
            application: result.rows[0]
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            error: 'Failed to apply'
        });

    }

});

// ===========================================
// AUTH - REGISTER
// ===========================================

const ensureAuthTables = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id SERIAL PRIMARY KEY,
      role_name TEXT UNIQUE NOT NULL
    )
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'roles' AND column_name = 'name'
      ) THEN
        ALTER TABLE roles ADD COLUMN name TEXT;
      END IF;

      IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'roles' AND column_name = 'name'
      ) THEN
        UPDATE roles
        SET name = role_name
        WHERE name IS NULL
          AND role_name IS NOT NULL;
      END IF;
    END$$;
  `);

  await pool.query(`
    INSERT INTO roles (role_name, name)
    VALUES ('admin', 'admin'), ('employer', 'employer'), ('employee', 'employee')
    ON CONFLICT (role_name) DO UPDATE
      SET name = COALESCE(roles.name, EXCLUDED.name)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role_id INTEGER NOT NULL DEFAULT 3,
      created_at TIMESTAMP DEFAULT NOW(),
      FOREIGN KEY (role_id) REFERENCES roles(id)
    )
  `);
};

// ===========================================
// DATABASE TEST
// ===========================================

pool.connect((err, client, release) => {

    if (err) {

        console.log(
            '❌ PostgreSQL connection error:',
            err.message
        );

    } else {

        console.log(
            '✅ PostgreSQL connected successfully'
        );

        release();

    }

});

const ensureRolesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        role_name TEXT UNIQUE NOT NULL
      )
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'roles' AND column_name = 'name'
        ) THEN
          ALTER TABLE roles ADD COLUMN name TEXT;
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'roles' AND column_name = 'role_name'
        ) THEN
          ALTER TABLE roles ADD COLUMN role_name TEXT;
        END IF;

        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'roles' AND column_name = 'name'
        ) AND EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'roles' AND column_name = 'role_name'
        ) THEN
          UPDATE roles
          SET role_name = name
          WHERE role_name IS NULL
            AND name IS NOT NULL;

          UPDATE roles
          SET name = role_name
          WHERE name IS NULL
            AND role_name IS NOT NULL;
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'roles_role_name_unique'
        ) THEN
          ALTER TABLE roles
          ADD CONSTRAINT roles_role_name_unique UNIQUE (role_name);
        END IF;
      END$$;
    `);

    const result = await pool.query(`
      SELECT COUNT(*) AS count
      FROM roles
    `);

    if (parseInt(result.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO roles (role_name, name)
        VALUES
          ('admin', 'admin'),
          ('employer', 'employer'),
          ('employee', 'employee')
      `);
    }
  } catch (err) {
    console.log('❌ Failed to initialize roles table:', err.message);
  }
};

const ensureUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role_id INTEGER NOT NULL DEFAULT 3,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);
  } catch (err) {
    console.log('❌ Failed to initialize users table:', err.message);
  }
};

const ensureEmployersTable = async () => {
  try {
    // Employers table likely already exists, just ensure it has the required columns
    await pool.query(`
      ALTER TABLE employers
      ADD COLUMN IF NOT EXISTS industry TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT
    `);
    console.log('✅ Employers table ready');
  } catch (err) {
    console.log('⚠️  Employers table setup:', err.message);
  }
};

const ensureJobsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        salary TEXT,
        requirements TEXT,
        job_type TEXT,
        status TEXT DEFAULT 'open',
        application_deadline DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Jobs table ready');
  } catch (err) {
    console.log('❌ Failed to initialize jobs table:', err.message);
  }
};

const ensureDatabaseTables = async () => {
  await ensureRolesTable();
  await ensureUsersTable();
  await ensureEmployersTable();
  await ensureJobsTable();
};

ensureDatabaseTables();

const ensureCareerAdviceTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS career_advice (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        body TEXT,
        category TEXT,
        icon TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const existing = await pool.query(`
      SELECT count(*) AS count
      FROM career_advice
    `);

    if (parseInt(existing.rows[0].count, 10) === 0) {
      await pool.query(
        `INSERT INTO career_advice (
          slug,
          title,
          summary,
          body,
          category,
          icon,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          'growing-your-career',
          'Growing Your Career in the LMIS Economy',
          'Learn how to plan career steps, build transferable skills, and navigate high-demand sectors in Eswatini.',
          'This guide helps learners and job seekers identify opportunities, build practical skills, and thrive in Eswatini’s labour market.',
          'Career Planning',
          'briefcase'
        ]
      );
    }
  } catch (err) {
    console.log('❌ Failed to initialize career advice table:', err.message);
  }
};

ensureCareerAdviceTable();

const ensureStatisticalDataTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS statistical_data (
        id SERIAL PRIMARY KEY,
        year VARCHAR(20) NOT NULL,
        category VARCHAR(255) NOT NULL,
        industry VARCHAR(255) NOT NULL,
        region VARCHAR(100),
        value NUMERIC(14,4) NOT NULL,
        upload_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    await pool.query(`
      ALTER TABLE statistical_data
      ADD COLUMN IF NOT EXISTS upload_id INTEGER
    `);
    await pool.query(`
      ALTER TABLE statistical_data
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `);
  } catch (err) {
    console.log('❌ Failed to initialize statistical data table:', err.message);
  }
};
ensureStatisticalDataTable();

// ===========================================
// START SERVER
// ===========================================

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, '0.0.0.0', () => {

    console.log('\n==============================');

    console.log(
        `✅ Server running on port ${PORT}`
    );

    console.log(
        `🌐 http://localhost:${PORT}`
    );

    console.log(
        `📁 Uploads:
http://localhost:${PORT}/uploads`
    );

    console.log(
        '==============================\n'
    );

});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`\nERROR: Port ${PORT} is already in use. Another process is listening on this port.`);
    console.error('Tip: run `netstat -ano | findstr :' + PORT + '` to find the PID, then `taskkill /PID <pid> /F` to stop it.');
    process.exit(1);
  }
  console.error('Server error:', err);
});
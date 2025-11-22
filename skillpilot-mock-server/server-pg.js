const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'skillpilot',
  password: process.env.DB_PASSWORD || 'skillpilot123',
  database: process.env.DB_NAME || 'skillpilot_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Middleware
app.use(cors());
app.use(express.json());

// ============================================
// SWAGGER CONFIGURATION
// ============================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillPilot AI Mock API',
      version: '1.0.0',
      description: 'Comprehensive mock API for SkillPilot AI hackathon. PostgreSQL-powered backend with realistic learner data.',
      contact: {
        name: 'SkillPilot AI Team',
        url: 'https://skillpilot.dev'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Learner: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Rajesh Kumar' },
            email: { type: 'string', example: 'rajesh.kumar@company.com' },
            role: { type: 'string', example: 'Software Engineer II (Backend)' },
            department: { type: 'string', example: 'Backend Platform' },
            currentLevel: { type: 'string', enum: ['Junior', 'Mid-Level', 'Senior', 'Lead'], example: 'Mid-Level' }
          }
        }
      }
    }
  },
  apis: ['./server-pg.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  }
}));

// ============================================
// API ROUTES
// ============================================

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
app.get('/healthcheck', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'Connected',
      message: 'SkillPilot AI Mock API is running'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'Disconnected',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /learners:
 *   get:
 *     summary: Get all learners
 *     tags: [Learners]
 *     responses:
 *       200:
 *         description: List of all learners
 */
app.get('/learners', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM learners ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching learners:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /learners/{id}:
 *   get:
 *     summary: Get a specific learner by ID
 *     tags: [Learners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Learner details
 *       404:
 *         description: Learner not found
 */
app.get('/learners/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM learners WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Learner not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching learner:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /githubProfiles:
 *   get:
 *     summary: Get all GitHub profiles
 *     tags: [Integrations - GitHub]
 *     parameters:
 *       - in: query
 *         name: learnerId
 *         schema:
 *           type: integer
 *         description: Filter by learner ID
 *     responses:
 *       200:
 *         description: List of GitHub profiles
 */
app.get('/githubProfiles', async (req, res) => {
  try {
    const { learnerId } = req.query;
    let query = 'SELECT * FROM "githubProfiles"';
    let params = [];
    
    if (learnerId) {
      query += ' WHERE "learnerId" = $1';
      params.push(learnerId);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching GitHub profiles:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * @swagger
 * /linkedinProfiles:
 *   get:
 *     summary: Get all LinkedIn profiles
 *     tags: [Integrations - LinkedIn]
 *     parameters:
 *       - in: query
 *         name: learnerId
 *         schema:
 *           type: integer
 *         description: Filter by learner ID
 *     responses:
 *       200:
 *         description: List of LinkedIn profiles
 */
app.get('/linkedinProfiles', async (req, res) => {
  try {
    const { learnerId } = req.query;
    let query = 'SELECT * FROM "linkedinProfiles"';
    let params = [];
    
    if (learnerId) {
      query += ' WHERE "learnerId" = $1';
      params.push(learnerId);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching LinkedIn profiles:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Additional routes for other endpoints
app.get('/skillAssessments', async (req, res) => {
  try {
    const { learnerId } = req.query;
    let query = 'SELECT * FROM "skillAssessments"';
    let params = [];
    
    if (learnerId) {
      query += ' WHERE "learnerId" = $1';
      params.push(learnerId);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching skill assessments:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/learningPaths', async (req, res) => {
  try {
    const { learnerId } = req.query;
    let query = 'SELECT * FROM "learningPaths"';
    let params = [];
    
    if (learnerId) {
      query += ' WHERE "learnerId" = $1';
      params.push(learnerId);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/dailyMissions', async (req, res) => {
  try {
    const { learnerId } = req.query;
    let query = 'SELECT * FROM "dailyMissions"';
    let params = [];
    
    if (learnerId) {
      query += ' WHERE "learnerId" = $1';
      params.push(learnerId);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching daily missions:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/teamsCalendar', async (req, res) => {
  try {
    const { learnerId } = req.query;
    let query = 'SELECT * FROM "teamsCalendar"';
    let params = [];
    
    if (learnerId) {
      query += ' WHERE "learnerId" = $1';
      params.push(learnerId);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching Teams calendar:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/jiraData', async (req, res) => {
  try {
    const { learnerId } = req.query;
    let query = 'SELECT * FROM "jiraData"';
    let params = [];
    
    if (learnerId) {
      query += ' WHERE "learnerId" = $1';
      params.push(learnerId);
    }
    
    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching JIRA data:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// ============================================
// ERROR HANDLING & SERVER START
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 3001;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('PostgreSQL pool has ended');
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   SkillPilot AI - PostgreSQL API Server                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📚 API Docs at: http://localhost:${PORT}/api-docs`);
  console.log('');
  console.log('Quick Start:');
  console.log(`  GET http://localhost:${PORT}/learners - Get all learners`);
  console.log(`  GET http://localhost:${PORT}/githubProfiles - GitHub integration`);
  console.log(`  GET http://localhost:${PORT}/linkedinProfiles - LinkedIn integration`);
  console.log('');
});

module.exports = app;


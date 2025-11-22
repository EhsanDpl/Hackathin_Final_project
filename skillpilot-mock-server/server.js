// Use PostgreSQL version if DB_HOST is set, otherwise use JSON server
// For Docker, we'll use server-pg.js directly via Dockerfile
// This file serves as the JSON server fallback for local development

// Check if we should use PostgreSQL
const usePostgres = process.env.DB_HOST;

if (usePostgres) {
  // Use PostgreSQL server - load and start it
  console.log('🔄 Using PostgreSQL mode...');
  require('./server-pg');
  // Exit this file - server-pg.js will handle everything
} else {
  // Use JSON server (original) - continue with code below
  console.log('📄 Using JSON Server mode...');
  // Use JSON server (original)
const jsonServer = require('json-server');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const app = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Middleware
app.use(cors());
app.use(express.json());
app.use(middlewares);

// ============================================
// SWAGGER CONFIGURATION
// ============================================

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillPilot AI Mock API',
      version: '1.0.0',
      description: 'Comprehensive mock API for SkillPilot AI hackathon. Contains realistic learner personas, skill data, learning paths, missions, and integrations with GitHub, LinkedIn, Teams, and JIRA.',
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
            phone: { type: 'string', example: '+91-9876543210' },
            role: { type: 'string', example: 'Software Engineer II (Backend)' },
            department: { type: 'string', example: 'Backend Platform' },
            location: { type: 'string', example: 'Bangalore, India' },
            joinDate: { type: 'string', format: 'date', example: '2022-03-15' },
            currentLevel: { type: 'string', enum: ['Junior', 'Mid-Level', 'Senior', 'Lead'], example: 'Mid-Level' },
            yearsExperience: { type: 'integer', example: 5 },
            timezone: { type: 'string', example: 'IST' },
            reportsTo: { type: 'string', example: 'Vikram Singh' },
            linkedinProfile: { type: 'string', example: 'rajesh-kumar-backend' },
            githubUsername: { type: 'string', example: 'rajesh-kb' },
            status: { type: 'string', enum: ['active', 'inactive', 'on-leave'], example: 'active' }
          }
        },

        GitHubProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            learnerId: { type: 'integer' },
            username: { type: 'string' },
            fullName: { type: 'string' },
            bio: { type: 'string' },
            publicRepos: { type: 'integer' },
            followers: { type: 'integer' },
            languages: { type: 'array', items: { type: 'string' } },
            primaryLanguage: { type: 'string' },
            topRepositories: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  language: { type: 'string' },
                  stars: { type: 'integer' },
                  forks: { type: 'integer' }
                }
              }
            },
            contributionsLastYear: { type: 'integer' }
          }
        },
        LinkedinProfile: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            learnerId: { type: 'integer' },
            username: { type: 'string' },
            fullName: { type: 'string' },
            headline: { type: 'string' },
            location: { type: 'string' },
            endorsedSkills: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  skill: { type: 'string' },
                  endorsements: { type: 'integer' }
                }
              }
            },
            connections: { type: 'integer' },
            followers: { type: 'integer' }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
    displayOperationId: true
  }
}));

// ============================================
// CUSTOM ROUTES / ENDPOINTS
// ============================================

/**
 * @swagger
 * /learners:
 *   get:
 *     summary: Get all learners
 *     tags: [Learners]
 *     responses:
 *       200:
 *         description: List of all learners
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Learner'
 *             example:
 *               - id: 1
 *                 name: "Rajesh Kumar"
 *                 email: "rajesh.kumar@company.com"
 *                 role: "Software Engineer II (Backend)"
 *                 department: "Backend Platform"
 *                 currentLevel: "Mid-Level"
 *                 yearsExperience: 5
 *               - id: 2
 *                 name: "Priya Sharma"
 *                 email: "priya.sharma@company.com"
 *                 role: "Senior Frontend Engineer"
 *                 department: "Frontend"
 *                 currentLevel: "Senior"
 *                 yearsExperience: 7
 */

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
 *         example: 1
 *     responses:
 *       200:
 *         description: Learner details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Learner'
 *       404:
 *         description: Learner not found
 */







/**
 * @swagger
 * /githubProfiles:
 *   get:
 *     summary: Get all GitHub profiles (integrated with learners)
 *     tags: [Integrations - GitHub]
 *     responses:
 *       200:
 *         description: List of GitHub profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GitHubProfile'
 *             example:
 *               - id: 1
 *                 learnerId: 1
 *                 username: "rajesh-kb"
 *                 publicRepos: 28
 *                 followers: 145
 *                 languages: ["TypeScript", "JavaScript", "Python", "Go"]
 *                 contributionsLastYear: 1250
 */

/**
 * @swagger
 * /githubProfiles?learnerId={learnerId}:
 *   get:
 *     summary: Get GitHub profile for a specific learner
 *     tags: [Integrations - GitHub]
 *     parameters:
 *       - in: query
 *         name: learnerId
 *         schema:
 *           type: integer
 *         example: 1
 */

/**
 * @swagger
 * /linkedinProfiles:
 *   get:
 *     summary: Get all LinkedIn profiles (integrated with learners)
 *     tags: [Integrations - LinkedIn]
 *     responses:
 *       200:
 *         description: List of LinkedIn profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LinkedinProfile'
 *             example:
 *               - id: 1
 *                 learnerId: 1
 *                 username: "rajesh-kumar-backend"
 *                 headline: "Software Engineer II | Backend | TypeScript | Node.js"
 *                 endorsedSkills:
 *                   - skill: "TypeScript"
 *                     endorsements: 45
 *                   - skill: "Node.js"
 *                     endorsements: 52
 *                 connections: 385
 */

/**
 * @swagger
 * /teamsCalendar:
 *   get:
 *     summary: Get Microsoft Teams calendar events for all learners
 *     tags: [Integrations - Teams]
 *     responses:
 *       200:
 *         description: List of calendar events
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 learnerId: 1
 *                 eventTitle: "1:1 with Manager"
 *                 eventType: "Meeting"
 *                 startTime: "2024-01-22T10:00:00Z"
 *                 endTime: "2024-01-22T10:30:00Z"
 *                 duration: 30
 *                 isRecurring: true
 */

/**
 * @swagger
 * /teamsCalendar?learnerId={learnerId}:
 *   get:
 *     summary: Get calendar events for a specific learner
 *     tags: [Integrations - Teams]
 *     parameters:
 *       - in: query
 *         name: learnerId
 *         schema:
 *           type: integer
 *         example: 1
 */

/**
 * @swagger
 * /jiraData:
 *   get:
 *     summary: Get JIRA issues and sprint data for all learners
 *     tags: [Integrations - JIRA]
 *     responses:
 *       200:
 *         description: List of JIRA issues
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 learnerId: 1
 *                 sprintName: "Sprint 24"
 *                 issueKey: "BACKEND-1245"
 *                 issueTitle: "Implement TypeScript migration"
 *                 issueType: "Story"
 *                 status: "In Progress"
 *                 priority: "High"
 *                 storyPoints: 8
 */

/**
 * @swagger
 * /jiraData?learnerId={learnerId}:
 *   get:
 *     summary: Get JIRA issues for a specific learner
 *     tags: [Integrations - JIRA]
 *     parameters:
 *       - in: query
 *         name: learnerId
 *         schema:
 *           type: integer
 *         example: 1
 */

/**
 * @swagger
 * /skillTaxonomy:
 *   get:
 *     summary: Get skill taxonomy (category and skills mapping)
 *     tags: [Taxonomy]
 *     responses:
 *       200:
 *         description: Skill taxonomy
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 category: "Backend Development"
 *                 skills: ["TypeScript", "Node.js", "Python", "System Design"]
 *               - id: 2
 *                 category: "Frontend Development"
 *                 skills: ["React", "Vue.js", "CSS/Styling", "Performance Optimization"]
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get course recommendations from content marketplace
 *     tags: [Content Marketplace]
 *     responses:
 *       200:
 *         description: List of available courses
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 courseTitle: "TypeScript Advanced Patterns"
 *                 courseProvider: "Udemy"
 *                 difficulty: "Advanced"
 *                 duration: "15 hours"
 *                 rating: 4.8
 *                 price: "$14.99"
 *                 skills: ["TypeScript", "Advanced"]
 */



/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             example:
 *               status: "OK"
 *               timestamp: "2024-01-19T10:30:00Z"
 *               message: "SkillPilot AI Mock API is running"
 */
app.get('/healthcheck', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'SkillPilot AI Mock API is running'
  });
});





// Use JSON Server router for all other routes
app.use('/api', router);
app.use(router);

// ============================================
// ERROR HANDLING & SERVER START
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   SkillPilot AI - Mock API Server                          ║');
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
} // Close the else block

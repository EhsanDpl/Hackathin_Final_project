import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import Groq from 'groq-sdk';

@Injectable()
export class LearningPathService {
  private readonly logger = new Logger(LearningPathService.name);
  private pool: Pool | null = null;
  private groq: Groq | null = null;
  private readonly model = 'llama-3.3-70b-versatile';

  constructor() {
    // Initialize PostgreSQL connection
    if (
      process.env.DB_HOST &&
      process.env.DB_USER &&
      process.env.DB_PASSWORD &&
      process.env.DB_NAME
    ) {
      this.pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
      this.logger.log('✅ PostgreSQL connection initialized for learning paths');
    }

    // Initialize Groq client
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({
        apiKey: apiKey,
      });
      this.logger.log(`✅ Groq client initialized with ${this.model}`);
    }
  }

  async getLearnerIdByEmail(email: string): Promise<number | null> {
    if (!this.pool) {
      return null;
    }
    try {
      const result = await this.pool.query(
        'SELECT id FROM learners WHERE email = $1',
        [email],
      );
      return result.rows.length > 0 ? result.rows[0].id : null;
    } catch (error) {
      this.logger.error('Error getting learner ID:', error);
      return null;
    }
  }

  async createLearningPath(learnerId: number, skillProfileId?: number) {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!this.groq) {
      throw new HttpException(
        'AI service not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Get skill profile data
      let skillProfile = null;
      if (skillProfileId) {
        const profileResult = await this.pool.query(
          'SELECT * FROM "skillProfiles" WHERE id = $1 AND "learnerId" = $2',
          [skillProfileId, learnerId],
        );
        if (profileResult.rows.length > 0) {
          skillProfile = profileResult.rows[0];

          // Get insights, strengths, growth areas, and skill map
          const insights = await this.pool.query(
            'SELECT * FROM "skillProfileInsights" WHERE "skillProfileId" = $1',
            [skillProfileId],
          );
          const strengths = await this.pool.query(
            'SELECT * FROM "skillStrengths" WHERE "skillProfileId" = $1',
            [skillProfileId],
          );
          const growthAreas = await this.pool.query(
            'SELECT * FROM "skillGrowthAreas" WHERE "skillProfileId" = $1',
            [skillProfileId],
          );
          const skillMap = await this.pool.query(
            'SELECT * FROM "skillMaps" WHERE "skillProfileId" = $1',
            [skillProfileId],
          );

          skillProfile.insights = insights.rows;
          skillProfile.strengths = strengths.rows.map((s) => s.strength);
          skillProfile.growthAreas = growthAreas.rows.map((g) => g.area);
          skillProfile.skillMap = skillMap.rows;
        }
      }

      // Build prompt for learning path generation
      const prompt = this.buildLearningPathPrompt(skillProfile);

      // Generate learning path using AI
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert learning path designer. Create comprehensive, structured learning paths based on skill profiles. Generate a 6-week personalized learning journey with weekly modules, including modules count, hours, and XP points. Return your response as a valid JSON object.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const responseText =
        completion.choices[0]?.message?.content || '{}';
      const learningPathData = JSON.parse(responseText);

      // Calculate dates (6 weeks from today)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 42); // 6 weeks

      // Check if learning path already exists for this learner
      const existingPath = await this.pool.query(
        'SELECT id FROM "learningPaths" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      let pathResult;
      if (existingPath.rows.length > 0) {
        // Update existing learning path
        pathResult = await this.pool.query(
          `UPDATE "learningPaths" 
           SET title = $1, description = $2, duration = $3, "startDate" = $4, "endDate" = $5, 
               "totalModules" = $6, difficulty = $7, status = $8, "updatedAt" = CURRENT_TIMESTAMP
           WHERE id = $9
           RETURNING *`,
          [
            learningPathData.title || 'Personalized Learning Journey',
            JSON.stringify(learningPathData), // Store full data as JSON in description
            learningPathData.duration || '6 weeks',
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            learningPathData.totalModules || 0,
            learningPathData.difficulty || 'Intermediate',
            'planned',
            existingPath.rows[0].id,
          ],
        );
      } else {
        // Create new learning path
        pathResult = await this.pool.query(
          `INSERT INTO "learningPaths" ("learnerId", title, description, duration, "startDate", "endDate", "totalModules", "completedModules", progress, difficulty, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           RETURNING *`,
          [
            learnerId,
            learningPathData.title || 'Personalized Learning Journey',
            JSON.stringify(learningPathData), // Store full data as JSON in description
            learningPathData.duration || '6 weeks',
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            learningPathData.totalModules || 0,
            0,
            0,
            learningPathData.difficulty || 'Intermediate',
            'planned',
          ],
        );
      }

      const learningPathId = pathResult.rows[0].id;

      return {
        ...pathResult.rows[0],
        weeks: learningPathData.weeks || [],
      };
    } catch (error: any) {
      this.logger.error('Error creating learning path:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create learning path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLearningPath(learnerId: number) {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const result = await this.pool.query(
        'SELECT * FROM "learningPaths" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const learningPath = result.rows[0];

      // Parse weeks from description if stored as JSON
      try {
        const weeksData = JSON.parse(learningPath.description || '{}');
        if (weeksData.weeks) {
          learningPath.weeks = weeksData.weeks;
        }
      } catch (e) {
        // Description is not JSON, use as is
      }

      return learningPath;
    } catch (error: any) {
      this.logger.error('Error getting learning path:', error);
      throw new HttpException(
        error.message || 'Failed to get learning path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateLearningPath(learnerId: number, updateData: any) {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updateData.status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(updateData.status);
      }

      if (updateData.progress !== undefined) {
        updates.push(`progress = $${paramCount++}`);
        values.push(updateData.progress);
      }

      if (updateData.completedModules !== undefined) {
        updates.push(`"completedModules" = $${paramCount++}`);
        values.push(updateData.completedModules);
      }

      if (updates.length === 0) {
        throw new HttpException('No fields to update', HttpStatus.BAD_REQUEST);
      }

      updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
      values.push(learnerId);

      const query = `UPDATE "learningPaths" SET ${updates.join(', ')} WHERE "learnerId" = $${paramCount} RETURNING *`;
      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new HttpException('Learning path not found', HttpStatus.NOT_FOUND);
      }

      return result.rows[0];
    } catch (error: any) {
      this.logger.error('Error updating learning path:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to update learning path',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildLearningPathPrompt(skillProfile: any): string {
    if (!skillProfile) {
      return `Create a comprehensive 6-week learning path for full-stack development. Include weekly modules with specific topics, modules count, hours, and XP points.`;
    }

    let prompt = `Create a personalized 6-week learning path based on the following skill profile:\n\n`;

    if (skillProfile.strengths && skillProfile.strengths.length > 0) {
      prompt += `Strengths: ${skillProfile.strengths.join(', ')}\n`;
    }

    if (skillProfile.growthAreas && skillProfile.growthAreas.length > 0) {
      prompt += `Growth Areas: ${skillProfile.growthAreas.join(', ')}\n`;
    }

    if (skillProfile.skillMap && skillProfile.skillMap.length > 0) {
      prompt += `Current Skills:\n`;
      skillProfile.skillMap.forEach((skill: any) => {
        prompt += `- ${skill.skill} (${skill.level || 'Unknown'}) - ${skill.category || 'General'}\n`;
      });
    }

    if (skillProfile.recommendation) {
      prompt += `\nRecommendation: ${skillProfile.recommendation}\n`;
    }

    prompt += `\nGenerate a JSON response with this structure:
{
  "title": "Full-Stack Development Mastery",
  "description": "Backend, Data, and Front-end skills",
  "duration": "6 weeks",
  "difficulty": "Intermediate",
  "totalModules": 24,
  "weeks": [
    {
      "week": 1,
      "title": "Backend Fundamentals",
      "subtitle": "Node.js & Express Basics",
      "description": "Build RESTful APIs and server-side architecture",
      "modules": 4,
      "hours": 8,
      "xp": 200
    },
    {
      "week": 2,
      "title": "Database Integration",
      "subtitle": "SQL & NoSQL Databases",
      "description": "Master database design and queries",
      "modules": 4,
      "hours": 10,
      "xp": 250
    },
    {
      "week": 3,
      "title": "Authentication & Security",
      "subtitle": "Secure Your Applications",
      "description": "Implement JWT, OAuth, and best practices",
      "modules": 3,
      "hours": 7,
      "xp": 200
    },
    {
      "week": 4,
      "title": "Frontend Integration",
      "subtitle": "React & API Integration",
      "description": "Connect frontend to backend APIs",
      "modules": 4,
      "hours": 10,
      "xp": 250
    },
    {
      "week": 5,
      "title": "Advanced Patterns",
      "subtitle": "State Management & Architecture",
      "description": "Learn advanced patterns and best practices",
      "modules": 5,
      "hours": 12,
      "xp": 300
    },
    {
      "week": 6,
      "title": "Deployment & DevOps",
      "subtitle": "Production Ready",
      "description": "Deploy applications and CI/CD pipelines",
      "modules": 4,
      "hours": 10,
      "xp": 250
    }
  ]
}`;

    return prompt;
  }
}


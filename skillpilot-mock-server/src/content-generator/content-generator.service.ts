import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import Groq from 'groq-sdk';

@Injectable()
export class ContentGeneratorService {
  private readonly logger = new Logger(ContentGeneratorService.name);
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
      this.logger.log('✅ PostgreSQL connection initialized for content generator');
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

  async getSkillsGap(learnerId: number) {
    if (!this.pool) {
      return null;
    }

    try {
      // Get learner's skill profile
      const profileResult = await this.pool.query(
        'SELECT * FROM "skillProfiles" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      if (profileResult.rows.length === 0) {
        return null;
      }

      const profile = profileResult.rows[0];
      
      // Get growth areas
      const growthAreas = await this.pool.query(
        'SELECT * FROM "skillGrowthAreas" WHERE "skillProfileId" = $1',
        [profile.id],
      );

      // Get recent Jira data to detect skills gaps
      const jiraData = await this.pool.query(
        `SELECT jd.* FROM "jiraData" jd
         JOIN "userExternalLinks" uel ON jd.id = uel."accountId"
         WHERE uel."learnerId" = $1 AND uel."accountType" = 'jira'
         ORDER BY jd."createdAt" DESC LIMIT 5`,
        [learnerId],
      );

      // Analyze for skills gap
      if (growthAreas.rows.length > 0 || jiraData.rows.length > 0) {
        const gap = growthAreas.rows[0]?.area || 'Backend development';
        const recentTicket = jiraData.rows[0];
        
        return {
          gap: gap,
          description: recentTicket 
            ? `Based on recent JIRA tickets and code reviews. You were assigned a ticket requiring ${gap} (${recentTicket.issueKey || 'PROJ-2847'}), but your profile shows no ${gap} experience. Generate targeted content now?`
            : `Based on your skill profile analysis, you have a gap in ${gap}. Generate targeted content now?`,
          ticketKey: recentTicket?.issueKey || 'PROJ-2847',
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Error getting skills gap:', error);
      return null;
    }
  }

  async getSmartSuggestions(learnerId: number) {
    if (!this.pool) {
      return [];
    }

    try {
      // Get learner's skill profile
      const profileResult = await this.pool.query(
        'SELECT * FROM "skillProfiles" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      if (profileResult.rows.length === 0) {
        return [];
      }

      const profile = profileResult.rows[0];
      
      // Get growth areas and skill map
      const growthAreas = await this.pool.query(
        'SELECT * FROM "skillGrowthAreas" WHERE "skillProfileId" = $1 LIMIT 3',
        [profile.id],
      );

      const suggestions = growthAreas.rows.map((area, index) => {
        const topics = [
          { title: 'Redis Caching Basics', icon: '🗄️', reason: 'For PROJ-2847 ticket' },
          { title: 'Performance Optimization', icon: '⚡', reason: 'Related to your queries' },
          { title: 'API Security Best Practices', icon: '🔒', reason: 'Trending in your team' },
        ];
        return {
          title: topics[index]?.title || area.area,
          icon: topics[index]?.icon || '📚',
          reason: topics[index]?.reason || `Based on your skill gap in ${area.area}`,
        };
      });

      return suggestions.length > 0 ? suggestions : [
        { title: 'Redis Caching Basics', icon: '🗄️', reason: 'For PROJ-2847 ticket' },
        { title: 'Performance Optimization', icon: '⚡', reason: 'Related to your queries' },
        { title: 'API Security Best Practices', icon: '🔒', reason: 'Trending in your team' },
      ];
    } catch (error) {
      this.logger.error('Error getting smart suggestions:', error);
      return [];
    }
  }

  async generateContent(
    learnerId: number,
    contentType: 'quiz' | 'coding-challenge',
    topic: string,
    difficulty: string,
    duration: string,
  ) {
    if (!this.groq) {
      throw new HttpException(
        'AI service not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Get learner's context
      const learnerContext = await this.getLearnerContext(learnerId);

      // Build prompt based on content type
      const prompt = this.buildContentPrompt(
        contentType,
        topic,
        difficulty,
        duration,
        learnerContext,
      );

      // Generate content using AI
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt(contentType),
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
      const contentData = JSON.parse(responseText);

      // Save generated content to database
      const contentId = await this.saveGeneratedContent(
        learnerId,
        contentType,
        topic,
        difficulty,
        duration,
        contentData,
      );

      return {
        id: contentId,
        type: contentType,
        topic,
        difficulty,
        duration,
        ...contentData,
      };
    } catch (error: any) {
      this.logger.error('Error generating content:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to generate content',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getLearnerContext(learnerId: number): Promise<any> {
    if (!this.pool) {
      return {};
    }

    try {
      // Get skill profile
      const profileResult = await this.pool.query(
        'SELECT * FROM "skillProfiles" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      const context: any = {};

      if (profileResult.rows.length > 0) {
        const profile = profileResult.rows[0];
        
        // Get strengths and growth areas
        const strengths = await this.pool.query(
          'SELECT * FROM "skillStrengths" WHERE "skillProfileId" = $1',
          [profile.id],
        );
        const growthAreas = await this.pool.query(
          'SELECT * FROM "skillGrowthAreas" WHERE "skillProfileId" = $1',
          [profile.id],
        );
        const skillMap = await this.pool.query(
          'SELECT * FROM "skillMaps" WHERE "skillProfileId" = $1',
          [profile.id],
        );

        context.strengths = strengths.rows.map((s) => s.strength);
        context.growthAreas = growthAreas.rows.map((g) => g.area);
        context.skills = skillMap.rows.map((s) => ({
          skill: s.skill,
          level: s.level,
          category: s.category,
        }));
      }

      // Get learning path
      const learningPath = await this.pool.query(
        'SELECT * FROM "learningPaths" WHERE "learnerId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
        [learnerId],
      );

      if (learningPath.rows.length > 0) {
        context.learningPath = learningPath.rows[0];
      }

      return context;
    } catch (error) {
      this.logger.error('Error getting learner context:', error);
      return {};
    }
  }

  private buildContentPrompt(
    contentType: string,
    topic: string,
    difficulty: string,
    duration: string,
    context: any,
  ): string {
    let prompt = `Generate a ${contentType} for the following requirements:\n\n`;
    prompt += `Topic: ${topic}\n`;
    prompt += `Difficulty Level: ${difficulty}\n`;
    prompt += `Duration: ${duration}\n\n`;

    if (context.strengths && context.strengths.length > 0) {
      prompt += `Learner's Strengths: ${context.strengths.join(', ')}\n`;
    }
    if (context.growthAreas && context.growthAreas.length > 0) {
      prompt += `Areas for Growth: ${context.growthAreas.join(', ')}\n`;
    }
    if (context.skills && context.skills.length > 0) {
      prompt += `Current Skills: ${context.skills.map((s: any) => `${s.skill} (${s.level})`).join(', ')}\n`;
    }

    prompt += `\nGenerate personalized ${contentType} content that:\n`;
    prompt += `1. Matches the difficulty level (${difficulty})\n`;
    prompt += `2. Can be completed in ${duration}\n`;
    prompt += `3. Builds on learner's strengths while addressing growth areas\n`;
    prompt += `4. Is engaging and practical\n\n`;

    if (contentType === 'quiz') {
      prompt += `Return JSON with this structure:
{
  "title": "Quiz title",
  "description": "Quiz description",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of the correct answer"
    }
  ],
  "totalQuestions": 10,
  "estimatedTime": "${duration}"
}`;
    } else if (contentType === 'coding-challenge') {
      prompt += `Return JSON with this structure:
{
  "title": "Coding challenge title",
  "description": "Challenge description",
  "instructions": "Step-by-step instructions",
  "starterCode": "// Starter code here",
  "solution": "// Solution code here",
  "testCases": [
    {
      "input": "input example",
      "expectedOutput": "expected output"
    }
  ],
  "hints": ["Hint 1", "Hint 2"],
  "estimatedTime": "${duration}"
}`;
    }

    return prompt;
  }

  private getSystemPrompt(contentType: string): string {
    const prompts: any = {
      quiz: 'You are an expert quiz creator. Create engaging, educational quizzes that test understanding and reinforce learning. Make questions clear, options plausible, and explanations helpful.',
      'coding-challenge': 'You are an expert coding challenge creator. Create practical, hands-on coding challenges that build real-world skills. Provide clear instructions, starter code, and helpful hints.',
    };

    return prompts[contentType] || 'You are an expert educational content creator.';
  }

  private async saveGeneratedContent(
    learnerId: number,
    contentType: string,
    topic: string,
    difficulty: string,
    duration: string,
    contentData: any,
  ): Promise<number> {
    if (!this.pool) {
      return 0;
    }

    try {
      // Create generated content table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS "generatedContent" (
          id SERIAL PRIMARY KEY,
          "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
          "contentType" VARCHAR(50) NOT NULL,
          topic VARCHAR(255) NOT NULL,
          difficulty VARCHAR(50),
          duration VARCHAR(50),
          content JSONB NOT NULL,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await this.pool.query(
        `INSERT INTO "generatedContent" ("learnerId", "contentType", topic, difficulty, duration, content)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [learnerId, contentType, topic, difficulty, duration, JSON.stringify(contentData)],
      );

      return result.rows[0].id;
    } catch (error: any) {
      this.logger.error('Error saving generated content:', error);
      // If table creation fails, just return 0 (content still generated)
      return 0;
    }
  }

  async getContentById(contentId: number, learnerId: number): Promise<any> {
    if (!this.pool) {
      return null;
    }

    try {
      const result = await this.pool.query(
        `SELECT * FROM "generatedContent" WHERE id = $1 AND "learnerId" = $2`,
        [contentId, learnerId],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const content = result.rows[0];
      return {
        id: content.id,
        type: content.contentType,
        topic: content.topic,
        difficulty: content.difficulty,
        duration: content.duration,
        ...content.content,
      };
    } catch (error: any) {
      this.logger.error('Error getting content by ID:', error);
      return null;
    }
  }

  async saveResult(learnerId: number, resultData: any): Promise<any> {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Create contentResults table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS "contentResults" (
          id SERIAL PRIMARY KEY,
          "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
          "contentId" INTEGER,
          "contentType" VARCHAR(50) NOT NULL,
          topic VARCHAR(255),
          score INTEGER,
          "totalQuestions" INTEGER,
          percentage DECIMAL(5,2),
          "timeSpent" INTEGER,
          answers JSONB,
          "completedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const result = await this.pool.query(
        `INSERT INTO "contentResults" ("learnerId", "contentId", "contentType", topic, score, "totalQuestions", percentage, "timeSpent", answers)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          learnerId,
          resultData.contentId || null,
          resultData.contentType,
          resultData.topic || null,
          resultData.score || 0,
          resultData.totalQuestions || 0,
          resultData.percentage || 0,
          resultData.timeSpent || 0,
          JSON.stringify(resultData.answers || {}),
        ],
      );

      this.logger.log(`✅ Saved ${resultData.contentType} result for learner ${learnerId}`);
      return {
        id: result.rows[0].id,
        message: 'Result saved successfully',
      };
    } catch (error: any) {
      this.logger.error('Error saving result:', error);
      throw new HttpException(
        error.message || 'Failed to save result',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEmployeeQuizStatus(): Promise<any> {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Get all learners with their quiz results
      const result = await this.pool.query(`
        SELECT 
          l.id,
          l.name,
          l.email,
          l.role,
          l.department,
          COUNT(cr.id) as "totalQuizzes",
          AVG(cr.percentage) as "averageScore",
          MAX(cr."completedAt") as "lastQuizDate",
          COUNT(CASE WHEN cr."contentType" = 'quiz' THEN 1 END) as "quizCount",
          COUNT(CASE WHEN cr."contentType" = 'flashcard' THEN 1 END) as "flashcardCount",
          COUNT(CASE WHEN cr."contentType" = 'coding-challenge' THEN 1 END) as "codingChallengeCount"
        FROM learners l
        LEFT JOIN "contentResults" cr ON l.id = cr."learnerId"
        WHERE l.status = 'active'
        GROUP BY l.id, l.name, l.email, l.role, l.department
        ORDER BY l.name
      `);

      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        department: row.department,
        totalQuizzes: parseInt(row.totalQuizzes) || 0,
        averageScore: parseFloat(row.averageScore) || 0,
        lastQuizDate: row.lastQuizDate,
        quizCount: parseInt(row.quizCount) || 0,
        flashcardCount: parseInt(row.flashcardCount) || 0,
        codingChallengeCount: parseInt(row.codingChallengeCount) || 0,
        status: row.averageScore >= 70 ? 'On Track' : row.averageScore >= 50 ? 'Needs Improvement' : 'Behind',
      }));
    } catch (error: any) {
      this.logger.error('Error getting employee quiz status:', error);
      throw new HttpException(
        error.message || 'Failed to get employee quiz status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}


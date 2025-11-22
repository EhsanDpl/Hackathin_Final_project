import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Pool } from 'pg';
import Groq from 'groq-sdk';

@Injectable()
export class SkillProfileService {
  private readonly logger = new Logger(SkillProfileService.name);
  private pool: Pool | null = null;
  private groq: Groq | null = null;
  private readonly model = 'llama-3.3-70b-versatile'; // Using Llama 3.3 70B (excellent for code/data extraction and analysis)

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
      this.logger.log('✅ PostgreSQL connection initialized for skill profiles');
    }

    // Initialize Groq client for Qwen2 model
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      this.groq = new Groq({
        apiKey: apiKey,
      });
      this.logger.log(`✅ Groq client initialized with ${this.model}`);
    } else {
      this.logger.warn('⚠️ GROQ_API_KEY not found. Skill profile generation will not work.');
    }
  }

  async saveDraft(learnerId: number, draftData: any) {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Check if draft exists
      const existing = await this.pool.query(
        'SELECT id FROM "skillProfiles" WHERE "learnerId" = $1',
        [learnerId],
      );

      if (existing.rows.length > 0) {
        // Update existing draft
        await this.pool.query(
          'UPDATE "skillProfiles" SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "learnerId" = $2',
          ['draft', learnerId],
        );
        return { message: 'Draft saved successfully', id: existing.rows[0].id };
      } else {
        // Create new draft
        const result = await this.pool.query(
          'INSERT INTO "skillProfiles" ("learnerId", status) VALUES ($1, $2) RETURNING id',
          [learnerId, 'draft'],
        );
        return { message: 'Draft saved successfully', id: result.rows[0].id };
      }
    } catch (error: any) {
      this.logger.error('Error saving draft:', error);
      throw new HttpException(
        error.message || 'Failed to save draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateProfile(learnerId: number) {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    if (!this.groq) {
      throw new HttpException(
        'AI service not configured. Please set GROQ_API_KEY environment variable.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Get learner's connected accounts
      const connectedAccounts = await this.pool.query(
        `SELECT uel.*, el."accountType", el.url 
         FROM "userExternalLinks" uel
         JOIN "externalLinks" el ON uel."externalLinkId" = el.id
         WHERE uel."learnerId" = $1 AND uel.connected = true`,
        [learnerId],
      );

      if (connectedAccounts.rows.length === 0) {
        throw new HttpException(
          'No connected integrations found. Please connect at least one integration.',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Collect data from connected accounts
      const accountData: any = {};
      for (const account of connectedAccounts.rows) {
        const accountType = account.accountType;
        if (accountType === 'github' && account.accountId) {
          const githubData = await this.pool.query(
            'SELECT * FROM "githubProfiles" WHERE id = $1',
            [account.accountId],
          );
          if (githubData.rows.length > 0) {
            accountData.github = githubData.rows[0];
          }
        } else if (accountType === 'jira' && account.accountId) {
          const jiraData = await this.pool.query(
            'SELECT * FROM "jiraData" WHERE id = $1',
            [account.accountId],
          );
          if (jiraData.rows.length > 0) {
            accountData.jira = jiraData.rows[0];
          }
        } else if (accountType === 'gitlab' && account.accountId) {
          // GitLab data would be similar structure
          accountData.gitlab = { accountId: account.accountId };
        }
      }

      // Prepare prompt for Qwen2 model
      const prompt = this.buildPrompt(accountData, connectedAccounts.rows.length);

      // Call AI model optimized for code/data extraction and analysis
      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              'You are an expert code repository analyst and career skill profiler. Your specialty is extracting meaningful insights from code repositories, work patterns, and technical contributions. Analyze the provided repository data (GitHub, Jira, GitLab) and extract detailed technical skills, work patterns, code quality indicators, and career progression signals. Focus on: 1) Programming languages and frameworks used, 2) Code contribution patterns and frequency, 3) Technical depth and complexity, 4) Collaboration and project management skills, 5) Areas of expertise and gaps. Return your response as a valid JSON object with structured insights.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.model,
        temperature: 0.5, // Lower temperature for more focused, accurate extraction
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const responseText =
        completion.choices[0]?.message?.content || '{}';
      const profileData = JSON.parse(responseText);

      // Save profile to database
      // Save profile with recommendation
      const profileResult = await this.pool.query(
        `INSERT INTO "skillProfiles" ("learnerId", status, "generatedAt", recommendation)
         VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
         ON CONFLICT ("learnerId") 
         DO UPDATE SET status = $2, "generatedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP, recommendation = $3
         RETURNING id`,
        [learnerId, 'generated', profileData.recommendation || null],
      );

      const skillProfileId = profileResult.rows[0].id;

      // Save insights
      if (profileData.insights && Array.isArray(profileData.insights)) {
        for (const insight of profileData.insights) {
          await this.pool.query(
            `INSERT INTO "skillProfileInsights" ("skillProfileId", "accountType", insight)
             VALUES ($1, $2, $3)`,
            [skillProfileId, insight.accountType || 'general', insight.insight],
          );
        }
      }

      // Save strengths
      if (profileData.strengths && Array.isArray(profileData.strengths)) {
        for (const strength of profileData.strengths) {
          await this.pool.query(
            `INSERT INTO "skillStrengths" ("skillProfileId", strength)
             VALUES ($1, $2)`,
            [skillProfileId, strength],
          );
        }
      }

      // Save growth areas
      if (
        profileData.growthAreas &&
        Array.isArray(profileData.growthAreas)
      ) {
        for (const area of profileData.growthAreas) {
          await this.pool.query(
            `INSERT INTO "skillGrowthAreas" ("skillProfileId", area)
             VALUES ($1, $2)`,
            [skillProfileId, area],
          );
        }
      }

      // Save skill map
      if (profileData.skillMap && Array.isArray(profileData.skillMap)) {
        for (const skill of profileData.skillMap) {
          await this.pool.query(
            `INSERT INTO "skillMaps" ("skillProfileId", skill, level, category)
             VALUES ($1, $2, $3, $4)`,
            [
              skillProfileId,
              skill.skill,
              skill.level || null,
              skill.category || null,
            ],
          );
        }
      }

      // Get the complete profile
      return await this.getProfile(learnerId);
    } catch (error: any) {
      this.logger.error('Error generating profile:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to generate profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getProfile(learnerId: number) {
    if (!this.pool) {
      throw new HttpException(
        'Database not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const profileResult = await this.pool.query(
        'SELECT * FROM "skillProfiles" WHERE "learnerId" = $1',
        [learnerId],
      );

      if (profileResult.rows.length === 0) {
        return null;
      }

      const profile = profileResult.rows[0];

      // Get insights
      const insights = await this.pool.query(
        'SELECT * FROM "skillProfileInsights" WHERE "skillProfileId" = $1',
        [profile.id],
      );

      // Get strengths
      const strengths = await this.pool.query(
        'SELECT * FROM "skillStrengths" WHERE "skillProfileId" = $1',
        [profile.id],
      );

      // Get growth areas
      const growthAreas = await this.pool.query(
        'SELECT * FROM "skillGrowthAreas" WHERE "skillProfileId" = $1',
        [profile.id],
      );

      // Get skill map
      const skillMap = await this.pool.query(
        'SELECT * FROM "skillMaps" WHERE "skillProfileId" = $1',
        [profile.id],
      );

      return {
        ...profile,
        insights: insights.rows,
        strengths: strengths.rows.map((s) => s.strength),
        growthAreas: growthAreas.rows.map((g) => g.area),
        skillMap: skillMap.rows,
        recommendation: profile.recommendation || 'No recommendation available',
      };
    } catch (error: any) {
      this.logger.error('Error getting profile:', error);
      throw new HttpException(
        error.message || 'Failed to get profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private buildPrompt(accountData: any, connectedCount: number): string {
    let prompt = `Extract and analyze technical skills and work patterns from the following repository and work data (${connectedCount} connected sources). Focus on code-level insights, technical depth, and skill extraction.\n\n`;

    if (accountData.github) {
      const github = accountData.github;
      prompt += `=== GITHUB REPOSITORY DATA ===\n`;
      prompt += `Username: ${github.username || 'N/A'}\n`;
      prompt += `Full Name: ${github.fullName || 'N/A'}\n`;
      prompt += `Bio: ${github.bio || 'N/A'}\n`;
      prompt += `Location: ${github.location || 'N/A'}\n`;
      prompt += `Public Repositories: ${github.publicRepos || 0}\n`;
      prompt += `Followers: ${github.followers || 0}\n`;
      prompt += `Following: ${github.following || 0}\n`;
      prompt += `Contributions Last Year: ${github.contributionsLastYear || 0}\n`;
      prompt += `Primary Language: ${github.primaryLanguage || 'N/A'}\n`;
      prompt += `Recent Activity: ${github.recentActivity || 'N/A'}\n`;
      prompt += `Languages Used: ${JSON.stringify(github.languages || {})}\n`;
      if (github.topRepositories) {
        prompt += `Top Repositories: ${JSON.stringify(github.topRepositories)}\n`;
      }
      prompt += `\n`;
    }

    if (accountData.jira) {
      const jira = accountData.jira;
      prompt += `=== JIRA WORK PATTERNS ===\n`;
      prompt += `Sprint Name: ${jira.sprintName || 'N/A'}\n`;
      prompt += `Sprint Status: ${jira.sprintStatus || 'N/A'}\n`;
      prompt += `Issue Key: ${jira.issueKey || 'N/A'}\n`;
      prompt += `Issue Title: ${jira.issueTitle || 'N/A'}\n`;
      prompt += `Issue Type: ${jira.issueType || 'N/A'}\n`;
      prompt += `Status: ${jira.status || 'N/A'}\n`;
      prompt += `Priority: ${jira.priority || 'N/A'}\n`;
      prompt += `Story Points: ${jira.storyPoints || 0}\n`;
      prompt += `Assignee: ${jira.assignee || 'N/A'}\n`;
      prompt += `Reporter: ${jira.reporter || 'N/A'}\n`;
      if (jira.sprintStartDate) {
        prompt += `Sprint Start: ${jira.sprintStartDate}\n`;
      }
      if (jira.sprintEndDate) {
        prompt += `Sprint End: ${jira.sprintEndDate}\n`;
      }
      prompt += `\n`;
    }

    if (accountData.gitlab) {
      prompt += `=== GITLAB DATA ===\n`;
      prompt += `Account connected\n\n`;
    }

    prompt += `=== ANALYSIS REQUIREMENTS ===\n`;
    prompt += `Based on the repository and work data above, extract and analyze:\n\n`;
    prompt += `1. CODE REPOSITORY INSIGHTS:\n`;
    prompt += `   - Programming languages distribution and proficiency levels\n`;
    prompt += `   - Code contribution patterns (frequency, volume, complexity)\n`;
    prompt += `   - Technical stack and framework usage\n`;
    prompt += `   - Repository activity and engagement metrics\n\n`;
    prompt += `2. WORK PATTERN ANALYSIS:\n`;
    prompt += `   - Types of work completed (frontend, backend, infrastructure, etc.)\n`;
    prompt += `   - Project complexity and scope indicators\n`;
    prompt += `   - Collaboration and team work patterns\n\n`;
    prompt += `3. SKILL EXTRACTION:\n`;
    prompt += `   - Specific technical skills with proficiency levels\n`;
    prompt += `   - Framework and tool expertise\n`;
    prompt += `   - Domain knowledge areas\n\n`;
    prompt += `Generate a JSON response with this structure:\n`;
    prompt += `{\n`;
    prompt += `  "insights": [\n`;
    prompt += `    {"accountType": "github", "insight": "Detailed technical insight about code patterns, languages, and repository activity. Be specific about percentages, technologies, and patterns."},\n`;
    prompt += `    {"accountType": "jira", "insight": "Detailed insight about work patterns, ticket types, complexity, and project involvement."}\n`;
    prompt += `  ],\n`;
    prompt += `  "recommendation": "Comprehensive AI recommendation based on code analysis and work patterns. Focus on technical growth path and skill development areas.",\n`;
    prompt += `  "strengths": ["Specific technical strength 1", "Specific technical strength 2", "Specific technical strength 3", "Specific technical strength 4"],\n`;
    prompt += `  "growthAreas": ["Specific technical area 1", "Specific technical area 2", "Specific technical area 3", "Specific technical area 4", "Specific technical area 5"],\n`;
    prompt += `  "skillMap": [\n`;
    prompt += `    {"skill": "React", "level": "Advanced", "category": "Frontend Development"},\n`;
    prompt += `    {"skill": "Node.js", "level": "Intermediate", "category": "Backend Development"},\n`;
    prompt += `    {"skill": "TypeScript", "level": "Advanced", "category": "Programming Language"}\n`;
    prompt += `  ]\n`;
    prompt += `}\n\n`;
    prompt += `IMPORTANT: Be specific, technical, and data-driven in your analysis. Extract actual patterns from the code repository data.`;

    return prompt;
  }
}


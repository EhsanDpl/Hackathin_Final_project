import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MockServerService implements OnModuleDestroy {
  private readonly logger = new Logger(MockServerService.name);
  private pool: Pool | null = null;
  private usePostgres = false;
  private dbData: any = null;

  constructor() {
    // Check if we should use PostgreSQL
    if (process.env.DB_HOST) {
      this.usePostgres = true;
      this.initializePostgres();
    } else {
      // Load JSON data
      this.loadJsonData();
    }
  }

  private initializePostgres() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'skillpilot',
      password: process.env.DB_PASSWORD || 'skillpilot123',
      database: process.env.DB_NAME || 'skillpilot_db',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    this.pool.on('connect', () => {
      this.logger.log('✅ Connected to PostgreSQL database');
    });

    this.pool.on('error', (err) => {
      this.logger.error('❌ Unexpected error on idle client', err);
    });
  }

  private loadJsonData() {
    try {
      const dbPath = path.join(process.cwd(), 'db.json');
      const fileContent = fs.readFileSync(dbPath, 'utf-8');
      this.dbData = JSON.parse(fileContent);
      this.logger.log('✅ Loaded JSON data from db.json');
    } catch (error) {
      this.logger.error('❌ Error loading JSON data', error);
      this.dbData = {};
    }
  }

  async healthcheck() {
    if (this.usePostgres && this.pool) {
      try {
        await this.pool.query('SELECT NOW()');
        return {
          status: 'OK',
          timestamp: new Date().toISOString(),
          database: 'Connected',
          message: 'SkillPilot AI Mock API is running',
        };
      } catch (error) {
        return {
          status: 'ERROR',
          database: 'Disconnected',
          message: error.message,
        };
      }
    } else {
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: 'JSON',
        message: 'SkillPilot AI Mock API is running',
      };
    }
  }

  async getLearners() {
    if (this.usePostgres && this.pool) {
      const result = await this.pool.query(
        'SELECT * FROM learners ORDER BY id',
      );
      return result.rows;
    } else {
      return this.dbData?.learners || [];
    }
  }

  async getLearnerById(id: number) {
    if (this.usePostgres && this.pool) {
      const result = await this.pool.query(
        'SELECT * FROM learners WHERE id = $1',
        [id],
      );
      if (result.rows.length === 0) {
        throw new Error('Learner not found');
      }
      return result.rows[0];
    } else {
      const learner = this.dbData?.learners?.find((l: any) => l.id === id);
      if (!learner) {
        throw new Error('Learner not found');
      }
      return learner;
    }
  }

  async getGitHubProfiles(learnerId?: number) {
    if (this.usePostgres && this.pool) {
      let query = 'SELECT * FROM "githubProfiles"';
      const params: any[] = [];
      if (learnerId) {
        query += ' WHERE "learnerId" = $1';
        params.push(learnerId);
      }
      query += ' ORDER BY id';
      const result = await this.pool.query(query, params);
      return result.rows;
    } else {
      let profiles = this.dbData?.githubProfiles || [];
      if (learnerId) {
        profiles = profiles.filter((p: any) => p.learnerId === learnerId);
      }
      return profiles;
    }
  }

  async getLinkedInProfiles(learnerId?: number) {
    if (this.usePostgres && this.pool) {
      let query = 'SELECT * FROM "linkedinProfiles"';
      const params: any[] = [];
      if (learnerId) {
        query += ' WHERE "learnerId" = $1';
        params.push(learnerId);
      }
      query += ' ORDER BY id';
      const result = await this.pool.query(query, params);
      return result.rows;
    } else {
      let profiles = this.dbData?.linkedinProfiles || [];
      if (learnerId) {
        profiles = profiles.filter((p: any) => p.learnerId === learnerId);
      }
      return profiles;
    }
  }

  async getSkillAssessments(learnerId?: number) {
    if (this.usePostgres && this.pool) {
      let query = 'SELECT * FROM "skillAssessments"';
      const params: any[] = [];
      if (learnerId) {
        query += ' WHERE "learnerId" = $1';
        params.push(learnerId);
      }
      query += ' ORDER BY id';
      const result = await this.pool.query(query, params);
      return result.rows;
    } else {
      let assessments = this.dbData?.skillAssessments || [];
      if (learnerId) {
        assessments = assessments.filter(
          (a: any) => a.learnerId === learnerId,
        );
      }
      return assessments;
    }
  }

  async getLearningPaths(learnerId?: number) {
    if (this.usePostgres && this.pool) {
      let query = 'SELECT * FROM "learningPaths"';
      const params: any[] = [];
      if (learnerId) {
        query += ' WHERE "learnerId" = $1';
        params.push(learnerId);
      }
      query += ' ORDER BY id';
      const result = await this.pool.query(query, params);
      return result.rows;
    } else {
      let paths = this.dbData?.learningPaths || [];
      if (learnerId) {
        paths = paths.filter((p: any) => p.learnerId === learnerId);
      }
      return paths;
    }
  }

  async getDailyMissions(learnerId?: number) {
    if (this.usePostgres && this.pool) {
      let query = 'SELECT * FROM "dailyMissions"';
      const params: any[] = [];
      if (learnerId) {
        query += ' WHERE "learnerId" = $1';
        params.push(learnerId);
      }
      query += ' ORDER BY id';
      const result = await this.pool.query(query, params);
      return result.rows;
    } else {
      let missions = this.dbData?.dailyMissions || [];
      if (learnerId) {
        missions = missions.filter((m: any) => m.learnerId === learnerId);
      }
      return missions;
    }
  }

  async getTeamsCalendar(learnerId?: number) {
    if (this.usePostgres && this.pool) {
      let query = 'SELECT * FROM "teamsCalendar"';
      const params: any[] = [];
      if (learnerId) {
        query += ' WHERE "learnerId" = $1';
        params.push(learnerId);
      }
      query += ' ORDER BY id';
      const result = await this.pool.query(query, params);
      return result.rows;
    } else {
      let calendar = this.dbData?.teamsCalendar || [];
      if (learnerId) {
        calendar = calendar.filter((c: any) => c.learnerId === learnerId);
      }
      return calendar;
    }
  }

  async getJiraData(learnerId?: number) {
    if (this.usePostgres && this.pool) {
      let query = 'SELECT * FROM "jiraData"';
      const params: any[] = [];
      if (learnerId) {
        query += ' WHERE "learnerId" = $1';
        params.push(learnerId);
      }
      query += ' ORDER BY id';
      const result = await this.pool.query(query, params);
      return result.rows;
    } else {
      let jiraData = this.dbData?.jiraData || [];
      if (learnerId) {
        jiraData = jiraData.filter((j: any) => j.learnerId === learnerId);
      }
      return jiraData;
    }
  }

  async getSkillTaxonomy() {
    if (this.usePostgres && this.pool) {
      const result = await this.pool.query(
        'SELECT * FROM "skillTaxonomy" ORDER BY id',
      );
      return result.rows;
    } else {
      return this.dbData?.skillTaxonomy || [];
    }
  }

  async getCourses() {
    if (this.usePostgres && this.pool) {
      const result = await this.pool.query(
        'SELECT * FROM courses ORDER BY id',
      );
      return result.rows;
    } else {
      return this.dbData?.courses || [];
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}


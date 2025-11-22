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

  async activateUserProfile(email: string, profileData: any) {
    const { password, phone, location, skills } = profileData;

    if (this.usePostgres && this.pool) {
      // Hash password if provided
      let hashedPassword = null;
      if (password) {
        const bcrypt = require('bcrypt');
        hashedPassword = await bcrypt.hash(password, 10);
      }

      // Update user status to active and growth plan to active
      const result = await this.pool.query(
        `UPDATE learners 
         SET status = $1, 
             "growthPlanStatus" = $2,
             phone = COALESCE($3, phone),
             location = COALESCE($4, location),
             "updatedAt" = CURRENT_TIMESTAMP
         WHERE email = $5
         RETURNING *`,
        ['active', 'active', phone || null, location || null, email]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      // If password provided, update users table
      if (hashedPassword) {
        await this.pool.query(
          `UPDATE users SET password = $1 WHERE email = $2`,
          [hashedPassword, email]
        );
      }

      this.logger.log(`✅ User profile activated: ${email}`);
      return result.rows[0];
    } else {
      // For JSON mode
      const learner = this.dbData?.learners?.find((l: any) => l.email === email);
      if (!learner) {
        throw new Error('User not found');
      }

      learner.status = 'active';
      learner.growthPlanStatus = 'active';
      if (phone) learner.phone = phone;
      if (location) learner.location = location;
      learner.updatedAt = new Date().toISOString();

      return learner;
    }
  }

  async createEmployee(employeeData: any) {
    const { name, email, role, position, skills, password, phone, location } = employeeData;
    
    if (this.usePostgres && this.pool) {
      // Insert into learners table with active status (password is set directly)
      const result = await this.pool.query(
        `INSERT INTO learners (name, email, role, department, status, "growthPlanStatus", phone, location, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING *`,
        [
          name, 
          email, 
          position || role, 
          role === 'admin' ? 'Admin' : 'General', 
          'active', // Status is active since password is set directly
          'active', // Growth plan is active
          phone || null,
          location || null
        ]
      );
      
      // Create user account in users table if password is provided
      if (password) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash(password, 10);
        const userRole = role === 'admin' ? 'admin' : 'learner';
        
        // Check if user already exists
        const existingUser = await this.pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );
        
        if (existingUser.rows.length > 0) {
          // Update existing user
          await this.pool.query(
            'UPDATE users SET password = $1, role = $2, updated_at = CURRENT_TIMESTAMP WHERE email = $3',
            [hashedPassword, userRole, email]
          );
        } else {
          // Create new user
          await this.pool.query(
            `INSERT INTO users (email, password, role, created_at, updated_at)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [email, hashedPassword, userRole]
          );
        }
        
        this.logger.log(`✅ Created user account for: ${email}`);
      }
      
      this.logger.log(`✅ Created employee: ${name} (${email})`);
      return result.rows[0];
    } else {
      // For JSON mode, add to in-memory data
      if (!this.dbData.learners) {
        this.dbData.learners = [];
      }
      const nextId = Math.max(...this.dbData.learners.map((l: any) => l.id || 0), 0) + 1;
      const newEmployee = {
        id: nextId,
        name,
        email,
        role: position || role,
        department: role === 'admin' ? 'Admin' : 'General',
        status: 'active', // Status is active since password is set directly
        growthPlanStatus: 'active', // Growth plan is active
        phone: employeeData.phone || null,
        location: employeeData.location || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.dbData.learners.push(newEmployee);
      
      // Save to file
      try {
        const dbPath = path.join(process.cwd(), 'db.json');
        fs.writeFileSync(dbPath, JSON.stringify(this.dbData, null, 2));
      } catch (error) {
        this.logger.error('Error saving to db.json', error);
      }
      
      this.logger.log(`✅ Created employee: ${name} (${email})`);
      return newEmployee;
    }
  }

  async getLearnerByEmail(email: string) {
    if (this.usePostgres && this.pool) {
      const result = await this.pool.query(
        'SELECT * FROM learners WHERE email = $1',
        [email],
      );
      return result.rows[0] || null;
    } else {
      return this.dbData?.learners?.find((l: any) => l.email === email) || null;
    }
  }

  async updateProfile(email: string, profileData: any) {
    const { phone, location, linkedinConnected, jiraConnected, teamsConnected, linkedinProfile } = profileData;
    
    if (this.usePostgres && this.pool) {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (phone !== undefined) {
        updates.push(`phone = $${paramCount++}`);
        values.push(phone);
      }
      if (location !== undefined) {
        updates.push(`location = $${paramCount++}`);
        values.push(location);
      }
      if (linkedinProfile !== undefined) {
        updates.push(`"linkedinProfile" = $${paramCount++}`);
        values.push(linkedinProfile);
      }
      if (linkedinConnected !== undefined) {
        updates.push(`"linkedinConnected" = $${paramCount++}`);
        values.push(linkedinConnected);
      }
      if (jiraConnected !== undefined) {
        updates.push(`"jiraConnected" = $${paramCount++}`);
        values.push(jiraConnected);
      }
      if (teamsConnected !== undefined) {
        updates.push(`"teamsConnected" = $${paramCount++}`);
        values.push(teamsConnected);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
      values.push(email);

      const query = `UPDATE learners SET ${updates.join(', ')} WHERE email = $${paramCount} RETURNING *`;
      const result = await this.pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Learner not found');
      }

      this.logger.log(`✅ Profile updated for: ${email}`);
      return result.rows[0];
    } else {
      const learner = this.dbData?.learners?.find((l: any) => l.email === email);
      if (!learner) {
        throw new Error('Learner not found');
      }

      if (phone !== undefined) learner.phone = phone;
      if (location !== undefined) learner.location = location;
      if (linkedinProfile !== undefined) learner.linkedinProfile = linkedinProfile;
      if (linkedinConnected !== undefined) learner.linkedinConnected = linkedinConnected;
      if (jiraConnected !== undefined) learner.jiraConnected = jiraConnected;
      if (teamsConnected !== undefined) learner.teamsConnected = teamsConnected;
      learner.updatedAt = new Date().toISOString();

      return learner;
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}


import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

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
      const learner = result.rows[0] || null;
      
      if (learner) {
        // Initialize connectedAccounts array
        learner.connectedAccounts = [];
        
        try {
          // Check if userExternalLinks table exists
          const tableCheck = await this.pool.query(
            `SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'userExternalLinks'
            )`
          );
          
          if (tableCheck.rows[0]?.exists) {
            // Get connected accounts from bridge table
            const connectedAccountsResult = await this.pool.query(
              `SELECT 
                uel.id,
                uel."accountId",
                uel."accountUrl",
                uel.connected,
                uel."connectedAt",
                el."accountType",
                el.url as "externalUrl"
               FROM "userExternalLinks" uel
               JOIN "externalLinks" el ON uel."externalLinkId" = el.id
               WHERE uel."learnerId" = $1 AND uel.connected = true`,
              [learner.id]
            );
            
            // Add connected accounts info to learner object
            learner.connectedAccounts = connectedAccountsResult.rows.map((row: any) => ({
              accountType: row.accountType,
              accountId: row.accountId,
              accountUrl: row.accountUrl,
              externalUrl: row.externalUrl,
              connected: row.connected,
              connectedAt: row.connectedAt,
            }));
            
            // Set connection flags for backward compatibility
            learner.linkedinConnected = connectedAccountsResult.rows.some((r: any) => r.accountType === 'linkedin');
            learner.jiraConnected = connectedAccountsResult.rows.some((r: any) => r.accountType === 'jira');
            learner.teamsConnected = connectedAccountsResult.rows.some((r: any) => r.accountType === 'teams');
          } else {
            // Table doesn't exist yet, use old flags
            learner.linkedinConnected = learner.linkedinConnected || false;
            learner.jiraConnected = learner.jiraConnected || false;
            learner.teamsConnected = learner.teamsConnected || false;
          }
        } catch (error: any) {
          // If there's an error, fall back to old flags
          this.logger.warn(`Error fetching connected accounts for ${email}: ${error.message}`);
          learner.linkedinConnected = learner.linkedinConnected || false;
          learner.jiraConnected = learner.jiraConnected || false;
          learner.teamsConnected = learner.teamsConnected || false;
        }
      }
      
      return learner;
    } else {
      return this.dbData?.learners?.find((l: any) => l.email === email) || null;
    }
  }

  async updateProfile(email: string, profileData: any) {
    const { 
      phone, 
      location, 
      linkedinConnected, 
      jiraConnected, 
      teamsConnected, 
      githubConnected,
      linkedinProfile,
      linkedinProfileId,
      jiraDataId,
      teamsCalendarId,
      githubProfileId
    } = profileData;
    
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
      // GitHub connection logic
      if (githubConnected !== undefined && (githubProfileId === undefined || githubProfileId === null)) {
        updates.push(`"githubConnected" = $${paramCount++}`);
        values.push(githubConnected);
      }
      if (githubProfileId !== undefined && githubProfileId !== null) {
        const profileId = parseInt(githubProfileId, 10);
        if (isNaN(profileId)) {
          throw new Error('Invalid githubProfileId: must be a number');
        }
        // Verify the profile exists
        const profileCheck = await this.pool.query(
          'SELECT id FROM "githubProfiles" WHERE id = $1',
          [profileId]
        );
        if (profileCheck.rows.length === 0) {
          throw new Error(`GitHub profile with id ${profileId} not found`);
        }
        
        // Get learner ID
        const learnerResult = await this.pool.query('SELECT id FROM learners WHERE email = $1', [email]);
        if (learnerResult.rows.length === 0) {
          throw new Error('Learner not found');
        }
        const learnerId = learnerResult.rows[0].id;
        
        // Get external link ID and URL from externalLinks table for 'github'
        const externalLinkResult = await this.pool.query(
          'SELECT id, url FROM "externalLinks" WHERE "accountType" = $1 AND "isActive" = true',
          ['github']
        );
        if (externalLinkResult.rows.length === 0) {
          throw new Error('GitHub external link not found in externalLinks table');
        }
        const externalLinkId = externalLinkResult.rows[0].id;
        const externalLinkUrl = externalLinkResult.rows[0].url;
        
        // Create or update bridge table entry (userExternalLinks)
        await this.pool.query(
          `INSERT INTO "userExternalLinks" ("learnerId", "externalLinkId", "accountId", "accountUrl", connected, "connectedAt")
           VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
           ON CONFLICT ("learnerId", "externalLinkId")
           DO UPDATE SET 
             "accountId" = EXCLUDED."accountId",
             "accountUrl" = EXCLUDED."accountUrl",
             connected = true,
             "connectedAt" = CURRENT_TIMESTAMP,
             "disconnectedAt" = NULL,
             "updatedAt" = CURRENT_TIMESTAMP`,
          [learnerId, externalLinkId, profileId, externalLinkUrl]
        );
        
        // Also update learners table for backward compatibility
        updates.push(`"githubProfileId" = $${paramCount++}`);
        updates.push(`"githubConnected" = $${paramCount++}`);
        values.push(profileId);
        values.push(true);
        this.logger.log(`🔗 Linking learner ${email} to GitHub profile ID: ${profileId} via external link ID: ${externalLinkId} with URL: ${externalLinkUrl}`);
      }
      // Only add linkedinConnected separately if linkedinProfileId is not provided
      // (linkedinProfileId block will set it automatically)
      if (linkedinConnected !== undefined && (linkedinProfileId === undefined || linkedinProfileId === null)) {
        updates.push(`"linkedinConnected" = $${paramCount++}`);
        values.push(linkedinConnected);
      }
      if (linkedinProfileId !== undefined && linkedinProfileId !== null) {
        // Convert to integer and validate it exists
        const profileId = parseInt(linkedinProfileId, 10);
        if (isNaN(profileId)) {
          throw new Error('Invalid linkedinProfileId: must be a number');
        }
        // Verify the profile exists
        const profileCheck = await this.pool.query(
          'SELECT id FROM "linkedinProfiles" WHERE id = $1',
          [profileId]
        );
        if (profileCheck.rows.length === 0) {
          throw new Error(`LinkedIn profile with id ${profileId} not found`);
        }
        
        // Get learner ID
        const learnerResult = await this.pool.query('SELECT id FROM learners WHERE email = $1', [email]);
        if (learnerResult.rows.length === 0) {
          throw new Error('Learner not found');
        }
        const learnerId = learnerResult.rows[0].id;
        
        // Get external link ID and URL from externalLinks table for 'linkedin'
        const externalLinkResult = await this.pool.query(
          'SELECT id, url FROM "externalLinks" WHERE "accountType" = $1 AND "isActive" = true',
          ['linkedin']
        );
        if (externalLinkResult.rows.length === 0) {
          throw new Error('LinkedIn external link not found in externalLinks table');
        }
        const externalLinkId = externalLinkResult.rows[0].id;
        const externalLinkUrl = externalLinkResult.rows[0].url;
        
        // Create or update bridge table entry (userExternalLinks)
        await this.pool.query(
          `INSERT INTO "userExternalLinks" ("learnerId", "externalLinkId", "accountId", "accountUrl", connected, "connectedAt")
           VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
           ON CONFLICT ("learnerId", "externalLinkId")
           DO UPDATE SET 
             "accountId" = EXCLUDED."accountId",
             "accountUrl" = EXCLUDED."accountUrl",
             connected = true,
             "connectedAt" = CURRENT_TIMESTAMP,
             "disconnectedAt" = NULL,
             "updatedAt" = CURRENT_TIMESTAMP`,
          [learnerId, externalLinkId, profileId, externalLinkUrl]
        );
        
        // Also update learners table for backward compatibility
        updates.push(`"linkedinProfileId" = $${paramCount++}`);
        updates.push(`"linkedinConnected" = $${paramCount++}`);
        values.push(profileId);
        values.push(true);
        this.logger.log(`🔗 Linking learner ${email} to LinkedIn profile ID: ${profileId} via external link ID: ${externalLinkId} with URL: ${externalLinkUrl}`);
      }
      // Only add jiraConnected separately if jiraDataId is not provided
      // (jiraDataId block will set it automatically)
      if (jiraConnected !== undefined && (jiraDataId === undefined || jiraDataId === null)) {
        updates.push(`"jiraConnected" = $${paramCount++}`);
        values.push(jiraConnected);
      }
      if (jiraDataId !== undefined && jiraDataId !== null) {
        const jiraId = parseInt(jiraDataId, 10);
        if (isNaN(jiraId)) {
          throw new Error('Invalid jiraDataId: must be a number');
        }
        // Verify the Jira data exists
        const jiraCheck = await this.pool.query(
          'SELECT id FROM "jiraData" WHERE id = $1',
          [jiraId]
        );
        if (jiraCheck.rows.length === 0) {
          throw new Error(`Jira data with id ${jiraId} not found`);
        }
        
        // Get learner ID
        const learnerResult = await this.pool.query('SELECT id FROM learners WHERE email = $1', [email]);
        if (learnerResult.rows.length === 0) {
          throw new Error('Learner not found');
        }
        const learnerId = learnerResult.rows[0].id;
        
        // Get external link ID and URL from externalLinks table for 'jira'
        const externalLinkResult = await this.pool.query(
          'SELECT id, url FROM "externalLinks" WHERE "accountType" = $1 AND "isActive" = true',
          ['jira']
        );
        if (externalLinkResult.rows.length === 0) {
          throw new Error('Jira external link not found in externalLinks table');
        }
        const externalLinkId = externalLinkResult.rows[0].id;
        const externalLinkUrl = externalLinkResult.rows[0].url;
        
        // Create or update bridge table entry
        await this.pool.query(
          `INSERT INTO "userExternalLinks" ("learnerId", "externalLinkId", "accountId", "accountUrl", connected, "connectedAt")
           VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
           ON CONFLICT ("learnerId", "externalLinkId")
           DO UPDATE SET 
             "accountId" = EXCLUDED."accountId",
             "accountUrl" = EXCLUDED."accountUrl",
             connected = true,
             "connectedAt" = CURRENT_TIMESTAMP,
             "disconnectedAt" = NULL,
             "updatedAt" = CURRENT_TIMESTAMP`,
          [learnerId, externalLinkId, jiraId, externalLinkUrl]
        );
        
        // Also update learners table for backward compatibility
        updates.push(`"jiraDataId" = $${paramCount++}`);
        updates.push(`"jiraConnected" = $${paramCount++}`);
        values.push(jiraId);
        values.push(true);
        this.logger.log(`🔗 Linking learner ${email} to Jira data ID: ${jiraId} via external link ID: ${externalLinkId} with URL: ${externalLinkUrl}`);
      }
      // Only add teamsConnected separately if teamsCalendarId is not provided
      // (teamsCalendarId block will set it automatically)
      if (teamsConnected !== undefined && (teamsCalendarId === undefined || teamsCalendarId === null)) {
        updates.push(`"teamsConnected" = $${paramCount++}`);
        values.push(teamsConnected);
      }
      if (teamsCalendarId !== undefined && teamsCalendarId !== null) {
        const teamsId = parseInt(teamsCalendarId, 10);
        if (isNaN(teamsId)) {
          throw new Error('Invalid teamsCalendarId: must be a number');
        }
        // Verify the Teams calendar data exists
        const teamsCheck = await this.pool.query(
          'SELECT id FROM "teamsCalendar" WHERE id = $1',
          [teamsId]
        );
        if (teamsCheck.rows.length === 0) {
          throw new Error(`Teams calendar with id ${teamsId} not found`);
        }
        
        // Get learner ID
        const learnerResult = await this.pool.query('SELECT id FROM learners WHERE email = $1', [email]);
        if (learnerResult.rows.length === 0) {
          throw new Error('Learner not found');
        }
        const learnerId = learnerResult.rows[0].id;
        
        // Get external link ID and URL from externalLinks table for 'teams'
        const externalLinkResult = await this.pool.query(
          'SELECT id, url FROM "externalLinks" WHERE "accountType" = $1 AND "isActive" = true',
          ['teams']
        );
        if (externalLinkResult.rows.length === 0) {
          throw new Error('Teams external link not found in externalLinks table');
        }
        const externalLinkId = externalLinkResult.rows[0].id;
        const externalLinkUrl = externalLinkResult.rows[0].url;
        
        // Create or update bridge table entry
        await this.pool.query(
          `INSERT INTO "userExternalLinks" ("learnerId", "externalLinkId", "accountId", "accountUrl", connected, "connectedAt")
           VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP)
           ON CONFLICT ("learnerId", "externalLinkId")
           DO UPDATE SET 
             "accountId" = EXCLUDED."accountId",
             "accountUrl" = EXCLUDED."accountUrl",
             connected = true,
             "connectedAt" = CURRENT_TIMESTAMP,
             "disconnectedAt" = NULL,
             "updatedAt" = CURRENT_TIMESTAMP`,
          [learnerId, externalLinkId, teamsId, externalLinkUrl]
        );
        
        // Also update learners table for backward compatibility
        updates.push(`"teamsCalendarId" = $${paramCount++}`);
        updates.push(`"teamsConnected" = $${paramCount++}`);
        values.push(teamsId);
        values.push(true);
        this.logger.log(`🔗 Linking learner ${email} to Teams calendar ID: ${teamsId} via external link ID: ${externalLinkId} with URL: ${externalLinkUrl}`);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
      values.push(email);

      const query = `UPDATE learners SET ${updates.join(', ')} WHERE email = $${paramCount} RETURNING *`;
      
      try {
        const result = await this.pool.query(query, values);

        if (result.rows.length === 0) {
          throw new Error('Learner not found');
        }

        this.logger.log(`✅ Profile updated for: ${email}`);
        return result.rows[0];
      } catch (error: any) {
        this.logger.error(`❌ Error updating profile for ${email}: ${error.message}`);
        this.logger.error(`Query: ${query}`);
        this.logger.error(`Values: ${JSON.stringify(values)}`);
        throw error;
      }
    } else {
      const learner = this.dbData?.learners?.find((l: any) => l.email === email);
      if (!learner) {
        throw new Error('Learner not found');
      }

      if (phone !== undefined) learner.phone = phone;
      if (location !== undefined) learner.location = location;
      if (linkedinProfile !== undefined) learner.linkedinProfile = linkedinProfile;
      if (linkedinConnected !== undefined) learner.linkedinConnected = linkedinConnected;
      if (linkedinProfileId !== undefined) learner.linkedinProfileId = linkedinProfileId;
      if (jiraConnected !== undefined) learner.jiraConnected = jiraConnected;
      if (jiraDataId !== undefined) learner.jiraDataId = jiraDataId;
      if (teamsConnected !== undefined) learner.teamsConnected = teamsConnected;
      if (teamsCalendarId !== undefined) learner.teamsCalendarId = teamsCalendarId;
      learner.updatedAt = new Date().toISOString();

      return learner;
    }
  }

  /**
   * Get all LinkedIn profiles (allow selecting any ID)
   * Can fetch from external URL if LINKEDIN_MOCK_DATA_URL is set
   */
  async getAvailableLinkedInProfiles() {
    // Check if external URL is configured
    const externalUrl = process.env.LINKEDIN_MOCK_DATA_URL;
    
    if (externalUrl) {
      try {
        this.logger.log(`Fetching LinkedIn profiles from external URL: ${externalUrl}`);
        const response = await axios.get(externalUrl, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Accept': 'application/json',
          },
        });
        
        // Handle different response formats
        let profiles = [];
        if (Array.isArray(response.data)) {
          profiles = response.data;
        } else if (response.data.linkedinProfiles && Array.isArray(response.data.linkedinProfiles)) {
          profiles = response.data.linkedinProfiles;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          profiles = response.data.data;
        } else {
          this.logger.warn('Unexpected response format from external LinkedIn URL');
          profiles = [];
        }
        
        // Return all profiles - allow users to select any ID
        this.logger.log(`✅ Fetched ${profiles.length} LinkedIn profiles from external URL`);
        return profiles;
      } catch (error) {
        this.logger.error(`Failed to fetch LinkedIn profiles from external URL: ${error.message}`);
        // Fall through to database/local data
      }
    }
    
    // Get all profiles from database/local data (no filtering)
    if (this.usePostgres && this.pool) {
      const query = `SELECT * FROM "linkedinProfiles" ORDER BY id`;
      const result = await this.pool.query(query);
      return result.rows;
    } else {
      return this.dbData?.linkedinProfiles || [];
    }
  }

  /**
   * Get all GitHub profiles (allow selecting any ID, not assigned to a learner)
   */
  async getAvailableGitHubProfiles() {
    if (this.usePostgres && this.pool) {
      const query = `SELECT * FROM "githubProfiles" WHERE "learnerId" IS NULL ORDER BY id`;
      const result = await this.pool.query(query);
      return result.rows;
    } else {
      return this.dbData?.githubProfiles || [];
    }
  }

  /**
   * Get all Jira data (allow selecting any ID)
   */
  async getAvailableJiraData() {
    if (this.usePostgres && this.pool) {
      const query = `SELECT * FROM "jiraData" WHERE "learnerId" IS NULL ORDER BY id`;
      const result = await this.pool.query(query);
      return result.rows;
    } else {
      return this.dbData?.jiraData || [];
    }
  }

  /**
   * Get all Teams calendar data (allow selecting any ID)
   */
  async getAvailableTeamsData() {
    if (this.usePostgres && this.pool) {
      const query = `SELECT * FROM "teamsCalendar" ORDER BY id`;
      const result = await this.pool.query(query);
      return result.rows;
    } else {
      return this.dbData?.teamsCalendar || [];
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}


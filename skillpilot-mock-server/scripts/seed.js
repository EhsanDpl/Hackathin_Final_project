const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'skillpilot',
  password: process.env.DB_PASSWORD || 'skillpilot123',
  database: process.env.DB_NAME || 'skillpilot_db',
});

// Read the JSON data file
const dbPath = path.join(__dirname, '..', 'db.json');
const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🌱 Starting database seed...');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await client.query('TRUNCATE TABLE "jiraData", "teamsCalendar", "dailyMissions", "learningPaths", "skillAssessments", "linkedinProfiles", "githubProfiles", learners RESTART IDENTITY CASCADE');
    
    // Insert Learners
    console.log('👥 Inserting learners...');
    for (const learner of dbData.learners) {
      await client.query(
        `INSERT INTO learners (id, name, email, phone, role, department, location, "joinDate", "currentLevel", "yearsExperience", timezone, "reportsTo", "linkedinProfile", "githubUsername", status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          learner.id, learner.name, learner.email, learner.phone, learner.role,
          learner.department, learner.location, learner.joinDate, learner.currentLevel,
          learner.yearsExperience, learner.timezone, learner.reportsTo,
          learner.linkedinProfile, learner.githubUsername, learner.status
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.learners.length} learners`);
    
    // Insert GitHub Profiles
    console.log('🐙 Inserting GitHub profiles...');
    for (const profile of dbData.githubProfiles) {
      await client.query(
        `INSERT INTO "githubProfiles" (id, "learnerId", username, "fullName", bio, location, "publicRepos", followers, following, languages, "primaryLanguage", "recentActivity", "profileUrl", "topRepositories", "contributionsLastYear")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          profile.id, profile.learnerId, profile.username, profile.fullName, profile.bio,
          profile.location, profile.publicRepos, profile.followers, profile.following,
          JSON.stringify(profile.languages), profile.primaryLanguage, profile.recentActivity,
          profile.profileUrl, JSON.stringify(profile.topRepositories), profile.contributionsLastYear
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.githubProfiles.length} GitHub profiles`);
    
    // Insert LinkedIn Profiles
    console.log('💼 Inserting LinkedIn profiles...');
    for (const profile of dbData.linkedinProfiles) {
      await client.query(
        `INSERT INTO "linkedinProfiles" (id, "learnerId", username, "fullName", headline, location, industry, "experienceLevel", "profilePictureUrl", about, "endorsedSkills", experience, education, connections, followers)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          profile.id, profile.learnerId, profile.username, profile.fullName, profile.headline,
          profile.location, profile.industry, profile.experienceLevel, profile.profilePictureUrl,
          profile.about, JSON.stringify(profile.endorsedSkills), JSON.stringify(profile.experience),
          JSON.stringify(profile.education), profile.connections, profile.followers
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.linkedinProfiles.length} LinkedIn profiles`);
    
    // Insert Skill Assessments
    console.log('📊 Inserting skill assessments...');
    for (const assessment of dbData.skillAssessments) {
      await client.query(
        `INSERT INTO "skillAssessments" (id, "learnerId", skill, "currentLevel", "targetLevel", proficiency, "assessmentDate", source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          assessment.id, assessment.learnerId, assessment.skill, assessment.currentLevel,
          assessment.targetLevel, assessment.proficiency, assessment.assessmentDate, assessment.source
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.skillAssessments.length} skill assessments`);
    
    // Insert Learning Paths
    console.log('🗺️  Inserting learning paths...');
    for (const path of dbData.learningPaths) {
      await client.query(
        `INSERT INTO "learningPaths" (id, "learnerId", title, description, duration, "startDate", "endDate", "totalModules", "completedModules", progress, difficulty, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          path.id, path.learnerId, path.title, path.description, path.duration,
          path.startDate, path.endDate, path.totalModules, path.completedModules,
          path.progress, path.difficulty, path.status
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.learningPaths.length} learning paths`);
    
    // Insert Daily Missions
    console.log('🎯 Inserting daily missions...');
    for (const mission of dbData.dailyMissions) {
      await client.query(
        `INSERT INTO "dailyMissions" (id, "learnerId", title, description, xp, difficulty, category, completed, "dueDate", "completedDate", "createdDate", "learningPathId")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          mission.id, mission.learnerId, mission.title, mission.description, mission.xp,
          mission.difficulty, mission.category, mission.completed, mission.dueDate,
          mission.completedDate, mission.createdDate, mission.learningPathId
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.dailyMissions.length} daily missions`);
    
    // Insert Teams Calendar
    console.log('📅 Inserting Teams calendar events...');
    for (const event of dbData.teamsCalendar) {
      await client.query(
        `INSERT INTO "teamsCalendar" (id, "learnerId", "eventTitle", "eventType", "startTime", "endTime", duration, attendees, "isRecurring", status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          event.id, event.learnerId, event.eventTitle, event.eventType, event.startTime,
          event.endTime, event.duration, JSON.stringify(event.attendees), event.isRecurring, event.status
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.teamsCalendar.length} Teams calendar events`);
    
    // Insert JIRA Data
    console.log('🎫 Inserting JIRA data...');
    for (const jira of dbData.jiraData) {
      await client.query(
        `INSERT INTO "jiraData" (id, "learnerId", "sprintName", "sprintStatus", "sprintStartDate", "sprintEndDate", "issueKey", "issueTitle", "issueType", status, priority, "storyPoints", assignee, reporter)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          jira.id, jira.learnerId, jira.sprintName, jira.sprintStatus, jira.sprintStartDate,
          jira.sprintEndDate, jira.issueKey, jira.issueTitle, jira.issueType, jira.status,
          jira.priority, jira.storyPoints, jira.assignee, jira.reporter
        ]
      );
    }
    console.log(`✅ Inserted ${dbData.jiraData.length} JIRA records`);
    
    await client.query('COMMIT');
    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log('✅ Seed script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });


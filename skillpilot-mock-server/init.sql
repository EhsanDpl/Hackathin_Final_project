-- SkillPilot AI Database Schema
-- This file creates all necessary tables for the SkillPilot AI application

-- Learners Table
CREATE TABLE IF NOT EXISTS learners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(255),
    department VARCHAR(255),
    location VARCHAR(255),
    "joinDate" DATE,
    "currentLevel" VARCHAR(50),
    "yearsExperience" INTEGER,
    timezone VARCHAR(50),
    "reportsTo" VARCHAR(255),
    "linkedinProfile" VARCHAR(255),
    "githubUsername" VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    "growthPlanStatus" VARCHAR(50) DEFAULT 'inactive',
    "linkedinConnected" BOOLEAN DEFAULT false,
    "jiraConnected" BOOLEAN DEFAULT false,
    "teamsConnected" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GitHub Profiles Table
CREATE TABLE IF NOT EXISTS "githubProfiles" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    "fullName" VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    "publicRepos" INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    languages JSONB,
    "primaryLanguage" VARCHAR(100),
    "recentActivity" VARCHAR(255),
    "profileUrl" VARCHAR(500),
    "topRepositories" JSONB,
    "contributionsLastYear" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LinkedIn Profiles Table
CREATE TABLE IF NOT EXISTS "linkedinProfiles" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE NOT NULL,
    "fullName" VARCHAR(255),
    headline VARCHAR(500),
    location VARCHAR(255),
    industry VARCHAR(255),
    "experienceLevel" VARCHAR(255),
    "profilePictureUrl" VARCHAR(500),
    about TEXT,
    "endorsedSkills" JSONB,
    experience JSONB,
    education JSONB,
    connections INTEGER DEFAULT 0,
    followers INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Skill Assessments Table
CREATE TABLE IF NOT EXISTS "skillAssessments" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    skill VARCHAR(255) NOT NULL,
    "currentLevel" VARCHAR(50),
    "targetLevel" VARCHAR(50),
    proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
    "assessmentDate" DATE,
    source VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning Paths Table
CREATE TABLE IF NOT EXISTS "learningPaths" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration VARCHAR(50),
    "startDate" DATE,
    "endDate" DATE,
    "totalModules" INTEGER DEFAULT 0,
    "completedModules" INTEGER DEFAULT 0,
    progress INTEGER CHECK (progress >= 0 AND progress <= 100),
    difficulty VARCHAR(50),
    status VARCHAR(50) DEFAULT 'planned',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily Missions Table
CREATE TABLE IF NOT EXISTS "dailyMissions" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    xp INTEGER DEFAULT 0,
    difficulty VARCHAR(50),
    category VARCHAR(100),
    completed BOOLEAN DEFAULT FALSE,
    "dueDate" DATE,
    "completedDate" DATE,
    "createdDate" DATE,
    "learningPathId" INTEGER REFERENCES "learningPaths"(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams Calendar Table
CREATE TABLE IF NOT EXISTS "teamsCalendar" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    "eventTitle" VARCHAR(255) NOT NULL,
    "eventType" VARCHAR(100),
    "startTime" TIMESTAMP,
    "endTime" TIMESTAMP,
    duration INTEGER,
    attendees JSONB,
    "isRecurring" BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'Scheduled',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- JIRA Data Table
CREATE TABLE IF NOT EXISTS "jiraData" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    "sprintName" VARCHAR(255),
    "sprintStatus" VARCHAR(100),
    "sprintStartDate" DATE,
    "sprintEndDate" DATE,
    "issueKey" VARCHAR(100),
    "issueTitle" VARCHAR(500),
    "issueType" VARCHAR(100),
    status VARCHAR(100),
    priority VARCHAR(50),
    "storyPoints" INTEGER,
    assignee VARCHAR(255),
    reporter VARCHAR(255),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table for Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_learners_email ON learners(email);
CREATE INDEX IF NOT EXISTS idx_github_learner ON "githubProfiles"("learnerId");
CREATE INDEX IF NOT EXISTS idx_linkedin_learner ON "linkedinProfiles"("learnerId");
CREATE INDEX IF NOT EXISTS idx_skill_assessments_learner ON "skillAssessments"("learnerId");
CREATE INDEX IF NOT EXISTS idx_learning_paths_learner ON "learningPaths"("learnerId");
CREATE INDEX IF NOT EXISTS idx_daily_missions_learner ON "dailyMissions"("learnerId");
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


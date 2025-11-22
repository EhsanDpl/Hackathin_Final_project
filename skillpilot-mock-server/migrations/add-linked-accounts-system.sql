-- Migration: Add linked accounts system with bridge table
-- This migration adds linkedinUrl to linkedinProfiles, creates account types table, and user linked accounts bridge table

-- Add linkedinUrl column to linkedinProfiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'linkedinProfiles' AND column_name = 'linkedinUrl'
    ) THEN
        ALTER TABLE "linkedinProfiles" 
        ADD COLUMN "linkedinUrl" VARCHAR(500);
    END IF;
END $$;

-- Create linkedAccountTypes table if it doesn't exist
CREATE TABLE IF NOT EXISTS "linkedAccountTypes" (
    id SERIAL PRIMARY KEY,
    "accountType" VARCHAR(50) UNIQUE NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default account types if they don't exist
INSERT INTO "linkedAccountTypes" ("accountType", "displayName", description, icon, "isActive")
VALUES 
    ('linkedin', 'LinkedIn', 'Connect your LinkedIn profile', 'linkedin', true),
    ('jira', 'Jira', 'Connect your Jira workspace', 'jira', true),
    ('teams', 'Microsoft Teams', 'Connect your Teams calendar', 'teams', true)
ON CONFLICT ("accountType") DO NOTHING;

-- Create userLinkedAccounts bridge table if it doesn't exist
CREATE TABLE IF NOT EXISTS "userLinkedAccounts" (
    id SERIAL PRIMARY KEY,
    "learnerId" INTEGER REFERENCES learners(id) ON DELETE CASCADE,
    "accountType" VARCHAR(50) NOT NULL,
    "accountId" INTEGER,
    "accountUrl" VARCHAR(500),
    connected BOOLEAN DEFAULT false,
    "connectedAt" TIMESTAMP,
    "disconnectedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("learnerId", "accountType")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_linked_accounts_learner ON "userLinkedAccounts"("learnerId");
CREATE INDEX IF NOT EXISTS idx_user_linked_accounts_type ON "userLinkedAccounts"("accountType");
CREATE INDEX IF NOT EXISTS idx_user_linked_accounts_connected ON "userLinkedAccounts"(connected);


-- Migration: Add integration reference fields to learners table
-- This migration adds foreign key references to linkedinProfiles, jiraData, and teamsCalendar tables

-- Add linkedinProfileId column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learners' AND column_name = 'linkedinProfileId'
    ) THEN
        ALTER TABLE learners 
        ADD COLUMN "linkedinProfileId" INTEGER REFERENCES "linkedinProfiles"(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add jiraDataId column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learners' AND column_name = 'jiraDataId'
    ) THEN
        ALTER TABLE learners 
        ADD COLUMN "jiraDataId" INTEGER REFERENCES "jiraData"(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add teamsCalendarId column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'learners' AND column_name = 'teamsCalendarId'
    ) THEN
        ALTER TABLE learners 
        ADD COLUMN "teamsCalendarId" INTEGER REFERENCES "teamsCalendar"(id) ON DELETE SET NULL;
    END IF;
END $$;


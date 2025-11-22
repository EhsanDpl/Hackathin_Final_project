-- Add mentor selection to learners table
-- This migration adds mentorId column to link learners with their mentors

-- Add mentorId column to learners table
ALTER TABLE learners 
ADD COLUMN IF NOT EXISTS "mentorId" INTEGER REFERENCES learners(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_learners_mentor ON learners("mentorId");

-- Add comment
COMMENT ON COLUMN learners."mentorId" IS 'Reference to mentor (learner with role=mentor)';


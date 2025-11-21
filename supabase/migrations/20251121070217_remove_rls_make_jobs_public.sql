/*
  # Remove Row Level Security and Make All Jobs Public

  1. Changes
    - Drop all RLS policies on jobs table
    - Drop all RLS policies on job_items table
    - Disable RLS on jobs table
    - Disable RLS on job_items table
    - This makes all jobs visible to everyone

  2. Security Impact
    - All users can now view, create, update, and delete any job
    - No authentication or authorization checks
    - Use this configuration only if you want a completely open system
*/

-- Drop all policies from jobs table
DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;

-- Drop all policies from job_items table
DROP POLICY IF EXISTS "Users can view job items for their jobs" ON job_items;
DROP POLICY IF EXISTS "Users can insert job items for their jobs" ON job_items;
DROP POLICY IF EXISTS "Users can update job items for their jobs" ON job_items;
DROP POLICY IF EXISTS "Users can delete job items for their jobs" ON job_items;

-- Disable Row Level Security on both tables
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE job_items DISABLE ROW LEVEL SECURITY;
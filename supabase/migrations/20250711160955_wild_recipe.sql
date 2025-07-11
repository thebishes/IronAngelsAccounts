/*
  # Simplify security model for authenticated users

  1. Security Changes
    - Update all RLS policies to allow authenticated users full access
    - Remove restrictive team-based access controls
    - Allow authenticated users to read all data across the system
    - Maintain basic ownership for data modification

  2. Tables Updated
    - jobs: Allow authenticated users to view all jobs, modify own jobs
    - job_items: Allow authenticated users to view all items, modify items for own jobs
    - teams: Allow authenticated users to view all teams, modify own teams
    - team_members: Allow authenticated users to view all members, modify own memberships
    - team_invitations: Allow authenticated users to view all invitations, manage own invitations
    - users: Allow authenticated users to view all users, modify own profile
*/

-- Drop existing restrictive policies and create permissive ones

-- Jobs table policies
DROP POLICY IF EXISTS "Users can view jobs from their teams" ON jobs;
DROP POLICY IF EXISTS "Users can insert jobs to their teams" ON jobs;
DROP POLICY IF EXISTS "Users can update jobs in their teams" ON jobs;
DROP POLICY IF EXISTS "Users can delete jobs from their teams" ON jobs;

CREATE POLICY "Authenticated users can view all jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Job items table policies
DROP POLICY IF EXISTS "Users can view job items from their teams" ON job_items;
DROP POLICY IF EXISTS "Users can insert job items for their team jobs" ON job_items;
DROP POLICY IF EXISTS "Users can update job items for their team jobs" ON job_items;
DROP POLICY IF EXISTS "Users can delete job items from their team jobs" ON job_items;

CREATE POLICY "Authenticated users can view all job items"
  ON job_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert job items for own jobs"
  ON job_items
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_items.job_id 
    AND jobs.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can update job items for own jobs"
  ON job_items
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_items.job_id 
    AND jobs.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_items.job_id 
    AND jobs.user_id = auth.uid()
  ));

CREATE POLICY "Authenticated users can delete job items for own jobs"
  ON job_items
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM jobs 
    WHERE jobs.id = job_items.job_id 
    AND jobs.user_id = auth.uid()
  ));

-- Teams table policies
DROP POLICY IF EXISTS "Users can view teams they belong to" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;

CREATE POLICY "Authenticated users can view all teams"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams"
  ON teams
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Team members table policies
DROP POLICY IF EXISTS "Users can view team members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage team members" ON team_members;

CREATE POLICY "Authenticated users can view all team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team owners can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_members.team_id 
    AND teams.owner_id = auth.uid()
  ));

-- Team invitations table policies
DROP POLICY IF EXISTS "Users can view invitations for teams they can manage" ON team_invitations;
DROP POLICY IF EXISTS "Team owners and admins can manage invitations" ON team_invitations;

CREATE POLICY "Authenticated users can view all team invitations"
  ON team_invitations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team owners can manage invitations"
  ON team_invitations
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_invitations.team_id 
    AND teams.owner_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM teams 
    WHERE teams.id = team_invitations.team_id 
    AND teams.owner_id = auth.uid()
  ));

-- Users table policies (already permissive, but let's ensure consistency)
DROP POLICY IF EXISTS "Users can read all user data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Authenticated users can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
/*
  # Team-Based Data Sharing System

  1. New Tables
    - `teams` - Organizations/businesses that can have multiple users
    - `team_members` - Junction table linking users to teams with roles
    - `team_invitations` - Pending invitations to join teams

  2. Modified Tables
    - `jobs` - Add team_id to associate jobs with teams instead of individual users
    - `job_items` - Inherits team access through jobs relationship

  3. Security
    - Enable RLS on all new tables
    - Update existing RLS policies to work with team-based access
    - Add policies for team owners, admins, editors, and viewers

  4. Permission Levels
    - `owner` - Full control, can manage team and all data
    - `admin` - Can manage team members and all job data
    - `editor` - Can create, edit, and delete jobs
    - `viewer` - Can only view jobs and reports

  5. Functions
    - Function to get user's team memberships
    - Function to check user permissions within a team
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team member roles enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
    CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');
  END IF;
END $$;

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'viewer',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, email)
);

-- Add team_id to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE jobs ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_jobs_team_id ON jobs(team_id);

-- Enable RLS on new tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Function to get user's team role
CREATE OR REPLACE FUNCTION get_user_team_role(user_id uuid, team_id uuid)
RETURNS team_role AS $$
BEGIN
  -- Check if user is team owner
  IF EXISTS (SELECT 1 FROM teams WHERE id = team_id AND owner_id = user_id) THEN
    RETURN 'owner'::team_role;
  END IF;
  
  -- Check team membership
  RETURN (
    SELECT role FROM team_members 
    WHERE team_members.user_id = get_user_team_role.user_id 
    AND team_members.team_id = get_user_team_role.team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access team
CREATE OR REPLACE FUNCTION user_can_access_team(user_id uuid, team_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM teams WHERE id = team_id AND owner_id = user_id
    UNION
    SELECT 1 FROM team_members WHERE team_members.user_id = user_can_access_team.user_id AND team_members.team_id = user_can_access_team.team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they belong to"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM team_members WHERE team_id = teams.id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams"
  ON teams
  FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Users can view team members of teams they belong to"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (user_can_access_team(auth.uid(), team_id));

CREATE POLICY "Team owners and admins can manage team members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin')
  );

-- RLS Policies for team_invitations
CREATE POLICY "Users can view invitations for teams they can manage"
  ON team_invitations
  FOR SELECT
  TO authenticated
  USING (
    get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin') OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Team owners and admins can manage invitations"
  ON team_invitations
  FOR ALL
  TO authenticated
  USING (
    get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin')
  )
  WITH CHECK (
    get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin')
  );

-- Update jobs RLS policies to work with teams
DROP POLICY IF EXISTS "Users can view their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON jobs;

CREATE POLICY "Users can view jobs from their teams"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    (user_id = auth.uid() AND team_id IS NULL) OR
    (team_id IS NOT NULL AND user_can_access_team(auth.uid(), team_id))
  );

CREATE POLICY "Users can insert jobs to their teams"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (user_id = auth.uid() AND team_id IS NULL) OR
    (team_id IS NOT NULL AND get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "Users can update jobs in their teams"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (
    (user_id = auth.uid() AND team_id IS NULL) OR
    (team_id IS NOT NULL AND get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin', 'editor'))
  )
  WITH CHECK (
    (user_id = auth.uid() AND team_id IS NULL) OR
    (team_id IS NOT NULL AND get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin', 'editor'))
  );

CREATE POLICY "Users can delete jobs from their teams"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (
    (user_id = auth.uid() AND team_id IS NULL) OR
    (team_id IS NOT NULL AND get_user_team_role(auth.uid(), team_id) IN ('owner', 'admin', 'editor'))
  );

-- Update job_items RLS policies
DROP POLICY IF EXISTS "Users can view job items for their jobs" ON job_items;
DROP POLICY IF EXISTS "Users can insert job items for their jobs" ON job_items;
DROP POLICY IF EXISTS "Users can update job items for their jobs" ON job_items;
DROP POLICY IF EXISTS "Users can delete job items for their jobs" ON job_items;

CREATE POLICY "Users can view job items from their teams"
  ON job_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND (
        (jobs.user_id = auth.uid() AND jobs.team_id IS NULL) OR
        (jobs.team_id IS NOT NULL AND user_can_access_team(auth.uid(), jobs.team_id))
      )
    )
  );

CREATE POLICY "Users can insert job items for their team jobs"
  ON job_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND (
        (jobs.user_id = auth.uid() AND jobs.team_id IS NULL) OR
        (jobs.team_id IS NOT NULL AND get_user_team_role(auth.uid(), jobs.team_id) IN ('owner', 'admin', 'editor'))
      )
    )
  );

CREATE POLICY "Users can update job items for their team jobs"
  ON job_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND (
        (jobs.user_id = auth.uid() AND jobs.team_id IS NULL) OR
        (jobs.team_id IS NOT NULL AND get_user_team_role(auth.uid(), jobs.team_id) IN ('owner', 'admin', 'editor'))
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND (
        (jobs.user_id = auth.uid() AND jobs.team_id IS NULL) OR
        (jobs.team_id IS NOT NULL AND get_user_team_role(auth.uid(), jobs.team_id) IN ('owner', 'admin', 'editor'))
      )
    )
  );

CREATE POLICY "Users can delete job items from their team jobs"
  ON job_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND (
        (jobs.user_id = auth.uid() AND jobs.team_id IS NULL) OR
        (jobs.team_id IS NOT NULL AND get_user_team_role(auth.uid(), jobs.team_id) IN ('owner', 'admin', 'editor'))
      )
    )
  );
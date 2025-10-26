-- ============================================================================
-- Complete Migration Script for PostgreSQL on Coolify
-- Run this script on your Coolify PostgreSQL database
-- ============================================================================

-- ============================================================================
-- STEP 1: Create Custom Types
-- ============================================================================

CREATE TYPE job_type AS ENUM ('ironing', 'cleaning', 'both');
CREATE TYPE job_status AS ENUM ('completed', 'pending', 'invoiced', 'paid');
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

-- ============================================================================
-- STEP 2: Create Tables
-- ============================================================================

-- Users table (replaces Supabase auth.users for application purposes)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  date date NOT NULL,
  type job_type NOT NULL,
  total decimal(10,2) NOT NULL DEFAULT 0,
  status job_status NOT NULL DEFAULT 'completed',
  notes text,
  invoice_number text UNIQUE,
  invoicing_company text DEFAULT 'Cleaning Angels',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid,
  CONSTRAINT jobs_invoicing_company_check CHECK (invoicing_company IN ('Cleaning Angels', 'Ironing Angels'))
);

-- Job items table
CREATE TABLE IF NOT EXISTS job_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint for team_id in jobs (had to wait for teams table)
ALTER TABLE jobs ADD CONSTRAINT jobs_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'viewer',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  invited_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, email)
);

-- ============================================================================
-- STEP 3: Create Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_team_id ON jobs(team_id);
CREATE INDEX IF NOT EXISTS idx_jobs_invoice_number ON jobs(invoice_number);
CREATE INDEX IF NOT EXISTS idx_job_items_job_id ON job_items(job_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);

-- ============================================================================
-- STEP 4: Create Functions
-- ============================================================================

-- Function to automatically calculate item total
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update job total when items change
CREATE OR REPLACE FUNCTION update_job_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE jobs
  SET total = (
    SELECT COALESCE(SUM(total), 0)
    FROM job_items
    WHERE job_id = COALESCE(NEW.job_id, OLD.job_id)
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.job_id, OLD.job_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  current_year text;
  max_number integer;
  next_number text;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;

  SELECT COALESCE(
    MAX(
      CASE
        WHEN invoice_number ~ ('^' || current_year || '-[0-9]{4}$')
        THEN CAST(SUBSTRING(invoice_number FROM '[0-9]{4}$') AS integer)
        ELSE 0
      END
    ),
    99
  ) INTO max_number
  FROM jobs
  WHERE invoice_number IS NOT NULL;

  next_number := LPAD((max_number + 1)::text, 4, '0');

  RETURN current_year || '-' || next_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-populate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's team role
CREATE OR REPLACE FUNCTION get_user_team_role(user_id uuid, team_id uuid)
RETURNS team_role AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM teams WHERE id = team_id AND owner_id = user_id) THEN
    RETURN 'owner'::team_role;
  END IF;

  RETURN (
    SELECT role FROM team_members
    WHERE team_members.user_id = get_user_team_role.user_id
    AND team_members.team_id = get_user_team_role.team_id
  );
END;
$$ LANGUAGE plpgsql;

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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 5: Create Triggers
-- ============================================================================

-- Trigger to calculate item totals
CREATE TRIGGER trigger_calculate_item_total
  BEFORE INSERT OR UPDATE ON job_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

-- Triggers to update job totals
CREATE TRIGGER trigger_update_job_total_on_insert
  AFTER INSERT ON job_items
  FOR EACH ROW
  EXECUTE FUNCTION update_job_total();

CREATE TRIGGER trigger_update_job_total_on_update
  AFTER UPDATE ON job_items
  FOR EACH ROW
  EXECUTE FUNCTION update_job_total();

CREATE TRIGGER trigger_update_job_total_on_delete
  AFTER DELETE ON job_items
  FOR EACH ROW
  EXECUTE FUNCTION update_job_total();

-- Trigger to set invoice numbers
CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();

-- ============================================================================
-- Migration Complete!
-- ============================================================================

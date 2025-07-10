/*
  # Create jobs and job items tables for ironing & cleaning business

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `client_name` (text, required)
      - `date` (date, required)
      - `type` (text, enum: ironing, cleaning, both)
      - `total` (decimal, calculated from items)
      - `status` (text, enum: completed, pending, invoiced)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)
    
    - `job_items`
      - `id` (uuid, primary key)
      - `job_id` (uuid, foreign key to jobs)
      - `description` (text, required)
      - `quantity` (integer, required)
      - `price` (decimal, required)
      - `total` (decimal, calculated)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create custom types for enums
CREATE TYPE job_type AS ENUM ('ironing', 'cleaning', 'both');
CREATE TYPE job_status AS ENUM ('completed', 'pending', 'invoiced');

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  date date NOT NULL,
  type job_type NOT NULL,
  total decimal(10,2) NOT NULL DEFAULT 0,
  status job_status NOT NULL DEFAULT 'completed',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create job_items table
CREATE TABLE IF NOT EXISTS job_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_items ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs table
CREATE POLICY "Users can view their own jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON jobs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for job_items table
CREATE POLICY "Users can view job items for their jobs"
  ON job_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert job items for their jobs"
  ON job_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update job items for their jobs"
  ON job_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND jobs.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete job items for their jobs"
  ON job_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = job_items.job_id 
      AND jobs.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_items_job_id ON job_items(job_id);

-- Create function to update job total when items change
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

-- Create triggers to automatically update job totals
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

-- Create function to automatically calculate item total
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate item totals
CREATE TRIGGER trigger_calculate_item_total
  BEFORE INSERT OR UPDATE ON job_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();
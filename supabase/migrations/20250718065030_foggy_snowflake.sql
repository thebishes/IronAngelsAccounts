/*
  # Add Invoice Number Field

  1. Schema Changes
    - Add `invoice_number` column to `jobs` table
    - Add unique constraint on invoice_number
    - Add index for performance

  2. Functions
    - Create function to generate next invoice number
    - Create trigger to auto-populate invoice number on insert

  3. Security
    - No RLS changes needed (inherits from jobs table)
*/

-- Add invoice_number column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE jobs ADD COLUMN invoice_number text UNIQUE;
  END IF;
END $$;

-- Create index on invoice_number for performance
CREATE INDEX IF NOT EXISTS idx_jobs_invoice_number ON jobs(invoice_number);

-- Function to generate the next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  current_year text;
  max_number integer;
  next_number text;
BEGIN
  -- Get current year
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  -- Find the highest invoice number for current year
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
  
  -- Generate next number (start at 100 if no existing numbers)
  next_number := LPAD((max_number + 1)::text, 4, '0');
  
  RETURN current_year || '-' || next_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-populate invoice number
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_set_invoice_number ON jobs;
CREATE TRIGGER trigger_set_invoice_number
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_invoice_number();
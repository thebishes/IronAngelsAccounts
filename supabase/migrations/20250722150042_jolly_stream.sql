/*
  # Add invoicing company field to jobs table

  1. Changes
    - Add `invoicing_company` column to `jobs` table
    - Set default value to 'Cleaning Angels'
    - Add check constraint to ensure only valid values

  2. Security
    - No changes to RLS policies needed
*/

-- Add invoicing_company column to jobs table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jobs' AND column_name = 'invoicing_company'
  ) THEN
    ALTER TABLE jobs ADD COLUMN invoicing_company text DEFAULT 'Cleaning Angels';
    
    -- Add check constraint to ensure only valid values
    ALTER TABLE jobs ADD CONSTRAINT jobs_invoicing_company_check 
    CHECK (invoicing_company IN ('Cleaning Angels', 'Ironing Angels'));
  END IF;
END $$;
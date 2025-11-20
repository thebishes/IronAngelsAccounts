/*
  # Add password hash to users table

  1. Changes
    - Add password_hash column to users table with default value
    - Update existing users with default password 'password123'
  
  2. Security
    - Users should change their passwords after first login
*/

-- Add password_hash column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text;
  END IF;
END $$;

-- Update existing users with a default password if they don't have one
UPDATE users 
SET password_hash = 'password123' 
WHERE password_hash IS NULL OR password_hash = '';

-- Make password_hash NOT NULL after setting defaults
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

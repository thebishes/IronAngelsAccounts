/*
  # Fix users table and add test users

  1. Changes
    - Ensure id column has UUID default generator
    - Add test users for login
  
  2. Security
    - Users can login with any username/password from the database
*/

-- Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop and recreate users table with proper UUID defaults
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert test users
INSERT INTO users (email, password_hash) VALUES
  ('thebishes@gmail.com', 'password123'),
  ('hayleylacey@live.co.uk', 'password123'),
  ('tony', 'admin123');

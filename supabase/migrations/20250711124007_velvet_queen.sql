/*
  # Fix users table permissions

  1. Security
    - Add RLS policy to allow authenticated users to read user id and email from auth.users table
    - This is required for team member management functionality

  2. Changes
    - Create policy on auth.users table to allow SELECT access for authenticated users
    - This enables the team service to fetch user emails for displaying team member information
*/

-- Enable RLS on auth.users table (if not already enabled)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read user id and email
CREATE POLICY "Allow authenticated users to read user id and email" 
ON auth.users 
FOR SELECT 
TO authenticated 
USING (true);
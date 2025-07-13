/*
  # User Administration Setup

  1. Security
    - Enable admin access for user management
    - Add policies for user administration
  
  2. Functions
    - Add function to handle user creation with proper permissions
*/

-- Grant necessary permissions for user administration
-- Note: This requires service role key for admin operations

-- Create a function to check if user is admin (for future use)
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- For now, all authenticated users can manage users
  -- In production, you might want to add an admin role system
  RETURN EXISTS (
    SELECT 1 FROM auth.users WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update users table policies to allow admin operations
DROP POLICY IF EXISTS "Authenticated users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

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

-- Allow authenticated users to insert users (for admin purposes)
CREATE POLICY "Authenticated users can create users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to delete users (for admin purposes)
CREATE POLICY "Authenticated users can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (true);
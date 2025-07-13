import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const userService = {
  // Get all users (for admin purposes)
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create a new user manually
  async createUser(email: string, password: string): Promise<User> {
    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Auto-confirm email
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // The trigger should automatically create the user in the users table
    // But let's verify it exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      // If user doesn't exist in users table, create it manually
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return newUser;
    }

    return userData;
  },

  // Update user
  async updateUser(userId: string, updates: { email?: string }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    // Delete from auth.users (this will cascade to users table)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  },

  // Reset user password
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    if (error) throw error;
  }
};
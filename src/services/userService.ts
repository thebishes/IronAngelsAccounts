import { executeExternalQuery } from '../lib/externalPostgres';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export const userService = {
  async createUser(email: string, password: string): Promise<User> {
    const result = await executeExternalQuery<User>(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [email, password]
    );

    if (!result.success || !result.data || result.data.length === 0) {
      throw new Error(result.error || 'Failed to create user');
    }

    return result.data[0];
  },

  async getAllUsers(): Promise<User[]> {
    const result = await executeExternalQuery<User>(
      'SELECT id, email, created_at FROM users ORDER BY created_at DESC'
    );

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch users');
    }

    return result.data;
  },

  async deleteUser(userId: string): Promise<void> {
    const result = await executeExternalQuery(
      'DELETE FROM users WHERE id = $1',
      [userId]
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user');
    }
  }
};

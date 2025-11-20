import { executeExternalQuery } from '../lib/externalPostgres';

const TONY_USERNAME = 'tony';
const TONY_PASSWORD = 'admin123';

let currentUser: { id: string; email: string } | null = null;

export const authService = {
  async signUp(email: string, password: string) {
    try {
      const result = await executeExternalQuery(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
        [email, password]
      );

      if (result.success && result.data && result.data.length > 0) {
        currentUser = { id: result.data[0].id, email: result.data[0].email };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return { data: { user: currentUser }, error: null };
      }

      return { data: null, error: { message: result.error || 'Failed to create user' } };
    } catch (error) {
      return { data: null, error };
    }
  },

  async signIn(username: string, password: string) {
    try {
      const result = await executeExternalQuery<{ id: string; email: string; password_hash: string }>(
        'SELECT id, email, password_hash FROM users WHERE email = $1 LIMIT 1',
        [username]
      );

      if (result.success && result.data && result.data.length > 0) {
        const user = result.data[0];

        if (user.password_hash === password) {
          currentUser = { id: user.id, email: user.email };
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          return { data: { user: currentUser }, error: null };
        }
      }

      return { data: null, error: { message: 'Invalid credentials' } };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: { message: 'An error occurred during sign in' } };
    }
  },

  async signOut() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    return { error: null };
  },

  async getCurrentUser() {
    if (currentUser) {
      return { user: currentUser, error: null };
    }

    const stored = localStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
      return { user: currentUser, error: null };
    }

    return { user: null, error: null };
  },

  onAuthStateChange(callback: (user: any) => void) {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      currentUser = JSON.parse(stored);
      callback(currentUser);
    } else {
      callback(null);
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    };
  },

  async resetPassword(email: string) {
    return { data: null, error: { message: 'Password reset not supported in simple auth mode' } };
  },

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const { user } = await this.getCurrentUser();
      if (!user) {
        return { success: false, error: { message: 'User not authenticated' } };
      }

      const result = await executeExternalQuery(
        'SELECT password_hash FROM users WHERE id = $1',
        [user.id]
      );

      if (!result.success || !result.data || result.data.length === 0) {
        return { success: false, error: { message: 'User not found' } };
      }

      const storedPassword = result.data[0].password_hash;
      if (storedPassword !== currentPassword) {
        return { success: false, error: { message: 'Current password is incorrect' } };
      }

      const updateResult = await executeExternalQuery(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newPassword, user.id]
      );

      if (updateResult.success) {
        return { success: true, error: null };
      }

      return { success: false, error: { message: updateResult.error || 'Failed to update password' } };
    } catch (error) {
      return { success: false, error: { message: 'An error occurred while changing password' } };
    }
  }
};

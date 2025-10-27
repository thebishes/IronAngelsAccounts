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
    if (username === TONY_USERNAME && password === TONY_PASSWORD) {
      const result = await executeExternalQuery<{ id: string; email: string }>(
        'SELECT id, email FROM users WHERE email = $1 LIMIT 1',
        ['tony@example.com']
      );

      if (result.success && result.data && result.data.length > 0) {
        currentUser = result.data[0];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        return { data: { user: currentUser }, error: null };
      }
    }

    return { data: null, error: { message: 'Invalid credentials' } };
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
  }
};

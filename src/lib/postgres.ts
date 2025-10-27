import { Pool } from 'pg';

const pool = new Pool({
  host: import.meta.env.POSTGRES_HOST || '132.226.215.254',
  port: parseInt(import.meta.env.POSTGRES_PORT || '5432'),
  user: import.meta.env.POSTGRES_USER || 'postgres',
  password: import.meta.env.POSTGRES_PASSWORD,
  database: import.meta.env.POSTGRES_DATABASE || 'postgres',
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;

export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('PostgreSQL connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    return false;
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

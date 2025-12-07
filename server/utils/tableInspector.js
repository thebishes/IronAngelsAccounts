const pool = require('../config/database');

// Utility to inspect existing tables and their structures
async function inspectTables() {
  try {
    console.log('🔍 Inspecting existing database tables...');

    // Check if tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const tables = await pool.query(tablesQuery);
    console.log('📋 Found tables:', tables.rows.map(row => row.table_name));

    // Inspect jobs table structure
    if (tables.rows.some(row => row.table_name === 'jobs')) {
      const jobsStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'jobs'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Jobs table structure:');
      jobsStructure.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });

      // Sample data from jobs table
      const sampleJobs = await pool.query('SELECT * FROM jobs LIMIT 3');
      console.log('\n📝 Sample jobs data:');
      console.log(sampleJobs.rows);
    }

    // Inspect job_items table structure
    if (tables.rows.some(row => row.table_name === 'job_items')) {
      const itemsStructure = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'job_items'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Job_items table structure:');
      itemsStructure.rows.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });

      // Sample data from job_items table
      const sampleItems = await pool.query('SELECT * FROM job_items LIMIT 5');
      console.log('\n📝 Sample job_items data:');
      console.log(sampleItems.rows);
    }

  } catch (error) {
    console.error('❌ Error inspecting tables:', error.message);
  }
}

module.exports = { inspectTables };
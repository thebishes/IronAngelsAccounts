const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./config/database');
const { inspectTables } = require('./utils/tableInspector');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test database connection and inspect tables on startup
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    client.release();
    
    // Inspect existing tables
    await inspectTables();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Simple login endpoint (using hardcoded credentials since we're using existing tables)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Hardcoded credentials check (since we're using existing tables)
    const validCredentials = {
      username: 'tonybisht',
      password: 'Topaz26'
    };

    if (username === validCredentials.username && password === validCredentials.password) {
      // Generate JWT token
      const token = jwt.sign(
        { id: 1, username: username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: 1,
          username: username,
          email: 'tony@ironcleanpro.com'
        }
      });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cached jobs table columns
let jobColumnsCache = null;
async function getJobColumns() {
  if (jobColumnsCache) return jobColumnsCache;
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'jobs'");
    jobColumnsCache = new Set(res.rows.map(r => r.column_name));
  } catch (e) {
    console.warn('⚠️ Could not load jobs columns, falling back to defaults:', e.message);
    jobColumnsCache = new Set();
  }
  return jobColumnsCache;
}

// Dynamic field mapping function
function mapJobFields(job, isFromDatabase = true, availableColumns = null) {
  if (isFromDatabase) {
    // Map database fields to frontend format
    const mapped = {
      id: job.id || job.job_id, 
      clientName: job.client_name || job.clientname || job.customer_name || job.customer,
      invoiceNumber: job.invoice_number || job.job_id,
      date: job.date || job.job_date || job.created_date,
      serviceType: job.service_type || job.type || job.service || 'Ironing',
      invoicingCompany: job.invoicing_company || job.company || 'Iron & Clean Pro',
      status: job.status || 'Completed',
      notes: job.notes || job.description || job.comments || '',
      totalAmount: parseFloat(job.total_amount || job.total || job.amount || 0),
      items: job.items || []
    };
    
    // Format date properly
    if (mapped.date) {
      mapped.date = new Date(mapped.date).toLocaleDateString('en-GB');
    }
    
    return mapped;
  } else {
    // Map frontend format to database fields dynamically based on available columns
    const base = {
      client_name: job.clientName,
      invoice_number: job.invoiceNumber,
      date: job.date,
      service_type: job.serviceType || 'Ironing',
      invoicing_company: job.invoicingCompany || 'Iron & Clean Pro',
      status: job.status || 'Completed',
      notes: job.notes || '',
      total_amount: job.totalAmount || 0
    };

    if (availableColumns && availableColumns.size > 0) {
      const filtered = {};
      for (const [k, v] of Object.entries(base)) {
        if (availableColumns.has(k)) filtered[k] = v;
      }
      return filtered;
    }

    return base;
  }
}

function mapItemFields(item, jobId, isFromDatabase = true) {
  if (isFromDatabase) {
    return {
      id: item.id,
      description: item.description || item.item_description || item.item_name,
      quantity: parseInt(item.quantity || item.qty || 1),
      price: parseFloat(item.price || item.unit_price || item.rate || 0),
      total: parseFloat(item.total || item.total_price || item.amount || 0)
    };
  } else {
    return {
      job_id: jobId,
      description: item.description,
      quantity: item.quantity || 1,
      price: item.price || 0,
      total: item.total || 0
    };
  }
}

// Get single job
app.get('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

    const query = `
      SELECT j.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ji.id,
                   'description', ji.description,
                   'quantity', COALESCE(ji.quantity, 1),
                   'price', COALESCE(ji.price, 0),
                   'total', COALESCE(ji.total, 0)
                 )
               ) FILTER (WHERE ji.id IS NOT NULL),
               '[]'
             ) AS items
      FROM jobs j
      LEFT JOIN job_items ji ON j.id = ji.job_id
      WHERE j.id = $1
      GROUP BY j.id
      LIMIT 1
    `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });

    const job = mapJobFields(result.rows[0], true);
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error.message);
    res.status(500).json({ error: 'Error fetching job: ' + error.message });
  }
});

// Get job by invoice number
app.get('/api/jobs/invoice/:invoiceNumber', authenticateToken, async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number required' });

    const query = `
      SELECT j.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ji.id,
                   'description', ji.description,
                   'quantity', COALESCE(ji.quantity, 1),
                   'price', COALESCE(ji.price, 0),
                   'total', COALESCE(ji.total, 0)
                 )
               ) FILTER (WHERE ji.id IS NOT NULL),
               '[]'
             ) AS items
      FROM jobs j
      LEFT JOIN job_items ji ON j.id = ji.job_id
      WHERE j.invoice_number = $1 OR j.job_id::text = $1
      GROUP BY j.id
      LIMIT 1
    `;

    const result = await pool.query(query, [invoiceNumber]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Job not found' });

    const job = mapJobFields(result.rows[0], true);
    res.json(job);
  } catch (error) {
    console.error('Error fetching job by invoice:', error.message);
    res.status(500).json({ error: 'Error fetching job by invoice: ' + error.message });
  }
});

// Update job by invoice number
app.put('/api/jobs/invoice/:invoiceNumber', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { invoiceNumber } = req.params;
    if (!invoiceNumber) return res.status(400).json({ error: 'Invoice number required' });

    const incoming = req.body || {};
    const mapped = mapJobFields(incoming, false);
    const entries = Object.entries(mapped).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const setClauses = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');
    const values = entries.map(([_, v]) => v);

    const updateQuery = `
      UPDATE jobs
      SET ${setClauses}
      WHERE invoice_number = $${values.length + 1}
      RETURNING *
    `;

    const result = await client.query(updateQuery, [...values, invoiceNumber]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updated = result.rows[0];
    const itemsRes = await client.query(
      'SELECT id, description, quantity, price, total FROM job_items WHERE job_id = $1',
      [updated.id]
    ).catch(() => ({ rows: [] }));

    const formatted = mapJobFields({ ...updated, items: itemsRes.rows }, true);
    res.json(formatted);
  } catch (error) {
    console.error('❌ Error updating job by invoice:', error.message);
    res.status(500).json({ error: 'Error updating job by invoice: ' + error.message });
  } finally {
    client.release();
  }
});

// Get all jobs
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    // First, try to get jobs with items
    const jobsQuery = `
      SELECT j.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', ji.id,
                   'description', ji.description,
                   'quantity', COALESCE(ji.quantity, 1),
                   'price', COALESCE(ji.price, 0),
                   'total', COALESCE(ji.total, 0)
                 )
               ) FILTER (WHERE ji.id IS NOT NULL),
               '[]'
             ) AS items
      FROM jobs j
      LEFT JOIN job_items ji ON j.id = ji.job_id
      GROUP BY j.id
      ORDER BY 
        COALESCE(j.date, j.created_at, CURRENT_DATE) DESC,
        j.id DESC
      LIMIT 100
    `;
    
    const result = await pool.query(jobsQuery);
    
    // Format the data for frontend using dynamic mapping
    const jobs = result.rows.map(job => mapJobFields(job, true));

    console.log(`📊 Retrieved ${jobs.length} jobs from database`);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Error fetching jobs: ' + error.message });
  }
});

// Create new job
app.post('/api/jobs', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const jobData = req.body;
    console.log('📝 Creating new job:', jobData);

    // Use provided invoice number if present; otherwise generate one
    let invoiceNumber = jobData.invoiceNumber;
    if (!invoiceNumber) {
      const year = new Date().getFullYear();
      const rand6 = Math.floor(100000 + Math.random() * 900000);
      invoiceNumber = `${year}-${rand6}`;
    }

    // Map frontend data to database fields, filtering to actual columns
    const columns = await getJobColumns();
    const dbJobData = mapJobFields({ ...jobData, invoiceNumber }, false, columns);

    // Build dynamic INSERT query based on available fields
    const jobFields = Object.keys(dbJobData);
    const jobValues = Object.values(dbJobData);
    const placeholders = jobValues.map((_, i) => `$${i + 1}`).join(', ');

    const jobQuery = `
      INSERT INTO jobs (${jobFields.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    console.log('🔍 Job insert query:', jobQuery);
    console.log('🔍 Job values:', jobValues);

    const jobResult = await client.query(jobQuery, jobValues);
    const newJob = jobResult.rows[0];

    // Insert job items if they exist and job_items table is available
    if (jobData.items && jobData.items.length > 0) {
      for (const item of jobData.items) {
        try {
          const dbItemData = mapItemFields(item, newJob.id, false);
          
          const itemFields = Object.keys(dbItemData);
          const itemValues = Object.values(dbItemData);
          const itemPlaceholders = itemValues.map((_, i) => `$${i + 1}`).join(', ');

          const itemQuery = `
            INSERT INTO job_items (${itemFields.join(', ')})
            VALUES (${itemPlaceholders})
          `;

          await client.query(itemQuery, itemValues);
        } catch (itemError) {
          console.warn('⚠️ Could not insert item:', itemError.message);
          // Continue with job creation even if items fail
        }
      }
    }

    await client.query('COMMIT');

    // Return formatted job using mapping function
    const formattedJob = mapJobFields({...newJob, items: jobData.items}, true);

    console.log('✅ Job created successfully:', formattedJob.invoiceNumber);
    res.status(201).json(formattedJob);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating job:', error.message);
    res.status(500).json({ error: 'Error creating job: ' + error.message });
  } finally {
    client.release();
  }
});

// Update job
app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const jobId = parseInt(req.params.id, 10);
    if (Number.isNaN(jobId)) {
      return res.status(400).json({ error: 'Invalid job id' });
    }

    const incoming = req.body || {};
    const mapped = mapJobFields(incoming, false);
    const entries = Object.entries(mapped).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    const setClauses = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');
    const values = entries.map(([_, v]) => v);

    const updateQuery = `
      UPDATE jobs
      SET ${setClauses}
      WHERE id = $${values.length + 1}
      RETURNING *
    `;

    const result = await client.query(updateQuery, [...values, jobId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const updated = result.rows[0];
    const itemsRes = await client.query(
      'SELECT id, description, quantity, price, total FROM job_items WHERE job_id = $1',
      [jobId]
    ).catch(() => ({ rows: [] }));

    const formatted = mapJobFields({ ...updated, items: itemsRes.rows }, true);
    res.json(formatted);
  } catch (error) {
    console.error('❌ Error updating job:', error.message);
    res.status(500).json({ error: 'Error updating job: ' + error.message });
  } finally {
    client.release();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await testConnection();
});

module.exports = app;
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Simple in-memory data storage (for now)
let jobs = [
  {
    id: 1,
    clientName: 'Helen Fowler',
    invoiceNumber: '2025-0143',
    date: '02/12/25',
    serviceType: 'Ironing',
    invoicingCompany: 'Cleaning Angels',
    status: 'Completed',
    items: [
      { description: 'Shirts', quantity: 5, price: 8.95, total: 44.75 }
    ],
    totalAmount: 44.75,
    notes: ''
  },
  {
    id: 2,
    clientName: 'Chris StClair',
    invoiceNumber: '2025-0142',
    date: '20/11/25',
    serviceType: 'Ironing',
    invoicingCompany: 'Cleaning Angels',
    status: 'Completed',
    items: [
      { description: 'Bottom sheet extra', quantity: 1, price: 31.00, total: 31.00 }
    ],
    totalAmount: 31.00,
    notes: 'inc bottom sheet extra #2025-0142'
  },
  {
    id: 3,
    clientName: 'Ian Brett',
    invoiceNumber: '2025-0141',
    date: '17/11/25',
    serviceType: 'Ironing',
    invoicingCompany: 'Cleaning Angels',
    status: 'Completed',
    items: [
      { description: 'Mixed items', quantity: 1, price: 45.75, total: 45.75 }
    ],
    totalAmount: 45.75,
    notes: ''
  }
];

// Routes
app.get('/api/health', (req, res) => {
  console.log('✅ Health check requested');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Iron & Clean Pro API is running'
  });
});

// Login endpoint
app.post('/api/login', (req, res) => {
  console.log('🔐 Login attempt:', req.body);
  
  const { username, password } = req.body;
  
  if (username === 'tonybisht' && password === 'Topaz26') {
    console.log('✅ Login successful');
    res.json({
      message: 'Login successful',
      token: 'simple-token-' + Date.now(),
      user: {
        id: 1,
        username: username,
        email: 'tony@ironcleanpro.com'
      }
    });
  } else {
    console.log('❌ Login failed');
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get all jobs
app.get('/api/jobs', (req, res) => {
  console.log('📋 Jobs requested');
  res.json(jobs);
});

// Create new job
app.post('/api/jobs', (req, res) => {
  console.log('➕ Creating new job:', req.body);
  
  const newJob = {
    ...req.body,
    id: jobs.length + 1,
    invoiceNumber: `2025-${String(jobs.length + 1).padStart(4, '0')}`
  };
  
  jobs.unshift(newJob);
  console.log('✅ Job created:', newJob.invoiceNumber);
  res.status(201).json(newJob);
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log('====================================');
  console.log(`🚀 Iron & Clean Pro API Server`);
  console.log(`📡 Running on: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: tonybisht / Topaz26`);
  console.log('====================================');
  
  // Test the server immediately
  setTimeout(() => {
    const http = require('http');
    http.get(`http://localhost:${PORT}/api/health`, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server self-test passed');
      }
    }).on('error', (err) => {
      console.error('❌ Server self-test failed:', err.message);
    });
  }, 1000);
});

module.exports = app;
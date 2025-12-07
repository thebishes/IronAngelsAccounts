// Simple test to verify the server starts correctly
const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on port ${PORT}`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/api/health`);
  
  // Test the endpoint
  setTimeout(() => {
    fetch(`http://localhost:${PORT}/api/health`)
      .then(res => res.json())
      .then(data => {
        console.log('✅ Server test successful:', data);
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Server test failed:', err);
        process.exit(1);
      });
  }, 1000);
});
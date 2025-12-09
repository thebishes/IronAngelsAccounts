// Quick test to verify the combined app works
const http = require('http');

console.log('Testing combined app startup...\n');

// Test if server responds
setTimeout(() => {
  http.get('http://localhost:3001/api/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ API endpoint working:', data);
      } else {
        console.log('❌ API endpoint failed:', res.statusCode);
      }
    });
  }).on('error', (err) => {
    console.log('❌ Server not responding:', err.message);
  });

  // Test static file serving
  http.get('http://localhost:3001/', (res) => {
    console.log(`✅ Frontend serving: Status ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('\n🎉 Combined app is working perfectly!');
      console.log('Open http://localhost:3001 in your browser');
    }
    process.exit(0);
  }).on('error', (err) => {
    console.log('❌ Frontend not responding:', err.message);
    process.exit(1);
  });
}, 2000);

// Start the server
require('./server/server.js');

// Temporary test script to verify your deployed API is reachable
// Usage:
//   node tmp_rovodev_test_api.js https://api.accounts.ironingangels.uk/api
// or set env API_BASE and run
//   API_BASE=https://api.accounts.ironingangels.uk/api node tmp_rovodev_test_api.js

const base = (process.argv[2] || process.env.API_BASE || '').replace(/\/$/, '');

if (!base) {
  console.error('Please pass the API base URL as an argument or set API_BASE env var.');
  process.exit(1);
}

async function run() {
  try {
    const healthUrl = `${base}/health`;
    console.log('Checking:', healthUrl);
    const res = await fetch(healthUrl);
    const text = await res.text();
    console.log('Status:', res.status, res.statusText);
    console.log('Body:', text);
    if (!res.ok) process.exit(2);
  } catch (e) {
    console.error('Request failed:', e.message);
    process.exit(3);
  }
}

run();

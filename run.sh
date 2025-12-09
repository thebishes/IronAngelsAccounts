#!/bin/bash

echo "==============================================="
echo "  Iron & Clean Pro - Single App Deployment"
echo "==============================================="
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build React app if not exists
if [ ! -d "build" ]; then
  echo "Building React app..."
  npm run build
fi

echo ""
echo "Starting combined app..."
echo "App will be available at: http://localhost:3001"
echo "Login: tonybisht / Topaz26"
echo ""

# Start the server
node server/server.js

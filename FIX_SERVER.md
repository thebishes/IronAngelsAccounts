# 🔧 Fix "Cannot connect to server" Error

## The Problem
The frontend is getting HTML instead of JSON from the API, which means:
- The backend server isn't running on port 3001 
- OR something else is running on port 3001 (like a web server)

## 🚀 Step-by-Step Fix

### **Step 1: Check what's on port 3001**
```bash
# Windows
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3001
```

### **Step 2: Kill anything using port 3001**
```bash
# Windows (replace PID with actual process ID from step 1)
taskkill /F /PID [PID]

# Mac/Linux
sudo kill -9 [PID]

# OR use this universal command
npx kill-port 3001
```

### **Step 3: Test simple server startup**
```bash
cd server
npm install
node test.js
```
**Expected output:**
```
✅ Test server running on port 3001
🔗 Test URL: http://localhost:3001/api/health
✅ Server test successful: { status: 'OK', timestamp: '...' }
```

### **Step 4: Start the real backend**
```bash
cd server
node server.js
```
**Expected output:**
```
🚀 Server running on port 3001
✅ Database connection successful
🔍 Inspecting existing database tables...
```

### **Step 5: Test backend is working**
Open in browser: http://localhost:3001/api/health
Should show:
```json
{"status":"OK","timestamp":"2025-01-27T..."}
```

### **Step 6: Start frontend (new terminal)**
```bash
npm start
```

## 🎯 **Alternative: Start Both Together**

Once the backend works individually:
```bash
npm run dev
```

## 🔍 **If Server Won't Start**

### **Missing dependencies:**
```bash
cd server
rm -rf node_modules
npm install
```

### **Database connection issues:**
```bash
# Test database independently
node test-connection.js
```

### **Port conflicts:**
```bash
# Use different port temporarily
cd server
PORT=3002 node server.js
```
Then update frontend API URL temporarily.

## ✅ **Success Indicators**

1. **Backend console shows:**
   - "Server running on port 3001"
   - "Database connection successful"

2. **Frontend login page shows:**
   - Green "✅ Connected to server"
   - NOT red "❌ Cannot connect to server"

3. **Browser console shows:**
   - API requests to `http://localhost:3001/api/...`
   - NO "failed to fetch" errors

## 🚨 **Emergency Fallback**

If nothing works, let's start with a minimal setup:
```bash
# 1. Clean everything
rm -rf node_modules server/node_modules

# 2. Fresh install
npm install
cd server && npm install && cd ..

# 3. Start backend only first
cd server
node server.js

# 4. In another terminal, start frontend
npm start
```

**Try Step 1-3 first and let me know what output you see!**
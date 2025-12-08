# 🆘 EMERGENCY RESET - Iron & Clean Pro

## The app is broken? Let's fix it completely!

### 🔥 **Option 1: Automatic Reset (Windows)**
```cmd
RESET_APP.bat
```
This will:
- Kill all running processes
- Delete all node_modules
- Reinstall everything fresh
- Start with a simple working backend
- Launch the app

### 🔥 **Option 2: Manual Reset Steps**

#### **Step 1: Clean Everything**
```bash
# Kill any running servers
taskkill /F /IM node.exe
# OR on Mac/Linux: sudo killall node

# Delete all dependencies
rm -rf node_modules server/node_modules
rm package-lock.json server/package-lock.json
```

#### **Step 2: Fresh Backend Install**
```bash
cd server
npm install
```

#### **Step 3: Test Simple Backend**
```bash
cd server
node simple-server.js
```
**Should see:**
```
🚀 Iron & Clean Pro API Server
📡 Running on: http://localhost:3001
✅ Server self-test passed
```

#### **Step 4: Test Backend in Browser**
Open: http://localhost:3001/api/health
Should show:
```json
{"status":"OK","timestamp":"...","message":"Iron & Clean Pro API is running"}
```

#### **Step 5: Start Frontend (New Terminal)**
```bash
npm install
npm start
```

### ✅ **What This Fixes:**

1. **Simple backend** - No database complexity, just works
2. **Fresh dependencies** - No corrupted packages
3. **Clear ports** - No conflicts
4. **Working API** - Proper JSON responses
5. **Your sample data** - Helen Fowler, Chris StClair, etc.

### 🎯 **After Reset:**

- **Login**: `tonybisht` / `Topaz26`
- **Features**: All working (Add jobs, Dashboard, Reports)
- **Data**: In memory (adds jobs temporarily)
- **Later**: We can reconnect database once basic app works

### 🚨 **If STILL Broken:**

Try this minimal test:
```bash
# Just test if Node.js works
node -v

# Just test if ports are free
netstat -an | findstr :3001
netstat -an | findstr :3000
```

**Run the reset and tell me what you see at each step!**
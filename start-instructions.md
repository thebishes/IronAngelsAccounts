# 🚀 Step-by-Step Startup Instructions

## Current Issue: "Failed to fetch" on login

This error means the **frontend cannot connect to the backend API**. Let's fix this step by step.

## 🔧 **Step 1: Test Database Connection First**

```bash
# Test if we can connect to your PostgreSQL database
node test-connection.js
```

**Expected output:**
```
🔍 Testing database connection...
✅ Database connection successful!
🕒 Database time: [current time]
📋 Found tables: [jobs, job_items, etc.]
✅ Connection test completed successfully
```

If this fails, we have a database connectivity issue to solve first.

---

## 🚀 **Step 2: Start Backend Server**

Open **Terminal 1** and run:
```bash
cd server
npm install
npm start
```

**Expected output:**
```
🚀 Server running on port 3001
✅ Database connection successful
🔍 Inspecting existing database tables...
📋 Found tables: jobs, job_items
```

**⚠️ If you see errors here:**
- Database connection failed → Check database server accessibility
- Port 3001 already in use → Stop other processes or change port
- Module errors → Run `npm install` in server folder

---

## 🎨 **Step 3: Start Frontend (New Terminal)**

Open **Terminal 2** and run:
```bash
npm install
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

Browser should open automatically to http://localhost:3000

---

## 🔍 **Step 4: Test Login**

1. **Check Connection Status** - You should see green "✅ Connected to server" message
2. **If red "❌ Cannot connect"** - Backend isn't running properly
3. **Login with**: `tonybisht` / `Topaz26`

---

## 🛠️ **Alternative: Start Everything Together**

If both terminals work individually, you can use:
```bash
npm run dev
```

This starts both frontend and backend simultaneously.

---

## 🔍 **Debugging Steps**

### **If backend won't start:**
```bash
cd server
npm install --force
node server.js
```

### **If database connection fails:**
```bash
# Test connection independently
node test-connection.js
```

### **If frontend can't reach backend:**
- Check backend is running on port 3001
- Visit http://localhost:3001/api/health in browser
- Should show: `{"status":"OK","timestamp":"..."}`

### **Check what's running on ports:**
```bash
# Windows
netstat -an | findstr :3001
netstat -an | findstr :3000

# Mac/Linux  
lsof -i :3001
lsof -i :3000
```

---

## 📞 **Quick Troubleshooting**

| Problem | Solution |
|---------|----------|
| "Failed to fetch" | Backend not running - check Terminal 1 |
| "Cannot connect to server" | Start backend: `cd server && npm start` |
| "Port 3001 in use" | Stop other processes or change port |
| Database errors | Run `node test-connection.js` to verify |
| Module not found | Run `npm install` in both root and server folders |

---

## 🎯 **Expected Final Result**

- **Terminal 1**: Backend running, showing database connection success
- **Terminal 2**: Frontend compiled successfully  
- **Browser**: Login page with green "Connected to server" status
- **Login works**: tonybisht/Topaz26 credentials accepted

Let me know what output you see from each step!
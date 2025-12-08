# 🗄️ PostgreSQL Database Setup Guide

## Overview
Your Iron & Clean Pro app now connects to your PostgreSQL database at:
- **Host**: 132.226.215.254
- **Port**: 5432
- **Database**: iron_clean_pro
- **User**: postgres

## 🚀 Quick Setup Steps

### 1. **Database Schema Setup**
Connect to your PostgreSQL server and run the schema:

```sql
-- Connect to PostgreSQL (use your preferred client: pgAdmin, psql, etc.)
-- Run the contents of: server/database/schema.sql
```

**Or copy and paste this:**
```sql
-- Create database
CREATE DATABASE iron_clean_pro;

-- Switch to the database
\c iron_clean_pro;

-- Create tables
CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    invoicing_company VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS job_items (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert your user account (password: Topaz26)
INSERT INTO users (username, password_hash, email) 
VALUES ('tonybisht', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tony@ironcleanpro.com')
ON CONFLICT (username) DO NOTHING;

-- Insert sample data
INSERT INTO jobs (client_name, invoice_number, date, service_type, invoicing_company, status, notes, total_amount) VALUES
('Helen Fowler', '2025-0143', '2025-12-02', 'Ironing', 'Cleaning Angels', 'Completed', '', 44.75),
('Chris StClair', '2025-0142', '2025-11-20', 'Ironing', 'Cleaning Angels', 'Completed', 'inc bottom sheet extra #2025-0142', 31.00),
('Ian Brett', '2025-0141', '2025-11-17', 'Ironing', 'Cleaning Angels', 'Completed', '', 45.75),
('Ian and Angie', '2025-0140', '2025-10-26', 'Ironing', 'Cleaning Angels', 'Completed', '', 19.00),
('Susan', '2025-0138', '2025-10-25', 'Ironing', 'Cleaning Angels', 'Completed', '', 25.00);

INSERT INTO job_items (job_id, description, quantity, price, total) VALUES
(1, 'Shirts', 5, 8.95, 44.75),
(2, 'Bottom sheet extra', 1, 31.00, 31.00),
(3, 'Mixed items', 1, 45.75, 45.75),
(4, 'Mixed items', 1, 19.00, 19.00),
(5, 'Mixed items', 1, 25.00, 25.00);
```

### 2. **Install Dependencies**

**Frontend dependencies:**
```bash
npm install
```

**Backend dependencies:**
```bash
cd server
npm install
```

### 3. **Environment Setup**
The database connection is already configured in `server/.env`:
```
DB_HOST=132.226.215.254
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=6ccQll56TmCaSwefKBduVQyIuYmBoTEkrMh6sfQkWnaYVy4omHP4WfyBzAJt1Qu8
DB_NAME=iron_clean_pro
```

### 4. **Start the Application**

**Option A: Run both frontend and backend together:**
```bash
npm run dev
```

**Option B: Run separately:**
```bash
# Terminal 1 - Backend API
cd server
npm start

# Terminal 2 - Frontend React App  
npm start
```

## 🔧 **How It Works Now**

### **🔐 Authentication**
- Login with: `tonybisht` / `Topaz26`
- Credentials are verified against the PostgreSQL `users` table
- JWT token authentication for API security

### **📊 Data Storage**
- **Jobs**: Stored in `jobs` table
- **Items**: Stored in `job_items` table (linked to jobs)
- **Users**: Stored in `users` table

### **🔄 Real-time Updates**
- Add new jobs → Saved to database immediately
- Dashboard statistics → Calculated from live database data  
- All data persists permanently

## 🏗️ **Architecture**

```
Frontend (React)     Backend (Node.js)     Database (PostgreSQL)
     ↓                       ↓                      ↓
   Port 3000    ←→    Port 3001 (API)    ←→    132.226.215.254:5432
```

## 🔍 **Verify Setup**

1. **Database Connection**: Backend will show "✅ Database connection successful" 
2. **API Health**: Visit `http://localhost:3001/api/health`
3. **Login Test**: Use tonybisht/Topaz26 credentials
4. **Data Test**: Add a new job and see it persist after refresh

## 🛠️ **Troubleshooting**

### **Database Connection Issues**
- Verify database server is running
- Check firewall allows connections to port 5432
- Confirm database `iron_clean_pro` exists
- Test connection with pgAdmin or another client

### **Backend API Issues** 
- Check `server/.env` file exists with correct credentials
- Ensure Node.js dependencies installed: `cd server && npm install`
- Look for error messages in server console

### **Frontend Issues**
- Verify backend is running on port 3001
- Check browser console for API errors
- Clear browser cache and local storage

## 🚨 **Security Note**
The database credentials are stored in `.env` file. In production:
- Use environment variables
- Rotate passwords regularly  
- Enable SSL connections
- Implement proper user roles

## 📈 **Next Steps**
- Test creating new jobs
- Verify data persistence
- Customize business settings
- Add backup procedures
- Plan production deployment
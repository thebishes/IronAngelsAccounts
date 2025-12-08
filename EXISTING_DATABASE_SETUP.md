# 🔄 Using Your Existing PostgreSQL Database

## Overview
Your Iron & Clean Pro app now connects to your existing PostgreSQL database and will automatically adapt to your current table structure.

**Database Connection:**
- **Host**: 132.226.215.254
- **Port**: 5432  
- **Database**: postgres (default database)
- **Tables**: Uses your existing `jobs` and `job_items` tables

## 🔍 **Automatic Field Mapping**

The system intelligently maps your existing database fields to the application:

### **Jobs Table Mapping:**
```sql
-- The app will look for these field variations:
client_name OR clientname OR customer_name OR customer → Client Name
invoice_number OR invoice_no OR invoice_id OR job_id → Invoice Number  
date OR job_date OR created_date → Job Date
service_type OR type OR service → Service Type
status → Job Status
notes OR description OR comments → Notes
total_amount OR total OR amount → Total Amount
```

### **Job Items Table Mapping:**
```sql
-- The app will look for these field variations:
job_id → Links to jobs table
description OR item_description OR item_name → Item Description
quantity OR qty → Quantity
price OR unit_price OR rate → Unit Price
total OR total_price OR amount → Item Total
```

## 🚀 **Setup Steps**

### **1. Install Dependencies**
```bash
# Frontend dependencies
npm install

# Backend dependencies  
cd server
npm install
```

### **2. Start the Application**
```bash
# Run both frontend and backend
npm run dev
```

The system will:
1. ✅ Connect to your existing database
2. 🔍 Inspect your table structures automatically
3. 📊 Map fields dynamically to work with your data
4. 📝 Display existing jobs if any are found

## 🎯 **What Happens on Startup**

When you start the server, you'll see:
```
🚀 Server running on port 3001
✅ Database connection successful
🔍 Inspecting existing database tables...
📋 Found tables: [jobs, job_items, ...]
📊 Jobs table structure: [field mappings]
📝 Sample jobs data: [your existing data]
```

## 🔧 **How It Works**

### **Reading Existing Data:**
- Automatically detects your table structure
- Maps field names to app requirements
- Preserves all existing data
- Works with any reasonable field naming

### **Creating New Jobs:**
- Uses dynamic field mapping for inserts
- Maintains compatibility with your existing structure
- Generates invoice numbers based on existing count
- Gracefully handles missing optional fields

### **Error Handling:**
- If field mapping fails, shows detailed error messages
- Continues working even if some fields don't match
- Logs all database operations for debugging

## 🧪 **Testing Steps**

1. **Start the application**: `npm run dev`
2. **Check console logs** for table structure detection
3. **Login** with `tonybisht` / `Topaz26`
4. **View existing jobs** (if any) on the dashboard
5. **Add a test job** to verify database writing works
6. **Check your database** to confirm new data was saved

## 📊 **Expected Console Output**

```
🔍 Inspecting existing database tables...
📋 Found tables: jobs, job_items
📊 Jobs table structure:
  id: integer (NOT NULL)
  client_name: character varying
  invoice_number: character varying  
  date: date
  total_amount: numeric
📝 Sample jobs data: [your existing records]
```

## ⚠️ **Troubleshooting**

### **If No Jobs Appear:**
- Check table names are exactly `jobs` and `job_items`
- Verify field names match mapping patterns
- Look at console for field detection results

### **If New Jobs Don't Save:**
- Check console for specific error messages
- Verify required fields exist in your database
- Ensure proper permissions for INSERT operations

### **Connection Issues:**
- Verify database server is accessible
- Check firewall allows connections to port 5432
- Confirm database credentials are correct

## 🎯 **Next Steps**

Once connected successfully:
1. **Review your existing data** in the dashboard
2. **Test creating new jobs** to verify everything works  
3. **Customize field mappings** if needed (in server/server.js)
4. **Add any missing database constraints** for data integrity

The system is designed to work with your existing data structure while providing the modern interface for managing your ironing business!
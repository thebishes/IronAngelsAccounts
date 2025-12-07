-- Iron & Clean Pro Database Schema
-- Run this SQL to create the necessary tables

-- Create database (if it doesn't exist)
-- CREATE DATABASE iron_clean_pro;

-- Use the database
-- \c iron_clean_pro;

-- Create jobs table
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

-- Create job_items table for individual items within each job
CREATE TABLE IF NOT EXISTS job_items (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user (password hash for 'Topaz26')
INSERT INTO users (username, password_hash, email) 
VALUES ('tonybisht', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tony@ironcleanpro.com')
ON CONFLICT (username) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_name ON jobs(client_name);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_items_job_id ON job_items(job_id);

-- Insert sample data
INSERT INTO jobs (client_name, invoice_number, date, service_type, invoicing_company, status, notes, total_amount) VALUES
('Helen Fowler', '2025-0143', '2025-12-02', 'Ironing', 'Cleaning Angels', 'Completed', '', 44.75),
('Chris StClair', '2025-0142', '2025-11-20', 'Ironing', 'Cleaning Angels', 'Completed', 'inc bottom sheet extra #2025-0142', 31.00),
('Ian Brett', '2025-0141', '2025-11-17', 'Ironing', 'Cleaning Angels', 'Completed', '', 45.75),
('Ian and Angie', '2025-0140', '2025-10-26', 'Ironing', 'Cleaning Angels', 'Completed', '', 19.00),
('Susan', '2025-0138', '2025-10-25', 'Ironing', 'Cleaning Angels', 'Completed', '', 25.00)
ON CONFLICT (invoice_number) DO NOTHING;

-- Insert sample job items
INSERT INTO job_items (job_id, description, quantity, price, total) VALUES
(1, 'Shirts', 5, 8.95, 44.75),
(2, 'Bottom sheet extra', 1, 31.00, 31.00),
(3, 'Mixed items', 1, 45.75, 45.75),
(4, 'Mixed items', 1, 19.00, 19.00),
(5, 'Mixed items', 1, 25.00, 25.00)
ON CONFLICT DO NOTHING;
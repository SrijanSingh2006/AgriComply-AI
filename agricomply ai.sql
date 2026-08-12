DROP DATABASE agricomply_db
CREATE DATABASE agricomply_db
USE agricomply_db;

-- 1. Users Table (This is the one missing!)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Documents Table (For the Vault)
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    tag VARCHAR(50), 
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. Compliance Rules (For Track A)
CREATE TABLE IF NOT EXISTS compliance_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(100),
    required_doc_tag VARCHAR(50),
    penalty_amount DECIMAL(10,2),
    due_date DATE
);

-- 4. Schemes (For Track B)
CREATE TABLE IF NOT EXISTS schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_name VARCHAR(100),
    description TEXT,
    required_docs_json JSON
);

-- 5. Insert some dummy data so the app isn't empty
INSERT INTO compliance_rules (rule_name, required_doc_tag, due_date) VALUES 
('Income Tax Filing', 'ITR-V', '2025-07-31'),
('GST October Return', 'GSTR-3B', '2025-11-20');

INSERT INTO schemes (scheme_name, required_docs_json) VALUES 
('Kisan Credit Card', '["PAN", "LandRecord"]'),
('Tractor Loan', '["Aadhaar", "Quotation", "LandRecord"]');
USE agricomply_db;

-- 1. Add 'role' to Users table
ALTER TABLE users ADD COLUMN role ENUM('Farmer', 'FPO', 'MSME') NOT NULL DEFAULT 'Farmer';

-- 2. Add 'applicable_role' to Compliance Rules
ALTER TABLE compliance_rules ADD COLUMN applicable_role ENUM('Farmer', 'FPO', 'MSME', 'ALL') NOT NULL DEFAULT 'ALL';

-- 3. Clear old seed data to avoid confusion
TRUNCATE TABLE compliance_rules;

-- 4. Insert Specific Rules based on your list
INSERT INTO compliance_rules (rule_name, required_doc_tag, applicable_role, due_date) VALUES 
-- INDIVIDUAL FARMER RULES
('KCC Renewal', 'LandRecord', 'Farmer', '2025-06-30'),
('PM-KISAN KYC', 'Aadhaar', 'Farmer', '2025-12-31'),
('Crop Insurance (PMFBY)', 'CropSowingCertificate', 'Farmer', '2025-07-15'),

-- FPO / COOPERATIVE RULES
('FPO GST Return (GSTR-3B)', 'GSTR-3B', 'FPO', '2025-11-20'),
('TDS Return Filing', 'Form26AS', 'FPO', '2025-10-31'),
('Annual Audit Report', 'AuditReport', 'FPO', '2025-09-30'),
('Equity Grant Utilization', 'UtilizationCertificate', 'FPO', '2025-03-31'),

-- MSME RULES
('GST Annual Return (GSTR-9)', 'GSTR-9', 'MSME', '2025-12-31'),
('Professional Tax Payment', 'ChallanPT', 'MSME', '2025-06-30'),
('Stock & Debtor Statement', 'StockStmt', 'MSME', '2025-01-10'),
('Udyam Registration', 'UdyamCert', 'MSME', '2025-03-31');
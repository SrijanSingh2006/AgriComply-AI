-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Shared Vault (Documents)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    tag VARCHAR(50), 
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Track A: Compliance Rules
CREATE TABLE IF NOT EXISTS compliance_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100),
    required_doc_tag VARCHAR(50),
    penalty_amount DECIMAL(10,2),
    due_date DATE
);

-- 4. Track B: Schemes & Loans
CREATE TABLE IF NOT EXISTS schemes (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(100),
    description TEXT,
    required_docs_json JSONB -- JSONB is preferred in Postgres for performance
);

-- Seed Data
INSERT INTO compliance_rules (rule_name, required_doc_tag, due_date) VALUES 
('Income Tax Filing', 'ITR-V', '2025-07-31'),
('GST October Return', 'GSTR-3B', '2025-11-20');

INSERT INTO schemes (scheme_name, required_docs_json) VALUES 
('Kisan Credit Card', '["PAN", "LandRecord"]'),
('Tractor Loan', '["[Your ID Number]", "Quotation", "LandRecord"]');
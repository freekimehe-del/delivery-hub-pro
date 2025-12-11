-- Clearance & Forwarding Module Schema
-- Created: 2025-12-11

-- 1. Reference Data: Pakistan Customs Tariff (PCT) Codes
CREATE TABLE IF NOT EXISTS pct_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g., '8703.2113'
    description TEXT,
    customs_duty_rate DECIMAL(5, 2) DEFAULT 0.00, -- e.g., 20.00 for 20%
    sales_tax_rate DECIMAL(5, 2) DEFAULT 17.00, -- Standard 17%
    income_tax_rate DECIMAL(5, 2) DEFAULT 11.00,
    additional_customs_duty DECIMAL(5, 2) DEFAULT 0.00,
    regulatory_duty DECIMAL(5, 2) DEFAULT 0.00,
    unit_of_measure VARCHAR(20), -- kg, numbers, liters
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Main Clearance Job Table
CREATE TABLE IF NOT EXISTS clearance_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'IMP-KHI-24-001'
    client_id UUID REFERENCES customers(id), -- Assuming 'customers' table exists from Finance module
    status VARCHAR(50) DEFAULT 'draft', -- draft, gd_filed, assessment, payment, examination, released, completed
    type VARCHAR(20) NOT NULL CHECK (type IN ('import', 'export', 'transit')),
    transport_mode VARCHAR(20) DEFAULT 'maritime',
    
    -- Shipment Details
    bl_number VARCHAR(50),
    vir_number VARCHAR(50), -- Vessel Import Rotation No (IGM)
    vessel_name VARCHAR(100),
    arrival_date DATE,
    port_of_loading VARCHAR(100),
    port_of_discharge VARCHAR(100), -- e.g., 'KPT', 'SAPT'
    terminal VARCHAR(100), -- 'KICT', 'PICT', 'QICT'
    
    -- Financials
    declared_value_pkr DECIMAL(15, 2),
    total_duties_paid DECIMAL(15, 2) DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Goods Declarations (GD) - The core PSW document
CREATE TABLE IF NOT EXISTS goods_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES clearance_jobs(id) ON DELETE CASCADE,
    gd_number VARCHAR(50), -- Assigned by PSW/WeBOC e.g. 'KPXI-GD-12345'
    psid_number VARCHAR(50), -- Payment Slip ID
    submission_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50), -- pending, submitted, assessed, cleared
    
    -- Consignment Info
    net_weight DECIMAL(10, 2),
    gross_weight DECIMAL(10, 2),
    package_count INTEGER,
    package_type VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. GD Line Items
CREATE TABLE IF NOT EXISTS gd_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gd_id UUID REFERENCES goods_declarations(id) ON DELETE CASCADE,
    pct_code_id UUID REFERENCES pct_codes(id),
    description TEXT,
    quantity DECIMAL(10, 2),
    unit_value_usd DECIMAL(12, 4),
    assessable_value_pkr DECIMAL(15, 2),
    
    -- Duty breakdown for this item
    duty_amount DECIMAL(12, 2),
    sales_tax_amount DECIMAL(12, 2),
    income_tax_amount DECIMAL(12, 2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_clearance_jobs_client ON clearance_jobs(client_id);
CREATE INDEX idx_clearance_jobs_status ON clearance_jobs(status);
CREATE INDEX idx_pct_codes_code ON pct_codes(code);

-- Enable RLS
ALTER TABLE pct_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clearance_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gd_line_items ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Open for now to allow Anon access during dev)
CREATE POLICY "Allow read access for all users" ON pct_codes FOR SELECT USING (true);
CREATE POLICY "Allow all access for all users" ON clearance_jobs FOR ALL USING (true);
CREATE POLICY "Allow all access for all users" ON goods_declarations FOR ALL USING (true);
CREATE POLICY "Allow all access for all users" ON gd_line_items FOR ALL USING (true);

-- 5. Landed Cost Sheets
CREATE TABLE IF NOT EXISTS landed_cost_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES clearance_jobs(id) ON DELETE CASCADE,
    total_cost_pkr DEFAULT 0,
    cost_data JSONB, -- Stores the full breakdown of costs and allocations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE landed_cost_sheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for all users" ON landed_cost_sheets FOR ALL USING (true);

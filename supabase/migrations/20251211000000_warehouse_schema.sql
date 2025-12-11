-- Warehouse Management Schema
-- Created: 2025-12-11

-- 1. Warehouses (Bonded & Non-Bonded)
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200),
    is_bonded BOOLEAN DEFAULT FALSE, -- distinguishing feature for Customs
    capacity_sqft DECIMAL(10, 2),
    manager_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Warehouse Inventory (Linked to GD Items for Bonded tracking)
CREATE TABLE IF NOT EXISTS warehouse_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    gd_line_item_id UUID REFERENCES gd_line_items(id), -- Optional link to specific cleared item
    description TEXT NOT NULL,
    quantity_on_hand DECIMAL(10, 2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'units',
    received_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Gate Passes (Inward / Outward Movement)
CREATE TABLE IF NOT EXISTS gate_passes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pass_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'GP-IN-2025-001'
    type VARCHAR(20) CHECK (type IN ('inward', 'outward')),
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Transporter Info
    driver_name VARCHAR(100),
    vehicle_number VARCHAR(50),
    transporter_name VARCHAR(100),
    
    status VARCHAR(50) DEFAULT 'issued', -- issued, completed, cancelled
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Gate Pass Items
CREATE TABLE IF NOT EXISTS gate_pass_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_pass_id UUID REFERENCES gate_passes(id) ON DELETE CASCADE,
    description TEXT,
    quantity DECIMAL(10, 2),
    remarks TEXT
);

-- Indexes
CREATE INDEX idx_warehouse_inventory_wh ON warehouse_inventory(warehouse_id);
CREATE INDEX idx_gate_passes_wh ON gate_passes(warehouse_id);

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gate_pass_items ENABLE ROW LEVEL SECURITY;

-- Open Access Policies (Dev Mode)
CREATE POLICY "Allow all access" ON warehouses FOR ALL USING (true);
CREATE POLICY "Allow all access" ON warehouse_inventory FOR ALL USING (true);
CREATE POLICY "Allow all access" ON gate_passes FOR ALL USING (true);
CREATE POLICY "Allow all access" ON gate_pass_items FOR ALL USING (true);

-- Seed Data: Sample Warehouses
INSERT INTO warehouses (name, location, is_bonded, capacity_sqft, manager_name)
VALUES 
('Port Qasim Bonded Warehouse', 'Plot 4, Port Qasim Industrial Area', true, 50000, 'Ahmed Khan'),
('Korangi Distribution Center', 'Sector 15, Korangi Industrial Area', false, 25000, 'Sara Ali');

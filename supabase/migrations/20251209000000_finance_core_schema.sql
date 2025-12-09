-- Finance Module Core Schema
-- General Ledger, AP/AR, Invoicing, Payments, Logistics Finance

-- =====================================================
-- 1. CHART OF ACCOUNTS & GENERAL LEDGER
-- =====================================================

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50), -- 'invoice', 'payment', 'bill', 'manual'
    reference_id UUID,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    created_by UUID,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    posted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES chart_of_accounts(id),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    description TEXT,
    line_number INT
);

-- =====================================================
-- 2. CUSTOMERS & VENDORS
-- =====================================================

CREATE TABLE IF NOT EXISTS finance_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms_days INT DEFAULT 30,
    tax_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    vendor_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    payment_terms_days INT DEFAULT 30,
    tax_id VARCHAR(100),
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. INVOICES (Accounts Receivable)
-- =====================================================

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES finance_customers(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    shipment_id UUID, -- Link to shipments table
    bl_number VARCHAR(100),
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    notes TEXT,
    terms_conditions TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    amount DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    line_number INT
);

-- =====================================================
-- 4. BILLS (Accounts Payable)
-- =====================================================

CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES finance_vendors(id),
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    reference_number VARCHAR(100),
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    balance DECIMAL(15,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'partial', 'paid', 'cancelled')),
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bill_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID REFERENCES bills(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_price DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    amount DECIMAL(15,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    line_number INT
);

-- =====================================================
-- 5. PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('received', 'made')),
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'card', 'online')),
    reference_number VARCHAR(100),
    customer_id UUID REFERENCES finance_customers(id),
    vendor_id UUID REFERENCES finance_vendors(id),
    bank_account VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id),
    bill_id UUID REFERENCES bills(id),
    allocated_amount DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. CREDIT/DEBIT NOTES
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credit_note_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES finance_customers(id),
    invoice_id UUID REFERENCES invoices(id),
    credit_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'applied', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debit_note_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID REFERENCES finance_vendors(id),
    bill_id UUID REFERENCES bills(id),
    debit_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'applied', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. LOGISTICS-SPECIFIC FINANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS freight_rate_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transport_mode VARCHAR(50) NOT NULL CHECK (transport_mode IN ('air', 'sea', 'road', 'rail')),
    origin VARCHAR(100),
    destination VARCHAR(100),
    rate_per_kg DECIMAL(10,2),
    rate_per_cbm DECIMAL(10,2),
    base_rate DECIMAL(15,2),
    fuel_surcharge_percent DECIMAL(5,2) DEFAULT 0,
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shipment_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID, -- Link to shipments
    bl_number VARCHAR(100),
    freight_charges DECIMAL(15,2) DEFAULT 0,
    fuel_surcharge DECIMAL(15,2) DEFAULT 0,
    loading_charges DECIMAL(15,2) DEFAULT 0,
    unloading_charges DECIMAL(15,2) DEFAULT 0,
    warehouse_charges DECIMAL(15,2) DEFAULT 0,
    customs_duty DECIMAL(15,2) DEFAULT 0,
    port_charges DECIMAL(15,2) DEFAULT 0,
    handling_fees DECIMAL(15,2) DEFAULT 0,
    insurance DECIMAL(15,2) DEFAULT 0,
    other_charges DECIMAL(15,2) DEFAULT 0,
    total_charges DECIMAL(15,2) GENERATED ALWAYS AS (
        freight_charges + fuel_surcharge + loading_charges + unloading_charges + 
        warehouse_charges + customs_duty + port_charges + handling_fees + 
        insurance + other_charges
    ) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS driver_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID, -- Link to drivers
    trip_id UUID,
    settlement_date DATE NOT NULL,
    base_allowance DECIMAL(10,2) DEFAULT 0,
    fuel_allowance DECIMAL(10,2) DEFAULT 0,
    food_allowance DECIMAL(10,2) DEFAULT 0,
    trip_expenses DECIMAL(10,2) DEFAULT 0,
    toll_charges DECIMAL(10,2) DEFAULT 0,
    other_expenses DECIMAL(10,2) DEFAULT 0,
    total_settlement DECIMAL(15,2) GENERATED ALWAYS AS (
        base_allowance + fuel_allowance + food_allowance + 
        trip_expenses + toll_charges + other_expenses
    ) STORED,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    approved_by UUID,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID, -- Link to vehicles
    cost_date DATE NOT NULL,
    cost_type VARCHAR(50) NOT NULL CHECK (cost_type IN ('fuel', 'maintenance', 'insurance', 'tax', 'depreciation', 'other')),
    amount DECIMAL(15,2) NOT NULL,
    odometer_reading INT,
    description TEXT,
    vendor_id UUID REFERENCES finance_vendors(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. TAX MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tax_name VARCHAR(100) NOT NULL,
    tax_type VARCHAR(50) CHECK (tax_type IN ('GST', 'VAT', 'Sales Tax', 'Customs Duty', 'Excise')),
    rate DECIMAL(5,2) NOT NULL,
    country VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. MULTI-CURRENCY SUPPORT
-- =====================================================

CREATE TABLE IF NOT EXISTS currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    currency_code VARCHAR(3) UNIQUE NOT NULL,
    currency_name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    is_base BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. AUDIT & COMPLIANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS finance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete', 'approve', 'cancel')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_bills_vendor ON bills(vendor_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_vendor ON payments(vendor_id);
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_shipment_charges_shipment ON shipment_charges(shipment_id);
CREATE INDEX idx_driver_settlements_driver ON driver_settlements(driver_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

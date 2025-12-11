-- 1. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    location TEXT,
    status TEXT CHECK (status IN ('active', 'premium', 'inactive')) DEFAULT 'active',
    joined_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY, -- User-facing ID (e.g., INV-001)
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT CHECK (status IN ('paid', 'pending', 'overdue', 'draft', 'sent')) DEFAULT 'draft',
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT, -- 'Credit Card', 'Bank Transfer', 'Cash'
    status TEXT DEFAULT 'completed',
    payment_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);

-- 5. Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Open for Development)
CREATE POLICY "Allow all access to customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to payments" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- 7. Triggers for Updated At
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Seed Data
INSERT INTO public.customers (name, email, phone, location, status) VALUES
('Acme Corporation', 'orders@acme.com', '+1 (555) 123-4567', 'New York, NY', 'active'),
('Tech Solutions Inc.', 'logistics@techsol.com', '+1 (555) 234-5678', 'Brooklyn, NY', 'active'),
('Global Imports LLC', 'shipping@globalimports.com', '+1 (555) 345-6789', 'Manhattan, NY', 'premium');

INSERT INTO public.invoices (id, customer_id, amount, status, issue_date, due_date)
SELECT 'INV-001', id, 4580.00, 'paid', CURRENT_DATE - 30, CURRENT_DATE FROM public.customers WHERE name = 'Acme Corporation';

INSERT INTO public.invoices (id, customer_id, amount, status, issue_date, due_date)
SELECT 'INV-002', id, 2340.00, 'pending', CURRENT_DATE - 15, CURRENT_DATE + 15 FROM public.customers WHERE name = 'Tech Solutions Inc.';

INSERT INTO public.payments (invoice_id, customer_id, amount, method, payment_date)
SELECT 'INV-001', id, 4580.00, 'Bank Transfer', now() - interval '2 days' FROM public.customers WHERE name = 'Acme Corporation';

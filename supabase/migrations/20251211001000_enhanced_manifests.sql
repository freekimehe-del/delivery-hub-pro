-- Enhanced Logistics Manifests & Bilty System Migration

-- 1. Enhance logistics_manifests table
ALTER TABLE public.logistics_manifests 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'manifest', -- manifest, bilty
ADD COLUMN IF NOT EXISTS origin_location_id UUID,
ADD COLUMN IF NOT EXISTS destination_location_id UUID,
ADD COLUMN IF NOT EXISTS consignor_id UUID REFERENCES public.customers(id),
ADD COLUMN IF NOT EXISTS consignee_id UUID REFERENCES public.customers(id),
ADD COLUMN IF NOT EXISTS carrier_id UUID, -- Link to fleet/vendor
ADD COLUMN IF NOT EXISTS driver_id UUID,
ADD COLUMN IF NOT EXISTS vehicle_id UUID,
ADD COLUMN IF NOT EXISTS total_weight FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_items INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS freight_charges DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);

-- 2. Create manifest_items table
CREATE TABLE IF NOT EXISTS public.manifest_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id UUID NOT NULL REFERENCES public.logistics_manifests(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    weight FLOAT DEFAULT 0,
    dimensions TEXT,
    packaging_type TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create document_attachments table (Generic)
CREATE TABLE IF NOT EXISTS public.document_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linked_entity_id UUID NOT NULL,
    linked_entity_type TEXT NOT NULL, -- 'manifest', 'shipment', 'invoice'
    file_url TEXT NOT NULL,
    file_name TEXT,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create audit_logs table
CREATE TABLE IF NOT EXISTS public.logistics_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_table TEXT NOT NULL,
    entity_id UUID NOT NULL,
    action TEXT NOT NULL, -- CREATE, UPDATE, STATUS_CHANGE
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS
ALTER TABLE public.manifest_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics_audit_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- manifest_items policies
CREATE POLICY "Enable read for authenticated users" ON public.manifest_items
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.manifest_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.manifest_items
    FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.manifest_items
    FOR DELETE USING (auth.role() = 'authenticated');

-- document_attachments policies
CREATE POLICY "Enable read for authenticated users" ON public.document_attachments
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.document_attachments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- logistics_audit_logs policies
CREATE POLICY "Enable read for authenticated users" ON public.logistics_audit_logs
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON public.logistics_audit_logs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

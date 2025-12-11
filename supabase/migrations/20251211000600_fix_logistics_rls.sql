-- Ensure logistics_manifests table exists
CREATE TABLE IF NOT EXISTS public.logistics_manifests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_number TEXT UNIQUE NOT NULL,
    transport_mode TEXT NOT NULL, -- maritime, air, road
    status TEXT DEFAULT 'draft', -- draft, issued, in_transit, completed
    vessel_name TEXT,
    voyage_number TEXT,
    flight_number TEXT,
    port_of_loading TEXT,
    port_of_discharge TEXT,
    departure_date TIMESTAMP WITH TIME ZONE,
    arrival_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure container_inventory table exists
CREATE TABLE IF NOT EXISTS public.container_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    container_number TEXT UNIQUE NOT NULL,
    size TEXT DEFAULT '40ft',
    type TEXT DEFAULT 'standard',
    status TEXT DEFAULT 'available', -- available, in_use, maintenance
    current_location TEXT, -- yard, port, customer_site
    last_service_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure proof_of_delivery table exists
CREATE TABLE IF NOT EXISTS public.proof_of_delivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id UUID REFERENCES public.logistics_manifests(id),
    shipment_id UUID REFERENCES public.shipment_master(id),
    receiver_name TEXT,
    receiver_signature TEXT, -- URL or base64
    photos TEXT[], -- Array of URLs
    delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.logistics_manifests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.container_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proof_of_delivery ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow all authenticated users to read/write for now)
CREATE POLICY "Enable read access for all users" ON public.logistics_manifests
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.logistics_manifests
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.logistics_manifests
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Containers Policies
CREATE POLICY "Enable read access for all users" ON public.container_inventory
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.container_inventory
    FOR ALL USING (auth.role() = 'authenticated');

-- POD Policies
CREATE POLICY "Enable read access for all users" ON public.proof_of_delivery
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.proof_of_delivery
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

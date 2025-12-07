-- Phase 1: Shipment Management Module - Core Schema

-- Carriers table
CREATE TABLE IF NOT EXISTS public.carriers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('truck', 'sea', 'air', 'rail')),
    registration_number VARCHAR(100),
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    license_number VARCHAR(100),
    insurance_expiry DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Routes table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    transport_mode VARCHAR(50) NOT NULL CHECK (transport_mode IN ('truck', 'sea', 'air', 'rail')),
    distance_km DECIMAL(10,2),
    estimated_duration_hours DECIMAL(6,2),
    border_crossings JSONB DEFAULT '[]'::jsonb, -- Array of border points
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Carrier routes junction table
CREATE TABLE IF NOT EXISTS public.carrier_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    carrier_id UUID NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    base_rate DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'PKR',
    effective_from DATE NOT NULL,
    effective_to DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id),
    origin_address TEXT NOT NULL,
    origin_city VARCHAR(100) NOT NULL,
    origin_country VARCHAR(100) NOT NULL,
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    destination_country VARCHAR(100) NOT NULL,
    transport_mode VARCHAR(50) NOT NULL CHECK (transport_mode IN ('truck', 'sea', 'air', 'rail', 'multi_modal')),
    service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('express', 'standard', 'economy', 'transit')),
    cargo_description TEXT,
    cargo_type VARCHAR(50) CHECK (cargo_type IN ('general', 'dangerous', 'perishable', 'fragile', 'oversized')),
    weight_kg DECIMAL(10,2),
    volume_cbm DECIMAL(10,2),
    package_count INTEGER,
    declared_value DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'PKR',
    insurance_required BOOLEAN DEFAULT false,
    insurance_value DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'quotation' CHECK (status IN ('quotation', 'booked', 'dispatched', 'in_transit', 'arrived', 'cleared', 'delivered', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    special_instructions TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Shipment legs (for multi-modal shipments)
CREATE TABLE IF NOT EXISTS public.shipment_legs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
    leg_number INTEGER NOT NULL,
    transport_mode VARCHAR(50) NOT NULL CHECK (transport_mode IN ('truck', 'sea', 'air', 'rail')),
    carrier_id UUID REFERENCES public.carriers(id),
    route_id UUID REFERENCES public.routes(id),
    origin_location VARCHAR(255) NOT NULL,
    destination_location VARCHAR(255) NOT NULL,
    planned_departure TIMESTAMP WITH TIME ZONE,
    actual_departure TIMESTAMP WITH TIME ZONE,
    planned_arrival TIMESTAMP WITH TIME ZONE,
    actual_arrival TIMESTAMP WITH TIME ZONE,
    vehicle_number VARCHAR(100),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    tracking_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'loading', 'in_transit', 'arrived', 'unloading', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Transit bonds table (for Afghanistan transit)
CREATE TABLE IF NOT EXISTS public.transit_bonds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bond_number VARCHAR(100) UNIQUE NOT NULL,
    shipment_id UUID REFERENCES public.shipments(id),
    bond_type VARCHAR(50) CHECK (bond_type IN ('single', 'continuous', 'comprehensive')),
    issuing_authority VARCHAR(255),
    bond_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PKR',
    validity_start DATE NOT NULL,
    validity_end DATE NOT NULL,
    guarantee_type VARCHAR(50) CHECK (guarantee_type IN ('bank', 'insurance', 'cash')),
    guarantor_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'claimed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('shipment', 'consignment', 'invoice', 'bond')),
    entity_id UUID NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    document_number VARCHAR(100),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT,
    file_size_bytes INTEGER,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES auth.users(id),
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    ocr_data JSONB,
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'verified', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_carriers_type ON public.carriers(type);
CREATE INDEX IF NOT EXISTS idx_routes_origin_destination ON public.routes(origin_country, destination_country);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_customer ON public.shipments(customer_id);
CREATE INDEX IF NOT EXISTS idx_shipment_legs_shipment ON public.shipment_legs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_legs_status ON public.shipment_legs(status);
CREATE INDEX IF NOT EXISTS idx_transit_bonds_shipment ON public.transit_bonds(shipment_id);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON public.documents(entity_type, entity_id);

-- RLS Policies
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transit_bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be expanded based on user roles)
CREATE POLICY "Users can view carriers" ON public.carriers FOR SELECT USING (true);
CREATE POLICY "Users can view routes" ON public.routes FOR SELECT USING (true);
CREATE POLICY "Users can view shipments" ON public.shipments FOR SELECT USING (true);
CREATE POLICY "Users can insert shipments" ON public.shipments FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Function to generate shipment number
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(shipment_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.shipments
    WHERE shipment_number LIKE 'SHP-' || current_year || '-%';

    RETURN 'SHP-' || current_year || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate bond number
CREATE OR REPLACE FUNCTION generate_bond_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_number INTEGER;
BEGIN
    current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    SELECT COALESCE(MAX(CAST(SUBSTRING(bond_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.transit_bonds
    WHERE bond_number LIKE 'BND-' || current_year || '-%';

    RETURN 'BND-' || current_year || '-' || LPAD(next_number::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_carriers_updated_at
    BEFORE UPDATE ON public.carriers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
    BEFORE UPDATE ON public.routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON public.shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipment_legs_updated_at
    BEFORE UPDATE ON public.shipment_legs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transit_bonds_updated_at
    BEFORE UPDATE ON public.transit_bonds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
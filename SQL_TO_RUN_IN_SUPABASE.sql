-- 1. Create Logistics Bookings Table
CREATE TABLE IF NOT EXISTS public.logistics_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id),
    
    -- Shipment Info
    transport_mode TEXT CHECK (transport_mode IN ('road', 'air', 'sea', 'rail')),
    cargo_type TEXT, -- FCL, LCL, Bulk, etc.
    incoterms TEXT,
    
    -- Locations & Dates
    origin_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    pickup_date TIMESTAMP WITH TIME ZONE,
    expected_delivery_date TIMESTAMP WITH TIME ZONE,
    
    -- Status & Workflow
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'scheduled', 'dispatched', 'in_transit', 'delivered', 'completed', 'cancelled')),
    
    -- Allocation
    carrier_id UUID, -- Link to vendor/carrier
    container_ids UUID[], -- Array of linked container IIDs (if applicable)
    driver_id UUID REFERENCES public.drivers(id), -- For Road
    vehicle_id UUID REFERENCES public.vehicles(id), -- For Road
    vessel_name TEXT, -- For Sea
    voyage_number TEXT, -- For Sea
    flight_number TEXT, -- For Air
    awb_number TEXT, -- For Air
    
    -- Financials/Billing (High level summary)
    total_freight_charges DECIMAL(10,2) DEFAULT 0,
    total_other_charges DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT DEFAULT 'pending',

    -- Metadata
    instructions TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.logistics_bookings ENABLE ROW LEVEL SECURITY;

-- 2. Item Details
CREATE TABLE IF NOT EXISTS public.booking_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.logistics_bookings(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    weight DECIMAL(10,2),
    volume DECIMAL(10,2),
    package_type TEXT,
    dimensions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

-- 3. Charges / Billing Lines
CREATE TABLE IF NOT EXISTS public.booking_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.logistics_bookings(id) ON DELETE CASCADE,
    charge_type TEXT NOT NULL, -- Freight, Fuel Surcharge, Handling, etc.
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    is_payable BOOLEAN DEFAULT false, -- True = We pay (Cost), False = Customer pays (Revenue)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.booking_charges ENABLE ROW LEVEL SECURITY;

-- 4. Attachments
CREATE TABLE IF NOT EXISTS public.booking_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.logistics_bookings(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    document_type TEXT, -- BL, Invoice, Packing List
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.booking_attachments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Basic authenticated access for now)
CREATE POLICY "Authenticated users can view bookings" ON public.logistics_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert bookings" ON public.logistics_bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update bookings" ON public.logistics_bookings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete bookings" ON public.logistics_bookings FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view items" ON public.booking_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert items" ON public.booking_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update items" ON public.booking_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete items" ON public.booking_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view charges" ON public.booking_charges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert charges" ON public.booking_charges FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update charges" ON public.booking_charges FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete charges" ON public.booking_charges FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view attachments" ON public.booking_attachments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert attachments" ON public.booking_attachments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

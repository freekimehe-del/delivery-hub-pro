-- Fleet Management Schema (Phase 1)
-- Created: 2025-12-11

-- 1. Maintenance Records Table
CREATE TABLE IF NOT EXISTS public.maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    reported_by_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    
    maintenance_type TEXT CHECK (maintenance_type IN ('scheduled', 'repair', 'inspection', 'recall', 'emergency')),
    status TEXT CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    
    title TEXT NOT NULL,
    description TEXT,
    
    -- Costs
    labor_cost DECIMAL(10,2) DEFAULT 0,
    parts_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    
    -- Dates
    scheduled_date TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Metadata
    odometer_at_service INTEGER,
    vendor_name TEXT,
    technician_name TEXT,
    work_performed TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Fuel Records Table (Comprehensive)
CREATE TABLE IF NOT EXISTS public.fuel_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    
    fuel_type TEXT CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'cng', 'lpg')) DEFAULT 'gasoline',
    quantity_gallons DECIMAL(10,2) NOT NULL,
    price_per_gallon DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2),
    
    odometer_reading INTEGER NOT NULL,
    previous_odometer INTEGER,
    miles_driven INTEGER,
    mpg DECIMAL(10,2),
    
    full_tank BOOLEAN DEFAULT true,
    station_name TEXT,
    station_location TEXT,
    fuel_card_used BOOLEAN DEFAULT false,
    receipt_url TEXT,
    
    anomaly_flag BOOLEAN DEFAULT false,
    anomaly_reason TEXT,
    notes TEXT,
    
    fueled_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle ON public.maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON public.maintenance_records(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON public.fuel_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_date ON public.fuel_records(fueled_at);

-- 4. Enable RLS
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_records ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Open for Development)
CREATE POLICY "Allow all access to maintenance_records"
    ON public.maintenance_records
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all access to fuel_records"
    ON public.fuel_records
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Triggers for Updated At
CREATE TRIGGER update_maintenance_updated_at
    BEFORE UPDATE ON public.maintenance_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fuel_updated_at
    BEFORE UPDATE ON public.fuel_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Seed Data (Optional - Sample Records)
INSERT INTO public.maintenance_records (vehicle_id, maintenance_type, status, title, priority, scheduled_date)
SELECT 
    id, 
    'scheduled', 
    'pending', 
    'Oil Change & Filter Replacement', 
    'medium', 
    now() + interval '7 days'
FROM public.vehicles 
LIMIT 1;

INSERT INTO public.fuel_records (vehicle_id, fuel_type, quantity_gallons, price_per_gallon, total_cost, odometer_reading, station_name)
SELECT 
    id,
    'gasoline',
    12.5,
    3.45,
    43.13,
    15000,
    'Shell Station #402'
FROM public.vehicles
LIMIT 1;

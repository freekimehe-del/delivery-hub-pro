-- Create maintenance_records table
CREATE TABLE public.maintenance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  reported_by_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('scheduled', 'repair', 'inspection', 'recall', 'emergency')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  triggered_by TEXT DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'mileage', 'time', 'driver_report', 'fuel_anomaly', 'diagnostic')),
  scheduled_date DATE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  odometer_at_service INTEGER,
  labor_cost NUMERIC DEFAULT 0,
  parts_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (labor_cost + parts_cost) STORED,
  vendor_name TEXT,
  technician_name TEXT,
  work_performed TEXT,
  parts_used JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fuel_records table
CREATE TABLE public.fuel_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  fuel_type TEXT NOT NULL DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline', 'diesel', 'electric', 'hybrid', 'cng', 'lpg')),
  quantity_gallons NUMERIC NOT NULL,
  price_per_gallon NUMERIC NOT NULL,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity_gallons * price_per_gallon) STORED,
  odometer_reading INTEGER NOT NULL,
  previous_odometer INTEGER,
  miles_driven NUMERIC GENERATED ALWAYS AS (CASE WHEN previous_odometer IS NOT NULL THEN odometer_reading - previous_odometer ELSE NULL END) STORED,
  mpg NUMERIC GENERATED ALWAYS AS (CASE WHEN previous_odometer IS NOT NULL AND quantity_gallons > 0 THEN (odometer_reading - previous_odometer) / quantity_gallons ELSE NULL END) STORED,
  full_tank BOOLEAN DEFAULT true,
  station_name TEXT,
  station_location TEXT,
  fuel_card_used BOOLEAN DEFAULT false,
  receipt_url TEXT,
  anomaly_flag BOOLEAN DEFAULT false,
  anomaly_reason TEXT,
  notes TEXT,
  fueled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fuel_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for maintenance_records
CREATE POLICY "Authenticated users can view maintenance records"
  ON public.maintenance_records FOR SELECT
  USING (true);

CREATE POLICY "Admins and fleet managers can manage maintenance records"
  ON public.maintenance_records FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'fleet_manager'::app_role));

CREATE POLICY "Drivers can create maintenance reports"
  ON public.maintenance_records FOR INSERT
  WITH CHECK (true);

-- RLS Policies for fuel_records
CREATE POLICY "Authenticated users can view fuel records"
  ON public.fuel_records FOR SELECT
  USING (true);

CREATE POLICY "Admins and fleet managers can manage fuel records"
  ON public.fuel_records FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'fleet_manager'::app_role));

CREATE POLICY "Drivers can create fuel records"
  ON public.fuel_records FOR INSERT
  WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_maintenance_records_updated_at
  BEFORE UPDATE ON public.maintenance_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fuel_records_updated_at
  BEFORE UPDATE ON public.fuel_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_maintenance_records_vehicle_id ON public.maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_records_status ON public.maintenance_records(status);
CREATE INDEX idx_fuel_records_vehicle_id ON public.fuel_records(vehicle_id);
CREATE INDEX idx_fuel_records_driver_id ON public.fuel_records(driver_id);
CREATE INDEX idx_fuel_records_fueled_at ON public.fuel_records(fueled_at);
-- Routes table for route planning and optimization
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_number TEXT NOT NULL,
  driver_id UUID REFERENCES public.drivers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  status TEXT NOT NULL DEFAULT 'planned',
  planned_start TIMESTAMP WITH TIME ZONE,
  actual_start TIMESTAMP WITH TIME ZONE,
  planned_end TIMESTAMP WITH TIME ZONE,
  actual_end TIMESTAMP WITH TIME ZONE,
  total_distance NUMERIC,
  total_stops INTEGER DEFAULT 0,
  completed_stops INTEGER DEFAULT 0,
  optimization_score NUMERIC,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Route stops linking orders to routes with sequence
CREATE TABLE public.route_stops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  stop_type TEXT DEFAULT 'delivery',
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  actual_arrival TIMESTAMP WITH TIME ZONE,
  estimated_departure TIMESTAMP WITH TIME ZONE,
  actual_departure TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  wait_time_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Dispatch batches for grouping dispatched orders
CREATE TABLE public.dispatch_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_number TEXT NOT NULL,
  driver_id UUID REFERENCES public.drivers(id),
  vehicle_id UUID REFERENCES public.vehicles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'standard',
  total_orders INTEGER DEFAULT 0,
  dispatched_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Link table for dispatch batches and orders
CREATE TABLE public.dispatch_batch_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatch_batch_id UUID NOT NULL REFERENCES public.dispatch_batches(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sequence_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add route_id to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS route_id UUID REFERENCES public.routes(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS dispatch_batch_id UUID REFERENCES public.dispatch_batches(id);

-- Generate route number trigger
CREATE OR REPLACE FUNCTION public.generate_route_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.route_number IS NULL THEN
    NEW.route_number := 'RT' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_route_number_trigger
BEFORE INSERT ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.generate_route_number();

-- Generate dispatch batch number trigger
CREATE OR REPLACE FUNCTION public.generate_batch_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.batch_number IS NULL THEN
    NEW.batch_number := 'DSP' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_batch_number_trigger
BEFORE INSERT ON public.dispatch_batches
FOR EACH ROW
EXECUTE FUNCTION public.generate_batch_number();

-- Enable RLS on all new tables
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_batch_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for routes
CREATE POLICY "Admins and dispatchers can view routes"
ON public.routes FOR SELECT
USING (is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Admins and dispatchers can manage routes"
ON public.routes FOR ALL
USING (is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Drivers can view their assigned routes"
ON public.routes FOR SELECT
USING (driver_id IN (SELECT d.id FROM drivers d JOIN profiles p ON d.profile_id = p.id WHERE p.user_id = auth.uid()));

-- RLS policies for route_stops
CREATE POLICY "View stops for accessible routes"
ON public.route_stops FOR SELECT
USING (route_id IN (SELECT id FROM routes));

CREATE POLICY "Admins and dispatchers can manage route stops"
ON public.route_stops FOR ALL
USING (is_admin_or_dispatcher(auth.uid()));

-- RLS policies for dispatch_batches
CREATE POLICY "Admins and dispatchers can view dispatch batches"
ON public.dispatch_batches FOR SELECT
USING (is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Admins and dispatchers can manage dispatch batches"
ON public.dispatch_batches FOR ALL
USING (is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Drivers can view their assigned batches"
ON public.dispatch_batches FOR SELECT
USING (driver_id IN (SELECT d.id FROM drivers d JOIN profiles p ON d.profile_id = p.id WHERE p.user_id = auth.uid()));

-- RLS policies for dispatch_batch_orders
CREATE POLICY "View batch orders for accessible batches"
ON public.dispatch_batch_orders FOR SELECT
USING (dispatch_batch_id IN (SELECT id FROM dispatch_batches));

CREATE POLICY "Admins and dispatchers can manage batch orders"
ON public.dispatch_batch_orders FOR ALL
USING (is_admin_or_dispatcher(auth.uid()));

-- Updated at triggers
CREATE TRIGGER update_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_route_stops_updated_at
BEFORE UPDATE ON public.route_stops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dispatch_batches_updated_at
BEFORE UPDATE ON public.dispatch_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_routes_driver_id ON public.routes(driver_id);
CREATE INDEX idx_routes_status ON public.routes(status);
CREATE INDEX idx_route_stops_route_id ON public.route_stops(route_id);
CREATE INDEX idx_route_stops_order_id ON public.route_stops(order_id);
CREATE INDEX idx_dispatch_batches_driver_id ON public.dispatch_batches(driver_id);
CREATE INDEX idx_dispatch_batches_status ON public.dispatch_batches(status);
CREATE INDEX idx_dispatch_batch_orders_batch_id ON public.dispatch_batch_orders(dispatch_batch_id);
CREATE INDEX idx_dispatch_batch_orders_order_id ON public.dispatch_batch_orders(order_id);
CREATE INDEX idx_orders_route_id ON public.orders(route_id);
CREATE INDEX idx_orders_dispatch_batch_id ON public.orders(dispatch_batch_id);
-- Create enum types for status tracking
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'dispatcher', 'fleet_manager', 'driver', 'customer');
CREATE TYPE public.driver_status AS ENUM ('pending', 'active', 'suspended', 'inactive');
CREATE TYPE public.vehicle_status AS ENUM ('active', 'idle', 'maintenance', 'offline');
CREATE TYPE public.order_status AS ENUM (
  'pending', 'confirmed', 'dispatched', 'driver_accepted', 
  'en_route_pickup', 'arrived_pickup', 'picked_up', 
  'en_route_delivery', 'arrived_delivery', 'delivered', 
  'failed', 'cancelled', 'rescheduled'
);
CREATE TYPE public.service_type AS ENUM ('express', 'same_day', 'standard', 'economy');

-- User roles table (security best practice - separate from profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  billing_email TEXT,
  payment_terms INTEGER DEFAULT 30,
  status TEXT DEFAULT 'active',
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_plate TEXT NOT NULL UNIQUE,
  vin TEXT,
  vehicle_type TEXT NOT NULL DEFAULT 'van',
  make TEXT,
  model TEXT,
  year INTEGER,
  color TEXT,
  capacity_weight DECIMAL(10,2),
  capacity_volume DECIMAL(10,2),
  fuel_type TEXT DEFAULT 'gasoline',
  status vehicle_status NOT NULL DEFAULT 'offline',
  current_location JSONB,
  last_location_update TIMESTAMPTZ,
  mileage INTEGER DEFAULT 0,
  insurance_expiry DATE,
  registration_expiry DATE,
  last_service_date DATE,
  next_service_due DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  employee_id TEXT,
  license_number TEXT,
  license_expiry DATE,
  status driver_status NOT NULL DEFAULT 'pending',
  is_online BOOLEAN DEFAULT false,
  current_location JSONB,
  last_location_update TIMESTAMPTZ,
  rating DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries INTEGER DEFAULT 0,
  on_time_rate DECIMAL(5,2) DEFAULT 100.00,
  shift_start TIMESTAMPTZ,
  shift_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'pending',
  service_type service_type NOT NULL DEFAULT 'standard',
  priority INTEGER DEFAULT 3,
  
  -- Pickup details
  pickup_address TEXT NOT NULL,
  pickup_city TEXT,
  pickup_state TEXT,
  pickup_postal_code TEXT,
  pickup_coordinates JSONB,
  pickup_contact_name TEXT,
  pickup_contact_phone TEXT,
  pickup_instructions TEXT,
  pickup_window_start TIMESTAMPTZ,
  pickup_window_end TIMESTAMPTZ,
  
  -- Dropoff details
  dropoff_address TEXT NOT NULL,
  dropoff_city TEXT,
  dropoff_state TEXT,
  dropoff_postal_code TEXT,
  dropoff_coordinates JSONB,
  dropoff_contact_name TEXT,
  dropoff_contact_phone TEXT,
  dropoff_instructions TEXT,
  delivery_window_start TIMESTAMPTZ,
  delivery_window_end TIMESTAMPTZ,
  
  -- Package details
  package_weight DECIMAL(10,2),
  package_dimensions JSONB,
  package_type TEXT,
  package_count INTEGER DEFAULT 1,
  is_fragile BOOLEAN DEFAULT false,
  requires_signature BOOLEAN DEFAULT true,
  
  -- Pricing
  base_rate DECIMAL(10,2),
  distance_charge DECIMAL(10,2),
  surcharges DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2),
  currency TEXT DEFAULT 'PKR',
  
  -- Timing
  estimated_pickup_time TIMESTAMPTZ,
  actual_pickup_time TIMESTAMPTZ,
  estimated_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  estimated_distance DECIMAL(10,2),
  actual_distance DECIMAL(10,2),
  
  -- Proof of delivery
  pod_type TEXT,
  pod_signature_url TEXT,
  pod_photo_urls JSONB,
  pod_recipient_name TEXT,
  pod_notes TEXT,
  pod_captured_at TIMESTAMPTZ,
  
  -- Metadata
  external_id TEXT,
  customer_reference TEXT,
  notes TEXT,
  failure_reason TEXT,
  cancellation_reason TEXT,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order status history for audit trail
CREATE TABLE public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  previous_status order_status,
  changed_by UUID REFERENCES auth.users(id),
  location JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook configurations
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  last_status_code INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Webhook delivery logs
CREATE TABLE public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INTEGER,
  response_body TEXT,
  attempt_number INTEGER DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service zones for pricing and coverage
CREATE TABLE public.service_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  boundaries JSONB,
  base_rate DECIMAL(10,2) NOT NULL,
  per_mile_rate DECIMAL(10,2) NOT NULL,
  per_minute_wait_rate DECIMAL(10,2) DEFAULT 0.25,
  minimum_charge DECIMAL(10,2) DEFAULT 5.00,
  surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generate tracking number function
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'FB' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tracking_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_tracking_number();

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_zones_updated_at BEFORE UPDATE ON public.service_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order status change trigger for history
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, previous_status, changed_by)
    VALUES (NEW.id, NEW.status, OLD.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_order_status_changes
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_status_change();

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user is admin or dispatcher
CREATE OR REPLACE FUNCTION public.is_admin_or_dispatcher(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'dispatcher')
  )
$$;

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin_or_dispatcher(auth.uid()));

-- RLS Policies for customers
CREATE POLICY "Admins and dispatchers can view all customers" ON public.customers
  FOR SELECT USING (public.is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Admins can manage customers" ON public.customers
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for vehicles
CREATE POLICY "Authenticated users can view vehicles" ON public.vehicles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and fleet managers can manage vehicles" ON public.vehicles
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'fleet_manager')
  );

-- RLS Policies for drivers
CREATE POLICY "Drivers can view their own record" ON public.drivers
  FOR SELECT USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins and dispatchers can view all drivers" ON public.drivers
  FOR SELECT USING (public.is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Admins can manage drivers" ON public.drivers
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Drivers can update their own location and status" ON public.drivers
  FOR UPDATE USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()))
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS Policies for orders
CREATE POLICY "Admins and dispatchers can view all orders" ON public.orders
  FOR SELECT USING (public.is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Drivers can view their assigned orders" ON public.orders
  FOR SELECT USING (
    driver_id IN (
      SELECT d.id FROM public.drivers d 
      JOIN public.profiles p ON d.profile_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT USING (
    customer_id IN (
      SELECT c.id FROM public.customers c 
      JOIN public.profiles p ON c.profile_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and dispatchers can create orders" ON public.orders
  FOR INSERT WITH CHECK (public.is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Admins and dispatchers can update orders" ON public.orders
  FOR UPDATE USING (public.is_admin_or_dispatcher(auth.uid()));

CREATE POLICY "Drivers can update their assigned orders" ON public.orders
  FOR UPDATE USING (
    driver_id IN (
      SELECT d.id FROM public.drivers d 
      JOIN public.profiles p ON d.profile_id = p.id 
      WHERE p.user_id = auth.uid()
    )
  );

-- RLS Policies for order_status_history
CREATE POLICY "Users can view status history for accessible orders" ON public.order_status_history
  FOR SELECT USING (
    order_id IN (SELECT id FROM public.orders)
  );

-- RLS Policies for webhooks
CREATE POLICY "Admins can manage webhooks" ON public.webhooks
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for webhook_logs
CREATE POLICY "Admins can view webhook logs" ON public.webhook_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for service_zones
CREATE POLICY "Authenticated users can view active zones" ON public.service_zones
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage service zones" ON public.service_zones
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Create indexes for performance
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_driver ON public.orders(driver_id);
CREATE INDEX idx_orders_tracking ON public.orders(tracking_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_drivers_status ON public.drivers(status);
CREATE INDEX idx_drivers_is_online ON public.drivers(is_online);
CREATE INDEX idx_vehicles_status ON public.vehicles(status);
CREATE INDEX idx_order_history_order ON public.order_status_history(order_id);
CREATE INDEX idx_webhook_logs_webhook ON public.webhook_logs(webhook_id);
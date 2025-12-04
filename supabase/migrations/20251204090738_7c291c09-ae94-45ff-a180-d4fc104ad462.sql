-- Add acquisition and onboarding fields to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS asset_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS acquisition_type TEXT DEFAULT 'purchase' CHECK (acquisition_type IN ('purchase', 'lease', 'rental')),
ADD COLUMN IF NOT EXISTS acquisition_date DATE,
ADD COLUMN IF NOT EXISTS acquisition_cost NUMERIC,
ADD COLUMN IF NOT EXISTS lease_end_date DATE,
ADD COLUMN IF NOT EXISTS monthly_lease_cost NUMERIC,
ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
ADD COLUMN IF NOT EXISTS telematics_device_id TEXT,
ADD COLUMN IF NOT EXISTS fuel_card_number TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
ADD COLUMN IF NOT EXISTS purchase_vendor TEXT,
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT;

-- Create function to generate asset code
CREATE OR REPLACE FUNCTION public.generate_asset_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.asset_code IS NULL THEN
    NEW.asset_code := UPPER(LEFT(NEW.vehicle_type, 3)) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for asset code generation
DROP TRIGGER IF EXISTS generate_vehicle_asset_code ON public.vehicles;
CREATE TRIGGER generate_vehicle_asset_code
BEFORE INSERT ON public.vehicles
FOR EACH ROW
EXECUTE FUNCTION public.generate_asset_code();
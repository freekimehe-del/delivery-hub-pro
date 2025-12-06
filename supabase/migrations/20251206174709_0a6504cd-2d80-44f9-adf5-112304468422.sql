-- Enums for customs and warehousing
CREATE TYPE public.warehouse_type AS ENUM ('private_bonded', 'public_bonded', 'manufacturing_bond');
CREATE TYPE public.warehouse_license_status AS ENUM ('active', 'pending', 'suspended', 'expired', 'cancelled');
CREATE TYPE public.consignment_type AS ENUM ('import', 'export', 'transit', 'temporary_import');
CREATE TYPE public.consignment_status AS ENUM ('pending', 'cleared', 'held', 'released', 'bonded', 'auctioned');
CREATE TYPE public.document_type AS ENUM ('igm', 'egm', 'bill_of_lading', 'commercial_invoice', 'packing_list', 'certificate_of_origin', 'customs_declaration', 'carnet_de_passage');
CREATE TYPE public.auction_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');
CREATE TYPE public.auction_type AS ENUM ('public', 'private');

-- HS Codes reference table
CREATE TABLE public.hs_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  chapter TEXT NOT NULL,
  duty_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  sales_tax_rate NUMERIC(5,2) NOT NULL DEFAULT 17,
  additional_duty_rate NUMERIC(5,2) DEFAULT 0,
  regulatory_duty_rate NUMERIC(5,2) DEFAULT 0,
  is_restricted BOOLEAN DEFAULT false,
  requires_license BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Warehouses table
CREATE TABLE public.warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  warehouse_type warehouse_type NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  capacity_sqft NUMERIC,
  capacity_weight_kg NUMERIC,
  license_number TEXT,
  license_status warehouse_license_status NOT NULL DEFAULT 'pending',
  license_issue_date DATE,
  license_expiry_date DATE,
  bank_guarantee_amount NUMERIC,
  bank_guarantee_expiry DATE,
  fire_safety_certificate TEXT,
  fire_safety_expiry DATE,
  site_plan_url TEXT,
  owner_name TEXT,
  owner_contact TEXT,
  operator_profile_id UUID,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Consignments table
CREATE TABLE public.consignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number TEXT NOT NULL UNIQUE,
  consignment_type consignment_type NOT NULL,
  status consignment_status NOT NULL DEFAULT 'pending',
  
  -- Importer/Exporter details
  importer_exporter_name TEXT NOT NULL,
  importer_exporter_ntn TEXT,
  import_license_number TEXT,
  
  -- Goods details
  hs_code_id UUID REFERENCES public.hs_codes(id),
  goods_description TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  quantity_unit TEXT DEFAULT 'KG',
  declared_value NUMERIC NOT NULL,
  currency TEXT DEFAULT 'PKR',
  country_of_origin TEXT,
  
  -- Customs duties
  customs_duty_rate NUMERIC(5,2),
  customs_duty_amount NUMERIC,
  sales_tax_rate NUMERIC(5,2),
  sales_tax_amount NUMERIC,
  additional_duty_amount NUMERIC DEFAULT 0,
  regulatory_duty_amount NUMERIC DEFAULT 0,
  total_duty_amount NUMERIC,
  
  -- Warehousing
  warehouse_id UUID REFERENCES public.warehouses(id),
  bond_start_date DATE,
  bond_expiry_date DATE,
  is_perishable BOOLEAN DEFAULT false,
  is_life_saving_drug BOOLEAN DEFAULT false,
  requires_urgent_release BOOLEAN DEFAULT false,
  
  -- Temporary import (vehicles)
  carnet_number TEXT,
  vehicle_registration TEXT,
  bank_guarantee_amount NUMERIC,
  
  -- Transport
  vessel_flight_number TEXT,
  port_of_origin TEXT,
  port_of_destination TEXT,
  arrival_date DATE,
  
  -- Audit
  created_by UUID,
  cleared_by UUID,
  cleared_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customs documents table
CREATE TABLE public.customs_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consignment_id UUID REFERENCES public.consignments(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_number TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auctions table
CREATE TABLE public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_number TEXT NOT NULL UNIQUE,
  auction_type auction_type NOT NULL,
  status auction_status NOT NULL DEFAULT 'scheduled',
  consignment_id UUID REFERENCES public.consignments(id),
  
  -- Auction details
  reserve_price NUMERIC NOT NULL,
  starting_bid NUMERIC,
  current_bid NUMERIC,
  winning_bid NUMERIC,
  
  -- Schedule
  scheduled_date TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  
  -- Auctioneer
  auctioneer_name TEXT,
  auctioneer_license TEXT,
  
  -- Winner
  winner_name TEXT,
  winner_ntn TEXT,
  winner_contact TEXT,
  
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auction bids table
CREATE TABLE public.auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE,
  bidder_name TEXT NOT NULL,
  bidder_ntn TEXT,
  bidder_contact TEXT,
  bid_amount NUMERIC NOT NULL,
  bid_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_winning BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Compliance alerts table
CREATE TABLE public.compliance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  due_date DATE,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hs_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customs_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hs_codes (public read, admin write)
CREATE POLICY "Anyone can view HS codes" ON public.hs_codes FOR SELECT USING (true);
CREATE POLICY "Admins can manage HS codes" ON public.hs_codes FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for warehouses
CREATE POLICY "Authenticated users can view warehouses" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Admins can manage warehouses" ON public.warehouses FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for consignments
CREATE POLICY "Admins and dispatchers can view consignments" ON public.consignments FOR SELECT USING (
  is_admin_or_dispatcher(auth.uid())
);
CREATE POLICY "Admins can manage consignments" ON public.consignments FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for customs_documents
CREATE POLICY "View documents for accessible consignments" ON public.customs_documents FOR SELECT USING (
  consignment_id IN (SELECT id FROM public.consignments)
);
CREATE POLICY "Admins can manage documents" ON public.customs_documents FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for auctions
CREATE POLICY "Authenticated users can view auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Admins can manage auctions" ON public.auctions FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);

-- RLS Policies for auction_bids
CREATE POLICY "View bids for accessible auctions" ON public.auction_bids FOR SELECT USING (
  auction_id IN (SELECT id FROM public.auctions)
);
CREATE POLICY "Authenticated users can place bids" ON public.auction_bids FOR INSERT WITH CHECK (true);

-- RLS Policies for compliance_alerts
CREATE POLICY "Admins can view alerts" ON public.compliance_alerts FOR SELECT USING (
  is_admin_or_dispatcher(auth.uid())
);
CREATE POLICY "Admins can manage alerts" ON public.compliance_alerts FOR ALL USING (
  has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin')
);

-- Triggers for updated_at
CREATE TRIGGER update_hs_codes_updated_at BEFORE UPDATE ON public.hs_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_consignments_updated_at BEFORE UPDATE ON public.consignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON public.auctions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate consignment tracking number
CREATE OR REPLACE FUNCTION public.generate_consignment_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'CON' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_consignment_tracking_trigger
  BEFORE INSERT ON public.consignments
  FOR EACH ROW EXECUTE FUNCTION public.generate_consignment_tracking();

-- Function to generate auction number
CREATE OR REPLACE FUNCTION public.generate_auction_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.auction_number IS NULL THEN
    NEW.auction_number := 'AUC' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_auction_number_trigger
  BEFORE INSERT ON public.auctions
  FOR EACH ROW EXECUTE FUNCTION public.generate_auction_number();

-- Function to calculate customs duties
CREATE OR REPLACE FUNCTION public.calculate_customs_duties()
RETURNS TRIGGER AS $$
DECLARE
  hs_record RECORD;
BEGIN
  IF NEW.hs_code_id IS NOT NULL THEN
    SELECT duty_rate, sales_tax_rate, additional_duty_rate, regulatory_duty_rate 
    INTO hs_record FROM public.hs_codes WHERE id = NEW.hs_code_id;
    
    NEW.customs_duty_rate := COALESCE(hs_record.duty_rate, 0);
    NEW.customs_duty_amount := NEW.declared_value * (COALESCE(hs_record.duty_rate, 0) / 100);
    NEW.sales_tax_rate := COALESCE(hs_record.sales_tax_rate, 17);
    NEW.sales_tax_amount := (NEW.declared_value + NEW.customs_duty_amount) * (COALESCE(hs_record.sales_tax_rate, 17) / 100);
    NEW.additional_duty_amount := NEW.declared_value * (COALESCE(hs_record.additional_duty_rate, 0) / 100);
    NEW.regulatory_duty_amount := NEW.declared_value * (COALESCE(hs_record.regulatory_duty_rate, 0) / 100);
    NEW.total_duty_amount := NEW.customs_duty_amount + NEW.sales_tax_amount + NEW.additional_duty_amount + NEW.regulatory_duty_amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER calculate_consignment_duties
  BEFORE INSERT OR UPDATE ON public.consignments
  FOR EACH ROW EXECUTE FUNCTION public.calculate_customs_duties();

-- Generate warehouse code
CREATE OR REPLACE FUNCTION public.generate_warehouse_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.code IS NULL THEN
    NEW.code := UPPER(LEFT(NEW.warehouse_type::text, 3)) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_warehouse_code_trigger
  BEFORE INSERT ON public.warehouses
  FOR EACH ROW EXECUTE FUNCTION public.generate_warehouse_code();
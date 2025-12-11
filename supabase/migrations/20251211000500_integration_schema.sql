-- Integration Schema: Customs - Logistics - Warehouse - Finance
-- Created: 2025-12-11

-- 1. Link Logistics (Shipments) to Customs (Clearance Jobs)
-- Assuming 'shipment_master' and 'clearance_jobs' tables exist
ALTER TABLE public.shipment_master 
ADD COLUMN IF NOT EXISTS clearance_job_id UUID REFERENCES public.clearance_jobs(id) ON DELETE SET NULL;

-- 2. Link Warehouse to Surveillance (Camera Access)
ALTER TABLE public.warehouses 
ADD COLUMN IF NOT EXISTS camera_feed_url TEXT;

ALTER TABLE public.warehouses 
ADD COLUMN IF NOT EXISTS surveillance_status TEXT DEFAULT 'active' CHECK (surveillance_status IN ('active', 'offline', 'maintenance'));

-- 3. Link Warehouse Gate Passes to Logistics (Manifests/Shipments)
-- This allows tracking WHICH shipment entered/left the warehouse
ALTER TABLE public.gate_passes 
ADD COLUMN IF NOT EXISTS shipment_id UUID REFERENCES public.shipment_master(id) ON DELETE SET NULL;

ALTER TABLE public.gate_passes 
ADD COLUMN IF NOT EXISTS manifest_number TEXT; -- For manual correlation if shipment_id not available

-- 4. Link Clearance Jobs to Finance (Invoices)
-- To track if the duty/taxes for a job have been invoiced
ALTER TABLE public.clearance_jobs 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL;

-- 5. Link Drivers to Bonded Carrier License (Compliance)
ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS bonded_license_number TEXT;

ALTER TABLE public.drivers 
ADD COLUMN IF NOT EXISTS bonded_license_expiry DATE;

-- 6. Create Integration Views (Optional helper for dashboard)
CREATE OR REPLACE VIEW public.dashboard_overview AS
SELECT 
    (SELECT COUNT(*) FROM public.clearance_jobs WHERE status = 'draft') as pending_jobs,
    (SELECT COUNT(*) FROM public.gate_passes WHERE status = 'issued') as active_gate_passes,
    (SELECT COUNT(*) FROM public.shipment_master WHERE status = 'in_transit') as active_shipments,
    (SELECT COUNT(*) FROM public.invoices WHERE payment_status = 'unpaid') as pending_invoices;

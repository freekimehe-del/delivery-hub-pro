-- Create Roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE, -- e.g. "transshipment.cargo.view"
    description TEXT,
    module TEXT, -- e.g. "transshipment"
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Role Permissions Join table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Update user_roles to link to dynamic roles
-- We add role_id, and make it nullable for now to allow migration
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Roles: Visible to authenticated users, manageable by admins
CREATE POLICY "Authenticated users can view roles" ON public.roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin')); -- Note: reliance on old function until migrated

-- Permissions: Visible to authenticated users
CREATE POLICY "Authenticated users can view permissions" ON public.permissions
  FOR SELECT TO authenticated USING (true);
  
CREATE POLICY "Admins can manage permissions" ON public.permissions
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Role Permissions: Visible to authenticated users
CREATE POLICY "Authenticated users can view role permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Create updated_at triggers
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SEED DATA
DO $$
DECLARE
    -- Role IDs
    v_admin_role_id UUID;
    v_transshipment_id UUID;
    v_afghan_id UUID;
    v_clearing_id UUID;
    v_shipping_id UUID;
    v_warehouse_id UUID;
BEGIN
    -- 1. Create Roles
    INSERT INTO public.roles (name, slug, description) VALUES
    ('Administrator', 'super_admin', 'Full access to all modules and system settings.'),
    ('Transshipment Agent', 'transshipment_agent', 'Manages inbound/outbound cargo, cross-docking, and container movement.'),
    ('Afghan Transit Agent', 'afghan_transit_agent', 'Handles Transit Trade cargo, documentation, and border coordination.'),
    ('Clearing Agency', 'clearing_agency', 'Manages customs clearance, Goods Declarations (GD), and duties.'),
    ('Shipping Agency', 'shipping_agency', 'Handles Bill of Lading (BL), vessel schedules, and freight billing.'),
    ('Warehouse Manager', 'warehouse_manager', 'Oversees inventory, storage, picking, packing, and stock audits.')
    ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO v_admin_role_id; -- This only catches the last one if we insert multiple... need separate inserts or select back

    -- Select back IDs to be safe
    SELECT id INTO v_admin_role_id FROM public.roles WHERE slug = 'super_admin';
    SELECT id INTO v_transshipment_id FROM public.roles WHERE slug = 'transshipment_agent';
    SELECT id INTO v_afghan_id FROM public.roles WHERE slug = 'afghan_transit_agent';
    SELECT id INTO v_clearing_id FROM public.roles WHERE slug = 'clearing_agency';
    SELECT id INTO v_shipping_id FROM public.roles WHERE slug = 'shipping_agency';
    SELECT id INTO v_warehouse_id FROM public.roles WHERE slug = 'warehouse_manager';

    -- 2. Create Permissions & Assign to Roles
    
    -- Transshipment Permissions
    INSERT INTO public.permissions (code, module, description) VALUES
    ('transshipment.cargo.view', 'transshipment', 'View cargo details'),
    ('transshipment.cargo.update', 'transshipment', 'Update cargo status'),
    ('transshipment.container.scan', 'transshipment', 'Scan container'),
    ('transshipment.container.verify', 'transshipment', 'Verify container'),
    ('transshipment.cross_docking.manage', 'transshipment', 'Manage cross-docking'),
    ('transshipment.storage.track', 'transshipment', 'Track storage'),
    ('transshipment.status.update', 'transshipment', 'Update status'),
    ('transshipment.reports.view', 'transshipment', 'View reports'),
    ('transshipment.exceptions.raise', 'transshipment', 'Raise exceptions')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_transshipment_id, id FROM public.permissions WHERE module = 'transshipment'
    ON CONFLICT DO NOTHING;

    -- Afghan Transit Permissions
    INSERT INTO public.permissions (code, module, description) VALUES
    ('afghan_transit.files.view', 'afghan_transit', 'View transit files'),
    ('afghan_transit.files.create', 'afghan_transit', 'Create transit files'),
    ('afghan_transit.files.update', 'afghan_transit', 'Update transit files'),
    ('afghan_transit.seals.manage', 'afghan_transit', 'Manage seals'),
    ('afghan_transit.customs.communicate', 'afghan_transit', 'Communicate with customs'),
    ('afghan_transit.alerts.view', 'afghan_transit', 'View alerts'),
    ('afghan_transit.checkpoints.update', 'afghan_transit', 'Update checkpoints'),
    ('afghan_transit.clearance.manage', 'afghan_transit', 'Manage clearance'),
    ('afghan_transit.weighbridge.approve', 'afghan_transit', 'Approve weighbridge')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_afghan_id, id FROM public.permissions WHERE module = 'afghan_transit'
    ON CONFLICT DO NOTHING;

    -- Clearing Agency Permissions
    INSERT INTO public.permissions (code, module, description) VALUES
    ('clearing.docs.view', 'clearing', 'View clearing docs'),
    ('clearing.docs.upload', 'clearing', 'Upload clearing docs'),
    ('clearing.gd.create', 'clearing', 'Create GD'),
    ('clearing.gd.update', 'clearing', 'Update GD'),
    ('clearing.invoices.verify', 'clearing', 'Verify invoices'),
    ('clearing.duties.view', 'clearing', 'View duties'),
    ('clearing.requests.submit', 'clearing', 'Submit requests'),
    ('clearing.status.update', 'clearing', 'Update clearing status'),
    ('clearing.coordination.manage', 'clearing', 'Manage coordination')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_clearing_id, id FROM public.permissions WHERE module = 'clearing'
    ON CONFLICT DO NOTHING;

    -- Shipping Agency Permissions
    INSERT INTO public.permissions (code, module, description) VALUES
    ('shipping.bl.create', 'shipping', 'Create BL'),
    ('shipping.bl.update', 'shipping', 'Update BL'),
    ('shipping.schedules.manage', 'shipping', 'Manage schedules'),
    ('shipping.containers.booking', 'shipping', 'Book containers'),
    ('shipping.containers.release', 'shipping', 'Release containers'),
    ('shipping.freight.invoicing', 'shipping', 'Freight invoicing'),
    ('shipping.communication.manage', 'shipping', 'Manage communication'),
    ('shipping.tracking.update', 'shipping', 'Update tracking')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_shipping_id, id FROM public.permissions WHERE module = 'shipping'
    ON CONFLICT DO NOTHING;

    -- Warehouse Permissions
    INSERT INTO public.permissions (code, module, description) VALUES
    ('warehouse.inventory.view', 'warehouse', 'View inventory'),
    ('warehouse.inventory.update', 'warehouse', 'Update inventory'),
    ('warehouse.shipments.scan', 'warehouse', 'Scan shipments'),
    ('warehouse.storage.track', 'warehouse', 'Track storage'),
    ('warehouse.operations.pick_pack', 'warehouse', 'Pick and pack'),
    ('warehouse.stock.audit', 'warehouse', 'Audit stock'),
    ('warehouse.reports.view', 'warehouse', 'View warehouse reports')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_warehouse_id, id FROM public.permissions WHERE module = 'warehouse'
    ON CONFLICT DO NOTHING;
    
    -- Admin gets ALL permissions (wildcard concept, but explicitly assigning all here for clarity/compliance with strict RBAC)
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT v_admin_role_id, id FROM public.permissions
    ON CONFLICT DO NOTHING;

END $$;

-- Update helper functions to use new tables
-- Function to check if user has a permission slug
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    JOIN public.role_permissions rp ON r.id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id 
    AND (p.code = _permission_code OR r.slug = 'super_admin') -- Admin bypass
  );
$$;

-- Function to check if user has a specific role slug
CREATE OR REPLACE FUNCTION public.has_role_slug(_user_id UUID, _role_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = _user_id 
    AND r.slug = _role_slug
  );
$$;

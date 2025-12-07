-- Migration: create shipment master and related tables
BEGIN;

CREATE TABLE IF NOT EXISTS shipment_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_ref text UNIQUE NOT NULL,
  type text NOT NULL,
  mode text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  origin text,
  destination text,
  transit_points jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS container_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipment_master(id) ON DELETE CASCADE,
  container_number text,
  container_type text,
  seal_number text,
  tare_weight numeric,
  iso_code text,
  condition text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS route_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipment_master(id) ON DELETE CASCADE,
  seq integer,
  mode text,
  from_location text,
  to_location text,
  carrier text,
  vehicle_info jsonb,
  scheduled_start timestamptz,
  scheduled_end timestamptz,
  actual_start timestamptz,
  actual_end timestamptz
);

CREATE TABLE IF NOT EXISTS shipment_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipment_master(id) ON DELETE CASCADE,
  doc_type text,
  reference_number text,
  issue_date date,
  expiry_date date,
  storage_path text,
  verification_status text DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bonded_trucks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_registration text UNIQUE,
  owner text,
  approved boolean DEFAULT false,
  insurance_amount numeric,
  created_at timestamptz DEFAULT now()
);

COMMIT;

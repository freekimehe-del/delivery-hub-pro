-- Create core workflow tables: goods_declaration, duty_payment_transactions, bond_register, transit_monitoring
BEGIN;

CREATE TABLE IF NOT EXISTS goods_declaration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid,
  gd_type text NOT NULL, -- import | transit | final
  status text NOT NULL DEFAULT 'GD_PREPARED',
  hs_codes jsonb,
  declared_value numeric,
  duties jsonb,
  psw_reference text,
  submitted_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS duty_payment_transactions (
  psid text PRIMARY KEY,
  shipment_id uuid,
  amount numeric,
  currency text DEFAULT 'PKR',
  payment_date timestamptz,
  bank_reference text,
  status text DEFAULT 'PENDING',
  reconciliation_status text DEFAULT 'unreconciled',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bond_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid,
  bond_type text,
  amount numeric,
  issuing_bank text,
  validity_start date,
  validity_end date,
  status text DEFAULT 'ACTIVE',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transit_monitoring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid,
  current_location jsonb,
  route jsonb,
  status text DEFAULT 'IN_TRANSIT',
  time_limit_end timestamptz,
  alert_state jsonb,
  gps_history jsonb,
  created_at timestamptz DEFAULT now()
);

COMMIT;

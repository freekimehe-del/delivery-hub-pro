# Logistics System Design: Manifests & Bilty Modules

## 1. Executive Summary
This document outlines the system architecture for the enhanced **Manifests** and **Bilty (Bill of Lading)** modules within the Logistics Management System. The goal is to provide full lifecycle management (CRUD), advanced reporting (PDF/Excel), and robust compliance/audit features.

## 2. Database Schema (Supabase/PostgreSQL)

### 2.1. `logistics_manifests` (Enhanced)
Stores the header information for both Manifests and Bilties.
- `id` (UUID, PK)
- `document_number` (Text, Unique) - e.g., "MAN-2025-001" or "BILTY-KHI-001"
- `type` (Enum): `manifest`, `bilty`
- `status` (Enum): `draft`, `pending`, `approved`, `dispatched`, `completed`, `cancelled`
- `transport_mode` (Enum): `road`, `air`, `maritime`, `rail`
- `origin_location_id` (UUID, FK)
- `destination_location_id` (UUID, FK)
- `consignor_id` (UUID, FK -> CRM)
- `consignee_id` (UUID, FK -> CRM)
- `carrier_id` (UUID, FK -> Fleet/Vendor)
- `driver_id` (UUID, FK -> Fleet)
- `vehicle_id` (UUID, FK -> Fleet)
- `departure_date` (Timestamptz)
- `arrival_date_est` (Timestamptz)
- `total_weight` (Float)
- `total_items` (Int)
- `freight_charges` (Decimal)
- `tax_amount` (Decimal)
- `total_amount` (Decimal)
- `created_by` (UUID, FK)
- `updated_by` (UUID, FK)
- `created_at` (Timestamptz)
- `updated_at` (Timestamptz)

### 2.2. `manifest_items`
Line items for each manifest/bilty.
- `id` (UUID, PK)
- `manifest_id` (UUID, FK)
- `description` (Text)
- `quantity` (Int)
- `weight` (Float)
- `dimensions` (Text)
- `packaging_type` (Text) - e.g., "Carton", "Pallet"
- `remarks` (Text)

### 2.3. `document_attachments`
Stores references to uploaded files.
- `id` (UUID, PK)
- `linked_entity_id` (UUID) - Generic link to manifest_id
- `linked_entity_type` (Text) - "manifest"
- `file_url` (Text)
- `file_type` (Text)
- `uploaded_at` (Timestamptz)

### 2.4. `audit_logs`
Tracks all changes.
- `id` (UUID, PK)
- `entity_table` (Text)
- `entity_id` (UUID)
- `action` (Text) - "CREATE", "UPDATE", "DELETE", "STATUS_CHANGE"
- `old_values` (JSONB)
- `new_values` (JSONB)
- `performed_by` (UUID)
- `performed_at` (Timestamptz)

## 3. Workflow & Status Transitions

`Draft` -> `Pending` (submitted for review) -> `Approved` (locked for editing) -> `Dispatched` (in transit) -> `Completed` (delivered)

*   **Draft**: Editable by Data Entry. No validation required.
*   **Pending**: Validates required fields.
*   **Approved**: Metadata locked. Generates final Document Number if using sequential logic.
*   **Dispatched**: Updates inventory/fleet availability.

## 4. API Structure (Supabase RPC/Edge Functions)

- `GET /rest/v1/logistics_manifests`: List with filters.
- `POST /rest/v1/logistics_manifests`: Create draft.
- `PUT /rest/v1/logistics_manifests?id=eq.{id}`: Update.
- `RPC generate_manifest_pdf({ manifest_id })`: Returns PDF blob/url.
- `RPC clone_manifest({ source_id })`: Creates a copy in 'draft' status.

## 5. UI/UX Structure

### 5.1. List View (`Manifests.tsx`)
- **Table**: Number, Type, Date, Origin, Destination, Status, Actions.
- **Filters**: Date Range, Status, Transport Mode.
- **Search**: By Document #, Customer Name.
- **Export**: PDF (Selected/All), Excel (Selected/All).

### 5.2. Create/Edit View (`CreateManifest.tsx`)
- **Header**: Status Badge, Action Buttons (Save Draft, Submit, Print).
- **Tabs**:
    1.  **General Info**: Auto-gen number, Dates, Locations.
    2.  **Parties**: Consignor, Consignee, Carrier.
    3.  **Cargo Details**: Dynamic list of items (Add/Remove row).
    4.  **Financials**: Freight charges, tax.
    5.  **Attachments**: Upload dropzone.

## 6. Export Features Implementation Plan

### 6.1. PDF Export
- **Library**: `jspdf` + `jspdf-autotable`.
- **Layout**:
    - **Header**: Company Logo (Left), Doc Title (Center), Doc # (Right).
    - **Info Block**: Grid layout for Consignor/Consignee/Transport details.
    - **Table**: Cargo items with totals at bottom.
    - **Footer**: Terms & Conditions, Authorized Signatory space, QR Code (using `qrcode` lib).

### 6.2. Excel Export
- **Library**: `xlsx` (SheetJS).
- **Logic**: Convert `manifest_items` and header data into robust flat array. Multi-sheet support (Sheet 1: Summary, Sheet 2: Items).

## 7. Roles & Permissions (RLS)
- **Admin**: Full Access.
- **Manager**: Approve/Reject, Edit All.
- **Data Entry**: Create, Edit (Draft/Pending only), View All.
- **Viewer**: Read Only.

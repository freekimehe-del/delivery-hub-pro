---
description: End-to-End Logistics Lifecycle Workflow
---
# Logistics Lifecycle Workflow

This workflow outlines the standard operating procedure for managing logistics operations within Delivery Hub Pro, from initial booking to final delivery.

## 1. Booking & Order Entry

### 1.1 Create New Booking
1.  Navigate to **Logistics > Bookings**.
2.  Click **"New Booking"**.
3.  Fill in the detailed booking form:
    -   **Customer**: Select from existing client list.
    -   **Origin/Destination**: Enter specific pickup and delivery locations.
    -   **Mode**: Road / Air / Sea / Rail.
    -   **Cargo Details**: Weight, Dimensions, Type.
4.  **Result**: Booking is created with status "**Draft**" or "**Pending Approval**".

### 1.2 Review & Approve
1.  Navigate to **Logistics > Bookings**.
2.  Locate bookings with status "Pending Approval" (highlighted in yellow).
3.  Click **"View Details"**.
4.  Review rates and capacity.
5.  Click **"Approve"** (or "Reject").
6.  **Result**: Status updates to "**Approved**", ready for planning.

## 2. Planning & Consolidation

### 2.1 AI Route Optimization (Optional)
1.  Navigate to **Logistics > AI Optimizer**.
2.  Select pending orders/bookings.
3.  Click **"Optimize Routes"**.
4.  System suggests the most efficient grouping and path.
5.  Review cost and CO2 savings.

### 2.2 Create Manifest
1.  Navigate to **Logistics > Logistics Manifests**.
2.  Click **"Create Manifest"**.
3.  Select **Transport Mode** (e.g., Road - Trucking).
4.  Add **Bookings** to this manifest.
5.  Assign **Vehicle/Driver** (if own fleet) or **Carrier Details** (if 3PL).
6.  **Result**: A consolidated Manifest/Loading Sheet is generated.

## 3. Execution & Tracking

### 3.1 Dispatch & Transit
1.  Once the vehicle departs, update Manifest/Booking status to "**In Transit**".
2.  Navigate to **Logistics > Live Tracking**.
3.  Search by Booking ID or Vehicle Plate.
4.  View real-time map location and latest events.

### 3.2 Update Status Events
1.  Open the specific **Booking Detail** view.
2.  Add tracking events manually (if no GPS integration):
    -   "Arrived at Pickup"
    -   "Departed Warehouse"
    -   "Customs Cleared"
3.  **Result**: Timeline is updated for the customer tracking portal.

## 4. Completion & Documentation

### 4.1 Proof of Delivery (POD)
1.  Navigate to **Logistics > Proof of Delivery**.
2.  Select the Shipment/Booking.
3.  Upload signed delivery note (image/PDF).
4.  Mark status as "**Delivered**".

### 4.2 Document Generation
1.  Navigate to **Logistics > Bookings**.
2.  Locate the completed booking.
3.  Click **"Export"** > **"Export PDF"**.
4.  Download the official **Booking Confirmation** or **Delivery Note**.
5.  Navigate to **Logistics > Manifests** to download the **Consignment Note (Bilty)**.

## 5. Billing (Finance Integration)

### 5.1 Generate Invoice
1.  Navigate to **Finance > Invoices**.
2.  Click **"Create Invoice"**.
3.  Select the "Job/Booking" ref.
4.  System auto-populates confirmed charges.
5.  Issue Invoice to customer.

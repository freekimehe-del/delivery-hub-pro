---
description: End-to-End Export Lifecycle Workflow
---

This workflow guides you through the complete Export process, from booking cargo space to customs compliance, matching the "Exports" sidebar navigation.

## 1. Export Dashboard
**Goal**: View high-level export statistics, upcoming shipments, and compliance alerts.
- Navigate to: **Exports > Dashboard** (`/exports`)
- Action: Review "Active Exports", "Pending Bookings", and "Gate Pass Requests".

## 2. Export Bookings
**Goal**: Create a Cargo Rolling Order (CRO) / Space Booking.
- Navigate to: **Exports > Export Bookings** (`/exports/bookings`)
- Action: Click **"New Booking"**.
- Input: Carrier, Vessel, ETD, and Container Count.
- Action: Click **"Create Booking"**.
- *Optional*: Use the "Export" button in the Actions column to generate a PDF confirmation.

## 3. Customs Clearance (GD)
**Goal**: File the Goods Declaration (GD) for the distinct export consignment.
- Navigate to: **Exports > Customs Clearance** (`/logistics/customs/new-gd`)
- Action: Fill out the Exporter Details and Consignee.
- Action: Attach or Reference the Booking Number.
- Action: Submit to WeBOC (Simulated).

## 4. Gate Passes & Compliance
**Goal**: Generate the Gate Pass to allow cargo entry into the terminal.
- Navigate to: **Exports > Gate Passes** (`/logistics/customs/compliance`)
- Prerequisite: GD must be filed and "Allowed" (Simulate check status).
- Action: Enter **GD Number**.
- Action: Click **"Check Status"**.
- Action: If status is Allowed, click **"Generate Gate Pass"**.
- Result: A printable PDF Gate Pass with vehicle and driver details.

---
description: End-to-End Fleet Management Workflow
---
# Fleet Management Lifecycle

This workflow outlines the lifecycle of managing vehicles and drivers within the Delivery Hub Pro system, from onboarding to daily operations and maintenance.

## 1. Onboarding & Setup

### 1.1 Register Vehicles
1.  Navigate to **Fleet > Vehicles**.
2.  Click **"Add Vehicle"**.
3.  Enter vehicle details:
    -   **Plate Number**: (e.g., KHI-1234)
    -   **Type**: Truck / Van / Bike
    -   **Capacity**: Weight/Volume
    -   **Initial Status**: Available
4.  **Verify**: Vehicle appears in the list with "Available" status.

### 1.2 Onboard Drivers
1.  Navigate to **Fleet > Drivers**.
2.  Click **"Add Driver"**.
3.  Enter driver details:
    -   **Name**: Full Name
    -   **License Number**: Valid license ID
    -   **Contact**: Phone Number
4.  **Verify**: Driver appears in the list with "Available" status.

## 2. Assignment & Operations

### 2.1 Asset Allocation
1.  When a driver starts a shift or is assigned a permanent vehicle:
2.  Navigate to **Fleet > Drivers**.
3.  Select a driver and click **"Assign Vehicle"**.
4.  Select a vehicle from the "Available" vehicle list (e.g., V-001).
5.  **Result**:
    -   Driver status updates to "Assigned".
    -   Vehicle status updates to "In Use" (or remains "Available" for order assignment depending on logic).

### 2.2 Trip Assignment (Logistics Integration)
*This is typically handled in the **Orders** or **Logistics** module but affects Fleet status.*
1.  Navigate to **Orders**.
2.  Select a "Pending" order and click **"Dispatch"**.
3.  Select an available vehicle (e.g., V-001).
4.  **Result**:
    -   Vehicle status changes to **"In Transit"**.
    -   Driver app (conceptual) receives trip details.

## 3. Monitoring & Maintenance

### 3.1 Live Monitoring
1.  Navigate to **Fleet > Overview** (Dashboard).
2.  View key metrics:
    -   **Total Active Vehicles**: Number of vehicles currently on trips.
    -   **Fuel Efficiency**: Average MPG/KPL.
    -   **Maintenance Alerts**: Immediate attention items.

### 3.2 Fuel Logging
1.  Navigate to **Fleet > Fuel**.
2.  Click **"Log Refuel"**.
3.  Enter:
    -   **Vehicle**: Select Plate #.
    -   **Amount**: Liters/Gallons.
    -   **Cost**: Total cost.
    -   **Odometer**: Current reading.
4.  **Result**: log is saved and calculates into the "Fleet Costs" in the Finance module.

### 3.3 Maintenance Management
1.  **Trigger**: System alert (e.g., "Oil Change Due") or driver report.
2.  Navigate to **Fleet > Maintenance**.
3.  Click **"Schedule Maintenance"**.
4.  Select Vehicle and Service Type (Routine / Repair).
5.  Set Date and Status to "Scheduled".
6.  **Upon Completion**:
    -   Update record to "Completed".
    -   Enter final cost.
    -   Vehicle status returns to "**Available**".

## 4. Reporting

### 4.1 Exporting Reports
1.  Navigate to any Fleet tab (**Vehicles**, **Drivers**, **Fuel**).
2.  Click the **"Export"** button (top right).
3.  Select **"Export as PDF"** or **"Export as Excel"**.
4.  **Verification**: Downloaded file contains the currently filtered list of assets/logs.

### 4.2 Financial Analysis
1.  Navigate to **Finance > Fleet Costs**.
2.  Review aggregated costs for Fuel, Maintenance, and Driver Settlements.

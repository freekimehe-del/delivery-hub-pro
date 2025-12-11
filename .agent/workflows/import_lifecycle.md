---
description: End-to-End Import Lifecycle Workflow
---

This workflow guides you through the complete Import process, from initial Indent to final Landed Costing, matching the "Imports" sidebar navigation.

## 1. Import Dashboard
**Goal**: View high-level import statistics and pending tasks.
- Navigate to: **Imports > Dashboard** (`/imports`)
- Action: Review "Pending Indents", "Shipments in Default", and "Duties Payable".

## 2. Purchase Indents
**Goal**: Create a new purchase order (Indent) for international goods.
- Navigate to: **Imports > Purchase Indents** (`/imports/indents`)
- Action: Click **"New Indent"**.
- Input: Supplier Name, Origin, Items, and Value.
- Action: Click **"Create Indent"**.
- *Optional*: Use the "Export" button to generate a PDF copy of the indent.

## 3. Weboc GD Filing
**Goal**: File the Goods Declaration (GD) with Customs (WeBOC).
- Navigate to: **Imports > Weboc GD Filing** (`/logistics/customs/new-gd`)
- Action: Enter the **BL Number** (Bill of Lading).
- Action: Click **"Auto-Fill"** to load data from OCR or verify manually.
- Action: Click **"Submit Filing"**.

## 4. Duty Payments
**Goal**: Calculate and record customs duty payments.
- Navigate to: **Imports > Duty Payments** (`/logistics/customs/calculator`)
- Action: Select the **HS Code** for your items (e.g., `8703.2113`).
- Action: Enter the **Assessed Value**.
- Action: Click **"Calculate Duties"**.
- Review: See breakdown of Customs Duty (CD), Additional Customs Duty (ACD), Sales Tax (ST), and Withholding Tax (WHT).

## 5. Landed Costing
**Goal**: Calculate the final cost per unit including all duties and freight.
- Navigate to: **Imports > Landed Costing** (`/finance/landed-cost`)
- Action: Select the **Clearance Job** (GD Number) created in Step 3.
- Action: Add **Freight Charges**, **Insurance**, and **Port Charges**.
- Action: Click **"Calculate & Apportion"**.
- Result: View the final "Per Unit Cost" in PKR.
- Action: Click **"Save Final Costing"**.

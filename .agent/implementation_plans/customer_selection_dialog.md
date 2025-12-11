# Implementation Plan - Customer Selection Dialog

## Goal
Replace the simple dropdown in "New Booking" with a robust **Customer Selection Dialog**. This dialog allows users to search, filter, and select a customer from a detailed list, improving the workflow for finding specific clients in a large database.

## User Review Required
> [!NOTE]
> This change replaces the native `<Select>` dropdown with a modal. The user usage flow will change: Click "Select Customer" -> Search -> Select -> Confirm.

## Proposed Changes

### [New Component] `src/components/logistics/bookings/CustomerSelectionDialog.tsx`
*   **UI**: `Dialog` from `shadcn/ui`.
*   **State**:
    *   `searchTerm`: string (for name/code/city).
    *   `filterType`: string ('all', 'individual', 'corporate').
    *   `selectedCustomerId`: string | null.
*   **Data**: Fetches `customers` from Supabase.
*   **Columns**: Name, Code (if available, else generated/mock), Phone, Email, City, Type.
*   **Interaction**:
    *   Click row to select.
    *   Double click row to select & close.
    *   "Confirm Selection" button.

### [Modify] `src/pages/logistics/CreateBooking.tsx`
*   Update "Shipment Details" card.
*   Replace `Select` with a custom input group:
    *   `Input` (readonly, displays selected customer name)
    *   `Button` (icon: Search/User) opens the Dialog.
*   Preserve existing `formData` logic, just update `customer_id` via the dialog callback.

## Verification Plan

### Manual Verification
1.  **Open "New Booking"**: Verify "Select Customer" input is read-only and empty.
2.  **Open Dialog**: Click the button. Verify modal opens.
3.  **Search**: Type a name. Verify list filters.
4.  **Select**: Click a row. Verify highlighting. Click "Select".
5.  **Result**: Modal closes, main form shows Customer Name, `customer_id` is set in state.
6.  **Submit**: Verify booking is created with correct `customer_id`.

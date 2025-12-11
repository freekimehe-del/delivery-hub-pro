# Task: Fix Booking UUID Error & Refine Resource Allocation
Status: Completed


## Context
The user encountered an "invalid input syntax for type uuid: """ error when saving a booking. This is caused by sending empty strings (`""`) to Supabase for optional UUID fields (like `driver_id`, `vehicle_id`) instead of `null`.

## Steps

1.  **Sanitize Payload in `CreateBooking.tsx`**:
    *   Modify the `handleSubmit` function.
    *   Create a helper or manual check to convert empty strings for `customer_id`, `driver_id`, `vehicle_id`, and `carrier_id` to `null` before sending to Supabase.
    *   Ensure `customer_id` is treated as required (or handle if optional, but usually required).

2.  **Verify State Initialization**:
    *   Ensure `formData` state actually includes `driver_id`, `vehicle_id`, `vessel_name`, etc., initializers to avoid "uncontrolled to controlled" warnings, although `undefined` usually works for Shadcn Select, it's safer to have defaults.

3.  **Review Create Manifest**:
    *   Check if similar issues exist in `CreateManifest.tsx` as the user has that file open and it shares similar logic. (Optional, but good practice).

4.  **Confirm**:
    *   User should be able to save a booking without selecting a driver (optional field) or after selecting one.

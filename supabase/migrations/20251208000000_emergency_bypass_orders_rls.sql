-- TEMPORARY FIX: Remove ALL RLS restrictions for order creation
-- This allows order creation without authentication
-- WARNING: Only use this for development/testing

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins and dispatchers can create orders" ON public.orders;

-- Create a completely permissive INSERT policy (development only)
CREATE POLICY "Allow all order inserts during development" ON public.orders
  FOR INSERT
  WITH CHECK (true);

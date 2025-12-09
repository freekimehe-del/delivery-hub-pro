-- Fix: Allow authenticated users to create orders
-- This migration adds a permissive RLS policy for order creation

-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Admins and dispatchers can create orders" ON public.orders;

-- Create a new policy that allows any authenticated user to create orders
CREATE POLICY "Authenticated users can create orders" ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

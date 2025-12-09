-- Fix RLS for drivers and vehicles tables
-- This allows creating drivers and vehicles without authentication

-- Disable RLS on drivers table
ALTER TABLE public.drivers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on vehicles table  
ALTER TABLE public.vehicles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles table (needed for driver creation)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'drivers', 'vehicles', 'profiles');

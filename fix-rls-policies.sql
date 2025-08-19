-- Fix RLS policies to allow designer registration
-- This script adds missing INSERT policy for nail_designers table

-- Add policy to allow anyone to create a new designer account
CREATE POLICY "Anyone can create designer account" ON public.nail_designers FOR INSERT WITH CHECK (true);

-- Optional: Add policy to allow anyone to view designer profiles (for booking purposes)
CREATE POLICY "Anyone can view designer profiles" ON public.nail_designers FOR SELECT USING (true);

-- Note: The existing policies for UPDATE are kept as they are (designers can only update their own profile)
-- This ensures security while allowing new registrations and public viewing for booking purposes
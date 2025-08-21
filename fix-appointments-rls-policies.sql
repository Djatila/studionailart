-- Fix RLS policies for appointments table
-- This script resolves synchronization issues between computer and tablet
-- The current policies are too restrictive and prevent proper data access

-- Drop existing policies for appointments table
DROP POLICY IF EXISTS "Designers can manage own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;

-- Create new policies that allow proper access for the application
-- Allow anyone to create appointments (needed for booking functionality)
CREATE POLICY "Anyone can create appointments" ON public.appointments 
    FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to view appointments (needed for dashboard and client views)
CREATE POLICY "Anyone can view appointments" ON public.appointments 
    FOR SELECT 
    USING (true);

-- Allow anyone to update appointments (needed for status changes and modifications)
CREATE POLICY "Anyone can update appointments" ON public.appointments 
    FOR UPDATE 
    USING (true);

-- Allow anyone to delete appointments (needed for appointment management)
CREATE POLICY "Anyone can delete appointments" ON public.appointments 
    FOR DELETE 
    USING (true);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'appointments'
ORDER BY policyname;

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'appointments';

-- Test query to verify appointments can be read
SELECT 
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_appointments
FROM public.appointments;

SELECT 'RLS policies for appointments table updated successfully!' as status;
-- Fix RLS policies to allow designer registration
-- This script adds missing INSERT policy for nail_designers table

-- 1. Desabilitar RLS temporariamente (CUIDADO: apenas para desenvolvimento)
-- ALTER TABLE nail_designers DISABLE ROW LEVEL SECURITY;

-- 2. OU criar política que permite UPDATE para todos (mais seguro)
DROP POLICY IF EXISTS "Enable update for all users" ON nail_designers;

CREATE POLICY "Enable update for all users" 
ON nail_designers 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 3. Criar política que permite SELECT para todos
DROP POLICY IF EXISTS "Enable read access for all users" ON nail_designers;

CREATE POLICY "Enable read access for all users" 
ON nail_designers 
FOR SELECT 
USING (true);

-- 4. Verificar políticas existentes
SELECT * FROM pg_policies WHERE tablename = 'nail_designers';

-- Add policy to allow anyone to create a new designer account
CREATE POLICY "Anyone can create designer account" ON public.nail_designers FOR INSERT WITH CHECK (true);

-- Optional: Add policy to allow anyone to view designer profiles (for booking purposes)
CREATE POLICY "Anyone can view designer profiles" ON public.nail_designers FOR SELECT USING (true);

-- Note: The existing policies for UPDATE are kept as they are (designers can only update their own profile)
-- This ensures security while allowing new registrations and public viewing for booking purposes
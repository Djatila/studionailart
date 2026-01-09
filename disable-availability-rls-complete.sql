-- Script para desabilitar completamente RLS na tabela availability
-- Isso resolve o erro 401 Unauthorized e 42501 (violação de política RLS)

-- 1. Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'availability'
ORDER BY policyname;

-- 2. Remover todas as políticas existentes da tabela availability
DROP POLICY IF EXISTS "Designers can manage own availability" ON public.availability;
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
DROP POLICY IF EXISTS "Anyone can create availability" ON public.availability;
DROP POLICY IF EXISTS "Anyone can update availability" ON public.availability;
DROP POLICY IF EXISTS "Anyone can delete availability" ON public.availability;
DROP POLICY IF EXISTS "Allow all operations on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow INSERT on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow SELECT on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow UPDATE on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow DELETE on availability" ON public.availability;

-- 3. Desabilitar RLS completamente na tabela availability
ALTER TABLE public.availability DISABLE ROW LEVEL SECURITY;

-- 4. Garantir que a tabela seja acessível publicamente
GRANT ALL ON public.availability TO anon;
GRANT ALL ON public.availability TO authenticated;
GRANT ALL ON public.availability TO service_role;

-- 5. Verificar o status final
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'availability';

-- 6. Verificar políticas restantes (deve retornar vazio)
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'availability';

-- 7. Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'availability'
ORDER BY grantee, privilege_type;

SELECT 'RLS desabilitado com sucesso para a tabela availability!' as status;
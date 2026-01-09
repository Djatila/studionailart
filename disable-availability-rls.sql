-- Script para desabilitar completamente RLS na tabela availability
-- Isso resolve o erro 401 Unauthorized e 42501 (violação de política RLS)

-- 1. Remover todas as políticas existentes da tabela availability
DROP POLICY IF EXISTS "Designers can manage own availability" ON public.availability;
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;
DROP POLICY IF EXISTS "Allow all operations on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow INSERT on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow SELECT on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow UPDATE on availability" ON public.availability;
DROP POLICY IF EXISTS "Allow DELETE on availability" ON public.availability;

-- 2. Desabilitar RLS completamente na tabela availability
ALTER TABLE public.availability DISABLE ROW LEVEL SECURITY;

-- 3. Garantir que a tabela seja acessível publicamente
GRANT ALL ON public.availability TO anon;
GRANT ALL ON public.availability TO authenticated;
GRANT ALL ON public.availability TO service_role;

-- 4. Verificar o status final
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'availability';

-- 5. Verificar políticas restantes (deve retornar vazio)
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'availability';

SELECT 'RLS desabilitado com sucesso para a tabela availability!' as status;
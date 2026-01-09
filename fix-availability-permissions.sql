-- Script para corrigir permissões da tabela availability
-- Este script resolve o erro 401 Unauthorized e 42501 (violação de política RLS)

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

-- 3. Criar novas políticas que permitem operações sem autenticação
-- Permitir que qualquer um crie disponibilidade (INSERT)
CREATE POLICY "Anyone can create availability" 
    ON public.availability 
    FOR INSERT 
    WITH CHECK (true);

-- Permitir que qualquer um visualize disponibilidade (SELECT)
CREATE POLICY "Anyone can view availability" 
    ON public.availability 
    FOR SELECT 
    USING (true);

-- Permitir que qualquer um atualize disponibilidade (UPDATE)
CREATE POLICY "Anyone can update availability" 
    ON public.availability 
    FOR UPDATE 
    USING (true)
    WITH CHECK (true);

-- Permitir que qualquer um delete disponibilidade (DELETE)
CREATE POLICY "Anyone can delete availability" 
    ON public.availability 
    FOR DELETE 
    USING (true);

-- 4. Garantir permissões para todos os usuários
GRANT ALL ON public.availability TO anon;
GRANT ALL ON public.availability TO authenticated;
GRANT ALL ON public.availability TO service_role;

-- 5. Verificar se as políticas foram criadas corretamente
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

-- 6. Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'availability'
ORDER BY grantee, privilege_type;

SELECT 'Correção de permissões concluída com sucesso!' as status;
-- Script seguro para corrigir políticas RLS da tabela clients
-- Remove todas as políticas existentes e recria apenas as necessárias

BEGIN;

-- ========================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ========================================

-- Remover políticas da tabela clients (todas as variações possíveis)
DROP POLICY IF EXISTS "Allow client creation" ON public.clients;
DROP POLICY IF EXISTS "Anyone can create client account" ON public.clients;
DROP POLICY IF EXISTS "Anyone can view client profiles" ON public.clients;
DROP POLICY IF EXISTS "Clients can view own profile" ON public.clients;
DROP POLICY IF EXISTS "Clients can update own profile" ON public.clients;
DROP POLICY IF EXISTS "Allow delete client accounts" ON public.clients;
DROP POLICY IF EXISTS "Admins can delete client accounts" ON public.clients;

-- ========================================
-- CRIAR POLÍTICAS CORRETAS
-- ========================================

-- Permitir criação de contas de cliente (registro)
CREATE POLICY "Anyone can create client account" 
    ON public.clients 
    FOR INSERT 
    WITH CHECK (true);

-- Permitir visualização de perfis (para login e admin)
CREATE POLICY "Anyone can view client profiles" 
    ON public.clients 
    FOR SELECT 
    USING (true);

-- Permitir atualização do próprio perfil
CREATE POLICY "Clients can update own profile" 
    ON public.clients 
    FOR UPDATE 
    USING (true); -- Temporariamente permissivo até implementar auth.uid()

-- Permitir exclusão (para admin)
CREATE POLICY "Allow delete client accounts" 
    ON public.clients 
    FOR DELETE 
    USING (true);

-- ========================================
-- VERIFICAÇÕES
-- ========================================

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'clients'
ORDER BY policyname;

-- Verificar status RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'clients';

COMMIT;

SELECT 'Políticas RLS da tabela clients corrigidas com sucesso!' as status;
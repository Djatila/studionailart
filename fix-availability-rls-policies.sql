-- Script para corrigir políticas RLS da tabela availability
-- O problema é que a política atual exige autenticação (auth.uid()) mas nossa app não usa auth

-- Remover políticas existentes da tabela availability
DROP POLICY IF EXISTS "Designers can manage own availability" ON public.availability;
DROP POLICY IF EXISTS "Anyone can view availability" ON public.availability;

-- Criar novas políticas que permitem operações sem autenticação
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
    USING (true);

-- Permitir que qualquer um delete disponibilidade (DELETE)
CREATE POLICY "Anyone can delete availability" 
    ON public.availability 
    FOR DELETE 
    USING (true);

-- Verificar se as políticas foram criadas
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
-- Script SQL para adicionar a coluna 'category' à tabela services
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna category à tabela services
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'services';

-- Adicionar coluna description à tabela services
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.services.category IS 'Categoria do serviço: services (serviços regulares) ou extras (serviços extras)';

-- Adicionar constraint para garantir valores válidos
ALTER TABLE public.services 
ADD CONSTRAINT check_category_values 
CHECK (category IN ('services', 'extras'));

-- Verificar se a coluna foi adicionada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
AND column_name = 'category';

-- Mostrar estrutura completa da tabela services
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'services' 
ORDER BY ordinal_position;
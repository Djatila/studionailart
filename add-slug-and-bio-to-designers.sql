-- Adicionar campos slug, bio e photo_url à tabela nail_designers
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar coluna slug (link personalizado)
ALTER TABLE nail_designers 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Adicionar coluna bio (biografia da designer)
ALTER TABLE nail_designers 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Adicionar coluna photo_url (URL da foto da designer)
ALTER TABLE nail_designers 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 4. Criar índice no slug para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_nail_designers_slug ON nail_designers(slug);

-- 5. Gerar slugs automaticamente para designers existentes (baseado no nome)
UPDATE nail_designers 
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;

-- 6. Comentários nas colunas para documentação
COMMENT ON COLUMN nail_designers.slug IS 'URL slug único para link personalizado (ex: klivia-azevedo)';
COMMENT ON COLUMN nail_designers.bio IS 'Biografia/descrição da designer exibida na página de agendamento';
COMMENT ON COLUMN nail_designers.photo_url IS 'URL da foto de perfil da designer';

-- Verificar resultado
SELECT id, name, slug, bio, photo_url FROM nail_designers;

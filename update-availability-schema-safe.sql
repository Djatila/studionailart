-- Script SQL seguro para atualizar a tabela availability
-- Verifica se a coluna existe antes de tentar adicioná-la

-- Adicionar coluna specific_date apenas se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'availability' 
        AND column_name = 'specific_date'
    ) THEN
        ALTER TABLE availability ADD COLUMN specific_date DATE;
    END IF;
END $$;

-- Tornar a coluna day_of_week opcional (permitir NULL)
ALTER TABLE availability ALTER COLUMN day_of_week DROP NOT NULL;

-- Verificar se as alterações foram aplicadas
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'availability' 
AND column_name IN ('specific_date', 'day_of_week')
ORDER BY column_name;
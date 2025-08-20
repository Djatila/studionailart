-- Adicionar coluna specific_date à tabela availability
ALTER TABLE public.availability 
ADD COLUMN IF NOT EXISTS specific_date DATE;

-- Tornar day_of_week opcional (nullable)
ALTER TABLE public.availability 
ALTER COLUMN day_of_week DROP NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.availability.specific_date IS 'Data específica para disponibilidade (usado para datas específicas ao invés de dias da semana recorrentes)';
COMMENT ON COLUMN public.availability.day_of_week IS 'Dia da semana (0=Domingo, 6=Sábado) - opcional quando specific_date é usado';
-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_schedule_whatsapp_reminder ON appointments;
DROP TRIGGER IF EXISTS trigger_whatsapp_reminders_v2 ON appointments;

-- Criar função para agendar lembretes automáticos
CREATE OR REPLACE FUNCTION schedule_whatsapp_reminder()
RETURNS TRIGGER AS $$
BEGIN
  -- Agendar lembrete para 24h antes do agendamento
  INSERT INTO whatsapp_logs (
    phone,
    message_type,
    status,
    template_parameters,
    scheduled_for
  ) VALUES (
    NEW.client_phone,
    'reminder_24h',
    'scheduled',
    jsonb_build_object(
      'client_name', NEW.client_name,
      'service', NEW.service,
      'date', NEW.date,
      'time', NEW.time,
      'designer_name', (
        SELECT name FROM nail_designers WHERE id = NEW.designer_id
      )
    ),
    (NEW.date || ' ' || NEW.time)::timestamp - INTERVAL '24 hours'
  );
  
  -- Agendar lembrete para 6h antes do agendamento
  INSERT INTO whatsapp_logs (
    phone,
    message_type,
    status,
    template_parameters,
    scheduled_for
  ) VALUES (
    NEW.client_phone,
    'reminder_6h',
    'scheduled',
    jsonb_build_object(
      'client_name', NEW.client_name,
      'service', NEW.service,
      'date', NEW.date,
      'time', NEW.time,
      'designer_name', (
        SELECT name FROM nail_designers WHERE id = NEW.designer_id
      )
    ),
    (NEW.date || ' ' || NEW.time)::timestamp - INTERVAL '6 hours'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger com nome novo
CREATE TRIGGER trigger_whatsapp_reminders_v2
  AFTER INSERT ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION schedule_whatsapp_reminder();

-- Adicionar coluna scheduled_for na tabela whatsapp_logs se não existir
ALTER TABLE whatsapp_logs 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;
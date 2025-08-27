-- Tabela para logs de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('confirmation', 'reminder_24h', 'reminder_2h', 'cancellation')) NOT NULL,
  message_id TEXT, -- ID retornado pela Meta API
  template_name TEXT,
  template_parameters JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  delivery_status TEXT CHECK (delivery_status IN ('sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  error_code TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de configurações do WhatsApp Business
CREATE TABLE IF NOT EXISTS whatsapp_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_account_id TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  webhook_verify_token TEXT NOT NULL,
  webhook_url TEXT,
  api_version TEXT DEFAULT 'v18.0',
  active BOOLEAN DEFAULT true,
  test_mode BOOLEAN DEFAULT true,
  daily_limit INTEGER DEFAULT 1000,
  monthly_limit INTEGER DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para templates aprovados pela Meta
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT CHECK (category IN ('MARKETING', 'UTILITY', 'AUTHENTICATION')) NOT NULL,
  language TEXT DEFAULT 'pt_BR',
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  template_body TEXT NOT NULL,
  parameters_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Adicionar colunas aos appointments para controle de lembretes
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_24h_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reminder_2h_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS whatsapp_reminder_status TEXT DEFAULT 'pending' CHECK (whatsapp_reminder_status IN ('pending', 'sent', 'failed', 'disabled'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_appointment_id ON whatsapp_logs(appointment_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_phone ON whatsapp_logs(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_message_type ON whatsapp_logs(message_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_status ON whatsapp_logs(status);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_status ON appointments(whatsapp_reminder_status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(date, status);

-- Inserir templates padrão (serão aprovados pela Meta)
INSERT INTO whatsapp_templates (name, category, template_body, parameters_count) VALUES
('appointment_confirmation', 'UTILITY', '🌸 Olá {{1}}! Seu agendamento foi confirmado para {{2}} às {{3}} com {{4}}. Nos vemos em breve! 💖', 4),
('appointment_reminder_24h', 'UTILITY', '⏰ Oi {{1}}! Lembrando que você tem agendamento amanhã {{2}} às {{3}} com {{4}}. Até lá! ✨', 4),
('appointment_reminder_2h', 'UTILITY', '🚨 {{1}}, seu agendamento é hoje às {{2}} com {{3}}! Em 2 horas. Te aguardo! 💖', 3),
('appointment_cancellation', 'UTILITY', '🔴 Olá {{1}}! Seu agendamento do dia {{2}} às {{3}} foi cancelado. Obrigada!', 3)
ON CONFLICT (name) DO NOTHING;

-- Configuração inicial (será preenchida via interface)
INSERT INTO whatsapp_config (business_account_id, phone_number_id, access_token, webhook_verify_token, test_mode) 
VALUES ('BUSINESS_ID_PLACEHOLDER', 'PHONE_ID_PLACEHOLDER', 'ACCESS_TOKEN_PLACEHOLDER', 'WEBHOOK_TOKEN_PLACEHOLDER', true)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_logs_updated_at BEFORE UPDATE ON whatsapp_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_whatsapp_config_updated_at BEFORE UPDATE ON whatsapp_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
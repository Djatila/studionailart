-- Executar lembretes a cada 30 minutos
SELECT cron.schedule(
  'whatsapp-reminders-30min',
  '*/30 * * * *', -- A cada 30 minutos
  $$
  SELECT net.http_post(
    url := 'https://vhvxjiorcggilujjtdbr.supabase.co/functions/v1/meta-whatsapp',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'
  );
  $$
);

-- Executar limpeza de logs antigos diariamente às 2h
SELECT cron.schedule(
  'whatsapp-logs-cleanup',
  '0 2 * * *', -- Todo dia às 2h
  $$
  DELETE FROM whatsapp_logs 
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND status IN ('sent', 'delivered', 'read');
  $$
);

-- Verificar configuração ativa diariamente
SELECT cron.schedule(
  'whatsapp-config-check',
  '0 8 * * *', -- Todo dia às 8h
  $$
  INSERT INTO whatsapp_logs (phone, message_type, status, template_parameters)
  SELECT 
    'SYSTEM',
    'system_check',
    CASE WHEN COUNT(*) > 0 THEN 'active' ELSE 'inactive' END,
    jsonb_build_object('active_configs', COUNT(*))
  FROM whatsapp_config 
  WHERE active = true;
  $$
);
import { supabase } from '../lib/supabase';

// Função para lidar com webhooks do n8n
export const handleN8nWebhook = async (req: Request, res: Response) => {
  try {
    const { type, data } = req.body;
    
    switch (type) {
      case 'appointment_created':
        // Processar novo agendamento
        await processNewAppointment(data);
        break;
        
      case 'reminder_24h':
        // Processar lembrete de 24h
        await process24hReminder(data);
        break;
        
      case 'reminder_6h':
        // Processar lembrete de 6h
        await process6hReminder(data);
        break;
        
      default:
        console.log('Tipo de webhook desconhecido:', type);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Função para processar novo agendamento
const processNewAppointment = async (appointmentData: any) => {
  console.log('Processando novo agendamento:', appointmentData);
  
  // Aqui você pode adicionar lógica para:
  // 1. Enviar notificação imediata para a cliente
  // 2. Enviar notificação imediata para a nail designer
  // 3. Agendar lembretes para 24h e 6h antes
  
  // Exemplo de envio de notificação
  await sendWhatsAppNotification(
    appointmentData.client_phone,
    `Olá ${appointmentData.client_name}! Seu agendamento foi confirmado:\n\n` +
    `Serviço: ${appointmentData.service}\n` +
    `Data: ${new Date(appointmentData.date).toLocaleDateString('pt-BR')}\n` +
    `Hora: ${appointmentData.time}\n` +
    `Valor: R$ ${appointmentData.price.toFixed(2)}\n\n` +
    `Nos vemos em breve! 💅✨`
  );
  
  // Enviar notificação para a designer também
  // (Você precisará obter o número da designer)
};

// Funções para processar lembretes
const process24hReminder = async (appointmentData: any) => {
  console.log('Enviando lembrete de 24h:', appointmentData);
  
  await sendWhatsAppNotification(
    appointmentData.client_phone,
    `Lembrete: Seu agendamento é amanhã às ${appointmentData.time}!\n\n` +
    `Serviço: ${appointmentData.service}\n` +
    `Valor: R$ ${appointmentData.price.toFixed(2)}\n\n` +
    `Estamos ansiosos para te ver! 💅✨`
  );
};

const process6hReminder = async (appointmentData: any) => {
  console.log('Enviando lembrete de 6h:', appointmentData);
  
  await sendWhatsAppNotification(
    appointmentData.client_phone,
    `Lembrete: Seu agendamento é hoje às ${appointmentData.time}!\n\n` +
    `Serviço: ${appointmentData.service}\n` +
    `Valor: R$ ${appointmentData.price.toFixed(2)}\n\n` +
    `Prepare-se para um momento especial! 💅✨`
  );
};

// Função para enviar notificação via WhatsApp (exemplo)
const sendWhatsAppNotification = async (to: string, message: string) => {
  // Esta função seria integrada com o UAZAPI
  console.log(`Enviando mensagem para ${to}: ${message}`);
  
  // Exemplo de chamada para UAZAPI (você precisará ajustar conforme a documentação)
  /*
  const response = await fetch('https://api.uazapi.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.UAZAPI_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      to: to.replace(/\D/g, ''), // Remover caracteres não numéricos
      type: 'text',
      text: {
        body: message
      }
    })
  });
  
  const result = await response.json();
  console.log('Resultado do envio:', result);
  return result;
  */
};
// Serviço para processar notificações e fila de reprocessamento
export class NotificationService {
  private static instance: NotificationService;
  private processingInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Iniciar processamento da fila
  startQueueProcessing() {
    if (this.processingInterval) {
      console.log('🔄 Processamento da fila já está em execução');
      return;
    }

    console.log('🚀 Iniciando processamento da fila de notificações');
    this.processingInterval = setInterval(() => {
      this.processNotificationQueue();
    }, 30000); // Processar a cada 30 segundos
  }

  // Parar processamento da fila
  stopQueueProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('⏹️ Processamento da fila parado');
    }
  }

  // Processar fila de notificações
  private async processNotificationQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('notification_queue') || '[]');
      
      if (queue.length === 0) {
        return;
      }

      console.log(`🔄 Processando fila de notificações: ${queue.length} itens`);

      // Processar cada item da fila
      const updatedQueue = [];
      for (const item of queue) {
        try {
          // Tentar reenviar
          const result = await this.sendToN8nWebhook(item.data);
          
          if (result) {
            console.log(`✅ Item reprocessado com sucesso: ${item.id}`);
          } else {
            // Incrementar tentativas
            item.retries = (item.retries || 0) + 1;
            
            // Se exceder 5 tentativas, mover para fila de falhas permanentes
            if (item.retries >= 5) {
              await this.moveToFailedQueue(item);
            } else {
              updatedQueue.push(item);
            }
          }
        } catch (error) {
          console.error(`❌ Erro ao reprocessar item ${item.id}:`, error);
          item.retries = (item.retries || 0) + 1;
          
          if (item.retries >= 5) {
            await this.moveToFailedQueue(item);
          } else {
            updatedQueue.push(item);
          }
        }
      }

      // Atualizar fila
      localStorage.setItem('notification_queue', JSON.stringify(updatedQueue));
      
      if (updatedQueue.length > 0) {
        console.log(`📋 ${updatedQueue.length} itens mantidos na fila para nova tentativa`);
      }
    } catch (error) {
      console.error('❌ Erro ao processar fila de notificações:', error);
    }
  }

  // Mover item para fila de falhas permanentes
  private async moveToFailedQueue(item: any) {
    try {
      const failedQueue = JSON.parse(localStorage.getItem('failed_notification_queue') || '[]');
      failedQueue.push(item);
      localStorage.setItem('failed_notification_queue', JSON.stringify(failedQueue));
      console.log(`🗑️ Item movido para fila de falhas permanentes: ${item.id}`);
    } catch (error) {
      console.error(`❌ Erro ao mover item para fila de falhas: ${item.id}`, error);
    }
  }

  // Enviar dados para webhook do n8n
  private async sendToN8nWebhook(data: any) {
    try {
      // URL do webhook do n8n (você precisará configurar isso)
      // 🆕 NOVO: Usar variável de ambiente ou URL padrão
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || '/webhook/3a2f1b4c-5d6e-7f8g-9h0i-jk1l2m3n4o5p';
      // 🆕 Garante que usamos o proxy do Vite para desenvolvimento local, ou a URL completa se fornecida
      const url = webhookUrl.startsWith('http')
        ? webhookUrl
        : `/webhook${webhookUrl.split('/webhook')[1] || ''}`;

      // 🆕 Basic Auth (se o n8n estiver protegido)
      const username = import.meta.env.VITE_N8N_USERNAME || '';
      const password = import.meta.env.VITE_N8N_PASSWORD || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (username && password) {
        const credentials = btoa(`${username}:${password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`n8n respondeu com status ${response.status}. Corpo:`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Ler resposta de forma segura (JSON ou texto)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        await response.json();
      } else {
        await response.text();
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar para n8n:', error);
      throw error;
    }
  }

  // Limpar filas (para manutenção)
  clearQueues() {
    localStorage.removeItem('notification_queue');
    localStorage.removeItem('failed_notification_queue');
    console.log('🧹 Filas de notificação limpas');
  }

  // Obter estatísticas das filas
  getQueueStats() {
    try {
      const queue = JSON.parse(localStorage.getItem('notification_queue') || '[]');
      const failedQueue = JSON.parse(localStorage.getItem('failed_notification_queue') || '[]');
      
      return {
        pending: queue.length,
        failed: failedQueue.length
      };
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas das filas:', error);
      return {
        pending: 0,
        failed: 0
      };
    }
  }
}

// Exportar instância singleton
export const notificationService = NotificationService.getInstance();
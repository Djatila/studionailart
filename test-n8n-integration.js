// Script para testar a integração com n8n
// Execute com: node test-n8n-integration.js

// Substitua pela URL real do seu webhook n8n (Production URL)
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5679/webhook/3a2f1b4c-5d6e-7f8g-9h0i-jk1l2m3n4o5p';

// 🆕 Adicione credenciais Basic Auth (mesmos valores definidos nas credenciais do Webhook)
const N8N_USERNAME = process.env.N8N_USERNAME || 'seu_usuario_aqui';
const N8N_PASSWORD = process.env.N8N_PASSWORD || 'sua_senha_aqui';
const BASIC_TOKEN = Buffer.from(`${N8N_USERNAME}:${N8N_PASSWORD}`).toString('base64');

// 🆕 Payload de teste compatível com o workflow
const testData = {
  type: 'appointment_created',
  appointment: {
    id: 'test-123',
    client_name: 'Maria Silva',
    client_phone: '+5511999999999', // o workflow normaliza com replace(/\D/g, '')
    service: 'Manicure Completa',
    date: '2025-09-25',
    time: '14:00',
    price: 80.0
  },
  designer_phone: '+5511988888888',
  message: 'Novo agendamento criado para Maria Silva às 14:00.\nServiço: Manicure Completa\nValor: R$ 80,00'
};

async function testN8nIntegration() {
  console.log('🧪 Testando integração com n8n...');
  console.log('🌐 URL do Webhook:', N8N_WEBHOOK_URL);
  
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 🆕 Header de autenticação Basic
        'Authorization': `Basic ${BASIC_TOKEN}`,
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📝 Status Text:', response.statusText);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Sucesso! Resposta:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Erro na requisição:');
      console.log('   Status:', response.status);
      console.log('   Status Text:', response.statusText);
      
      try {
        const errorText = await response.text();
        console.log('   Detalhes:', errorText);
      } catch (e) {
        console.log('   Não foi possível ler os detalhes do erro');
      }
    }
  } catch (error) {
    console.log('💥 Erro ao conectar com n8n:');
    console.log('   Mensagem:', error.message);
    
    if (error.cause) {
      console.log('   Causa:', error.cause);
    }
  }
}

// Executar o teste
testN8nIntegration();
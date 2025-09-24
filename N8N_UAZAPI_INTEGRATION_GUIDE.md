# Guia de Integração n8n com UAZAPI para Notificações do Studio Nail

Este guia detalha como configurar o n8n para integrar com a API do UAZAPI e enviar notificações de agendamento para clientes e designers.

## 1. Pré-requisitos

Antes de começar, você precisará de:

1. Uma conta no [n8n](https://n8n.io/)
2. Uma conta e API Key no [UAZAPI](https://uazapi.com/)
3. O workflow `studio-nail-notifications.json` que já está no seu projeto

## 2. Configuração do UAZAPI

### 2.1. Obter sua API Key

1. Acesse o painel do UAZAPI
2. Vá para a seção "API Keys" ou "Desenvolvedor"
3. Crie uma nova API Key ou use uma existente
4. Anote sua API Key para uso posterior

### 2.2. Configurar Número de WhatsApp

1. No painel do UAZAPI, registre o número de WhatsApp que será usado para enviar notificações
2. Verifique se o número está devidamente configurado e conectado

## 3. Configuração do n8n

### 3.1. Importar o Workflow

1. Acesse seu painel do n8n
2. Clique em "Workflows" no menu lateral
3. Clique em "Import"
4. Selecione o arquivo `studio-nail-notifications.json` do seu projeto
5. Clique em "Import Workflow"

### 3.2. Configurar as Credenciais do UAZAPI

1. No workflow importado, localize os nós "UAZAPI - Enviar para Cliente", "UAZAPI - Enviar para Designer" e "UAZAPI - Enviar Lembrete"
2. Em cada um desses nós, substitua o valor do header "Authorization":
   - De: `Bearer Sua_API_Key_Aqui`
   - Para: `Bearer SUA_API_KEY_REAL_AQUI`

### 3.3. Configurar o Webhook URL

1. No nó "Webhook", anote o "Webhook URL" gerado
2. Este será o endpoint que sua aplicação Studio Nail usará para enviar notificações

### 3.4. Atualizar a URL do Webhook na Aplicação

1. Abra os arquivos:
   - `src/components/BookingPage.tsx`
   - `src/components/AdminDashboard.tsx`
   - `src/services/notificationService.ts`

2. Em cada arquivo, localize a URL do webhook:
   ```javascript
   const webhookUrl = 'http://localhost:5679/webhook/3a2f1b4c-5d6e-7f8g-9h0i-jk1l2m3n4o5p';
   ```

3. Substitua pela URL real do seu webhook do n8n

## 4. Testando a Integração

### 4.1. Teste de Envio Imediato

1. Execute sua aplicação Studio Nail
2. Faça um agendamento de teste
3. Verifique se:
   - O agendamento é salvo corretamente
   - As notificações são enviadas para o cliente e designer
   - As notificações aparecem no painel do UAZAPI

### 4.2. Teste de Lembretes

1. Configure um agendamento para daqui a mais de 24 horas
2. Verifique se:
   - O lembrete de 24h é agendado corretamente
   - O lembrete de 6h é agendado corretamente
   - Os lembretes são enviados nos horários corretos

## 5. Personalização das Mensagens

Você pode personalizar as mensagens de notificação editando os nós HTTP Request no n8n:

### 5.1. Mensagem de Confirmação para Cliente

No nó "UAZAPI - Enviar para Cliente", edite o corpo da requisição:

```json
{
  "to": "{{ $json[\"appointment\"][\"client_phone\"].replace(/\\D/g, '') }}",
  "type": "text",
  "text": {
    "body": "{{ $json[\"message\"].replace(/\\n/g, '\\n') }}"
  }
}
```

### 5.2. Mensagem de Confirmação para Designer

No nó "UAZAPI - Enviar para Designer", edite o corpo da requisição:

```json
{
  "to": "{{ $json[\"designer_phone\"].replace(/\\D/g, '') }}",
  "type": "text",
  "text": {
    "body": "{{ $json[\"message\"].replace(/\\n/g, '\\n') }}"
  }
}
```

### 5.3. Mensagens de Lembrete

No nó "UAZAPI - Enviar Lembrete", edite o corpo da requisição:

```json
{
  "to": "{{ $json[\"appointment\"][\"client_phone\"].replace(/\\D/g, '') }}",
  "type": "text",
  "text": {
    "body": "Lembrete: Seu agendamento é {{ $json[\"type\"].includes('24h') ? 'amanhã' : 'hoje' }} às {{ $json[\"appointment\"][\"time\"] }}!\n\nServiço: {{ $json[\"appointment\"][\"service\"] }}\nValor: R$ {{ $json[\"appointment\"][\"price\"].toFixed(2) }}\n\nEstamos ansiosos para te ver! 💅✨"
  }
}
```

## 6. Monitoramento e Troubleshooting

### 6.1. Verificando Logs

1. No painel do n8n, acesse o workflow
2. Clique em "Executions" para ver o histórico de execuções
3. Verifique se há erros nas execuções

### 6.2. Verificando Fila de Notificações

A aplicação Studio Nail mantém uma fila de notificações em `localStorage`:

- `notification_queue`: Notificações aguardando envio
- `failed_notification_queue`: Notificações que falharam após várias tentativas

### 6.3. Erros Comuns

1. **API Key inválida**: Verifique se a API Key está correta e ativa
2. **Número não conectado**: Certifique-se de que o número do WhatsApp está conectado no UAZAPI
3. **Webhook URL incorreto**: Verifique se a URL do webhook está correta
4. **Problemas de rede**: Verifique a conectividade entre n8n e UAZAPI

## 7. Considerações Finais

- Mantenha sua API Key segura e não a compartilhe publicamente
- Monitore regularmente o envio de notificações
- Considere implementar alertas para falhas de envio críticas
- Faça backup do workflow do n8n regularmente

Com esta configuração, sua aplicação Studio Nail estará totalmente integrada com o n8n e UAZAPI para enviar notificações de agendamento de forma automática e confiável.
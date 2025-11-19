# Guia de Uso: Sistema de Notificações do Studio Nail

Este guia explica como o sistema de notificações funciona e como utilizá-lo efetivamente.

## 1. Como Funciona o Sistema

O Studio Nail App envia automaticamente notificações via WhatsApp para clientes e designers quando um agendamento é feito. O sistema também envia lembretes antes do agendamento.

### 1.1. Notificações Enviadas

1. **Confirmação Imediata**
   - Enviada para o cliente imediatamente após o agendamento
   - Enviada para o designer imediatamente após o agendamento

2. **Lembrete de 24h**
   - Enviada 24 horas antes do agendamento
   - Enviada apenas para o cliente

3. **Lembrete de 6h**
   - Enviada 6 horas antes do agendamento
   - Enviada apenas para o cliente

### 1.2. Fluxo de Processamento

```
[Agendamento Feito] 
        ↓
[Notificações Imediatas Enviadas]
        ↓
[Lembretes Agendados no n8n]
        ↓
[Lembretes Enviados nos Horários Programados]
```

## 2. Para Designers

### 2.1. Recebendo Notificações

Como designer, você receberá uma notificação sempre que um cliente fizer um agendamento:

```
Olá [Seu Nome]!

Você tem um novo agendamento:

👤 Cliente: [Nome do Cliente]
📞 Telefone: [Telefone do Cliente]
💅 Serviço: [Serviço Agendado]
📅 Data: [Data do Agendamento]
⏰ Horário: [Horário do Agendamento]
💰 Valor: R$ [Valor]
```

### 2.2. Verificando Agendamentos

1. Acesse o painel do Studio Nail App
2. Faça login com suas credenciais
3. Verifique a seção "Agenda" para ver todos os agendamentos
4. Use os filtros para ver agendamentos por data

## 3. Para Clientes

### 3.1. Recebendo Notificações

Como cliente, você receberá várias notificações:

**Confirmação Imediata:**
```
Olá [Seu Nome]!

Seu agendamento foi confirmado:

💅 Serviço: [Serviço Agendado]
📅 Data: [Data do Agendamento]
⏰ Horário: [Horário do Agendamento]
💰 Valor: R$ [Valor]

Nos vemos em breve! 💖
```

**Lembrete de 24h:**
```
Lembrete: Seu agendamento é amanhã às [Horário]!

Serviço: [Serviço Agendado]
Valor: R$ [Valor]

Estamos ansiosos para te ver! 💅✨
```

**Lembrete de 6h:**
```
Lembrete: Seu agendamento é hoje às [Horário]!

Serviço: [Serviço Agendado]
Valor: R$ [Valor]

Prepare-se para um momento especial! 💅✨
```

### 3.2. Verificando Agendamentos

1. Acesse o link pessoal fornecido pela sua designer
2. Ou faça login no sistema com suas credenciais
3. Verifique a seção "Meus Agendamentos" para ver todos os seus agendamentos

## 4. Para Administradores

### 4.1. Monitorando o Sistema

1. Verifique regularmente o painel do n8n para:
   - Ver execuções bem-sucedidas
   - Identificar falhas no envio de notificações
   - Monitorar a fila de processamento

2. Verifique o painel do UAZAPI para:
   - Ver mensagens enviadas
   - Identificar falhas na entrega
   - Monitorar o uso da API

### 4.2. Resolvendo Problemas

**Se uma notificação não foi enviada:**

1. Verifique o localStorage da aplicação:
   - `notification_queue`: Fila de notificações pendentes
   - `failed_notification_queue`: Fila de notificações falhas

2. Verifique os logs do n8n:
   - Acesse "Executions" no workflow
   - Veja detalhes de execuções falhas

3. Verifique a conexão do WhatsApp no UAZAPI:
   - Certifique-se de que o número está conectado
   - Verifique se não há mensagens de erro

## 5. Personalização

### 5.1. Personalizando Mensagens

As mensagens podem ser personalizadas no workflow do n8n:

1. Acesse o workflow "Studio Nail - Notificações de Agendamento"
2. Edite os nós HTTP Request:
   - "UAZAPI - Enviar para Cliente"
   - "UAZAPI - Enviar para Designer"
   - "UAZAPI - Enviar Lembrete"

### 5.2. Adicionando Novos Tipos de Notificação

Para adicionar novos tipos de notificação:

1. Adicione um novo nó no workflow do n8n
2. Configure o gatilho apropriado
3. Adicione a lógica de envio no código da aplicação
4. Atualize a função `sendToN8nWebhook` com o novo tipo

## 6. Boas Práticas

### 6.1. Para Designers

- Mantenha seu WhatsApp conectado ao UAZAPI
- Verifique regularmente os agendamentos recebidos
- Confirme ou rejeite agendamentos pendentes em até 24h

### 6.2. Para Clientes

- Mantenha seu WhatsApp ativo para receber notificações
- Verifique as notificações de lembrete para não esquecer seus agendamentos
- Entre em contato com sua designer se tiver dúvidas

### 6.3. Para Administradores

- Monitore regularmente o sistema de notificações
- Mantenha as credenciais de API seguras
- Faça backup do workflow do n8n regularmente
- Mantenha a documentação atualizada

## 7. Suporte

Se você encontrar problemas com o sistema de notificações:

1. Verifique este guia para soluções comuns
2. Consulte o administrador do sistema
3. Abra um ticket de suporte se necessário

Com este sistema, você garantirá uma comunicação eficiente entre designers e clientes, reduzindo o número de esquecimentos e melhorando a experiência geral.
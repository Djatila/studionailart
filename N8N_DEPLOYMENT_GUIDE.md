# Guia de Implantação do n8n para Studio Nail

Este guia explica como implantar o n8n para produção com o workflow de notificações do Studio Nail.

## 1. Opções de Implantação

Você pode implantar o n8n de várias formas:

1. **n8n Cloud** (Recomendado para iniciantes)
2. **Docker** (Recomendado para produção)
3. **Instalação direta** (Para ambientes personalizados)

## 2. Implantação no n8n Cloud

### 2.1. Criar Conta

1. Acesse [n8n.cloud](https://n8n.cloud)
2. Crie uma conta ou faça login

### 2.2. Criar Projeto

1. Clique em "Create Project"
2. Escolha o plano adequado (gratuito disponível)

### 2.3. Importar Workflow

1. Dentro do projeto, clique em "Workflows"
2. Clique em "Import"
3. Selecione o arquivo `studio-nail-notifications.json`
4. Clique em "Import Workflow"

### 2.4. Configurar Credenciais

1. Clique no workflow importado
2. Clique em "Credentials" no menu lateral
3. Adicione uma nova credencial do tipo "HTTP Request"
4. Configure o header "Authorization" com sua chave do UAZAPI:
   - Nome: `UAZAPI`
   - Authorization: `Bearer SUA_CHAVE_AQUI`

### 2.5. Configurar Variáveis de Ambiente

1. No menu do projeto, clique em "Settings"
2. Vá para "Environment Variables"
3. Adicione:
   - Nome: `UAZAPI_KEY`
   - Valor: `Bearer SUA_CHAVE_AQUI`

### 2.6. Atualizar Nós com Credenciais

1. Volte ao workflow
2. Para cada nó HTTP Request:
   - Clique no nó
   - Em "Authentication", selecione "Predefined Credential Type"
   - Escolha a credencial UAZAPI criada

## 3. Implantação com Docker

### 3.1. Pré-requisitos

- Docker instalado
- Docker Compose instalado

### 3.2. Criar docker-compose.yml

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5679:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=seu_usuario
      - N8N_BASIC_AUTH_PASSWORD=sua_senha
      - UAZAPI_KEY=Bearer sua_chave_api_aqui
    volumes:
      - ./n8n-data:/home/node/.n8n
```

### 3.3. Executar

```bash
docker-compose up -d
```

### 3.4. Acessar

Acesse `http://localhost:5679` e configure:

1. Importe o workflow
2. Configure as credenciais
3. Atualize as URLs de webhook conforme necessário

## 4. Configuração de Produção

### 4.1. SSL/HTTPS

Para produção, é essencial usar HTTPS:

1. Configure um proxy reverso (Nginx, Apache, etc.)
2. Obtenha um certificado SSL (Let's Encrypt, etc.)
3. Atualize as URLs de webhook para usar HTTPS

### 4.2. Backup

1. Faça backup regular do diretório `n8n-data`
2. Exporte workflows regularmente
3. Mantenha cópias das variáveis de ambiente

### 4.3. Monitoramento

1. Configure logs de acesso e erro
2. Monitore o uso de recursos
3. Configure alertas para falhas

## 5. Integração com Studio Nail App

### 5.1. Atualizar Variáveis de Ambiente

No arquivo `.env` da sua aplicação Studio Nail:

```
VITE_N8N_WEBHOOK_URL=https://n8n-n8n.ojzczb.easypanel.host/webhook/3a2f1b4c-5d6e-7f8g-9h0i-jk1l2m3n4o5p
```

### 5.2. Testar Conectividade

1. Reinicie sua aplicação Studio Nail
2. Faça um teste de agendamento
3. Verifique se o webhook é recebido no n8n
4. Verifique se a notificação é enviada via UAZAPI

## 6. Solução de Problemas

### 6.1. Webhook não é recebido

- Verifique se a URL do webhook está correta
- Verifique se as portas estão abertas
- Verifique o firewall

### 6.2. Notificações não são enviadas

- Verifique se a chave da API do UAZAPI está correta
- Verifique se o número do WhatsApp está conectado
- Verifique os logs do n8n

### 6.3. Erros de autenticação

- Verifique se a chave da API não expirou
- Verifique se há espaços extras na chave
- Verifique se o header está formatado corretamente

## 7. Manutenção

### 7.1. Atualizações

- Mantenha o n8n atualizado
- Faça backup antes de atualizar
- Teste após atualizações

### 7.2. Limpeza

- Limpe execuções antigas regularmente
- Monitore o uso de disco
- Arquive workflows antigos se necessário

Com este guia, você poderá implantar e manter com sucesso o n8n para enviar notificações do Studio Nail App via UAZAPI.
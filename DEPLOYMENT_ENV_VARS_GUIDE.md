# Guia de Configuração de Variáveis de Ambiente para Implantação

## Problema

O arquivo `.env` contém variáveis de ambiente sensíveis que não são enviadas para o repositório Git por razões de segurança. Quando o aplicativo é implantado na web, essas variáveis não estão disponíveis, causando erros como:

```
VITE_N8N_WEBHOOK_URL is not defined. Webhook call skipped.
```

## Solução

Configure as variáveis de ambiente diretamente no serviço de hospedagem (Vercel, Netlify, etc.).

## Variáveis de Ambiente Necessárias

### Supabase
- `VITE_SUPABASE_URL` = `https://vhvxjiorcggilujjtdbr.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodnhqaW9yY2dnaWx1amp0ZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzYyMzgsImV4cCI6MjA3MTExMjIzOH0.X_7h0ZadhguYIPpbiSY5sbs1DfsyUaZB59zucRM9qKU`

### UAZAPI
- `VITE_UAZAPI_INSTANCE_ID` = `9bf14467-a262-40cf-a314-f042d4fd9105`
- `VITE_UAZAPI_TOKEN` = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.u1JuQWRc5op8p2JTUYYmoCWsfPFXsEKDUmoiUytc3rxVp1K6Fd`

### n8n
- `VITE_N8N_WEBHOOK_URL` = `https://n8n-n8n.ojzczb.easypanel.host/webhook/3a2f1b4c-5d6e-7f8g-9h0i-jk1l2m3n4o5p`
- `VITE_N8N_USERNAME` = `djatila.azevedo@gmail.com`
- `VITE_N8N_PASSWORD` = `yLKy9Q4K8CYveL2`

## Configuração do n8n

### Se estiver usando n8n localmente:
1. Use um serviço como **ngrok** para tornar seu n8n local acessível publicamente
2. Instale o ngrok: `npm install -g ngrok`
3. Inicie o ngrok: `ngrok http 5679`
4. Use a URL https fornecida pelo ngrok na variável `VITE_N8N_WEBHOOK_URL`

### Se estiver usando n8n hospedado:
1. Obtenha o endereço público do seu n8n
2. Use esse endereço na variável `VITE_N8N_WEBHOOK_URL`

## Configuração no Vercel

### Opção 1: Importar arquivo .env (Recomendado)
1. Acesse o dashboard do Vercel
2. Vá para Settings → Environment Variables
3. Clique no botão "Import"
4. Selecione o arquivo `.env` ou `.env.production` do seu computador
5. **ATENÇÃO**: Atualize a variável `VITE_N8N_WEBHOOK_URL` com o endereço real do seu n8n
6. A Vercel irá automaticamente importar todas as variáveis

### Opção 2: Adicionar manualmente
1. Acesse o dashboard do Vercel
2. Vá para Settings → Environment Variables
3. Adicione cada uma das variáveis acima manualmente
4. **ATENÇÃO**: Use o endereço real do seu n8n na variável `VITE_N8N_WEBHOOK_URL`

## Configuração no Netlify

1. Acesse o dashboard do Netlify
2. Vá para Site settings → Build & deploy → Environment
3. Adicione cada uma das variáveis acima
4. **ATENÇÃO**: Use o endereço real do seu n8n na variável `VITE_N8N_WEBHOOK_URL`

## Verificação

Após configurar as variáveis de ambiente:

1. Faça um novo deploy do aplicativo
2. Teste a funcionalidade de agendamento
3. Verifique o console do navegador para confirmar que não há mais erros relacionados a variáveis de ambiente

## Segurança

- Nunca envie arquivos `.env` para repositórios públicos
- Use variáveis de ambiente do serviço de hospedagem para armazenar credenciais
- Revise periodicamente as permissões de acesso às variáveis de ambiente
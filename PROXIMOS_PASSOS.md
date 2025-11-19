# 🚀 Próximos Passos - Integração Supabase

Agora que você criou o projeto **Nail Agenda** no Supabase, siga estes passos para completar a integração:

## 📋 **Passo 1: Obter Credenciais do Supabase**

1. **Acesse seu projeto no Supabase:**
   - Vá para https://supabase.com
   - Faça login e acesse seu projeto "Nail Agenda"

2. **Obtenha as credenciais:**
   - No painel lateral, clique em **Settings** ⚙️
   - Clique em **API**
   - Copie:
     - **Project URL** (algo como: `https://xyzcompany.supabase.co`)
     - **anon/public key** (uma chave longa que começa com `eyJhbGciOiJIUzI1NiIs...`)

## 🔧 **Passo 2: Atualizar Arquivo .env**

1. **Abra o arquivo `.env` na raiz do projeto**
2. **Substitua as credenciais:**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```

## 🗄️ **Passo 3: Criar Tabelas no Banco**

1. **No Supabase, vá para SQL Editor:**
   - No painel lateral, clique em **SQL Editor** 📝

2. **Execute o schema:**
   - Abra o arquivo `supabase-schema.sql` do projeto
   - Copie todo o conteúdo
   - Cole no SQL Editor do Supabase
   - Clique em **Run** ▶️

3. **Verifique se as tabelas foram criadas:**
   - Vá para **Table Editor** 📊
   - Você deve ver as tabelas: `nail_designers`, `appointments`, `services`, `availability`

## 🔄 **Passo 4: Migrar Dados (Opcional)**

Se você já tem dados no localStorage que quer manter:

1. **No console do navegador (F12):**
   ```javascript
   // Ver dados atuais
   console.log('Designers:', JSON.parse(localStorage.getItem('nailDesigners') || '[]'));
   console.log('Appointments:', JSON.parse(localStorage.getItem('appointments') || '[]'));
   ```

2. **Use as funções de migração** (já implementadas em `src/utils/supabaseUtils.ts`)

## 🧪 **Passo 5: Testar Conexão**

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Abra o console do navegador (F12)**
3. **Teste a conexão:**
   ```javascript
   // No console do navegador
   import { supabase } from './src/lib/supabase.ts';
   supabase.from('nail_designers').select('*').then(console.log);
   ```

## ⚠️ **Possíveis Problemas e Soluções**

### Erro de CORS
- **Solução:** No Supabase, vá em Settings > API > CORS Origins e adicione `http://localhost:5173`

### Erro de RLS (Row Level Security)
- **Solução:** Temporariamente desabilite RLS nas tabelas para teste:
  ```sql
  ALTER TABLE nail_designers DISABLE ROW LEVEL SECURITY;
  ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE services DISABLE ROW LEVEL SECURITY;
  ALTER TABLE availability DISABLE ROW LEVEL SECURITY;
  ```

### Variáveis de ambiente não carregam
- **Solução:** Reinicie o servidor (`Ctrl+C` e `npm run dev`)
- Verifique se as variáveis começam com `VITE_`

## 🎯 **Próximos Passos Após Configuração**

1. **Substituir localStorage nos componentes**
2. **Implementar autenticação (opcional)**
3. **Configurar políticas de segurança**
4. **Deploy em produção**

---

## 📞 **Precisa de Ajuda?**

Se encontrar algum problema:
1. Verifique o console do navegador (F12) para erros
2. Consulte o arquivo `SUPABASE_INTEGRATION_GUIDE.md` para detalhes técnicos
3. Teste a conexão passo a passo

**Status atual:** ✅ Projeto criado no Supabase
**Próximo passo:** 🔧 Atualizar credenciais no arquivo `.env`
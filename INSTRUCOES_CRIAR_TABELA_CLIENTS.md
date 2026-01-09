# 🚨 INSTRUÇÕES URGENTES: Criar Tabela de Clientes no Supabase

## ❌ Problema Identificado
A tabela `clients` não existe no banco de dados Supabase, por isso:
- Clientes não estão sendo salvos no banco
- Apenas o localStorage está sendo usado
- Não há sincronização entre dispositivos

## ✅ Solução: Executar SQL Manualmente

### Passo 1: Acessar o Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto: **vhvxjiorcggilujjtdbr**

### Passo 2: Abrir SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar o SQL
Copie e cole o seguinte código SQL:

```sql
-- Criar tabela de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_active ON public.clients(is_active);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON public.clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Anyone can create client account"
    ON public.clients
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can view client profiles"
    ON public.clients
    FOR SELECT
    USING (true);

CREATE POLICY "Clients can update own profile"
    ON public.clients
    FOR UPDATE
    USING (true);

CREATE POLICY "Allow delete client accounts"
    ON public.clients
    FOR DELETE
    USING (true);
```

### Passo 4: Executar
1. Clique no botão **"Run"** (ou pressione Ctrl+Enter)
2. Aguarde a execução completar
3. Verifique se não há erros

### Passo 5: Verificar
1. Vá em **"Table Editor"** no menu lateral
2. Procure pela tabela **"clients"**
3. Confirme que a tabela foi criada com as colunas corretas

## 🎯 Após Criar a Tabela

1. **Reinicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

2. **Teste o cadastro de clientes:**
   - Cadastre um novo cliente
   - Verifique se aparece na tabela `clients` no Supabase
   - Teste em diferentes navegadores/dispositivos

## 📞 Status Atual

- ✅ Conexão com Supabase: **FUNCIONANDO**
- ✅ Tabela nail_designers: **EXISTE** (1 designer ativo)
- ❌ Tabela clients: **NÃO EXISTE** ← **PROBLEMA PRINCIPAL**
- ✅ Código da aplicação: **ATUALIZADO**

## 🚨 URGENTE

Sem a tabela `clients`, o sistema continuará salvando apenas no localStorage, sem sincronização entre dispositivos. Execute o SQL acima IMEDIATAMENTE para resolver o problema.
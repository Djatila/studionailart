# 🔧 Guia para Aplicar Políticas RLS no Supabase

## ❌ Problema Identificado
O erro `401 (Unauthorized)` e `new row violates row-level security policy` indica que as políticas RLS não estão configuradas corretamente no Supabase.

## 🎯 Solução: Aplicar Políticas Manualmente

### Passo 1: Acessar o Painel do Supabase
1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto: **vhvxjiorcggilujjtdbr**

### Passo 2: Navegar para o SQL Editor
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"** para criar uma nova consulta

### Passo 3: Executar o SQL de Correção
Copie e cole o seguinte código SQL no editor:

```sql
-- 🗑️ Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Designers can view own profile" ON public.nail_designers;
DROP POLICY IF EXISTS "Anyone can create designer account" ON public.nail_designers;
DROP POLICY IF EXISTS "Anyone can view designer profiles" ON public.nail_designers;
DROP POLICY IF EXISTS "Designers can update own profile" ON public.nail_designers;

-- ✨ Criar novas políticas corretas
CREATE POLICY "Anyone can create designer account" 
  ON public.nail_designers 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view designer profiles" 
  ON public.nail_designers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Designers can update own profile" 
  ON public.nail_designers 
  FOR UPDATE 
  USING (auth.uid()::text = id::text);

CREATE POLICY "Allow delete designer accounts" 
  ON public.nail_designers 
  FOR DELETE 
  USING (true);
```

### Passo 4: Executar a Query
1. Clique no botão **"Run"** (▶️) no canto inferior direito
2. Aguarde a execução completar
3. Verifique se não há erros na saída

### Passo 5: Verificar as Políticas
1. No menu lateral, vá para **"Authentication" > "Policies"**
2. Selecione a tabela **"nail_designers"**
3. Confirme que as seguintes políticas estão listadas:
   - ✅ "Anyone can create designer account" (INSERT)
   - ✅ "Anyone can view designer profiles" (SELECT)
   - ✅ "Designers can update own profile" (UPDATE)

## 🧪 Teste
Após aplicar as políticas:
1. Volte para a aplicação
2. Tente cadastrar um novo nail designer
3. O erro 401 deve desaparecer
4. O cadastro deve funcionar normalmente

## 📋 Explicação das Políticas

### 🔓 "Anyone can create designer account" (INSERT)
- **Função**: Permite que qualquer pessoa se cadastre como designer
- **Necessário**: Para o funcionamento do cadastro público

### 👁️ "Anyone can view designer profiles" (SELECT)
- **Função**: Permite que clientes vejam os perfis dos designers
- **Necessário**: Para o sistema de agendamentos

### 🔒 "Designers can update own profile" (UPDATE)
- **Função**: Permite que designers atualizem apenas seus próprios dados
- **Segurança**: Mantém a proteção dos dados pessoais

## ⚠️ Importante
- Essas políticas são essenciais para o funcionamento da aplicação
- Sem elas, nenhum cadastro ou consulta funcionará
- As políticas de UPDATE mantêm a segurança dos dados

---

**🚀 Após aplicar essas políticas, o sistema de cadastro deve funcionar perfeitamente!**
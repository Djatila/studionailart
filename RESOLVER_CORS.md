# 🚨 Como Resolver o Erro de CORS no Supabase

## ❌ **Problema Identificado:**
O erro `Failed to fetch at <anonymous>:1:1` indica um problema de **CORS (Cross-Origin Resource Sharing)**.
Isso acontece porque o Supabase não está permitindo requisições do seu domínio local.

## ✅ **Solução - Configurar URLs Permitidas:**

### **1. Acesse o Painel do Supabase:**
- Vá para: https://supabase.com
- Faça login na sua conta
- Selecione o projeto **"Nail Agenda"**

### **2. Configure as URLs de Desenvolvimento:**
- No painel lateral, clique em **"Settings"** (Configurações)
- Clique em **"Authentication"**
- Role para baixo até encontrar **"Site URL"** e **"Redirect URLs"**

### **3. Adicione as URLs Locais:**

**Site URL:**
```
http://localhost:5175
```

**Redirect URLs (adicione estas linhas):**
```
http://localhost:5175
http://localhost:5175/**
http://127.0.0.1:5175
http://127.0.0.1:5175/**
```

### **4. Salve as Configurações:**
- Clique em **"Save"** (Salvar)
- Aguarde alguns segundos para as mudanças serem aplicadas

## 🔄 **Teste Novamente:**

Após configurar, teste novamente no console do navegador:

```javascript
fetch('https://vhvxjiorcggilujjtdbr.supabase.co/rest/v1/nail_designers?select=*', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodnhqaW9yY2dnaWx1amp0ZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzYyMzgsImV4cCI6MjA3MTExMjIzOH0.X_7h0ZadhguYIPpbiSY5sbs1DfsyUaZB59zucRM9qKU',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodnhqaW9yY2dnaWx1amp0ZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzYyMzgsImV4cCI6MjA3MTExMjIzOH0.X_7h0ZadhguYIPpbiSY5sbs1DfsyUaZB59zucRM9qKU'
  }
}).then(r => r.json()).then(console.log)
```

## 🎯 **Resultado Esperado:**
Após a configuração, você deve ver:
```javascript
[] // Array vazio (normal, pois não há dados ainda)
```

## 🔧 **Solução Alternativa (Se ainda não funcionar):**

Se o problema persistir, desabilite temporariamente o RLS:

1. Vá no **SQL Editor** do Supabase
2. Execute este comando:

```sql
ALTER TABLE nail_designers DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE availability DISABLE ROW LEVEL SECURITY;
```

## 📝 **Próximos Passos:**
Após resolver o CORS:
1. ✅ Teste a conexão novamente
2. 🔄 Migre os componentes para usar Supabase
3. 🧪 Teste a aplicação completa

---
**💡 Dica:** O CORS é uma medida de segurança. Em produção, configure apenas os domínios reais da sua aplicação.
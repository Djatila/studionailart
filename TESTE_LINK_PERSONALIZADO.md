# 🧪 Como Testar o Link Personalizado

## 📋 Passo a Passo

### 1️⃣ Copiar o Link Personalizado

1. Faça login como **Klivia Azevedo**
2. Vá em **Configurações** (menu inferior)
3. Na seção "Seu Link Personalizado", copie o link completo
   - Exemplo: `http://localhost:5179/klivia-azevedo`

### 2️⃣ Abrir em Aba Anônima

1. Abra uma **aba anônima** (Ctrl+Shift+N no Chrome)
2. Cole o link copiado
3. Pressione Enter

### 3️⃣ Verificar o Console

1. Pressione **F12** para abrir o DevTools
2. Vá na aba **Console**
3. Procure por estas mensagens:

```
🔍 Verificando URL: /klivia-azevedo | Slug extraído: klivia-azevedo
🔗 Link personalizado detectado: klivia-azevedo
📋 Designers encontradas: [...]
🔎 Comparando: "klivia-azevedo" === "klivia-azevedo"? true
✅ Designer encontrada: Klivia Azevedo
```

### 4️⃣ Resultado Esperado

**✅ CORRETO:**
- Pula a seleção de designers
- Mostra foto e bio da Klivia
- Começa direto na escolha de serviços
- Título: "1. Escolha um Serviço" (não "2.")

**❌ ERRADO:**
- Mostra lista de designers
- Não mostra foto e bio
- Começa no Step 1 (seleção de designer)

---

## 🔍 Debug

Se ainda mostrar a lista de designers, verifique:

### 1. URL está correta?
- ✅ Correto: `http://localhost:5179/klivia-azevedo`
- ❌ Errado: `http://localhost:5179/` (sem slug)
- ❌ Errado: `http://localhost:5179/#/klivia-azevedo` (com #)

### 2. Slug no banco está correto?
Execute no SQL Editor do Supabase:
```sql
SELECT id, name, slug FROM nail_designers WHERE name LIKE '%Klivia%';
```

Deve retornar:
```
| id   | name           | slug           |
|------|----------------|----------------|
| ...  | Klivia Azevedo | klivia-azevedo |
```

### 3. Console mostra erros?
Procure por mensagens de erro em vermelho no Console (F12)

---

## 📸 Me Envie

Se ainda não funcionar, me envie:

1. **Screenshot do Console** (F12 → aba Console)
2. **URL completa** que você está acessando
3. **Screenshot da tela** que aparece

---

## 🎯 Formato do Slug

O slug é gerado automaticamente do nome:

- **"Klivia Azevedo"** → `klivia-azevedo`
- **"Clícia Maria"** → `clicia-maria`
- **"Ana Paula Silva"** → `ana-paula-silva`

Regras:
- Tudo em minúsculas
- Remove acentos
- Substitui espaços por hífens
- Remove caracteres especiais

---

**Teste agora e me diga o que aparece no Console!** 🚀

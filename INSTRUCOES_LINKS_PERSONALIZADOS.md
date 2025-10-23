# 🔗 Instruções - Links Personalizados para Nail Designers

## 📋 O Que Foi Implementado

### ✅ 1. Sistema de Slugs Automáticos
- Cada designer agora tem um **slug único** gerado automaticamente do nome
- Formato: `klivia-azevedo`, `clicia-maria`, etc.
- Slugs são salvos no banco de dados Supabase

### ✅ 2. Links Personalizados
- Formato: `studionailart.vercel.app/klivia-azevedo`
- Quando cliente acessa o link, **pula direto para seleção de serviço**
- Não precisa mais escolher designer da lista

### ✅ 3. Perfil Público da Designer
- **Foto de perfil** - URL de imagem hospedada online
- **Biografia** - Até 300 caracteres sobre a designer
- Exibidos na página de agendamento quando cliente acessa via link personalizado

### ✅ 4. Botão "Copiar Link"
- No painel de Configurações da designer
- Copia o link personalizado para área de transferência
- Feedback visual quando copiado

### ✅ 5. QR Code (Opcional)
- Pode ser implementado com biblioteca `qrcode.react`
- Designer pode imprimir e colocar no salão

---

## 🚀 Passos para Ativar no Supabase

### Passo 1: Executar Script SQL

Acesse o **SQL Editor** do Supabase e execute o arquivo:
```
add-slug-and-bio-to-designers.sql
```

Este script irá:
- ✅ Adicionar coluna `slug` (TEXT, UNIQUE)
- ✅ Adicionar coluna `bio` (TEXT)
- ✅ Adicionar coluna `photo_url` (TEXT)
- ✅ Criar índice para buscas rápidas
- ✅ Gerar slugs automaticamente para designers existentes

### Passo 2: Verificar Dados

Após executar o script, verifique se os slugs foram gerados:

```sql
SELECT id, name, slug, bio, photo_url FROM nail_designers;
```

Você deve ver algo como:
```
| id   | name           | slug           | bio  | photo_url |
|------|----------------|----------------|------|-----------|
| ...  | Klivia Azevedo | klivia-azevedo | NULL | NULL      |
| ...  | Clícia Maria   | clicia-maria   | NULL | NULL      |
```

---

## 👩‍💼 Como a Designer Usa

### 1. Acessar Configurações
- Fazer login no sistema
- Clicar em **"Configurações"** no menu inferior

### 2. Seção "Perfil Público"
Aqui a designer encontra:

#### **Seu Link Personalizado**
- Link completo exibido (ex: `https://studionailart.vercel.app/klivia-azevedo`)
- Botão **"Copiar"** para copiar o link
- Feedback visual quando copiado

#### **URL da Foto de Perfil**
- Campo para colar link de imagem hospedada online
- Sugestões: Imgur, Google Drive (público), Dropbox
- Pré-visualização da foto em tempo real

#### **Biografia**
- Campo de texto com até 300 caracteres
- Conte sobre você e seu trabalho
- Contador de caracteres

#### **Botão "Salvar Perfil"**
- Salva foto e biografia no banco de dados
- Mensagem de sucesso quando salvar

### 3. Compartilhar o Link
A designer pode compartilhar o link personalizado:
- ✅ Via WhatsApp
- ✅ Via Instagram (bio ou stories)
- ✅ Via Facebook
- ✅ QR Code impresso (futuro)

---

## 👤 Como a Cliente Usa

### Fluxo Antigo (ainda funciona):
1. Acessa `studionailart.vercel.app`
2. Escolhe a designer da lista
3. Escolhe o serviço
4. Escolhe data/horário
5. Preenche dados
6. Confirma

### Fluxo Novo (Link Personalizado):
1. Acessa `studionailart.vercel.app/klivia-azevedo`
2. **Vê foto e bio da Klivia** (se configurado)
3. **Pula direto para escolha de serviço** ⚡
4. Escolhe data/horário
5. Preenche dados
6. Confirma

**Vantagens:**
- ✅ Mais rápido (pula 1 etapa)
- ✅ Mais pessoal (vê foto e bio)
- ✅ Mais profissional
- ✅ Menos confusão

---

## 🔧 Detalhes Técnicos

### Arquivos Modificados

1. **`src/App.tsx`**
   - Detecta slug na URL
   - Busca designer pelo slug no Supabase
   - Passa designer para BookingPage

2. **`src/components/BookingPage.tsx`**
   - Começa no Step 2 se designer já estiver selecionada
   - Exibe card com foto e bio da designer
   - Ajusta numeração dos steps

3. **`src/components/DesignerSettings.tsx`**
   - Nova seção "Perfil Público"
   - Campos para foto e biografia
   - Botão "Copiar Link"
   - Função para salvar no Supabase

4. **`src/lib/supabase.ts`**
   - Adicionados campos `slug`, `bio`, `photo_url` na interface

5. **`src/utils/slugUtils.ts`** (NOVO)
   - Função `generateSlug()` - Gera slug do nome
   - Função `extractSlugFromPath()` - Extrai slug da URL
   - Função `generatePersonalLink()` - Gera link completo

### Como Funciona a Detecção de Slug

```typescript
// URL: studionailart.vercel.app/klivia-azevedo
const slug = extractSlugFromPath(window.location.pathname);
// slug = "klivia-azevedo"

// Busca designer no Supabase
const designers = await designerService.getAll();
const designer = designers.find(d => {
  const designerSlug = d.slug || generateSlug(d.name);
  return designerSlug === slug && d.is_active;
});

// Se encontrar, passa para BookingPage
if (designer) {
  setCurrentDesigner(designer);
  setCurrentView('booking');
}
```

### Geração de Slug

```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Normaliza acentos
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

// Exemplos:
// "Klivia Azevedo" → "klivia-azevedo"
// "Clícia Maria" → "clicia-maria"
// "Ana Paula Silva" → "ana-paula-silva"
```

---

## 🎨 Implementação Futura: QR Code

### Instalar Biblioteca

```bash
npm install qrcode.react
```

### Adicionar no DesignerSettings

```tsx
import QRCode from 'qrcode.react';

// No JSX, após o botão "Copiar":
<div className="mt-4 text-center">
  <p className="text-sm text-gray-600 mb-2">QR Code:</p>
  <QRCode 
    value={personalLink} 
    size={150}
    level="H"
    includeMargin={true}
  />
  <p className="text-xs text-gray-500 mt-2">
    Clique com botão direito para salvar e imprimir
  </p>
</div>
```

---

## 🧪 Como Testar

### Teste 1: Gerar Slug
1. Acesse o painel de uma designer
2. Vá em Configurações
3. Verifique se o link personalizado aparece
4. Clique em "Copiar" e cole em algum lugar

### Teste 2: Acessar via Link
1. Copie o link personalizado
2. Abra em uma aba anônima
3. Verifique se pula direto para seleção de serviço
4. Verifique se mostra foto e bio (se configurado)

### Teste 3: Salvar Perfil
1. Cole uma URL de imagem no campo "Foto"
2. Escreva uma biografia
3. Clique em "Salvar Perfil"
4. Verifique se aparece mensagem de sucesso
5. Acesse via link personalizado e veja se aparece

### Teste 4: Link Antigo Ainda Funciona
1. Acesse `studionailart.vercel.app` (sem slug)
2. Verifique se ainda mostra lista de designers
3. Selecione uma designer
4. Continue o fluxo normal

---

## ⚠️ Pontos de Atenção

### 1. Slugs Duplicados
- Se duas designers tiverem nomes muito parecidos, o sistema gera o mesmo slug
- **Solução**: O campo `slug` é UNIQUE no banco, então dará erro
- **Prevenção**: Adicionar número ao final (ex: `klivia-azevedo-2`)

### 2. Foto de Perfil
- Precisa ser URL pública de imagem hospedada online
- Não funciona com arquivos locais
- **Sugestões para designer**:
  - Imgur (gratuito, fácil)
  - Google Drive (tornar público)
  - Dropbox (link público)

### 3. Mudança de Nome
- Se designer mudar o nome, o slug antigo pode não funcionar mais
- **Solução**: Salvar slug no banco e não regenerar automaticamente

### 4. Deploy no Vercel
- Links personalizados funcionam automaticamente
- Vercel suporta rotas dinâmicas
- Não precisa configuração extra

---

## 📊 Estatísticas (Futuro)

Pode-se implementar tracking de acessos:

```typescript
// Quando cliente acessa via link personalizado
await supabase
  .from('link_analytics')
  .insert({
    designer_id: designer.id,
    accessed_at: new Date().toISOString(),
    source: 'personal_link'
  });
```

Depois mostrar no painel da designer:
- Quantas pessoas acessaram seu link
- Quantos agendamentos vieram do link
- Taxa de conversão

---

## 🎯 Resumo

### O que mudou:
- ✅ Cada designer tem link personalizado
- ✅ Cliente pula etapa de seleção de designer
- ✅ Designer pode adicionar foto e bio
- ✅ Botão para copiar link facilmente
- ✅ Experiência mais pessoal e profissional

### O que NÃO mudou:
- ✅ Link principal ainda funciona (`studionailart.vercel.app`)
- ✅ Lista de designers ainda existe
- ✅ Fluxo de agendamento continua o mesmo
- ✅ Notificações via WhatsApp continuam funcionando

### Próximos passos:
1. Executar script SQL no Supabase
2. Testar links personalizados
3. Designers configurarem foto e bio
4. Compartilhar links com clientes
5. (Opcional) Implementar QR Code

---

**Desenvolvido com ❤️ para profissionais de beleza**

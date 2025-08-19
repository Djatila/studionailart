# Guia de Integração com Supabase

## ✅ Etapas Concluídas

1. **Dependências instaladas**: `@supabase/supabase-js`
2. **Arquivo .env criado** com variáveis de ambiente
3. **Cliente Supabase configurado** em `src/lib/supabase.ts`
4. **Schema SQL criado** em `supabase-schema.sql`
5. **Funções utilitárias criadas** em `src/utils/supabaseUtils.ts`

## 🚀 Próximos Passos para Completar a Integração

### 1. Configurar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Escolha sua organização e configure:
   - **Name**: Nail Designer Project
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Obter Credenciais do Supabase

1. No dashboard do seu projeto, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://xyzcompany.supabase.co`)
   - **anon/public key** (chave longa que começa com `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 3. Atualizar Arquivo .env

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua os valores placeholder pelas suas credenciais reais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 4. Criar Tabelas no Supabase

1. No dashboard do Supabase, vá em **SQL Editor**
2. Abra o arquivo `supabase-schema.sql` deste projeto
3. Copie todo o conteúdo do arquivo
4. Cole no SQL Editor do Supabase
5. Clique em **Run** para executar o script
6. Verifique se todas as tabelas foram criadas em **Table Editor**

### 5. Migrar Dados Existentes (Opcional)

Se você já tem dados no localStorage, pode migrá-los:

1. Abra o console do navegador (F12)
2. Execute o seguinte código:

```javascript
// Importar as funções de migração
import { migrationService } from './src/utils/supabaseUtils.ts'

// Executar migração completa
await migrationService.runCompleteMigration()
```

### 6. Atualizar Componentes para Usar Supabase

Substitua as chamadas do localStorage pelos serviços do Supabase:

#### Exemplo - App.tsx:
```typescript
// Antes (localStorage)
const designers = JSON.parse(localStorage.getItem('nailDesigners') || '[]')

// Depois (Supabase)
import { designerService } from './utils/supabaseUtils'
const designers = await designerService.getAll()
```

#### Exemplo - AdminDashboard.tsx:
```typescript
// Antes (localStorage)
const appointments = JSON.parse(localStorage.getItem('appointments') || '[]')

// Depois (Supabase)
import { appointmentService } from '../utils/supabaseUtils'
const appointments = await appointmentService.getByDesignerId(designer.id)
```

### 7. Principais Substituições Necessárias

| Arquivo | localStorage | Supabase |
|---------|-------------|----------|
| `App.tsx` | `getDesigners()` | `designerService.getAll()` |
| `LoginPage.tsx` | Login logic | `designerService.getByEmail()` |
| `AdminDashboard.tsx` | Appointments CRUD | `appointmentService.*` |
| `ServicesManager.tsx` | Services CRUD | `serviceService.*` |
| `AvailabilityManager.tsx` | Availability CRUD | `availabilityService.*` |

### 8. Configurar Autenticação (Opcional)

Para maior segurança, você pode implementar autenticação real:

```typescript
// Login com Supabase Auth
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### 9. Testar a Integração

1. Reinicie o servidor de desenvolvimento: `npm run dev`
2. Teste todas as funcionalidades:
   - Login de designers
   - Criação de agendamentos
   - Gerenciamento de serviços
   - Configuração de horários
3. Verifique no Supabase Table Editor se os dados estão sendo salvos

### 10. Configurações de Produção

1. **Políticas RLS**: Ajuste as políticas de Row Level Security conforme necessário
2. **Backup**: Configure backups automáticos no Supabase
3. **Monitoramento**: Configure alertas para erros e performance

## 🔧 Comandos Úteis

```bash
# Instalar dependências (já feito)
npm install @supabase/supabase-js

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

## 🆘 Solução de Problemas

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` está na raiz do projeto
- Confirme se as variáveis começam com `VITE_`
- Reinicie o servidor após alterar o `.env`

### Erro: "Failed to fetch"
- Verifique se a URL do Supabase está correta
- Confirme se o projeto Supabase está ativo
- Verifique sua conexão com a internet

### Tabelas não aparecem
- Execute novamente o script SQL no Supabase
- Verifique se não há erros no SQL Editor
- Confirme se você tem permissões adequadas

## ✨ Benefícios da Migração

- **Persistência real**: Dados não se perdem ao limpar o navegador
- **Sincronização**: Múltiplos dispositivos podem acessar os mesmos dados
- **Backup automático**: Supabase faz backup dos seus dados
- **Escalabilidade**: Suporte a milhares de usuários
- **Segurança**: Autenticação e autorização robustas
- **Realtime**: Atualizações em tempo real entre dispositivos

---

**Próximo passo**: Configure seu projeto no Supabase e atualize o arquivo `.env` com suas credenciais!
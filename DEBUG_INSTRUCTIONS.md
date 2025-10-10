# Instruções para Debugar o Problema de Exclusão de Bloqueios

## Problema Identificado
O usuário relatou que ao deletar um bloqueio específico, todos os bloqueios são deletados ao mesmo tempo. Após análise do código, identifiquei que o problema pode estar relacionado a:

1. Políticas RLS (Row Level Security) no Supabase
2. Problemas na função de exclusão individual
3. Sincronização entre Supabase e localStorage

## Passos para Debugar

### 1. Verificar Políticas RLS
Execute o script `apply-availability-rls-fix.sql` no editor SQL do Supabase:

```sql
-- Verificar políticas atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'availability'
ORDER BY policyname;
```

### 2. Testar Exclusão Individual
Abra o arquivo `test-delete-availability.html` em um navegador e:

1. Preencha as credenciais do Supabase
2. Informe o ID de um designer de teste
3. Crie alguns bloqueios de teste
4. Tente excluir um bloqueio específico
5. Verifique se apenas esse bloqueio foi excluído

### 3. Verificar Console do Navegador
Ao reproduzir o problema no ambiente de produção:

1. Abra o console do navegador (F12)
2. Vá para a aba "Console"
3. Reproduza o problema de exclusão
4. Observe as mensagens de log, especialmente:
   - "Disponibilidade deletada do Supabase:"
   - "Erro ao deletar disponibilidade do Supabase:"
   - "Falha ao deletar disponibilidade do Supabase:"

### 4. Verificar LocalStorage
No console do navegador, execute:

```javascript
// Verificar dados de disponibilidade no localStorage
console.log(JSON.parse(localStorage.getItem('nail_availability') || '[]'));
```

### 5. Testar Função deleteAvailability Isoladamente
Crie um teste simples como o `test-availability-delete.js` para verificar o comportamento da função de exclusão.

## Possíveis Causas e Soluções

### Causa 1: Políticas RLS Restritivas
**Solução:** Aplicar o script `apply-availability-rls-fix.sql` no Supabase.

### Causa 2: Erro na Função deleteAvailability
**Solução:** Já implementada no componente [AvailabilityManager.tsx](file:///c:/Users/vanes/OneDrive/%C3%81rea%20de%20Trabalho/Studio%20Nail%20App/nailApp%20-%20Copia/src/components/AvailabilityManager.tsx) com tratamento de erros e verificação de tipos.

### Causa 3: Problemas de Sincronização
**Solução:** A função agora atualiza o estado local imediatamente e recarrega os dados do Supabase para garantir consistência.

## Verificação Final
Após aplicar as correções:

1. Crie vários bloqueios de horários diferentes
2. Tente excluir um bloqueio específico
3. Verifique que apenas esse bloqueio foi excluído
4. Confirme que os demais bloqueios permanecem visíveis
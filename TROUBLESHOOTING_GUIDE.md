# Guia de Solução de Problemas - Exclusão de Bloqueios

## Problemas Comuns e Soluções

### 1. Nada acontece ao clicar na lixeira

**Sintomas:**
- Ao clicar na lixeira, não há nenhuma mudança
- Nenhum log aparece no console
- O bloqueio continua visível

**Soluções:**
1. Verifique se o console do navegador está aberto antes de clicar
2. Confirme que não há erros de JavaScript na aba "Console"
3. Verifique se há erros de rede na aba "Network"

### 2. Erro "Falha ao deletar disponibilidade do Supabase"

**Sintomas:**
- Mensagem de aviso no console: "Falha ao deletar disponibilidade do Supabase"
- O bloqueio não é excluído

**Soluções:**
1. Verifique se as políticas RLS estão configuradas corretamente
2. Execute o script `apply-availability-rls-fix.sql` no Supabase
3. Confirme que o ID sendo passado é válido

### 3. Os dados continuam no localStorage após exclusão

**Sintomas:**
- O bloqueio desaparece da interface mas volta ao recarregar
- Os dados continuam no localStorage

**Soluções:**
1. Verifique se há erros no console relacionados ao localStorage
2. Confirme que o ID está no formato correto (string)
3. Teste a exclusão manual no console:

```javascript
// Substitua 'ID_AQUI' pelo ID real
const id = 'ID_AQUI';
const saved = localStorage.getItem('nail_availability');
let allAvailability = saved ? JSON.parse(saved) : [];
const filtered = allAvailability.filter(item => String(item.id) !== String(id));
localStorage.setItem('nail_availability', JSON.stringify(filtered));
```

### 4. Problemas com Tipos de ID

**Sintomas:**
- IDs numéricos e strings não são comparados corretamente
- Alguns bloqueios são excluídos e outros não

**Soluções:**
1. Verifique se todos os IDs estão como strings
2. Force a conversão para string na comparação:
   ```javascript
   String(item.id) !== String(targetId)
   ```

### 5. Estado da Interface não Atualiza

**Sintomas:**
- O bloqueio é excluído do localStorage mas continua visível
- É necessário recarregar a página para ver as mudanças

**Soluções:**
1. Verifique se a função `setAvailability` está sendo chamada corretamente
2. Confirme que o estado está sendo atualizado após a exclusão
3. Verifique se há erros na função de atualização do estado

## Comandos de Debug Úteis

### Verificar dados no localStorage:
```javascript
JSON.parse(localStorage.getItem('nail_availability') || '[]')
```

### Verificar estrutura dos dados:
```javascript
const data = JSON.parse(localStorage.getItem('nail_availability') || '[]');
data.forEach((item, index) => {
  console.log(`Item ${index}:`, {
    id: item.id,
    tipo: typeof item.id,
    valor: item.id
  });
});
```

### Testar exclusão manual:
```javascript
function testDelete(id) {
  const saved = localStorage.getItem('nail_availability');
  let allAvailability = saved ? JSON.parse(saved) : [];
  const filtered = allAvailability.filter(item => String(item.id) !== String(id));
  localStorage.setItem('nail_availability', JSON.stringify(filtered));
  console.log('Exclusão testada:', filtered);
}
```

## Verificação Final

1. Crie 3 bloqueios diferentes
2. Tente excluir o segundo bloqueio
3. Verifique que apenas esse bloqueio foi excluído
4. Confirme que os outros 2 bloqueios permanecem
5. Recarregue a página e verifique que a exclusão persistiu

## Contato para Suporte

Se após seguir este guia o problema persistir, entre em contato com o suporte técnico.
# Guia de Teste para o Usuário

## Como Testar a Correção do Problema de Exclusão

### Passo 1: Abrir o Console do Navegador
1. Abra o aplicativo no seu navegador
2. Pressione **F12** ou clique com o botão direito e selecione "Inspecionar"
3. Vá para a aba **Console**

### Passo 2: Reproduzir o Problema
1. Crie um ou mais bloqueios de horários
2. Tente excluir um bloqueio específico clicando na lixeira
3. Observe as mensagens no console que começam com "==="

### Passo 3: Verificar os Logs
Você deve ver mensagens como:
- `=== Iniciando deleteAvailability ===`
- `ID a ser excluído: [algum-id]`
- `Tentando deletar do Supabase...`
- `Tentando deletar do localStorage...`

### Passo 4: Verificar os Dados
No console, execute este comando:
```javascript
JSON.parse(localStorage.getItem('nail_availability') || '[]')
```

Isso mostrará os dados atuais de bloqueios.

### Passo 5: Verificar se a Exclusão Funcionou
1. Após tentar excluir um bloqueio, execute novamente o comando acima
2. Verifique se o bloqueio específico foi removido
3. Confirme que os outros bloqueios permanecem

## O que Esperar
- Ao clicar na lixeira, apenas o bloqueio específico deve ser excluído
- Os outros bloqueios devem permanecer visíveis
- Não deve haver erros no console relacionados à exclusão

## Problemas Comuns e Soluções

### Problema: Nenhum log aparece no console
**Solução:** Verifique se você está com o console aberto antes de clicar na lixeira.

### Problema: Mensagem "Falha ao deletar disponibilidade do Supabase"
**Solução:** Verifique se as políticas RLS estão configuradas corretamente no Supabase.

### Problema: Os dados continuam aparecendo após a exclusão
**Solução:** Recarregue a página e verifique novamente.

## Contato para Suporte
Se após seguir estes passos o problema persistir, entre em contato com o suporte técnico.
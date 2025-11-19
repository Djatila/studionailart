# Correção dos Erros de Serviços no Console

## Problema Identificado

Os erros no console ao criar e deletar serviços ocorrem porque o código está tentando usar as colunas `category` e `description` na tabela `services`, mas essas colunas não existem no banco de dados Supabase.

## Solução

Para corrigir os erros, você precisa adicionar essas colunas à tabela `services` no Supabase.

### Passo 1: Executar o Script SQL

1. Acesse o painel do Supabase (https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Copie e cole o conteúdo do arquivo `add-category-column-to-services.sql`
5. Execute o script clicando em "Run"

### Passo 2: Verificar as Alterações

Após executar o script, a tabela `services` terá as seguintes colunas adicionais:

- `category` (VARCHAR(50)): Categoria do serviço ('services' ou 'extras')
- `description` (TEXT): Descrição opcional do serviço

### Passo 3: Testar a Aplicação

1. Reinicie o servidor de desenvolvimento se necessário
2. Tente criar um novo serviço
3. Tente deletar um serviço
4. Verifique se os erros no console desapareceram

## Arquivos Modificados

- ✅ `src/lib/supabase.ts` - Tipos TypeScript atualizados
- ✅ `supabase-schema.sql` - Schema atualizado
- ✅ `add-category-column-to-services.sql` - Script para adicionar colunas

## Observações

- As correções de UUID já foram aplicadas anteriormente
- O código já está preparado para usar as novas colunas
- Após executar o script SQL, tudo deve funcionar corretamente

## Em Caso de Problemas

Se ainda houver erros após executar o script:

1. Verifique se o script foi executado com sucesso
2. Confirme que as colunas foram adicionadas executando:
   ```sql
   SELECT column_name, data_type FROM information_schema.columns 
   WHERE table_name = 'services' ORDER BY ordinal_position;
   ```
3. Reinicie a aplicação completamente
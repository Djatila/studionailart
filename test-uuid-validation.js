// Teste da validação de formato UUID
console.log('=== Teste da validação de formato UUID ===\n');

// Função para verificar se um ID está no formato UUID válido
function isUuidFormat(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// IDs de teste
const testIds = [
  'local-1759424646013-0-2zjl4cza3',  // ID local (inválido para Supabase)
  '123e4567-e89b-12d3-a456-426614174000',  // UUID válido
  '123e4567-e89b-12d3-a456-42661417400g',  // UUID inválido (caractere 'g')
  'abc-def-ghi-jkl-mno',  // Formato inválido
  '12345',  // ID numérico simples
  null,  // Valor nulo
  undefined,  // Valor indefinido
  '',  // String vazia
];

console.log('Testando validação de formato UUID:');
testIds.forEach((id, index) => {
  const result = isUuidFormat(id);
  console.log(`${index + 1}. ID: "${id}" -> Válido: ${result}`);
});

// Função simulada de delete do Supabase
function deleteFromSupabase(id) {
  console.log(`\n=== Tentando deletar do Supabase ===`);
  console.log(`ID a ser excluído: ${id}`);
  
  // Verificar se o ID está no formato UUID válido
  const isValidUuid = isUuidFormat(id);
  console.log(`ID está no formato UUID válido: ${isValidUuid}`);
  
  if (!isValidUuid) {
    console.log('⚠️  Pulando deleção no Supabase - ID não é UUID válido');
    return false;
  }
  
  // Simular deleção no Supabase (apenas para UUIDs válidos)
  console.log('✅ Deletando do Supabase...');
  // Aqui iria a chamada real para o Supabase
  console.log('✅ Registro excluído com sucesso do Supabase');
  return true;
}

// Testar deleção com diferentes tipos de IDs
console.log('\n\n=== Teste de deleção no Supabase ===');

// Teste 1: ID local (deve pular a deleção no Supabase)
console.log('\n--- Teste 1: ID local ---');
deleteFromSupabase('local-1759424646013-0-2zjl4cza3');

// Teste 2: UUID válido (deve deletar no Supabase)
console.log('\n--- Teste 2: UUID válido ---');
deleteFromSupabase('123e4567-e89b-12d3-a456-426614174000');

// Teste 3: UUID inválido (deve pular a deleção no Supabase)
console.log('\n--- Teste 3: UUID inválido ---');
deleteFromSupabase('123e4567-e89b-12d3-a456-42661417400g');

console.log('\n=== Fim dos testes ===');
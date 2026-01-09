// Teste da função de exclusão de disponibilidade
console.log('=== Teste da função deleteAvailability ===\n');

// Simular a estrutura de dados
const mockAvailability = [
  {
    id: 'local-1759424646013-0-2zjl4cza3',
    designerId: 'designer-123',
    specificDate: '2023-10-15',
    startTime: '08:00',
    endTime: '09:00',
    isActive: true
  },
  {
    id: 'local-1759424646013-1-iyz7gygmo',
    designerId: 'designer-123',
    specificDate: '2023-10-15',
    startTime: '13:00',
    endTime: '14:00',
    isActive: true
  },
  {
    id: 'local-1759424646013-2-2m2uthz2i',
    designerId: 'designer-123',
    specificDate: '2023-10-15',
    startTime: '17:00',
    endTime: '18:00',
    isActive: true
  }
];

console.log('Disponibilidade inicial:', JSON.stringify(mockAvailability, null, 2));

// Função simulada de deleteAvailability
function deleteAvailability(availabilityId) {
  console.log(`\nTentando excluir bloqueio com ID: ${availabilityId}`);
  
  // Simular exclusão do localStorage
  let allAvailability = [...mockAvailability];
  
  console.log(`Total de itens antes da exclusão: ${allAvailability.length}`);
  
  // Filtrar para remover apenas o item específico
  const filtered = allAvailability.filter((avail) => {
    // Verificar se avail existe e tem id
    if (!avail || !avail.id) return true;
    // Comparar IDs como strings
    const shouldKeep = String(avail.id) !== String(availabilityId);
    console.log(`Comparando: "${avail.id}" !== "${availabilityId}" = ${shouldKeep}`);
    return shouldKeep;
  });
  
  console.log(`Total de itens após a exclusão: ${filtered.length}`);
  
  // Mostrar quais itens foram mantidos
  console.log('Itens mantidos após exclusão:', JSON.stringify(filtered, null, 2));
  
  // Verificar se o item foi realmente removido
  const removedItem = allAvailability.find(avail => String(avail.id) === String(availabilityId));
  if (removedItem) {
    console.log(`✅ Item excluído com sucesso:`, removedItem);
  } else {
    console.log(`❌ Item com ID ${availabilityId} não encontrado para exclusão`);
  }
  
  return filtered;
}

// Testar a exclusão de um item específico
console.log('\n--- Teste 1: Excluir item com ID "local-1759424646013-1-iyz7gygmo" ---');
const result1 = deleteAvailability('local-1759424646013-1-iyz7gygmo');

console.log('\n--- Teste 2: Excluir item com ID "local-1759424646013-0-2zjl4cza3" ---');
const result2 = deleteAvailability('local-1759424646013-0-2zjl4cza3');

console.log('\n--- Teste 3: Excluir item com ID "local-1759424646013-2-2m2uthz2i" ---');
const result3 = deleteAvailability('local-1759424646013-2-2m2uthz2i');

console.log('\n=== Resultados dos testes ===');
console.log('Teste 1 (excluir ID local-1759424646013-1-iyz7gygmo):', result1.length === 2 ? '✅ PASSOU' : '❌ FALHOU');
console.log('Teste 2 (excluir ID local-1759424646013-0-2zjl4cza3):', result2.length === 2 ? '✅ PASSOU' : '❌ FALHOU');
console.log('Teste 3 (excluir ID local-1759424646013-2-2m2uthz2i):', result3.length === 2 ? '✅ PASSOU' : '❌ FALHOU');
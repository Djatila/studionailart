// Teste específico para a função deleteAvailability
console.log('=== Teste da função deleteAvailability ===\n');

// Simular a estrutura de dados
const mockAvailability = [
  {
    id: '1',
    designerId: 'designer-123',
    specificDate: '2023-10-15',
    startTime: '08:00',
    endTime: '09:00',
    isActive: true
  },
  {
    id: '2',
    designerId: 'designer-123',
    specificDate: '2023-10-15',
    startTime: '13:00',
    endTime: '14:00',
    isActive: true
  },
  {
    id: '3',
    designerId: 'designer-123',
    specificDate: '2023-10-15',
    startTime: '17:00',
    endTime: '18:00',
    isActive: true
  }
];

console.log('Disponibilidade inicial:', mockAvailability);

// Função simulada de deleteAvailability
async function deleteAvailability(availabilityId) {
  console.log(`\nTentando excluir bloqueio com ID: ${availabilityId}`);
  
  // Simular exclusão do localStorage
  const saved = JSON.stringify(mockAvailability);
  let allAvailability = saved ? JSON.parse(saved) : [];
  
  // Verificar se allAvailability é um array
  if (!Array.isArray(allAvailability)) {
    allAvailability = [];
  }
  
  console.log(`Total de itens antes da exclusão: ${allAvailability.length}`);
  
  // Filtrar para remover apenas o item específico
  const filtered = allAvailability.filter((avail) => {
    // Verificar se avail existe e tem id
    if (!avail || !avail.id) return true;
    // Comparar IDs como strings
    return String(avail.id) !== String(availabilityId);
  });
  
  console.log(`Total de itens após a exclusão: ${filtered.length}`);
  
  // Mostrar quais itens foram mantidos
  console.log('Itens mantidos após exclusão:', filtered);
  
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
(async () => {
  console.log('\n--- Teste 1: Excluir item com ID "2" ---');
  const result1 = await deleteAvailability('2');
  
  console.log('\n--- Teste 2: Excluir item com ID "1" ---');
  const result2 = await deleteAvailability('1');
  
  console.log('\n--- Teste 3: Excluir item com ID "3" ---');
  const result3 = await deleteAvailability('3');
  
  console.log('\n--- Teste 4: Excluir item inexistente com ID "999" ---');
  const result4 = await deleteAvailability('999');
  
  console.log('\n=== Resultados dos testes ===');
  console.log('Teste 1 (excluir ID 2):', result1.length === 2 ? '✅ PASSOU' : '❌ FALHOU');
  console.log('Teste 2 (excluir ID 1):', result2.length === 2 ? '✅ PASSOU' : '❌ FALHOU');
  console.log('Teste 3 (excluir ID 3):', result3.length === 2 ? '✅ PASSOU' : '❌ FALHOU');
  console.log('Teste 4 (excluir ID 999):', result4.length === 3 ? '✅ PASSOU' : '❌ FALHOU');
})();
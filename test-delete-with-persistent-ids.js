// Teste para verificar se a exclusão está funcionando corretamente com IDs persistentes
console.log('=== Teste de Exclusão com IDs Persistentes ===\n');

// Função para simular a exclusão
function deleteAvailability(allAvailability, availabilityId) {
  console.log(`Tentando excluir item com ID: ${availabilityId}`);
  console.log('Dados atuais:', JSON.stringify(allAvailability, null, 2));
  
  // Filtrar para remover apenas o item específico
  const filtered = allAvailability.filter((avail) => {
    // Verificar se avail existe e tem id
    if (!avail || !avail.id) {
      console.log('Item inválido encontrado:', avail);
      return true; // Manter itens válidos
    }
    
    // Comparar IDs como strings para garantir compatibilidade
    const shouldKeep = String(avail.id) !== String(availabilityId);
    console.log(`Comparando: "${avail.id}" !== "${availabilityId}" = ${shouldKeep}`);
    return shouldKeep;
  });
  
  console.log('Resultado após filtragem:', JSON.stringify(filtered, null, 2));
  console.log(`Itens removidos: ${allAvailability.length - filtered.length}`);
  
  return filtered;
}

// Dados de teste com IDs persistentes
const testData = [
  {
    id: 'local-1759426056297-0-d8w8g4jqh',
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
    id: 'local-1759426056297-2-7e777leou',
    designerId: 'designer-123',
    specificDate: '2023-10-15',
    startTime: '17:00',
    endTime: '18:00',
    isActive: true
  }
];

console.log('Dados de teste iniciais:');
console.log(JSON.stringify(testData, null, 2));

// Testar exclusão do item do meio
console.log('\n--- Teste 1: Excluir item do meio ---');
const result1 = deleteAvailability([...testData], 'local-1759424646013-1-iyz7gygmo');

console.log('\nItens restantes após exclusão:');
result1.forEach((item, index) => {
  console.log(`${index + 1}. ${item.specificDate} ${item.startTime}-${item.endTime} (ID: ${item.id})`);
});

const test1Passed = result1.length === 2 && 
                   result1[0].id === 'local-1759426056297-0-d8w8g4jqh' && 
                   result1[1].id === 'local-1759426056297-2-7e777leou';
console.log(`\n✅ Teste 1 PASSOU: ${test1Passed ? 'SIM' : 'NÃO'}`);

// Testar exclusão do primeiro item
console.log('\n--- Teste 2: Excluir primeiro item ---');
const result2 = deleteAvailability([...testData], 'local-1759426056297-0-d8w8g4jqh');

console.log('\nItens restantes após exclusão:');
result2.forEach((item, index) => {
  console.log(`${index + 1}. ${item.specificDate} ${item.startTime}-${item.endTime} (ID: ${item.id})`);
});

const test2Passed = result2.length === 2 && 
                   result2[0].id === 'local-1759424646013-1-iyz7gygmo' && 
                   result2[1].id === 'local-1759426056297-2-7e777leou';
console.log(`\n✅ Teste 2 PASSOU: ${test2Passed ? 'SIM' : 'NÃO'}`);

// Testar exclusão do último item
console.log('\n--- Teste 3: Excluir último item ---');
const result3 = deleteAvailability([...testData], 'local-1759426056297-2-7e777leou');

console.log('\nItens restantes após exclusão:');
result3.forEach((item, index) => {
  console.log(`${index + 1}. ${item.specificDate} ${item.startTime}-${item.endTime} (ID: ${item.id})`);
});

const test3Passed = result3.length === 2 && 
                   result3[0].id === 'local-1759426056297-0-d8w8g4jqh' && 
                   result3[1].id === 'local-1759424646013-1-iyz7gygmo';
console.log(`\n✅ Teste 3 PASSOU: ${test3Passed ? 'SIM' : 'NÃO'}`);

// Resumo final
console.log('\n=== RESUMO DOS TESTES ===');
console.log(`Teste 1 (excluir item do meio): ${test1Passed ? '✅ PASSOU' : '❌ FALHOU'}`);
console.log(`Teste 2 (excluir primeiro item): ${test2Passed ? '✅ PASSOU' : '❌ FALHOU'}`);
console.log(`Teste 3 (excluir último item): ${test3Passed ? '✅ PASSOU' : '❌ FALHOU'}`);

const allTestsPassed = test1Passed && test2Passed && test3Passed;
console.log(`\n🏁 TODOS OS TESTES: ${allTestsPassed ? '✅ PASSARAM' : '❌ FALHARAM'}`);
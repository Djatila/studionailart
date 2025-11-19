// Script para testar tipos de IDs
console.log('=== Teste de Tipos de IDs ===\n');

// Testar diferentes tipos de IDs
const testIds = [
  '1',
  1,
  'abc-123-def-456',
  12345678901234567890n, // BigInt
  null,
  undefined,
  0,
  '0'
];

console.log('Testando função String() com diferentes tipos:');
testIds.forEach((id, index) => {
  try {
    const stringId = String(id);
    console.log(`ID ${index + 1}: ${JSON.stringify(id)} (${typeof id}) -> "${stringId}" (${typeof stringId})`);
  } catch (error) {
    console.error(`Erro ao converter ID ${index + 1}:`, error);
  }
});

// Testar comparação de IDs
console.log('\nTestando comparação de IDs:');
const targetId = '1';
console.log(`Comparando com targetId: "${targetId}" (${typeof targetId})`);

testIds.forEach((id, index) => {
  try {
    const stringId = String(id);
    const isEqual = stringId === targetId;
    const isNotEqual = stringId !== targetId;
    console.log(`ID ${index + 1}: "${stringId}" === "${targetId}" = ${isEqual}`);
    console.log(`ID ${index + 1}: "${stringId}" !== "${targetId}" = ${isNotEqual}`);
  } catch (error) {
    console.error(`Erro ao comparar ID ${index + 1}:`, error);
  }
});

// Testar com dados reais do localStorage
console.log('\nTestando com dados reais do localStorage:');
try {
  const saved = localStorage.getItem('nail_availability');
  if (saved) {
    const allAvailability = JSON.parse(saved);
    console.log(`Total de registros: ${allAvailability.length}`);
    
    if (allAvailability.length > 0) {
      console.log('\nAnálise dos primeiros 3 registros:');
      allAvailability.slice(0, 3).forEach((item, index) => {
        console.log(`Registro ${index + 1}:`, {
          id: item.id,
          tipo: typeof item.id,
          valor: item.id,
          string: String(item.id)
        });
      });
      
      // Testar exclusão de um item
      if (allAvailability[0] && allAvailability[0].id) {
        const testId = allAvailability[0].id;
        console.log(`\nTestando filtragem com ID: ${testId} (${typeof testId})`);
        
        const filtered = allAvailability.filter(item => {
          if (!item || !item.id) return true;
          const keep = String(item.id) !== String(testId);
          console.log(`Comparando: "${item.id}" (${typeof item.id}) !== "${testId}" (${typeof testId}) = ${keep}`);
          return keep;
        });
        
        console.log(`Resultado: ${filtered.length} itens mantidos de ${allAvailability.length} itens originais`);
      }
    }
  } else {
    console.log('Nenhum dado encontrado no localStorage');
  }
} catch (error) {
  console.error('Erro ao testar com dados reais:', error);
}

console.log('\n=== Fim do teste ===');
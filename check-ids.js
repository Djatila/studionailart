// Script para verificar problemas com IDs dos registros
console.log('=== Verificação de IDs ===\n');

// Verificar dados no localStorage
console.log('1. Verificando dados no localStorage...');
try {
  const saved = localStorage.getItem('nail_availability');
  const allAvailability = saved ? JSON.parse(saved) : [];
  
  console.log('Total de registros:', allAvailability.length);
  
  if (allAvailability.length > 0) {
    console.log('\nAnálise de IDs:');
    allAvailability.forEach((item, index) => {
      console.log(`Registro ${index + 1}:`, {
        id: item.id,
        tipoId: typeof item.id,
        valorId: JSON.stringify(item.id),
        designerId: item.designerId,
        specificDate: item.specificDate
      });
      
      // Verificar se o ID é válido
      if (item.id === undefined || item.id === null) {
        console.warn(`⚠️  Registro ${index + 1} tem ID inválido:`, item.id);
      }
      
      if (typeof item.id === 'number') {
        console.warn(`⚠️  Registro ${index + 1} tem ID numérico:`, item.id);
      }
    });
  } else {
    console.log('Nenhum registro encontrado no localStorage');
  }
} catch (error) {
  console.error('Erro ao acessar localStorage:', error);
}

// Verificar dados no Supabase (se possível)
console.log('\n2. Verificando dados no Supabase...');
console.log('Para verificar dados no Supabase, execute esta query:');
console.log(`
SELECT 
  id,
  typeof(id) as tipo_id,
  designer_id,
  specific_date,
  start_time,
  end_time
FROM availability 
ORDER BY created_at DESC 
LIMIT 10;
`);

// Testar comparação de IDs
console.log('\n3. Testando comparação de IDs...');
const testIds = [
  '1',
  1,
  'abc-123',
  null,
  undefined,
  0
];

console.log('Comparação de IDs usando String():');
testIds.forEach(id1 => {
  testIds.forEach(id2 => {
    const result = String(id1) !== String(id2);
    console.log(`${JSON.stringify(id1)} !== ${JSON.stringify(id2)} = ${result}`);
  });
});

console.log('\n=== Fim da verificação ===');
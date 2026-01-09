// Utilitário para verificar dados de disponibilidade
console.log('=== Verificação de Dados de Disponibilidade ===\n');

// Verificar localStorage
console.log('1. Dados no localStorage:');
try {
  const saved = localStorage.getItem('nail_availability');
  const allAvailability = saved ? JSON.parse(saved) : [];
  console.log('Dados brutos:', saved);
  console.log('Dados parseados:', allAvailability);
  console.log('Total de registros:', allAvailability.length);
  
  if (allAvailability.length > 0) {
    console.log('\nDetalhes dos registros:');
    allAvailability.forEach((item, index) => {
      console.log(`Registro ${index + 1}:`, {
        id: item.id,
        tipoId: typeof item.id,
        designerId: item.designerId,
        specificDate: item.specificDate,
        startTime: item.startTime,
        endTime: item.endTime,
        isActive: item.isActive
      });
    });
  }
} catch (error) {
  console.error('Erro ao acessar localStorage:', error);
}

// Verificar se há funções disponíveis
console.log('\n2. Verificando funções disponíveis:');
console.log('localStorage.getItem:', typeof localStorage.getItem);
console.log('localStorage.setItem:', typeof localStorage.setItem);
console.log('localStorage.removeItem:', typeof localStorage.removeItem);

// Testar atualização de dados
console.log('\n3. Testando atualização de dados:');
try {
  const testData = [{id: 'test-1', name: 'Teste'}];
  localStorage.setItem('nail_availability_test', JSON.stringify(testData));
  const retrieved = JSON.parse(localStorage.getItem('nail_availability_test') || '[]');
  console.log('Teste de gravação/leitura:', retrieved);
  localStorage.removeItem('nail_availability_test');
  console.log('Teste concluído com sucesso');
} catch (error) {
  console.error('Erro no teste de gravação/leitura:', error);
}

console.log('\n=== Fim da verificação ===');
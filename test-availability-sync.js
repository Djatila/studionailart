// Script para testar a sincronização de disponibilidade com Supabase
console.log('=== TESTE: SINCRONIZAÇÃO DE DISPONIBILIDADE ===');

// Simular dados de disponibilidade
const testAvailability = {
  id: 'test-avail-' + Date.now(),
  designerId: 'test-designer-id',
  specificDate: '2024-01-15',
  startTime: '09:00',
  endTime: '18:00',
  isActive: true
};

console.log('1. Dados de teste da disponibilidade:', testAvailability);

// Verificar localStorage atual
if (typeof window !== 'undefined') {
  const localAvailability = localStorage.getItem('nail_availability');
  console.log('2. Disponibilidade no localStorage:', localAvailability ? JSON.parse(localAvailability) : 'Nenhuma');
  
  // Tentar importar as funções do Supabase
  import('./src/utils/supabaseUtils.js').then(async (supabaseUtils) => {
    console.log('3. Funções do Supabase carregadas');
    
    try {
      // Testar availabilityService.create
      console.log('4. Testando availabilityService.create...');
      
      const supabaseAvailability = {
        designer_id: testAvailability.designerId,
        day_of_week: testAvailability.specificDate ? new Date(testAvailability.specificDate).getDay() : 0,
        start_time: testAvailability.startTime,
        end_time: testAvailability.endTime,
        specific_date: testAvailability.specificDate,
        is_available: testAvailability.isActive
      };
      
      console.log('5. Dados formatados para Supabase:', supabaseAvailability);
      
      const result = await supabaseUtils.availabilityService.create(supabaseAvailability);
      console.log('6. Resultado da criação:', result);
      
      if (result) {
        console.log('✅ SUCESSO: Disponibilidade salva no Supabase!');
        
        // Testar busca
        console.log('7. Testando busca de disponibilidade...');
        const availabilities = await supabaseUtils.availabilityService.getByDesignerId(testAvailability.designerId);
        console.log('8. Disponibilidades encontradas:', availabilities);
      } else {
        console.log('❌ ERRO: Falha ao salvar disponibilidade no Supabase');
      }
      
    } catch (error) {
      console.error('❌ ERRO durante o teste:', error);
    }
  }).catch(error => {
    console.error('❌ ERRO ao carregar supabaseUtils:', error);
  });
} else {
  console.log('Script executado fora do navegador');
}
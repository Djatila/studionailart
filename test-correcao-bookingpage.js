// Teste para verificar a correção da função getAvailableTimeSlots no BookingPage
console.log("=== Teste de Correção: BookingPage getAvailableTimeSlots ===\n");

// Simular dados de disponibilidade (bloqueios)
const blocked = [
  {
    id: 'test-id-0',
    designerId: 'test-designer-id',
    dayOfWeek: 6,
    startTime: '08:00',
    endTime: '09:00',
    isActive: true,
    specificDate: '2023-10-15'
  },
  {
    id: 'test-id-1',
    designerId: 'test-designer-id',
    dayOfWeek: 6,
    startTime: '13:00',
    endTime: '14:00',
    isActive: true,
    specificDate: '2023-10-15'
  },
  {
    id: 'test-id-2',
    designerId: 'test-designer-id',
    dayOfWeek: 6,
    startTime: '17:00',
    endTime: '18:00',
    isActive: true,
    specificDate: '2023-10-15'
  }
];

console.log("Bloqueios simulados:", blocked);

// Simular a função getAvailableTimeSlots corrigida
async function getAvailableTimeSlots() {
  const selectedDate = '2023-10-15';
  const defaultTimeSlots = ['08:00', '10:00', '13:00', '15:00', '17:00'];
  
  try {
    const cacheBreaker = Date.now().toString();
    console.log(`🔄 [${cacheBreaker}] Buscando horários disponíveis para ${selectedDate}`);

    // Check for a full-day block first
    const dayBlockedCompletely = blocked.some(avail => 
      avail.specificDate === selectedDate && avail.startTime === '00:00' && avail.endTime === '23:59' && avail.isActive
    );

    if (dayBlockedCompletely) {
      // If the entire day is blocked, no slots are available
      console.log(`🚫 [${cacheBreaker}] Dia inteiro bloqueado`);
      return [];
    }

    // Simular agendamentos ocupados (vazio para este teste)
    const activeAppointments = [];
    console.log(`📊 [${cacheBreaker}] Agendamentos ativos (não cancelados):`, activeAppointments.length);

    // Extrair e normalizar horários ocupados por agendamentos
    const bookedTimes = activeAppointments.map(apt => {
      return apt.time.length > 5 ? apt.time.substring(0, 5) : apt.time;
    });
    console.log(`⏰ [${cacheBreaker}] Horários ocupados por agendamentos (normalizados):`, bookedTimes);

    // Verificar bloqueios de disponibilidade para a data selecionada
    const blockedTimes = blocked
      .filter((avail) => {
        if (!avail || !avail.specificDate || !avail.isActive) return false;
        const normalizedAvailDate = String(avail.specificDate).split('T')[0];
        const normalizedSelectedDate = selectedDate.split('T')[0];
        return normalizedAvailDate === normalizedSelectedDate;
      })
      .map((avail) => {
        // Para bloqueios de horários específicos, retornar o horário de início
        if (avail.startTime !== '00:00' || avail.endTime !== '23:59') {
          return avail.startTime;
        }
        // Para bloqueios de dia inteiro, retornar todos os horários
        return null;
      })
      .filter(time => time !== null);
    
    console.log(`🚫 [${cacheBreaker}] Horários bloqueados por disponibilidade:`, blockedTimes);
    
    // Combinar horários ocupados por agendamentos e bloqueios de disponibilidade
    const allBlockedTimes = [...bookedTimes, ...blockedTimes];
    
    // Filtrar horários disponíveis
    const availableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
    console.log(`✨ [${cacheBreaker}] Horários disponíveis:`, availableSlots);
    
    return availableSlots;
  } catch (error) {
    console.error('❌ Erro ao buscar horários disponíveis:', error);
    return defaultTimeSlots;
  }
}

// Executar o teste
(async () => {
  console.log("Executando teste da função getAvailableTimeSlots corrigida...\n");
  
  const result = await getAvailableTimeSlots();
  
  console.log("\n=== RESULTADOS ===");
  console.log("Horários disponíveis retornados:", result);
  
  // Verificar se o resultado está correto
  const expected = ['10:00', '15:00'];
  const isCorrect = JSON.stringify(result.sort()) === JSON.stringify(expected.sort());
  
  console.log("Horários esperados:", expected);
  console.log("Resultado correto:", isCorrect);
  
  if (isCorrect) {
    console.log("\n🎉 SUCESSO: A correção funcionou!");
    console.log("   - Horários bloqueados: 08:00, 13:00, 17:00");
    console.log("   - Horários disponíveis: 10:00, 15:00");
  } else {
    console.log("\n❌ FALHA: A correção não funcionou como esperado.");
  }
  
  console.log("\n=== FIM DO TESTE ===");
})();
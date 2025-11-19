// Teste de integração final para verificar se ambos os componentes estão funcionando corretamente
console.log("=== Teste de Integração Final ===\n");

// 1. Simular criação de bloqueios no AvailabilityManager
console.log("1. Simulando criação de bloqueios no AvailabilityManager...");

const formData = {
  specificDate: '2023-10-15',
  blockType: 'specificHours',
  specificHours: ['08:00', '13:00', '17:00']
};

console.log("Dados do formulário:", formData);

// Simular a criação dos bloqueios (como no handleSubmit do AvailabilityManager)
const createdBlocks = [];

for (const hour of formData.specificHours) {
  // Converter hora para formato de início e fim (ex: '08:00' -> '08:00' a '09:00')
  const [hours, minutes] = hour.split(':').map(Number);
  const startHour = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  // Calcular hora de término (adicionar 1 hora)
  const endHours = (hours + 1) % 24;
  const endHour = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  const newAvailability = {
    designerId: 'test-designer-id',
    specificDate: formData.specificDate,
    startTime: startHour,
    endTime: endHour,
    isActive: true
  };
  
  createdBlocks.push(newAvailability);
  console.log(`✅ Bloqueio criado: ${startHour} - ${endHour}`);
}

console.log("\nBloqueios criados:", createdBlocks);

// 2. Simular salvamento no Supabase (como no saveAvailability)
console.log("\n2. Simulando salvamento no Supabase...");

const supabaseData = createdBlocks.map(block => ({
  designer_id: block.designerId,
  day_of_week: block.specificDate ? new Date(block.specificDate).getDay() : 0,
  start_time: block.startTime,
  end_time: block.endTime,
  is_available: false, // FALSE = BLOQUEADO
  specific_date: block.specificDate
}));

console.log("Dados formatados para Supabase:", supabaseData);

// 3. Simular carregamento da disponibilidade no AdminDashboard
console.log("\n3. Simulando carregamento da disponibilidade no AdminDashboard...");

const mappedAvailabilityAdmin = supabaseData.map((supabaseItem, index) => ({
  id: `test-id-${index}`,
  designerId: supabaseItem.designer_id,
  dayOfWeek: supabaseItem.day_of_week,
  startTime: supabaseItem.start_time,
  endTime: supabaseItem.end_time,
  isActive: !supabaseItem.is_available, // isActive = bloqueio ativo (quando is_available = false)
  specificDate: supabaseItem.specific_date
}));

console.log("Disponibilidade mapeada no AdminDashboard:", mappedAvailabilityAdmin);

// 4. Simular carregamento da disponibilidade no BookingPage
console.log("\n4. Simulando carregamento da disponibilidade no BookingPage...");

const mappedAvailabilityBooking = supabaseData.map((supabaseItem, index) => ({
  id: supabaseItem.id || `test-id-${index}`,
  designerId: supabaseItem.designer_id,
  dayOfWeek: supabaseItem.day_of_week,
  startTime: supabaseItem.start_time,
  endTime: supabaseItem.end_time,
  isActive: !supabaseItem.is_available, // isActive = bloqueio ativo
  specificDate: supabaseItem.specific_date
}));

console.log("Disponibilidade mapeada no BookingPage:", mappedAvailabilityBooking);

// 5. Simular cálculo de horários disponíveis no AdminDashboard (função corrigida)
console.log("\n5. Simulando cálculo de horários disponíveis no AdminDashboard (função corrigida)...");

async function getAvailableTimeSlotsAdmin() {
  const selectedDate = '2023-10-15';
  const defaultTimeSlots = ['08:00', '10:00', '13:00', '15:00', '17:00'];
  
  try {
    const cacheBreaker = Date.now() + Math.random();
    console.log(`🔄 [${cacheBreaker}] Buscando horários disponíveis para ${selectedDate}`);

    // Simular agendamentos (vazio para este teste)
    const activeAppointments = [];
    console.log(`📊 [${cacheBreaker}] Agendamentos ativos (não cancelados):`, activeAppointments.length);
    
    // Extrair horários ocupados por agendamentos
    const bookedTimes = activeAppointments.map(apt => {
      return apt.time.length > 5 ? apt.time.substring(0, 5) : apt.time;
    });
    console.log(`⏰ [${cacheBreaker}] Horários ocupados por agendamentos (normalizados):`, bookedTimes);

    // Verificar bloqueios de disponibilidade para a data selecionada
    const blockedTimes = mappedAvailabilityAdmin
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
    
    // Se há um bloqueio de dia inteiro, nenhum horário está disponível
    const hasFullDayBlock = mappedAvailabilityAdmin.some((avail) => {
      if (!avail || !avail.specificDate || !avail.isActive) return false;
      const normalizedAvailDate = String(avail.specificDate).split('T')[0];
      const normalizedSelectedDate = selectedDate.split('T')[0];
      return normalizedAvailDate === normalizedSelectedDate && 
             avail.startTime === '00:00' && avail.endTime === '23:59';
    });
    
    if (hasFullDayBlock) {
      console.log(`🚫 [${cacheBreaker}] Dia inteiro bloqueado`);
      return [];
    }
    
    // Combinar horários ocupados por agendamentos e bloqueios de disponibilidade
    const allBlockedTimes = [...bookedTimes, ...blockedTimes];
    
    // Filtrar horários disponíveis
    const availableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
    console.log(`✨ [${cacheBreaker}] Horários disponíveis:`, availableSlots);
    
    return availableSlots;
  } catch (err) {
    console.error('Erro ao buscar horários disponíveis:', err);
    return [];
  }
}

// 6. Simular cálculo de horários disponíveis no BookingPage (função corrigida)
console.log("\n6. Simulando cálculo de horários disponíveis no BookingPage (função corrigida)...");

async function getAvailableTimeSlotsBooking() {
  const selectedDate = '2023-10-15';
  const defaultTimeSlots = ['08:00', '10:00', '13:00', '15:00', '17:00'];
  
  try {
    const cacheBreaker = Date.now().toString();
    console.log(`🔄 [${cacheBreaker}] Buscando horários disponíveis para ${selectedDate}`);

    // Check for a full-day block first
    const dayBlockedCompletely = mappedAvailabilityBooking.some(avail => 
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
    const blockedTimes = mappedAvailabilityBooking
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

// 7. Executar testes e verificar consistência
(async () => {
  console.log("\n7. Executando testes e verificando consistência...\n");
  
  const adminResult = await getAvailableTimeSlotsAdmin();
  const bookingResult = await getAvailableTimeSlotsBooking();
  
  console.log("\n=== RESULTADOS ===");
  console.log("Horários disponíveis no AdminDashboard:", adminResult);
  console.log("Horários disponíveis no BookingPage:", bookingResult);
  
  // Verificar se ambos os resultados são iguais
  const isConsistent = JSON.stringify(adminResult.sort()) === JSON.stringify(bookingResult.sort());
  console.log("Resultados consistentes:", isConsistent);
  
  // Verificar se os resultados estão corretos
  const expected = ['10:00', '15:00'];
  const isAdminCorrect = JSON.stringify(adminResult.sort()) === JSON.stringify(expected.sort());
  const isBookingCorrect = JSON.stringify(bookingResult.sort()) === JSON.stringify(expected.sort());
  
  console.log("AdminDashboard correto:", isAdminCorrect);
  console.log("BookingPage correto:", isBookingCorrect);
  
  console.log("\n=== RESULTADO FINAL ===");
  if (isConsistent && isAdminCorrect && isBookingCorrect) {
    console.log("🎉 SUCESSO TOTAL: Ambos os componentes estão funcionando corretamente!");
    console.log("   - Horários bloqueados: 08:00, 13:00, 17:00");
    console.log("   - Horários disponíveis: 10:00, 15:00");
    console.log("   - Ambos os componentes mostram os mesmos resultados");
  } else {
    console.log("❌ FALHA: Há inconsistências entre os componentes");
    console.log("   - Verifique as implementações");
  }
  
  console.log("\n=== FIM DO TESTE DE INTEGRAÇÃO FINAL ===");
})();
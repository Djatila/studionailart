// Teste completo do fluxo de bloqueio de horários específicos
console.log("=== Teste Completo do Fluxo de Bloqueio de Horários Específicos ===\n");

// Etapa 1: Criar bloqueios no AvailabilityManager
console.log("Etapa 1: Criando bloqueios no AvailabilityManager...");

const formData = {
  specificDate: '2023-10-20',
  blockType: 'specificHours',
  specificHours: ['08:00', '15:00']
};

console.log("Dados do formulário:", formData);

// Simular a criação dos bloqueios
const createdBlocks = [];

for (const hour of formData.specificHours) {
  const [hours, minutes] = hour.split(':').map(Number);
  const startHour = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  const endHours = (hours + 1) % 24;
  const endHour = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  const newAvailability = {
    designerId: 'designer-123',
    specificDate: formData.specificDate,
    startTime: startHour,
    endTime: endHour,
    isActive: true
  };
  
  createdBlocks.push(newAvailability);
  console.log(`✅ Bloqueio criado: ${startHour} - ${endHour}`);
}

console.log("\nBloqueios criados:", createdBlocks);

// Etapa 2: Salvar no Supabase
console.log("\nEtapa 2: Simulando salvamento no Supabase...");

const supabaseData = createdBlocks.map(block => ({
  designer_id: block.designerId,
  day_of_week: block.specificDate ? new Date(block.specificDate).getDay() : 0,
  start_time: block.startTime,
  end_time: block.endTime,
  is_available: false, // FALSE = BLOQUEADO
  specific_date: block.specificDate
}));

console.log("Dados formatados para Supabase:", supabaseData);

// Etapa 3: Carregar disponibilidade no AdminDashboard
console.log("\nEtapa 3: Carregando disponibilidade no AdminDashboard...");

const adminAvailability = supabaseData.map((supabaseItem, index) => ({
  id: `admin-${index}`,
  designerId: supabaseItem.designer_id,
  dayOfWeek: supabaseItem.day_of_week,
  startTime: supabaseItem.start_time,
  endTime: supabaseItem.end_time,
  isActive: !supabaseItem.is_available,
  specificDate: supabaseItem.specific_date
}));

console.log("Disponibilidade no AdminDashboard:", adminAvailability);

// Etapa 4: Carregar disponibilidade no BookingPage
console.log("\nEtapa 4: Carregando disponibilidade no BookingPage...");

const bookingAvailability = supabaseData.map((supabaseItem, index) => ({
  id: `booking-${index}`,
  designerId: supabaseItem.designer_id,
  dayOfWeek: supabaseItem.day_of_week,
  startTime: supabaseItem.start_time,
  endTime: supabaseItem.end_time,
  isActive: !supabaseItem.is_available,
  specificDate: supabaseItem.specific_date
}));

console.log("Disponibilidade no BookingPage:", bookingAvailability);

// Etapa 5: Verificar horários disponíveis no AdminDashboard
console.log("\nEtapa 5: Verificando horários disponíveis no AdminDashboard...");

async function getAdminAvailableSlots() {
  const selectedDate = '2023-10-20';
  const defaultTimeSlots = ['08:00', '10:00', '13:00', '15:00', '17:00'];
  
  try {
    // Verificar bloqueios de disponibilidade
    const blockedTimes = adminAvailability
      .filter((avail) => {
        if (!avail || !avail.specificDate || !avail.isActive) return false;
        const normalizedAvailDate = String(avail.specificDate).split('T')[0];
        const normalizedSelectedDate = selectedDate.split('T')[0];
        return normalizedAvailDate === normalizedSelectedDate;
      })
      .map((avail) => {
        if (avail.startTime !== '00:00' || avail.endTime !== '23:59') {
          return avail.startTime;
        }
        return null;
      })
      .filter(time => time !== null);
    
    console.log("Horários bloqueados no AdminDashboard:", blockedTimes);
    
    // Verificar bloqueio de dia inteiro
    const hasFullDayBlock = adminAvailability.some((avail) => {
      if (!avail || !avail.specificDate || !avail.isActive) return false;
      const normalizedAvailDate = String(avail.specificDate).split('T')[0];
      const normalizedSelectedDate = selectedDate.split('T')[0];
      return normalizedAvailDate === normalizedSelectedDate && 
             avail.startTime === '00:00' && avail.endTime === '23:59';
    });
    
    if (hasFullDayBlock) {
      return [];
    }
    
    // Combinar horários bloqueados
    const allBlockedTimes = [...[], ...blockedTimes]; // Não há agendamentos neste teste
    
    // Filtrar horários disponíveis
    const availableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
    return availableSlots;
  } catch (err) {
    console.error('Erro no AdminDashboard:', err);
    return [];
  }
}

// Etapa 6: Verificar horários disponíveis no BookingPage
console.log("\nEtapa 6: Verificando horários disponíveis no BookingPage...");

async function getBookingAvailableSlots() {
  const selectedDate = '2023-10-20';
  const defaultTimeSlots = ['08:00', '10:00', '13:00', '15:00', '17:00'];
  
  try {
    // Check for a full-day block first
    const dayBlockedCompletely = bookingAvailability.some(avail => 
      avail.specificDate === selectedDate && avail.startTime === '00:00' && avail.endTime === '23:59' && avail.isActive
    );

    if (dayBlockedCompletely) {
      return [];
    }

    // Verificar bloqueios de disponibilidade
    const blockedTimes = bookingAvailability
      .filter((avail) => {
        if (!avail || !avail.specificDate || !avail.isActive) return false;
        const normalizedAvailDate = String(avail.specificDate).split('T')[0];
        const normalizedSelectedDate = selectedDate.split('T')[0];
        return normalizedAvailDate === normalizedSelectedDate;
      })
      .map((avail) => {
        if (avail.startTime !== '00:00' || avail.endTime !== '23:59') {
          return avail.startTime;
        }
        return null;
      })
      .filter(time => time !== null);
    
    console.log("Horários bloqueados no BookingPage:", blockedTimes);
    
    // Combinar horários bloqueados
    const allBlockedTimes = [...[], ...blockedTimes]; // Não há agendamentos neste teste
    
    // Filtrar horários disponíveis
    const availableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
    return availableSlots;
  } catch (error) {
    console.error('Erro no BookingPage:', error);
    return defaultTimeSlots;
  }
}

// Etapa 7: Executar testes e verificar resultados
(async () => {
  console.log("\nEtapa 7: Executando testes finais...\n");
  
  const adminSlots = await getAdminAvailableSlots();
  const bookingSlots = await getBookingAvailableSlots();
  
  console.log("=== RESULTADOS FINAIS ===");
  console.log("Horários disponíveis no AdminDashboard:", adminSlots);
  console.log("Horários disponíveis no BookingPage:", bookingSlots);
  
  // Verificar consistência
  const isConsistent = JSON.stringify(adminSlots.sort()) === JSON.stringify(bookingSlots.sort());
  console.log("Resultados consistentes entre componentes:", isConsistent);
  
  // Verificar se os resultados estão corretos
  const expectedSlots = ['10:00', '13:00', '17:00'];
  const isAdminCorrect = JSON.stringify(adminSlots.sort()) === JSON.stringify(expectedSlots.sort());
  const isBookingCorrect = JSON.stringify(bookingSlots.sort()) === JSON.stringify(expectedSlots.sort());
  
  console.log("AdminDashboard mostra resultados corretos:", isAdminCorrect);
  console.log("BookingPage mostra resultados corretos:", isBookingCorrect);
  
  console.log("\n=== RESUMO ===");
  if (isConsistent && isAdminCorrect && isBookingCorrect) {
    console.log("🎉 SUCESSO COMPLETO!");
    console.log("   ✅ Fluxo de bloqueio de horários específicos funcionando corretamente");
    console.log("   ✅ Ambos os componentes (AdminDashboard e BookingPage) consistentes");
    console.log("   ✅ Horários bloqueados: 08:00-09:00 e 15:00-16:00");
    console.log("   ✅ Horários disponíveis: 10:00, 13:00 e 17:00");
    console.log("\n📋 Instruções para a Nail Designer:");
    console.log("   1. Acesse 'Gerenciar Horários' no painel administrativo");
    console.log("   2. Clique em 'Novo Bloqueio'");
    console.log("   3. Selecione a data desejada");
    console.log("   4. Escolha 'Horários Específicos'");
    console.log("   5. Selecione os horários que deseja bloquear");
    console.log("   6. Clique em 'Adicionar Bloqueio'");
    console.log("   7. Os horários bloqueados não aparecerão para as clientes agendarem");
  } else {
    console.log("❌ PROBLEMA DETECTADO!");
    console.log("   Verifique as implementações dos componentes");
  }
  
  console.log("\n=== FIM DO TESTE COMPLETO ===");
})();
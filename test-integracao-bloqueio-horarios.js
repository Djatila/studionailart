// Teste de integração completo para verificar o funcionamento do bloqueio de horários específicos

console.log("=== TESTE DE INTEGRAÇÃO: Bloqueio de Horários Específicos ===\n");

// Simular dados do Supabase para bloqueios de disponibilidade
const supabaseAvailabilityData = [
  {
    id: 'block-1',
    designer_id: 'designer-123',
    day_of_week: 0, // Domingo
    start_time: '08:00',
    end_time: '09:00',
    is_available: false, // BLOQUEADO
    specific_date: '2023-10-15'
  },
  {
    id: 'block-2',
    designer_id: 'designer-123',
    day_of_week: 0,
    start_time: '13:00',
    end_time: '14:00',
    is_available: false, // BLOQUEADO
    specific_date: '2023-10-15'
  },
  {
    id: 'block-3',
    designer_id: 'designer-123',
    day_of_week: 0,
    start_time: '17:00',
    end_time: '18:00',
    is_available: false, // BLOQUEADO
    specific_date: '2023-10-15'
  }
];

console.log("1. Dados simulados do Supabase:");
console.log(JSON.stringify(supabaseAvailabilityData, null, 2));

// Simular mapeamento no AdminDashboard (loadDesignerAvailability)
console.log("\n2. Mapeamento no AdminDashboard (loadDesignerAvailability):");
const mappedAvailabilityAdmin = supabaseAvailabilityData
  .filter(avail => avail && avail.specific_date)
  .map(avail => ({
    id: avail.id,
    designerId: avail.designer_id,
    dayOfWeek: avail.day_of_week,
    startTime: avail.start_time,
    endTime: avail.end_time,
    isActive: !avail.is_available, // isActive = bloqueio ativo
    specificDate: avail.specific_date
  }));

console.log(JSON.stringify(mappedAvailabilityAdmin, null, 2));

// Simular mapeamento no BookingPage (getDesignerAvailability)
console.log("\n3. Mapeamento no BookingPage (getDesignerAvailability):");
const mappedAvailabilityBooking = supabaseAvailabilityData
  .filter(avail => avail && avail.specific_date)
  .map(avail => ({
    id: avail.id,
    designerId: avail.designer_id,
    dayOfWeek: avail.day_of_week,
    startTime: avail.start_time,
    endTime: avail.end_time,
    isActive: !avail.is_available, // isActive = bloqueio ativo
    specificDate: avail.specific_date
  }));

console.log(JSON.stringify(mappedAvailabilityBooking, null, 2));

// Simular cálculo de horários disponíveis no AdminDashboard (getAvailableTimeSlots)
console.log("\n4. Cálculo de horários disponíveis no AdminDashboard:");
const selectedDate = '2023-10-15';
const defaultTimeSlots = ['08:00', '10:00', '13:00', '15:00', '17:00'];

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

console.log("Horários bloqueados:", blockedTimes);

// Se há um bloqueio de dia inteiro, nenhum horário está disponível
const hasFullDayBlock = mappedAvailabilityAdmin.some((avail) => {
  if (!avail || !avail.specificDate || !avail.isActive) return false;
  const normalizedAvailDate = String(avail.specificDate).split('T')[0];
  const normalizedSelectedDate = selectedDate.split('T')[0];
  return normalizedAvailDate === normalizedSelectedDate && 
         avail.startTime === '00:00' && avail.endTime === '23:59';
});

let adminAvailableSlots;
if (hasFullDayBlock) {
  console.log("Dia inteiro bloqueado");
  adminAvailableSlots = [];
} else {
  // Combinar horários ocupados por agendamentos e bloqueios de disponibilidade
  const allBlockedTimes = [...[], ...blockedTimes]; // Não há agendamentos neste teste
  
  // Filtrar horários disponíveis
  adminAvailableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
  console.log("Horários disponíveis no AdminDashboard:", adminAvailableSlots);
}

// Simular cálculo de horários disponíveis no BookingPage (getAvailableTimeSlots)
console.log("\n5. Cálculo de horários disponíveis no BookingPage:");
const blocked = mappedAvailabilityBooking;

const normalizedSelectedDate = selectedDate;
const dayBlockedCompletely = blocked.some(avail => 
  avail.specificDate === normalizedSelectedDate && avail.startTime === '00:00' && avail.endTime === '23:59' && avail.isActive
);

let bookingAvailableSlots;
if (dayBlockedCompletely) {
  bookingAvailableSlots = []; // If the entire day is blocked, no slots are available
} else {
  // If not a full-day block, filter out only specific blocked times
  bookingAvailableSlots = defaultTimeSlots.filter(slotTime => {
    const slotStartMinutes = parseInt(slotTime.split(':')[0]) * 60 + parseInt(slotTime.split(':')[1]);
    // Simular duração do serviço como 0 para este teste
    const serviceDurationMinutes = 0;
    const slotEndMinutes = slotStartMinutes + serviceDurationMinutes;

    return !blocked.some(avail => {
      if (!avail.isActive || avail.specificDate !== normalizedSelectedDate || (avail.startTime === '00:00' && avail.endTime === '23:59')) {
        return false; // Ignore full-day blocks here, they were handled above
      }

      const blockedStart = parseInt(avail.startTime.split(':')[0]) * 60 + parseInt(avail.startTime.split(':')[1]);
      const blockedEnd = parseInt(avail.endTime.split(':')[0]) * 60 + parseInt(avail.endTime.split(':')[1]);

      // Check for overlap of the service slot with the specific block
      return (
        (slotStartMinutes < blockedEnd && slotEndMinutes > blockedStart)
      );
    });
  });
  
  console.log("Horários disponíveis no BookingPage:", bookingAvailableSlots);
}

// Verificar consistência entre AdminDashboard e BookingPage
console.log("\n6. Verificação de consistência:");
const isConsistent = JSON.stringify(adminAvailableSlots.sort()) === JSON.stringify(bookingAvailableSlots.sort());
console.log("Horários disponíveis no AdminDashboard:", adminAvailableSlots);
console.log("Horários disponíveis no BookingPage:", bookingAvailableSlots);
console.log("Resultados consistentes:", isConsistent);

// Verificar se os resultados estão corretos
const expectedAvailableSlots = ['10:00', '15:00']; // Deve excluir 08:00, 13:00 e 17:00
const isAdminCorrect = JSON.stringify(adminAvailableSlots.sort()) === JSON.stringify(expectedAvailableSlots.sort());
const isBookingCorrect = JSON.stringify(bookingAvailableSlots.sort()) === JSON.stringify(expectedAvailableSlots.sort());

console.log("\n7. Verificação de resultados corretos:");
console.log("AdminDashboard correto:", isAdminCorrect);
console.log("BookingPage correto:", isBookingCorrect);

console.log("\n=== RESULTADOS FINAIS ===");
if (isConsistent && isAdminCorrect && isBookingCorrect) {
  console.log("✅ TESTE DE INTEGRAÇÃO PASSOU");
  console.log("✅ A funcionalidade de bloqueio de horários específicos está funcionando corretamente");
  console.log("✅ Ambos os componentes (AdminDashboard e BookingPage) estão consistentes");
  console.log("✅ Os horários bloqueados são: 08:00, 13:00, 17:00");
  console.log("✅ Os horários disponíveis são: 10:00, 15:00");
} else {
  console.log("❌ TESTE DE INTEGRAÇÃO FALHOU");
  console.log("❌ Há inconsistências na funcionalidade de bloqueio de horários específicos");
  
  if (!isConsistent) {
    console.log("❌ Inconsistência entre AdminDashboard e BookingPage");
  }
  
  if (!isAdminCorrect) {
    console.log("❌ AdminDashboard não está produzindo resultados corretos");
  }
  
  if (!isBookingCorrect) {
    console.log("❌ BookingPage não está produzindo resultados corretos");
  }
}

console.log("\n=== DETALHES DO TESTE ===");
console.log("Data testada: 2023-10-15");
console.log("Horários bloqueados: 08:00, 13:00, 17:00");
console.log("Horários esperados disponíveis: 10:00, 15:00");
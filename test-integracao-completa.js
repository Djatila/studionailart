// Teste completo de integração para verificar o funcionamento do bloqueio de horários específicos
// entre AvailabilityManager, AdminDashboard e BookingPage

console.log("=== Teste de Integração Completa: Bloqueio de Horários Específicos ===\n");

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

// 5. Simular cálculo de horários disponíveis no AdminDashboard (getAvailableTimeSlots)
console.log("\n5. Simulando cálculo de horários disponíveis no AdminDashboard...");

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
  console.log("🚫 Dia inteiro bloqueado");
  adminAvailableSlots = [];
} else {
  // Combinar horários ocupados por agendamentos e bloqueios de disponibilidade
  const allBlockedTimes = [...[], ...blockedTimes]; // Não há agendamentos neste teste
  
  // Filtrar horários disponíveis
  adminAvailableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
  console.log("✅ Horários disponíveis no AdminDashboard:", adminAvailableSlots);
}

// 6. Simular cálculo de horários disponíveis no BookingPage (getAvailableTimeSlots)
console.log("\n6. Simulando cálculo de horários disponíveis no BookingPage...");

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
  
  console.log("✅ Horários disponíveis no BookingPage:", bookingAvailableSlots);
}

// 7. Verificar consistência entre AdminDashboard e BookingPage
console.log("\n7. Verificando consistência entre componentes...");

const isConsistent = JSON.stringify(adminAvailableSlots.sort()) === JSON.stringify(bookingAvailableSlots.sort());
console.log("🔄 Horários disponíveis no AdminDashboard:", adminAvailableSlots);
console.log("🔄 Horários disponíveis no BookingPage:", bookingAvailableSlots);
console.log("✅ Resultados consistentes:", isConsistent);

// 8. Verificação final
console.log("\n=== RESULTADO FINAL ===");
if (isConsistent && adminAvailableSlots.length === 2 && bookingAvailableSlots.length === 2) {
  console.log("🎉 SUCESSO: O bloqueio de horários específicos está funcionando corretamente!");
  console.log("   - Horários bloqueados: 08:00, 13:00, 17:00");
  console.log("   - Horários disponíveis: 10:00, 15:00");
  console.log("   - Ambos os componentes (AdminDashboard e BookingPage) mostram os mesmos resultados");
} else {
  console.log("❌ FALHA: Há inconsistências no bloqueio de horários específicos");
  console.log("   - Verifique a implementação em ambos os componentes");
}

console.log("\n=== FIM DO TESTE ===");
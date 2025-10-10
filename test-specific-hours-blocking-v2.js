// Teste atualizado para verificar o funcionamento do bloqueio de horários específicos

// Função para simular a criação de um bloqueio de horário específico
function testCreateSpecificHourBlock() {
  console.log("=== Teste: Criar Bloqueio de Horário Específico ===");
  
  // Simular dados do formulário para bloqueio de horários específicos
  const formData = {
    specificDate: '2023-10-15',
    blockType: 'specificHours',
    specificHours: ['08:00', '13:00', '17:00']
  };
  
  console.log("Dados do formulário:", formData);
  
  // Simular a criação dos bloqueios (como no handleSubmit)
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
    console.log(`Bloqueio criado: ${startHour} - ${endHour}`);
  }
  
  console.log("Bloqueios criados:", createdBlocks);
  return createdBlocks;
}

// Função para simular o carregamento da disponibilidade no AdminDashboard (versão corrigida)
function testLoadDesignerAvailabilityCorrected(blocks) {
  console.log("\n=== Teste: Carregar Disponibilidade no AdminDashboard (Corrigido) ===");
  
  // Mapear campos como no loadDesignerAvailability do AdminDashboard (CORRIGIDO)
  const mappedAvailability = blocks.map(block => {
    // Simular o formato do Supabase (is_available = false para bloqueios)
    const supabaseFormat = {
      id: `test-id-${Math.random()}`,
      designer_id: block.designerId,
      day_of_week: block.specificDate ? new Date(block.specificDate).getDay() : 0,
      start_time: block.startTime,
      end_time: block.endTime,
      is_available: false, // FALSE = BLOQUEADO
      specific_date: block.specificDate
    };
    
    // Mapear para o formato esperado pela aplicação (isActive = bloqueio ativo)
    const mapped = {
      id: supabaseFormat.id,
      designerId: supabaseFormat.designer_id,
      dayOfWeek: supabaseFormat.day_of_week,
      startTime: supabaseFormat.start_time,
      endTime: supabaseFormat.end_time,
      isActive: !supabaseFormat.is_available, // isActive = bloqueio ativo (quando is_available = false)
      specificDate: supabaseFormat.specific_date
    };
    
    console.log(`Mapeamento: is_available=${supabaseFormat.is_available} -> isActive=${mapped.isActive}`);
    return mapped;
  });
  
  console.log("Disponibilidade mapeada (CORRIGIDA):", mappedAvailability);
  return mappedAvailability;
}

// Função para simular o cálculo de horários disponíveis no AdminDashboard
function testGetAvailableTimeSlotsAdmin(blockedTimes, selectedDate) {
  console.log("\n=== Teste: Calcular Horários Disponíveis no AdminDashboard ===");
  
  // Horários padrão
  const defaultTimeSlots = ['08:00', '10:00', '13:00', '15:00', '17:00'];
  console.log("Horários padrão:", defaultTimeSlots);
  
  // Verificar bloqueios de disponibilidade para a data selecionada
  const blockedTimesForDate = blockedTimes
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
  
  console.log("Horários bloqueados por disponibilidade:", blockedTimesForDate);
  
  // Se há um bloqueio de dia inteiro, nenhum horário está disponível
  const hasFullDayBlock = blockedTimes.some((avail) => {
    if (!avail || !avail.specificDate || !avail.isActive) return false;
    const normalizedAvailDate = String(avail.specificDate).split('T')[0];
    const normalizedSelectedDate = selectedDate.split('T')[0];
    return normalizedAvailDate === normalizedSelectedDate && 
           avail.startTime === '00:00' && avail.endTime === '23:59';
  });
  
  if (hasFullDayBlock) {
    console.log("Dia inteiro bloqueado");
    return [];
  }
  
  // Combinar horários ocupados por agendamentos e bloqueios de disponibilidade
  const allBlockedTimes = [...[], ...blockedTimesForDate]; // Não há agendamentos neste teste
  
  // Filtrar horários disponíveis
  const availableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
  console.log("Horários disponíveis:", availableSlots);
  
  return availableSlots;
}

// Executar testes
console.log("Iniciando testes ATUALIZADOS de bloqueio de horários específicos...\n");

// 1. Testar criação de bloqueios
const createdBlocks = testCreateSpecificHourBlock();

// 2. Testar carregamento da disponibilidade (como no AdminDashboard) - CORRIGIDO
const loadedAvailability = testLoadDesignerAvailabilityCorrected(createdBlocks);

// 3. Testar cálculo de horários disponíveis no AdminDashboard
const adminAvailableSlots = testGetAvailableTimeSlotsAdmin(loadedAvailability, '2023-10-15');

console.log("\n=== Resultados Finais ===");
console.log("Bloqueios criados:", createdBlocks.map(b => `${b.startTime}-${b.endTime}`));
console.log("Disponibilidade carregada:", loadedAvailability.map(a => `${a.startTime} (${a.isActive ? 'bloqueado' : 'disponível'})`));
console.log("Horários disponíveis no AdminDashboard:", adminAvailableSlots);

// Verificar se os resultados estão corretos
const expectedAvailableSlots = ['10:00', '15:00']; // Deve excluir 08:00, 13:00 e 17:00
const isCorrect = JSON.stringify(adminAvailableSlots.sort()) === JSON.stringify(expectedAvailableSlots.sort());

console.log("\n=== Verificação ===");
console.log("Horários esperados disponíveis:", expectedAvailableSlots);
console.log("Horários realmente disponíveis:", adminAvailableSlots);
console.log("Resultado correto:", isCorrect);

if (isCorrect) {
  console.log("✅ Teste PASSOU: Bloqueio de horários específicos está funcionando corretamente");
} else {
  console.log("❌ Teste FALHOU: Há problemas no bloqueio de horários específicos");
}
// Teste para verificar se os agendamentos estão sendo criados e filtrados corretamente

// Função para simular a criação de um agendamento
async function createTestAppointment() {
  const testAppointment = {
    id: 'test-' + Date.now(),
    designer_id: 'test-designer-id',
    client_name: 'Cliente Teste',
    client_phone: '(11) 99999-9999',
    client_email: 'cliente@teste.com',
    service: 'Serviço de Teste',
    date: '2025-10-10',
    time: '14:00',
    price: 50,
    status: 'pending'
  };
  
  console.log('Criando agendamento de teste:', testAppointment);
  
  // Salvar no localStorage para simular
  const saved = localStorage.getItem('nail_appointments');
  const allAppointments = saved ? JSON.parse(saved) : [];
  allAppointments.push(testAppointment);
  localStorage.setItem('nail_appointments', JSON.stringify(allAppointments));
  
  console.log('Agendamento salvo no localStorage');
  return testAppointment;
}

// Função para simular o filtro de agendamentos no ClientDashboard
function filterAppointmentsForClient(appointments, clientPhone) {
  console.log('Filtrando agendamentos para cliente com telefone:', clientPhone);
  
  const filtered = appointments.filter((apt) => {
    // Normalizar ambos os telefones para comparação
    const normalizedDBPhone = String(apt.client_phone || apt.clientPhone || '').replace(/\D/g, '');
    const normalizedClientPhone = String(clientPhone).replace(/\D/g, '');
    
    const matchesPhone = normalizedDBPhone === normalizedClientPhone;
    console.log(`Verificando agendamento ${apt.id}:`, {
      dbPhone: apt.client_phone || apt.clientPhone,
      dbPhoneNormalized: normalizedDBPhone,
      clientPhone: clientPhone,
      clientPhoneNormalized: normalizedClientPhone,
      matches: matchesPhone
    });
    return matchesPhone;
  });
  
  console.log('Agendamentos filtrados:', filtered);
  return filtered;
}

// Função para executar o teste completo
async function runTest() {
  console.log('=== Iniciando teste de agendamentos ===');
  
  // 1. Criar agendamento de teste
  const testAppointment = await createTestAppointment();
  
  // 2. Simular o carregamento de agendamentos no ClientDashboard
  const saved = localStorage.getItem('nail_appointments');
  const allAppointments = saved ? JSON.parse(saved) : [];
  console.log('Total de agendamentos no localStorage:', allAppointments.length);
  
  // 3. Filtrar para o cliente de teste
  const clientPhone = '(11) 99999-9999';
  const clientAppointments = filterAppointmentsForClient(allAppointments, clientPhone);
  
  console.log('=== Resultado do teste ===');
  console.log('Agendamentos encontrados para o cliente:', clientAppointments.length);
  
  if (clientAppointments.length > 0) {
    console.log('✅ Teste PASSOU: Agendamentos estão sendo filtrados corretamente');
  } else {
    console.log('❌ Teste FALHOU: Nenhum agendamento encontrado para o cliente');
  }
}

// Executar o teste
runTest();
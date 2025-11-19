// Script para testar se existem agendamentos no Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhvxjiorcggilujjtdbr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodnhqaW9yY2dnaWx1amp0ZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzYyMzgsImV4cCI6MjA3MTExMjIzOH0.X_7h0ZadhguYIPpbiSY5sbs1DfsyUaZB59zucRM9qKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointments() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Testar conexão básica
    const { data: testData, error: testError } = await supabase
      .from('appointments')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro de conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão com Supabase OK');
    
    // Buscar todos os agendamentos
    console.log('\n📋 Buscando todos os agendamentos...');
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    
    if (appointmentsError) {
      console.error('❌ Erro ao buscar agendamentos:', appointmentsError);
      return;
    }
    
    console.log(`📊 Total de agendamentos encontrados: ${appointments?.length || 0}`);
    
    if (appointments && appointments.length > 0) {
      console.log('\n📝 Primeiros 5 agendamentos:');
      appointments.slice(0, 5).forEach((apt, index) => {
        console.log(`${index + 1}. ID: ${apt.id}`);
        console.log(`   Designer ID: ${apt.designer_id}`);
        console.log(`   Cliente: ${apt.client_name}`);
        console.log(`   Telefone: ${apt.client_phone}`);
        console.log(`   Data: ${apt.date}`);
        console.log(`   Hora: ${apt.time}`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   Serviço: ${apt.service}`);
        console.log('   ---');
      });
      
      // Agrupar por designer
      const appointmentsByDesigner = appointments.reduce((acc, apt) => {
        const designerId = apt.designer_id;
        if (!acc[designerId]) {
          acc[designerId] = [];
        }
        acc[designerId].push(apt);
        return acc;
      }, {});
      
      console.log('\n👩‍💼 Agendamentos por Designer:');
      Object.entries(appointmentsByDesigner).forEach(([designerId, apts]) => {
        console.log(`Designer ${designerId}: ${apts.length} agendamentos`);
      });
    } else {
      console.log('⚠️ Nenhum agendamento encontrado no Supabase');
      
      // Verificar se há dados no localStorage
      console.log('\n🔍 Verificando localStorage...');
      if (typeof window !== 'undefined' && window.localStorage) {
        const localAppointments = localStorage.getItem('nail_appointments');
        if (localAppointments) {
          const parsed = JSON.parse(localAppointments);
          console.log(`📱 Agendamentos no localStorage: ${parsed.length}`);
          if (parsed.length > 0) {
            console.log('Primeiro agendamento local:', parsed[0]);
          }
        } else {
          console.log('📱 Nenhum agendamento no localStorage');
        }
      }
    }
    
    // Buscar designers para referência
    console.log('\n👩‍💼 Buscando designers...');
    const { data: designers, error: designersError } = await supabase
      .from('nail_designers')
      .select('*');
    
    if (designersError) {
      console.error('❌ Erro ao buscar designers:', designersError);
    } else {
      console.log(`👥 Total de designers: ${designers?.length || 0}`);
      if (designers && designers.length > 0) {
        designers.forEach(designer => {
          console.log(`- ${designer.name} (ID: ${designer.id}) - Ativo: ${designer.is_active}`);
        });
      }
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar teste
testAppointments();
// Teste de conexão com Supabase
// Execute este arquivo no console do navegador para testar a conexão

import { supabase } from './src/lib/supabase.js';

// Função para testar a conexão
async function testSupabaseConnection() {
  console.log('🔄 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar se as tabelas existem
    console.log('\n📋 Testando tabelas:');
    
    const { data: designers, error: designersError } = await supabase
      .from('nail_designers')
      .select('*')
      .limit(1);
    
    if (designersError) {
      console.error('❌ Erro na tabela nail_designers:', designersError.message);
    } else {
      console.log('✅ Tabela nail_designers: OK');
    }
    
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('*')
      .limit(1);
    
    if (appointmentsError) {
      console.error('❌ Erro na tabela appointments:', appointmentsError.message);
    } else {
      console.log('✅ Tabela appointments: OK');
    }
    
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(1);
    
    if (servicesError) {
      console.error('❌ Erro na tabela services:', servicesError.message);
    } else {
      console.log('✅ Tabela services: OK');
    }
    
    const { data: availability, error: availabilityError } = await supabase
      .from('availability')
      .select('*')
      .limit(1);
    
    if (availabilityError) {
      console.error('❌ Erro na tabela availability:', availabilityError.message);
    } else {
      console.log('✅ Tabela availability: OK');
    }
    
    // Teste 2: Inserir dados de teste
    console.log('\n🧪 Testando inserção de dados:');
    
    const { data: testDesigner, error: insertError } = await supabase
      .from('nail_designers')
      .insert({
        name: 'Teste Designer',
        email: 'teste@example.com',
        password: 'senha123',
        phone: '(11) 99999-9999',
        pix_key: 'teste@pix.com'
      })
      .select();
    
    if (insertError) {
      console.error('❌ Erro ao inserir designer de teste:', insertError.message);
    } else {
      console.log('✅ Designer de teste inserido:', testDesigner);
      
      // Limpar dados de teste
      await supabase
        .from('nail_designers')
        .delete()
        .eq('email', 'teste@example.com');
      
      console.log('🧹 Dados de teste removidos');
    }
    
    console.log('\n🎉 Teste de conexão concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar o teste
testSupabaseConnection();

// Instruções:
// 1. Abra o console do navegador (F12)
// 2. Cole este código no console
// 3. Pressione Enter para executar
// 4. Verifique os resultados
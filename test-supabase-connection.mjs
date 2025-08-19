// Teste de conexão com Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configurações do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vhvxjiorcggilujjtdbr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZodnhqaW9yY2dnaWx1amp0ZGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzYyMzgsImV4cCI6MjA3MTExMjIzOH0.X_7h0ZadhguYIPpbiSY5sbs1DfsyUaZB59zucRM9qKU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseConnection() {
  console.log('🔄 Testando conexão com Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // 1. Testar conexão básica
    console.log('\n1️⃣ Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('nail_designers')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError);
      return;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log('📊 Total de registros na tabela:', testData);
    
    // 2. Listar todos os designers
    console.log('\n2️⃣ Listando todos os designers...');
    const { data: allDesigners, error: listError } = await supabase
      .from('nail_designers')
      .select('*');
    
    if (listError) {
      console.error('❌ Erro ao listar designers:', listError);
      return;
    }
    
    console.log(`📋 Designers encontrados: ${allDesigners?.length || 0}`);
    if (allDesigners && allDesigners.length > 0) {
      console.log('Designers:', JSON.stringify(allDesigners, null, 2));
      
      const activeDesigners = allDesigners.filter(d => d.isActive);
      console.log(`✅ Designers ativos: ${activeDesigners.length}`);
      if (activeDesigners.length > 0) {
        console.log('Designers ativos:', JSON.stringify(activeDesigners, null, 2));
      }
    } else {
      console.log('⚠️ Nenhum designer encontrado no banco!');
    }
    
    // 3. Criar um designer de teste se não houver nenhum
    if (!allDesigners || allDesigners.length === 0) {
      console.log('\n3️⃣ Criando designer de teste...');
      
      const testDesigner = {
        id: 'test-designer-' + Date.now(),
        name: 'Maria Silva (Teste)',
        phone: '11999999999',
        email: 'maria.teste@nail.com',
        password: '1234',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      const { data: newDesigner, error: createError } = await supabase
        .from('nail_designers')
        .insert([testDesigner])
        .select();
      
      if (createError) {
        console.error('❌ Erro ao criar designer de teste:', createError);
      } else {
        console.log('✅ Designer de teste criado:', JSON.stringify(newDesigner, null, 2));
      }
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

// Executar o teste
testSupabaseConnection().then(() => {
  console.log('\n🏁 Teste concluído!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});
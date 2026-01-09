import { supabase } from './src/lib/supabase.js';

async function testDesigners() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Verificar se há designers na tabela
    const { data: designers, error } = await supabase
      .from('nail_designers')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar designers:', error);
      return;
    }
    
    console.log('✅ Designers encontrados:', designers?.length || 0);
    console.log('📋 Lista de designers:', designers);
    
    if (designers && designers.length > 0) {
      const activeDesigners = designers.filter(d => d.isActive);
      console.log('🟢 Designers ativos:', activeDesigners.length);
      console.log('📋 Designers ativos:', activeDesigners);
    }
    
  } catch (err) {
    console.error('💥 Erro inesperado:', err);
  }
}

testDesigners();
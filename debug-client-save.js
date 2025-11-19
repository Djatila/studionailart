// Script para debugar o salvamento de clientes
console.log('=== DEBUG: SALVAMENTO DE CLIENTES ===');

// Simular o processo de cadastro de cliente
const testClientData = {
  id: 'client-debug-' + Date.now(),
  name: 'Cliente Debug',
  phone: '11888888888',
  email: 'client-debug@nail.app',
  password: '123456',
  isActive: true,
  createdAt: new Date().toISOString()
};

console.log('1. Dados do cliente de teste:', testClientData);

// Verificar se as funções do Supabase estão disponíveis
if (typeof window !== 'undefined') {
  // Executar no navegador
  console.log('2. Executando no navegador...');
  
  // Verificar localStorage
  const localClients = localStorage.getItem('registered_clients');
  console.log('3. Clientes no localStorage:', localClients ? JSON.parse(localClients) : 'Nenhum');
  
  // Tentar importar as funções do Supabase
  import('./src/utils/supabaseUtils.js').then(async (supabaseUtils) => {
    console.log('4. Funções do Supabase carregadas');
    
    try {
      // Testar getNailDesignerByPhone
      console.log('5. Testando getNailDesignerByPhone...');
      const existingClient = await supabaseUtils.getNailDesignerByPhone(testClientData.phone);
      console.log('   Resultado:', existingClient);
      
      // Testar createNailDesigner
      console.log('6. Testando createNailDesigner...');
      const newClient = await supabaseUtils.createNailDesigner(testClientData);
      console.log('   Resultado:', newClient);
      
      if (newClient) {
        console.log('✅ Cliente criado com sucesso no Supabase!');
        
        // Verificar se aparece na listagem
        console.log('7. Verificando listagem de designers...');
        const allDesigners = await supabaseUtils.getNailDesigners();
        const clientInList = allDesigners.find(d => d.phone === testClientData.phone);
        console.log('   Cliente na listagem:', clientInList ? 'SIM' : 'NÃO');
        
      } else {
        console.log('❌ Falha ao criar cliente no Supabase');
      }
      
    } catch (error) {
      console.error('❌ Erro durante o teste:', error);
    }
    
  }).catch(error => {
    console.error('❌ Erro ao carregar funções do Supabase:', error);
  });
  
} else {
  console.log('Script executado fora do navegador');
}

console.log('=== FIM DO DEBUG ===');
// Script de debug para testar no console do navegador
// Copie e cole este código no console do navegador em https://studionailart.vercel.app/

console.log('🔍 Debug Supabase - Variáveis de Ambiente');
console.log('VITE_SUPABASE_URL:', import.meta.env?.VITE_SUPABASE_URL || 'NÃO DEFINIDA');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA');

// Teste de conexão simples
if (window.supabase) {
  console.log('✅ Cliente Supabase encontrado');
  
  // Testar uma query simples
  window.supabase.from('nail_designers').select('count', { count: 'exact' })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Erro na query:', error);
      } else {
        console.log('✅ Query bem-sucedida:', data);
      }
    });
} else {
  console.error('❌ Cliente Supabase não encontrado');
}

// Instruções
console.log('\n📋 INSTRUÇÕES:');
console.log('1. Abra https://studionailart.vercel.app/');
console.log('2. Pressione F12 para abrir o DevTools');
console.log('3. Vá para a aba Console');
console.log('4. Cole este código e pressione Enter');
console.log('5. Verifique se as variáveis estão definidas');
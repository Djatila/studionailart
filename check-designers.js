// Script para verificar designers no localStorage e Supabase
console.log('=== VERIFICANDO DESIGNERS ===');

// 1. Verificar localStorage
console.log('\n1. VERIFICANDO LOCALSTORAGE:');
const localDesigners = localStorage.getItem('nail_designers');
if (localDesigners) {
  const designers = JSON.parse(localDesigners);
  console.log('Designers encontrados no localStorage:', designers.length);
  console.log('Designers:', designers);
  
  const activeDesigners = designers.filter(d => d.isActive);
  console.log('Designers ativos:', activeDesigners.length);
  console.log('Designers ativos:', activeDesigners);
} else {
  console.log('Nenhum designer encontrado no localStorage');
}

// 2. Verificar se há clientes cadastrados
console.log('\n2. VERIFICANDO CLIENTES:');
const localClients = localStorage.getItem('registered_clients');
if (localClients) {
  const clients = JSON.parse(localClients);
  console.log('Clientes encontrados no localStorage:', clients.length);
  console.log('Clientes:', clients);
} else {
  console.log('Nenhum cliente encontrado no localStorage');
}

// 3. Verificar outros dados
console.log('\n3. VERIFICANDO OUTROS DADOS:');
console.log('nail_services:', localStorage.getItem('nail_services') ? 'Existe' : 'Não existe');
console.log('nail_appointments:', localStorage.getItem('nail_appointments') ? 'Existe' : 'Não existe');
console.log('availability:', localStorage.getItem('availability') ? 'Existe' : 'Não existe');

console.log('\n=== FIM DA VERIFICAÇÃO ===');
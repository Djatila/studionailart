const fs = require('fs');
const path = require('path');

// Corrigir BookingPage.tsx - verificar e corrigir problemas de sintaxe
const bookingPagePath = path.join(__dirname, 'src', 'components', 'BookingPage.tsx');
let bookingPageContent = fs.readFileSync(bookingPagePath, 'utf8');

// Verificar se há chaves desbalanceadas
let openBraces = 0;
let closeBraces = 0;
let openParens = 0;
let closeParens = 0;

for (let i = 0; i < bookingPageContent.length; i++) {
  const char = bookingPageContent[i];
  if (char === '{') openBraces++;
  if (char === '}') closeBraces++;
  if (char === '(') openParens++;
  if (char === ')') closeParens++;
}

console.log(`BookingPage.tsx - Chaves abertas: ${openBraces}, Chaves fechadas: ${closeBraces}`);
console.log(`BookingPage.tsx - Parênteses abertos: ${openParens}, Parênteses fechados: ${closeParens}`);

// Se há chaves ou parênteses desbalanceados, tentar corrigir
if (openBraces !== closeBraces || openParens !== closeParens) {
  console.log('Tentando corrigir desbalanceamento...');
  
  // Verificar se falta uma chave de fechamento no final
  if (openBraces > closeBraces) {
    // Adicionar chaves de fechamento necessárias
    for (let i = 0; i < openBraces - closeBraces; i++) {
      bookingPageContent += '\n}';
    }
    console.log(`Adicionadas ${openBraces - closeBraces} chaves de fechamento`);
  }
  
  // Verificar se falta um parêntese de fechamento no final
  if (openParens > closeParens) {
    // Adicionar parênteses de fechamento necessários
    for (let i = 0; i < openParens - closeParens; i++) {
      bookingPageContent += '\n)';
    }
    console.log(`Adicionados ${openParens - closeParens} parênteses de fechamento`);
  }
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(bookingPagePath, bookingPageContent, 'utf8');
  console.log('✓ Arquivo BookingPage.tsx corrigido');
} else {
  console.log('✓ Arquivo BookingPage.tsx já está balanceado');
}
const fs = require('fs');
const path = require('path');

// Corrigir BookingPage.tsx - remover código extra no final
const bookingPagePath = path.join(__dirname, 'src', 'components', 'BookingPage.tsx');
let bookingPageContent = fs.readFileSync(bookingPagePath, 'utf8');

// Dividir o conteúdo em linhas
const lines = bookingPageContent.split('\n');

// Encontrar as últimas linhas problemáticas
const lastLines = lines.slice(-5);

console.log('Últimas linhas do arquivo:');
lastLines.forEach((line, index) => {
  console.log(`${lines.length - 5 + index + 1}: ${line}`);
});

// Verificar se há código extra no final
if (lines[lines.length - 1].trim() === ')' && lines[lines.length - 2].trim() === '}') {
  console.log('Removendo código extra no final...');
  
  // Remover as últimas linhas problemáticas
  lines.splice(lines.length - 2, 2);
  
  // Juntar as linhas novamente
  const correctedContent = lines.join('\n');
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(bookingPagePath, correctedContent, 'utf8');
  console.log('✓ Corrigido: Código extra removido do final do BookingPage.tsx');
} else {
  console.log('ℹ Nenhum código extra encontrado no final do BookingPage.tsx');
}

console.log('✓ Correções aplicadas com sucesso!');
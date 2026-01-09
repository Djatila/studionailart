const fs = require('fs');
const path = require('path');

// Corrigir BookingPage.tsx - função getDesignerAvailability duplicada
const bookingPagePath = path.join(__dirname, 'src', 'components', 'BookingPage.tsx');
let bookingPageContent = fs.readFileSync(bookingPagePath, 'utf8');

// Procurar por código duplicado na função getDesignerAvailability
const lines = bookingPageContent.split('\n');

// Encontrar o índice da linha com o erro
let errorLineIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('} catch (error) {') && lines[i].includes('console.error(\'❌ Erro ao buscar disponibilidade:\', error);')) {
    // Verificar se esta é a linha duplicada
    if (i > 0 && lines[i-1].includes('return allAvailability.filter((avail: any) =>')) {
      errorLineIndex = i;
      break;
    }
  }
}

if (errorLineIndex !== -1) {
  // Encontrar o início do bloco duplicado
  let startBlockIndex = errorLineIndex;
  while (startBlockIndex > 0 && !lines[startBlockIndex].includes('const getDesignerAvailability = useCallback(async () => {')) {
    startBlockIndex--;
  }
  
  // Encontrar o fim do bloco duplicado
  let endBlockIndex = errorLineIndex;
  let braceCount = 0;
  for (let i = errorLineIndex; i < lines.length; i++) {
    if (lines[i].includes('{')) braceCount++;
    if (lines[i].includes('}')) braceCount--;
    if (braceCount === 0 && lines[i].includes('}')) {
      endBlockIndex = i;
      break;
    }
  }
  
  // Remover o bloco duplicado
  lines.splice(startBlockIndex, endBlockIndex - startBlockIndex + 1);
  
  // Juntar as linhas novamente
  bookingPageContent = lines.join('\n');
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(bookingPagePath, bookingPageContent, 'utf8');
  console.log('✓ Corrigido: Código duplicado removido do BookingPage.tsx');
} else {
  console.log('ℹ Nenhum código duplicado encontrado no BookingPage.tsx');
}

console.log('✓ Correções aplicadas com sucesso!');
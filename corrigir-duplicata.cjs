const fs = require('fs');
const path = require('path');

// Corrigir BookingPage.tsx - remover código duplicado na função getDesignerAvailability
const bookingPagePath = path.join(__dirname, 'src', 'components', 'BookingPage.tsx');
let bookingPageContent = fs.readFileSync(bookingPagePath, 'utf8');

// Dividir o conteúdo em linhas
const lines = bookingPageContent.split('\n');

// Encontrar o índice onde começa o código duplicado
let duplicateStartIndex = -1;
for (let i = 0; i < lines.length - 5; i++) {
  // Procurar pela sequência que indica o início do código duplicado
  if (lines[i].includes('}, [selectedDesigner]);') && 
      lines[i+1].includes('const allAvailability = saved ? JSON.parse(saved) : [];') &&
      lines[i+2].includes('if (!Array.isArray(allAvailability)) {')) {
    duplicateStartIndex = i;
    break;
  }
}

if (duplicateStartIndex !== -1) {
  console.log(`Encontrado código duplicado na linha ${duplicateStartIndex}`);
  
  // Encontrar o fim do bloco duplicado
  let duplicateEndIndex = duplicateStartIndex;
  for (let i = duplicateStartIndex; i < lines.length; i++) {
    if (lines[i].includes('}, [selectedDesigner]);') && i > duplicateStartIndex) {
      duplicateEndIndex = i;
      break;
    }
  }
  
  console.log(`Removendo linhas de ${duplicateStartIndex} a ${duplicateEndIndex}`);
  
  // Remover o bloco duplicado (incluindo a linha }, [selectedDesigner]); duplicada)
  lines.splice(duplicateStartIndex, duplicateEndIndex - duplicateStartIndex + 1);
  
  // Juntar as linhas novamente
  const correctedContent = lines.join('\n');
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(bookingPagePath, correctedContent, 'utf8');
  console.log('✓ Corrigido: Código duplicado removido do BookingPage.tsx');
} else {
  console.log('ℹ Nenhum código duplicado encontrado no BookingPage.tsx');
}

console.log('✓ Correções aplicadas com sucesso!');
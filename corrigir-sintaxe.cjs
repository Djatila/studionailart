const fs = require('fs');
const path = require('path');

// Corrigir AvailabilityManager.tsx - remover chave extra no final
const availabilityManagerPath = path.join(__dirname, 'src', 'components', 'AvailabilityManager.tsx');
let availabilityManagerContent = fs.readFileSync(availabilityManagerPath, 'utf8');

// Verificar se há uma chave extra no final
if (availabilityManagerContent.trim().endsWith('}')) {
  // Remover a última chave extra
  const lines = availabilityManagerContent.split('\n');
  if (lines[lines.length - 1].trim() === '}') {
    lines.pop(); // Remover a última linha
    availabilityManagerContent = lines.join('\n');
    fs.writeFileSync(availabilityManagerPath, availabilityManagerContent, 'utf8');
    console.log('✓ Corrigido: Chave extra removida do AvailabilityManager.tsx');
  }
}

// Corrigir BookingPage.tsx - função getDesignerAvailability duplicada
const bookingPagePath = path.join(__dirname, 'src', 'components', 'BookingPage.tsx');
let bookingPageContent = fs.readFileSync(bookingPagePath, 'utf8');

// Procurar por código duplicado na função getDesignerAvailability
const duplicatedCodePattern = /}, \\[selectedDesigner\\];\\s+const allAvailability = saved \\? JSON\\.parse\\(saved\\) : \\[];/;
if (duplicatedCodePattern.test(bookingPageContent)) {
  // Remover o código duplicado
  bookingPageContent = bookingPageContent.replace(duplicatedCodePattern, '}, [selectedDesigner]);');
  fs.writeFileSync(bookingPagePath, bookingPageContent, 'utf8');
  console.log('✓ Corrigido: Código duplicado removido do BookingPage.tsx');
}

console.log('✓ Correções de sintaxe aplicadas com sucesso!');
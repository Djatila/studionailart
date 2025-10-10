const fs = require('fs');
const path = require('path');

// Verificar BookingPage.tsx
const bookingPagePath = path.join(__dirname, 'src', 'components', 'BookingPage.tsx');
const bookingPageContent = fs.readFileSync(bookingPagePath, 'utf8');

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

if (openBraces !== closeBraces) {
  console.log('❌ Erro: Chaves desbalanceadas no BookingPage.tsx');
} else {
  console.log('✓ Chaves balanceadas no BookingPage.tsx');
}

if (openParens !== closeParens) {
  console.log('❌ Erro: Parênteses desbalanceados no BookingPage.tsx');
} else {
  console.log('✓ Parênteses balanceados no BookingPage.tsx');
}

// Verificar AvailabilityManager.tsx
const availabilityManagerPath = path.join(__dirname, 'src', 'components', 'AvailabilityManager.tsx');
const availabilityManagerContent = fs.readFileSync(availabilityManagerPath, 'utf8');

// Verificar se há chaves desbalanceadas
openBraces = 0;
closeBraces = 0;
openParens = 0;
closeParens = 0;

for (let i = 0; i < availabilityManagerContent.length; i++) {
  const char = availabilityManagerContent[i];
  if (char === '{') openBraces++;
  if (char === '}') closeBraces++;
  if (char === '(') openParens++;
  if (char === ')') closeParens++;
}

console.log(`AvailabilityManager.tsx - Chaves abertas: ${openBraces}, Chaves fechadas: ${closeBraces}`);
console.log(`AvailabilityManager.tsx - Parênteses abertos: ${openParens}, Parênteses fechados: ${closeParens}`);

if (openBraces !== closeBraces) {
  console.log('❌ Erro: Chaves desbalanceadas no AvailabilityManager.tsx');
} else {
  console.log('✓ Chaves balanceadas no AvailabilityManager.tsx');
}

if (openParens !== closeParens) {
  console.log('❌ Erro: Parênteses desbalanceados no AvailabilityManager.tsx');
} else {
  console.log('✓ Parênteses balanceados no AvailabilityManager.tsx');
}
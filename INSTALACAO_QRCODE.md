# 📦 Instalação da Biblioteca QR Code

## Passo 1: Instalar a Biblioteca

Abra o terminal na pasta do projeto e execute:

```bash
npm install qrcode
```

ou se usar yarn:

```bash
yarn add qrcode
```

## Passo 2: Instalar os Tipos TypeScript

```bash
npm install --save-dev @types/qrcode
```

ou

```bash
yarn add -D @types/qrcode
```

## Passo 3: Verificar Instalação

Após instalar, verifique se as dependências foram adicionadas ao `package.json`:

```json
{
  "dependencies": {
    "qrcode": "^1.5.3",
    ...
  },
  "devDependencies": {
    "@types/qrcode": "^1.5.5",
    ...
  }
}
```

## Passo 4: Reiniciar o Servidor

Se o servidor de desenvolvimento estiver rodando, pare e inicie novamente:

```bash
# Parar: Ctrl+C

# Iniciar novamente:
npm run dev
```

## ✅ Pronto!

Agora o QR Code deve funcionar perfeitamente. A designer pode:

1. Acessar **Configurações**
2. Ver seu **Link Personalizado**
3. Clicar em **"Gerar QR Code"**
4. Clicar em **"Baixar QR Code"**
5. Imprimir e colocar no salão

---

## 🔧 Alternativa: Usar CDN (sem instalação)

Se não quiser instalar a biblioteca, pode usar via CDN. Modifique o arquivo `QRCodeGenerator.tsx`:

```tsx
import { useEffect, useRef } from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export default function QRCodeGenerator({ value, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Carregar biblioteca via CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
    script.async = true;
    script.onload = () => {
      if (canvasRef.current && (window as any).QRCode) {
        (window as any).QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [value, size]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'qrcode-agendamento.png';
      link.href = url;
      link.click();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <canvas ref={canvasRef} className="border-2 border-pink-200 rounded-lg" />
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700 transition-colors"
      >
        Baixar QR Code
      </button>
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Salve e imprima este QR Code para colocar no seu salão.
      </p>
    </div>
  );
}
```

---

## 🧪 Testar

Após instalar:

1. Acesse o sistema como designer
2. Vá em **Configurações**
3. Role até **"Seu Link Personalizado"**
4. Clique em **"Gerar QR Code"**
5. Deve aparecer o QR Code
6. Clique em **"Baixar QR Code"**
7. Arquivo PNG deve ser baixado

---

## ❓ Problemas Comuns

### Erro: "Cannot find module 'qrcode'"
**Solução:** Execute `npm install qrcode`

### Erro: "Could not find a declaration file for module 'qrcode'"
**Solução:** Execute `npm install --save-dev @types/qrcode`

### QR Code não aparece
**Solução:** 
1. Verifique se instalou corretamente
2. Reinicie o servidor (`npm run dev`)
3. Limpe o cache do navegador (Ctrl+Shift+R)

### Erro ao baixar QR Code
**Solução:** Verifique se o navegador permite downloads automáticos

---

**Desenvolvido com ❤️ para profissionais de beleza**

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
}

export default function QRCodeGenerator({ value, size = 200 }: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    }
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
        Salve e imprima este QR Code para colocar no seu salão. Clientes podem escanear para agendar.
      </p>
    </div>
  );
}

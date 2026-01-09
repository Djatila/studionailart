import { useState, useEffect, useRef } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface ConnectionStatusProps {
  onConnectionChange?: (isOnline: boolean) => void;
}

export default function ConnectionStatus({ onConnectionChange }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const hideToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(true); // Ref para manter o valor atualizado

  useEffect(() => {
    let isComponentMounted = true;
    
    const showOnlineToast = () => {
      if (!isComponentMounted) return;
      
      // Limpar timeout anterior se existir
      if (hideToastTimeoutRef.current) {
        clearTimeout(hideToastTimeoutRef.current);
      }
      
      setIsOnline(true);
      isOnlineRef.current = true;
      setToastMessage('Conexão restaurada!');
      setToastType('success');
      setShowToast(true);
      
      // Guardar o timeout no ref para não perder na remontagem (3 segundos)
      hideToastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
        hideToastTimeoutRef.current = null;
      }, 3000); // 3 segundos
      
      if (onConnectionChange) {
        onConnectionChange(true);
      }
    };

    const showOfflineToast = () => {
      if (!isComponentMounted) return;
      
      // Limpar timeout anterior se existir
      if (hideToastTimeoutRef.current) {
        clearTimeout(hideToastTimeoutRef.current);
      }
      
      setIsOnline(false);
      isOnlineRef.current = false;
      setToastMessage('Sem conexão com a internet');
      setToastType('error');
      setShowToast(true);
      
      // Guardar o timeout no ref para não perder na remontagem (3 segundos)
      hideToastTimeoutRef.current = setTimeout(() => {
        setShowToast(false);
        hideToastTimeoutRef.current = null;
      }, 3000); // 3 segundos
      
      if (onConnectionChange) {
        onConnectionChange(false);
      }
    };

    // Verificar conexão usando imagem (método silencioso)
    const checkConnection = async (): Promise<boolean> => {
      if (!isComponentMounted) return false;
      
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          img.src = ''; // Cancelar carregamento
          resolve(false);
        }, 2000); // Timeout de 2 segundos para não atrasar a verificação
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
        
        // Usar Google Fonts (sempre disponível e não gera erro no console)
        img.src = `https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg?${Date.now()}`;
      });
    };

    // Verificar conexão periodicamente
    const checkAndUpdate = async () => {
      if (!isComponentMounted) return;
      
      const online = await checkConnection();
      
      if (online && !isOnlineRef.current) {
        showOnlineToast();
      } else if (!online && isOnlineRef.current) {
        showOfflineToast();
      }
    };

    // Verificar a cada 2 segundos
    const intervalId = setInterval(checkAndUpdate, 2000);
    
    // Verificar imediatamente (mas sem mostrar toast)
    checkConnection().then(online => {
      if (isComponentMounted) {
        setIsOnline(online);
        isOnlineRef.current = online;
      }
    });

    // Também adicionar listeners nativos como backup
    const handleOnline = () => {
      if (isComponentMounted && !isOnlineRef.current) {
        showOnlineToast();
      }
    };

    const handleOffline = () => {
      if (isComponentMounted && isOnlineRef.current) {
        showOfflineToast();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      isComponentMounted = false;
      clearInterval(intervalId);
      // NÃO limpar o timeout aqui - deixar ele executar
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onConnectionChange]); // Removido isOnline das dependências!

  return (
    <>
      {/* Toast Notification - Aparece por 3 segundos */}
      {showToast && (
        <div
          className="fixed top-4 right-4 z-[9999] transform transition-all duration-300 translate-x-0 opacity-100"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-md border ${
              toastType === 'error'
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-green-500/90 border-green-400 text-white'
            }`}
          >
            {toastType === 'error' ? (
              <WifiOff className="w-6 h-6 animate-pulse" />
            ) : (
              <Wifi className="w-6 h-6" />
            )}
            <div>
              <p className="font-semibold">{toastMessage}</p>
              {toastType === 'error' && (
                <p className="text-sm text-white/80">Tentando reconectar...</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Adicionar animação CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

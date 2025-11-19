import { useState, useCallback } from 'react';

interface UseConnectionCheckReturn {
  isOnline: boolean;
  checkConnection: () => boolean;
  showOfflineToast: () => void;
}

export function useConnectionCheck(): UseConnectionCheckReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const checkConnection = useCallback((): boolean => {
    const online = navigator.onLine;
    setIsOnline(online);
    return online;
  }, []);

  const showOfflineToast = useCallback(() => {
    // Disparar evento customizado para mostrar toast
    window.dispatchEvent(new CustomEvent('show-offline-toast'));
  }, []);

  return {
    isOnline,
    checkConnection,
    showOfflineToast
  };
}

// Função helper para usar em qualquer lugar
export function checkInternetConnection(): boolean {
  return navigator.onLine;
}

// Função para mostrar toast de offline de qualquer lugar
export function showOfflineNotification() {
  window.dispatchEvent(new CustomEvent('show-offline-toast'));
}

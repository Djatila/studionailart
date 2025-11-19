// Componente para debugar o estado do aplicativo
import React, { useState, useEffect } from 'react';

export default function StateDebugger() {
  const [localStorageData, setLocalStorageData] = useState<any[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    loadLocalStorageData();
  }, []);

  const loadLocalStorageData = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      const data = saved ? JSON.parse(saved) : [];
      setLocalStorageData(data);
      setStorageError(null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setStorageError('Erro ao carregar dados do localStorage');
      setLocalStorageData([]);
    }
  };

  const clearLocalStorage = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de disponibilidade?')) {
      localStorage.removeItem('nail_availability');
      loadLocalStorageData();
      alert('Dados limpos com sucesso!');
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg mt-6">
      <h3 className="text-lg font-bold mb-3">Debugger de Estado</h3>
      
      <div className="mb-4">
        <button
          onClick={loadLocalStorageData}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm mr-2"
        >
          Recarregar Dados
        </button>
        <button
          onClick={clearLocalStorage}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Limpar Dados
        </button>
      </div>
      
      {storageError ? (
        <div className="text-red-600 bg-red-50 p-3 rounded">
          {storageError}
        </div>
      ) : (
        <div className="bg-white p-3 rounded">
          <h4 className="font-medium mb-2">Dados no localStorage:</h4>
          <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded overflow-auto max-h-60">
            {JSON.stringify(localStorageData, null, 2)}
          </pre>
          <p className="mt-2 text-sm text-gray-600">
            Total de registros: {localStorageData.length}
          </p>
        </div>
      )}
    </div>
  );
}
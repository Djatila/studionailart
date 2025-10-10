// Componente para corrigir dados antigos sem IDs
import React, { useState, useEffect } from 'react';

interface OldAvailability {
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  // Pode não ter ID
  id?: string;
}

export default function OldDataFixer() {
  const [hasOldData, setHasOldData] = useState(false);
  const [fixedCount, setFixedCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkForOldData();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkForOldData = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      if (!saved) {
        setHasOldData(false);
        return;
      }
      
      const allAvailability = JSON.parse(saved);
      if (!Array.isArray(allAvailability)) {
        setHasOldData(false);
        return;
      }
      
      // Verificar se há itens sem ID
      const itemsWithoutId = allAvailability.filter((item: any) => !item.id);
      setHasOldData(itemsWithoutId.length > 0);
      
      if (itemsWithoutId.length > 0) {
        addLog(`Encontrados ${itemsWithoutId.length} itens sem ID`);
      }
    } catch (error) {
      console.error('Erro ao verificar dados antigos:', error);
      addLog(`Erro na verificação: ${error}`);
    }
  };

  const fixOldData = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      if (!saved) {
        addLog('Nenhum dado encontrado para corrigir');
        return;
      }
      
      let allAvailability = JSON.parse(saved);
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      addLog(`Verificando ${allAvailability.length} itens...`);
      
      let fixedItems = 0;
      
      // Corrigir itens sem ID
      const fixedData = allAvailability.map((item: any, index: number) => {
        // Verificar se o item já tem todas as propriedades necessárias
        const fixedItem = {
          id: item.id || `fixed-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          designerId: item.designerId || item.designer_id || 'unknown-designer',
          specificDate: item.specificDate || item.specific_date || new Date().toISOString().split('T')[0],
          startTime: item.startTime || item.start_time || '00:00',
          endTime: item.endTime || item.end_time || '23:59',
          isActive: item.isActive !== undefined ? item.isActive : 
                   (item.is_available !== undefined ? !item.is_available : true)
        };
        
        // Se tiver que corrigir o ID, contar
        if (!item.id) {
          fixedItems++;
          addLog(`Corrigido ID para item ${index}: ${fixedItem.id}`);
        }
        
        return fixedItem;
      });
      
      // Salvar dados corrigidos
      localStorage.setItem('nail_availability', JSON.stringify(fixedData));
      setFixedCount(fixedItems);
      setHasOldData(false);
      
      addLog(`Corrigidos ${fixedItems} itens. Total de itens: ${fixedData.length}`);
    } catch (error) {
      console.error('Erro ao corrigir dados:', error);
      addLog(`Erro na correção: ${error}`);
    }
  };

  const showCurrentData = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      if (!saved) {
        addLog('Nenhum dado encontrado');
        return;
      }
      
      const allAvailability = JSON.parse(saved);
      addLog(`Dados atuais: ${allAvailability.length} itens`);
      
      allAvailability.forEach((item: any, index: number) => {
        addLog(`Item ${index}: ID=${item.id || 'SEM ID'}, Data=${item.specificDate}, ${item.startTime}-${item.endTime}`);
      });
    } catch (error) {
      console.error('Erro ao mostrar dados:', error);
      addLog(`Erro ao mostrar dados: ${error}`);
    }
  };

  if (!hasOldData) {
    return null; // Não mostrar nada se não houver dados antigos
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mt-6">
      <h3 className="font-bold text-red-800 mb-3">Corretor de Dados Antigos</h3>
      
      <div className="mb-4 p-3 bg-yellow-100 rounded">
        <p className="text-yellow-800">
          <strong>Atenção:</strong> Foram encontrados dados de bloqueios antigos que podem não ter IDs únicos.
          Isso pode causar problemas com a exclusão de bloqueios.
        </p>
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={fixOldData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Corrigir Dados Automaticamente
        </button>
        
        <button
          onClick={showCurrentData}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Mostrar Dados Atuais
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-3 rounded text-xs max-h-40 overflow-y-auto">
        {logs.length === 0 ? (
          <p>Os logs aparecerão aqui...</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 last:mb-0">{log}</div>
          ))
        )}
      </div>
      
      <button
        onClick={() => setLogs([])}
        className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
      >
        Limpar Logs
      </button>
    </div>
  );
}
// Componente para corrigir dados existentes no localStorage
import React, { useState, useEffect } from 'react';

interface AvailabilityItem {
  id?: string;
  designerId?: string;
  designer_id?: string;
  specificDate?: string;
  specific_date?: string;
  startTime?: string;
  start_time?: string;
  endTime?: string;
  end_time?: string;
  isActive?: boolean;
  is_available?: boolean;
}

export default function DataFixer() {
  const [hasInvalidData, setHasInvalidData] = useState(false);
  const [fixedCount, setFixedCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    checkForInvalidData();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkForInvalidData = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      if (!saved) {
        setHasInvalidData(false);
        return;
      }
      
      const allAvailability = JSON.parse(saved);
      if (!Array.isArray(allAvailability)) {
        setHasInvalidData(false);
        return;
      }
      
      // Verificar se há itens sem ID ou com estrutura incorreta
      const invalidItems = allAvailability.filter((item: any) => {
        return !item.id || 
               !item.designerId || 
               !item.specificDate || 
               !item.startTime || 
               !item.endTime;
      });
      
      setHasInvalidData(invalidItems.length > 0);
      
      if (invalidItems.length > 0) {
        addLog(`Encontrados ${invalidItems.length} itens com dados incompletos`);
      }
    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      addLog(`Erro na verificação: ${error}`);
    }
  };

  const fixInvalidData = () => {
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
      
      // Corrigir itens com dados incompletos
      const fixedData = allAvailability.map((item: any, index: number) => {
        // Garantir que o item tenha todas as propriedades necessárias
        const fixedItem = {
          id: item.id || `fixed-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
          designerId: item.designerId || item.designer_id || 'unknown-designer',
          specificDate: item.specificDate || item.specific_date || new Date().toISOString().split('T')[0],
          startTime: item.startTime || item.start_time || '00:00',
          endTime: item.endTime || item.end_time || '23:59',
          isActive: item.isActive !== undefined ? item.isActive : 
                   (item.is_available !== undefined ? !item.is_available : true)
        };
        
        // Se tiver que corrigir algum campo, contar
        if (!item.id || !item.designerId || !item.specificDate || !item.startTime || !item.endTime) {
          fixedItems++;
          addLog(`Corrigido item ${index}: ${fixedItem.id}`);
        }
        
        return fixedItem;
      });
      
      // Salvar dados corrigidos
      localStorage.setItem('nail_availability', JSON.stringify(fixedData));
      setFixedCount(fixedItems);
      setHasInvalidData(false);
      
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
        addLog(`Item ${index}: ID=${item.id || 'SEM ID'}, Data=${item.specificDate || item.specific_date}, ${item.startTime || item.start_time}-${item.endTime || item.end_time}`);
      });
    } catch (error) {
      console.error('Erro ao mostrar dados:', error);
      addLog(`Erro ao mostrar dados: ${error}`);
    }
  };

  const clearAllData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de disponibilidade?')) {
      localStorage.removeItem('nail_availability');
      setHasInvalidData(false);
      addLog('Todos os dados removidos');
    }
  };

  if (!hasInvalidData) {
    return null; // Não mostrar nada se não houver dados inválidos
  }

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mt-6">
      <h3 className="font-bold text-orange-800 mb-3">Corretor de Dados</h3>
      
      <div className="mb-4 p-3 bg-yellow-100 rounded">
        <p className="text-yellow-800">
          <strong>Atenção:</strong> Foram encontrados dados de bloqueios que podem estar incompletos ou com estrutura incorreta.
          Isso pode causar problemas com a exclusão e exibição dos bloqueios.
        </p>
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={fixInvalidData}
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
        
        <button
          onClick={clearAllData}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Limpar Todos os Dados
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
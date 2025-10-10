// Componente para verificar se a correção está funcionando
import React, { useState, useEffect } from 'react';

interface AvailabilityItem {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function VerificationComponent() {
  const [items, setItems] = useState<AvailabilityItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    hasData: boolean;
    hasInvalidIds: boolean;
    hasMissingFields: boolean;
  }>({
    hasData: false,
    hasInvalidIds: false,
    hasMissingFields: false
  });

  useEffect(() => {
    verifyData();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const verifyData = () => {
    try {
      addLog('=== Iniciando verificação de dados ===');
      
      const saved = localStorage.getItem('nail_availability');
      if (!saved) {
        addLog('Nenhum dado encontrado no localStorage');
        setVerificationResult({
          hasData: false,
          hasInvalidIds: false,
          hasMissingFields: false
        });
        return;
      }
      
      const allAvailability = JSON.parse(saved);
      addLog(`Total de itens encontrados: ${allAvailability.length}`);
      
      if (!Array.isArray(allAvailability)) {
        addLog('Dados não estão no formato de array');
        setItems([]);
        setVerificationResult({
          hasData: false,
          hasInvalidIds: false,
          hasMissingFields: false
        });
        return;
      }
      
      setItems(allAvailability);
      
      // Verificar IDs inválidos
      const invalidIdItems = allAvailability.filter((item: any) => {
        return !item.id || typeof item.id !== 'string';
      });
      
      // Verificar campos faltando
      const missingFieldsItems = allAvailability.filter((item: any) => {
        return !item.designerId || !item.specificDate || !item.startTime || !item.endTime;
      });
      
      setVerificationResult({
        hasData: allAvailability.length > 0,
        hasInvalidIds: invalidIdItems.length > 0,
        hasMissingFields: missingFieldsItems.length > 0
      });
      
      addLog(`Itens com IDs inválidos: ${invalidIdItems.length}`);
      addLog(`Itens com campos faltando: ${missingFieldsItems.length}`);
      
      if (invalidIdItems.length > 0) {
        invalidIdItems.forEach((item: any, index: number) => {
          addLog(`  Item ${index} com ID inválido: ${JSON.stringify(item.id)}`);
        });
      }
      
      if (missingFieldsItems.length > 0) {
        missingFieldsItems.forEach((item: any, index: number) => {
          const missing = [];
          if (!item.designerId) missing.push('designerId');
          if (!item.specificDate) missing.push('specificDate');
          if (!item.startTime) missing.push('startTime');
          if (!item.endTime) missing.push('endTime');
          addLog(`  Item ${index} faltando: ${missing.join(', ')}`);
        });
      }
      
      addLog('=== Verificação concluída ===');
    } catch (error) {
      console.error('Erro na verificação:', error);
      addLog(`Erro na verificação: ${error}`);
    }
  };

  const fixData = () => {
    try {
      addLog('=== Iniciando correção de dados ===');
      
      const saved = localStorage.getItem('nail_availability');
      if (!saved) {
        addLog('Nenhum dado para corrigir');
        return;
      }
      
      let allAvailability = JSON.parse(saved);
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      let fixedCount = 0;
      
      const fixedData = allAvailability.map((item: any, index: number) => {
        let wasFixed = false;
        const fixedItem = { ...item };
        
        // Corrigir ID se necessário
        if (!fixedItem.id) {
          fixedItem.id = `fixed-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
          wasFixed = true;
          addLog(`  Corrigido ID para item ${index}: ${fixedItem.id}`);
        }
        
        // Corrigir campos faltando
        if (!fixedItem.designerId) {
          fixedItem.designerId = 'unknown-designer';
          wasFixed = true;
          addLog(`  Corrigido designerId para item ${index}`);
        }
        
        if (!fixedItem.specificDate) {
          fixedItem.specificDate = new Date().toISOString().split('T')[0];
          wasFixed = true;
          addLog(`  Corrigido specificDate para item ${index}`);
        }
        
        if (!fixedItem.startTime) {
          fixedItem.startTime = '00:00';
          wasFixed = true;
          addLog(`  Corrigido startTime para item ${index}`);
        }
        
        if (!fixedItem.endTime) {
          fixedItem.endTime = '23:59';
          wasFixed = true;
          addLog(`  Corrigido endTime para item ${index}`);
        }
        
        if (fixedItem.is_available !== undefined && fixedItem.isActive === undefined) {
          fixedItem.isActive = !fixedItem.is_available;
          wasFixed = true;
          addLog(`  Corrigido isActive para item ${index}`);
        }
        
        if (wasFixed) {
          fixedCount++;
        }
        
        return fixedItem;
      });
      
      if (fixedCount > 0) {
        localStorage.setItem('nail_availability', JSON.stringify(fixedData));
        setItems(fixedData);
        addLog(`Corrigidos ${fixedCount} itens`);
      } else {
        addLog('Nenhum item precisou de correção');
      }
      
      // Reexecutar verificação
      setTimeout(() => {
        verifyData();
      }, 100);
      
      addLog('=== Correção concluída ===');
    } catch (error) {
      console.error('Erro na correção:', error);
      addLog(`Erro na correção: ${error}`);
    }
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados?')) {
      localStorage.removeItem('nail_availability');
      setItems([]);
      setLogs([]);
      setVerificationResult({
        hasData: false,
        hasInvalidIds: false,
        hasMissingFields: false
      });
      addLog('Todos os dados foram removidos');
    }
  };

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg mt-6">
      <h3 className="font-bold text-indigo-800 mb-3">Verificação de Dados</h3>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className={`p-2 rounded text-center ${
          verificationResult.hasData 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="font-medium">Dados Presentes</div>
          <div className="text-sm">{verificationResult.hasData ? 'Sim' : 'Não'}</div>
        </div>
        
        <div className={`p-2 rounded text-center ${
          verificationResult.hasInvalidIds 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          <div className="font-medium">IDs Válidos</div>
          <div className="text-sm">{verificationResult.hasInvalidIds ? 'Não' : 'Sim'}</div>
        </div>
        
        <div className={`p-2 rounded text-center ${
          verificationResult.hasMissingFields 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          <div className="font-medium">Campos Completos</div>
          <div className="text-sm">{verificationResult.hasMissingFields ? 'Não' : 'Sim'}</div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={verifyData}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Verificar Dados
        </button>
        
        <button
          onClick={fixData}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Corrigir Dados
        </button>
        
        <button
          onClick={clearData}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Limpar Dados
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Itens ({items.length})</h4>
          {items.length === 0 ? (
            <p className="text-gray-500">Nenhum item encontrado</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.id || index} className="p-2 bg-white rounded border text-xs">
                  <div className="font-medium truncate">{item.specificDate}</div>
                  <div className="text-gray-600">{item.startTime} - {item.endTime}</div>
                  <div className="text-gray-500 truncate">ID: {item.id}</div>
                  <div className={`inline-block px-1 rounded mt-1 ${
                    item.isActive 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.isActive ? 'Bloqueado' : 'Liberado'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Logs de Verificação</h4>
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
      </div>
      
      <div className="mt-3 p-2 bg-indigo-100 rounded">
        <p className="text-xs text-indigo-700">
          Este componente verifica se os dados de disponibilidade estão corretos.
          Ele identifica problemas com IDs inválidos e campos faltando, e pode corrigi-los automaticamente.
        </p>
      </div>
    </div>
  );
}
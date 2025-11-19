// Componente para testar a atualização do estado após exclusão
import React, { useState, useEffect } from 'react';

interface TestItem {
  id: string;
  name: string;
  date: string;
}

export default function StateUpdateTester() {
  const [items, setItems] = useState<TestItem[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  // Inicializar com dados de teste
  useEffect(() => {
    const initialItems: TestItem[] = [
      { id: '1', name: 'Bloqueio 1', date: '2023-10-15' },
      { id: '2', name: 'Bloqueio 2', date: '2023-10-16' },
      { id: '3', name: 'Bloqueio 3', date: '2023-10-17' }
    ];
    setItems(initialItems);
    addLog(`Estado inicializado com ${initialItems.length} itens`);
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDeleteItem = (id: string) => {
    addLog(`=== Iniciando exclusão do item ${id} ===`);
    
    // Mostrar estado atual antes da exclusão
    addLog(`Estado antes: ${items.length} itens`);
    items.forEach(item => {
      addLog(`  - ${item.id}: ${item.name}`);
    });
    
    // Simular a exclusão (filtragem)
    const filteredItems = items.filter(item => {
      const shouldKeep = item.id !== id;
      addLog(`Comparando ${item.id} !== ${id} = ${shouldKeep}`);
      return shouldKeep;
    });
    
    // Atualizar o estado
    addLog(`Atualizando estado de ${items.length} para ${filteredItems.length} itens`);
    setItems(filteredItems);
    
    // Mostrar estado após a exclusão
    addLog(`Estado após: ${filteredItems.length} itens`);
    filteredItems.forEach(item => {
      addLog(`  - ${item.id}: ${item.name}`);
    });
    
    addLog(`=== Exclusão do item ${id} concluída ===`);
  };

  const resetState = () => {
    const initialItems: TestItem[] = [
      { id: '1', name: 'Bloqueio 1', date: '2023-10-15' },
      { id: '2', name: 'Bloqueio 2', date: '2023-10-16' },
      { id: '3', name: 'Bloqueio 3', date: '2023-10-17' }
    ];
    setItems(initialItems);
    addLog(`Estado resetado com ${initialItems.length} itens`);
  };

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-6">
      <h3 className="font-bold text-green-800 mb-3">Testador de Atualização de Estado</h3>
      
      <div className="mb-4">
        <button
          onClick={resetState}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm mr-2"
        >
          Resetar Estado
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Itens Atuais ({items.length})</h4>
          {items.length === 0 ? (
            <p className="text-gray-500">Nenhum item</p>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-600">{item.id} - {item.date}</div>
                  </div>
                  <button
                    onClick={() => testDeleteItem(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Logs</h4>
          <div className="bg-gray-900 text-green-400 p-3 rounded text-xs max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p>Sem logs ainda...</p>
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
      
      <div className="mt-3 p-2 bg-green-100 rounded">
        <p className="text-xs text-green-700">
          Este componente testa o processo de atualização do estado React após uma exclusão.
          Ele simula como o estado deve ser atualizado quando um item é removido.
        </p>
      </div>
    </div>
  );
}
// Componente para testar exclusão com diferentes tipos de IDs
import React, { useState } from 'react';

interface TestItem {
  id: string;
  name: string;
  type: 'uuid' | 'local' | 'invalid';
}

export default function IdTypeTester() {
  const [testItems, setTestItems] = useState<TestItem[]>([
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Item com ID UUID válido',
      type: 'uuid'
    },
    {
      id: 'local-1234567890-abc123',
      name: 'Item com ID local',
      type: 'local'
    },
    {
      id: 'invalid-id-123',
      name: 'Item com ID inválido',
      type: 'invalid'
    }
  ]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDeleteItem = (id: string, type: string) => {
    addLog(`=== Testando exclusão de item ${type} ===`);
    addLog(`ID: ${id}`);
    
    // Verificar formato do ID
    const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    addLog(`ID é formato UUID válido: ${isUuidFormat}`);
    
    if (isUuidFormat) {
      addLog('✅ Este ID seria excluído do Supabase');
    } else {
      addLog('⚠️  Este ID seria excluído apenas do localStorage');
    }
    
    // Simular exclusão
    const filteredItems = testItems.filter(item => item.id !== id);
    setTestItems(filteredItems);
    
    addLog(`✅ Item excluído. Restam ${filteredItems.length} itens`);
    addLog('=== Fim do teste ===');
  };

  const addNewItem = () => {
    const newId = `new-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newItem: TestItem = {
      id: newId,
      name: `Novo item ${testItems.length + 1}`,
      type: 'local'
    };
    
    setTestItems([...testItems, newItem]);
    addLog(`➕ Adicionado novo item: ${newId}`);
  };

  const resetItems = () => {
    setTestItems([
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Item com ID UUID válido',
        type: 'uuid'
      },
      {
        id: 'local-1234567890-abc123',
        name: 'Item com ID local',
        type: 'local'
      },
      {
        id: 'invalid-id-123',
        name: 'Item com ID inválido',
        type: 'invalid'
      }
    ]);
    addLog('🔄 Itens resetados');
  };

  return (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg mt-6">
      <h3 className="font-bold text-rose-800 mb-3">Testador de Tipos de ID</h3>
      
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={addNewItem}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Adicionar Item
        </button>
        
        <button
          onClick={resetItems}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Resetar Itens
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Itens para Teste ({testItems.length})</h4>
          <div className="space-y-2">
            {testItems.map((item) => (
              <div key={item.id} className="p-3 bg-white rounded border">
                <div className="font-medium">{item.name}</div>
                <div className="text-xs text-gray-600 mt-1 truncate">ID: {item.id}</div>
                <div className={`text-xs mt-2 inline-block px-2 py-1 rounded ${
                  item.type === 'uuid' 
                    ? 'bg-blue-100 text-blue-800' 
                    : item.type === 'local' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {item.type === 'uuid' ? 'UUID Válido' : 
                   item.type === 'local' ? 'ID Local' : 'ID Inválido'}
                </div>
                <button
                  onClick={() => testDeleteItem(item.id, item.type)}
                  className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Testar Exclusão
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Logs de Teste</h4>
          <div className="bg-gray-900 text-green-400 p-3 rounded text-xs max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p>Os logs de teste aparecerão aqui...</p>
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
      
      <div className="mt-3 p-2 bg-rose-100 rounded">
        <p className="text-xs text-rose-700">
          Este componente testa como diferentes tipos de IDs são tratados durante a exclusão.
          IDs no formato UUID válido tentam exclusão no Supabase, enquanto IDs locais ou inválidos
          são excluídos apenas do localStorage.
        </p>
      </div>
    </div>
  );
}
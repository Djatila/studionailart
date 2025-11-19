// Componente para testar a correção final do problema de exclusão
import React, { useState, useEffect } from 'react';

interface TestAvailability {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function FinalTestComponent() {
  const [testItems, setTestItems] = useState<TestAvailability[]>([]);
  const [newItem, setNewItem] = useState({
    specificDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00'
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [testMode, setTestMode] = useState<'create' | 'list'>('list');

  useEffect(() => {
    loadTestItems();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const loadTestItems = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      setTestItems(Array.isArray(allAvailability) ? allAvailability : []);
      addLog(`Carregados ${Array.isArray(allAvailability) ? allAvailability.length : 0} itens`);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      addLog(`Erro ao carregar: ${error}`);
      setTestItems([]);
    }
  };

  const createTestItem = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      // Criar item com ID no formato correto para testes
      const isSupabaseFormat = Math.random() > 0.5; // 50% de chance de ser formato Supabase
      let newId: string;
      
      if (isSupabaseFormat) {
        // Formato UUID (simulado)
        newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      } else {
        // Formato local
        newId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const newItemData: TestAvailability = {
        id: newId,
        designerId: 'test-designer',
        specificDate: newItem.specificDate,
        startTime: newItem.startTime,
        endTime: newItem.endTime,
        isActive: true
      };
      
      allAvailability.push(newItemData);
      localStorage.setItem('nail_availability', JSON.stringify(allAvailability));
      
      setTestItems(allAvailability);
      addLog(`Criado item (${isSupabaseFormat ? 'Supabase' : 'Local'}): ${newId.substring(0, 20)}...`);
    } catch (error) {
      console.error('Erro ao criar item:', error);
      addLog(`Erro ao criar: ${error}`);
    }
  };

  const deleteTestItem = (id: string) => {
    addLog(`=== Tentando excluir item ${id.substring(0, 20)}... ===`);
    
    // Verificar formato do ID
    const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    addLog(`ID é formato UUID válido: ${isUuidFormat}`);
    
    try {
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      addLog(`Total antes: ${allAvailability.length}`);
      
      // Filtrar para remover apenas o item específico
      const filtered = allAvailability.filter((item: TestAvailability) => {
        const shouldKeep = String(item.id) !== String(id);
        return shouldKeep;
      });
      
      addLog(`Total após: ${filtered.length}`);
      
      localStorage.setItem('nail_availability', JSON.stringify(filtered));
      setTestItems(filtered);
      
      addLog(`Excluído item: ${id.substring(0, 20)}...`);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      addLog(`Erro ao excluir: ${error}`);
    }
  };

  const clearAllTestItems = () => {
    if (confirm('Tem certeza que deseja limpar todos os itens de teste?')) {
      localStorage.removeItem('nail_availability');
      setTestItems([]);
      addLog('Todos os itens de teste removidos');
    }
  };

  return (
    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg mt-6">
      <h3 className="font-bold text-emerald-800 mb-3">Teste Final da Correção</h3>
      
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setTestMode('list')}
          className={`px-3 py-1 rounded text-sm ${
            testMode === 'list' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Lista de Itens
        </button>
        
        <button
          onClick={() => setTestMode('create')}
          className={`px-3 py-1 rounded text-sm ${
            testMode === 'create' 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Criar Item
        </button>
        
        <button
          onClick={loadTestItems}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Recarregar
        </button>
        
        <button
          onClick={clearAllTestItems}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Limpar Tudo
        </button>
      </div>
      
      {testMode === 'create' && (
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">Criar Novo Item de Teste</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-xs text-emerald-700 mb-1">Data</label>
              <input
                type="date"
                value={newItem.specificDate}
                onChange={(e) => setNewItem({...newItem, specificDate: e.target.value})}
                className="w-full p-2 border border-emerald-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-emerald-700 mb-1">Início</label>
              <input
                type="time"
                value={newItem.startTime}
                onChange={(e) => setNewItem({...newItem, startTime: e.target.value})}
                className="w-full p-2 border border-emerald-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-emerald-700 mb-1">Fim</label>
              <input
                type="time"
                value={newItem.endTime}
                onChange={(e) => setNewItem({...newItem, endTime: e.target.value})}
                className="w-full p-2 border border-emerald-300 rounded text-sm"
              />
            </div>
          </div>
          
          <button
            onClick={createTestItem}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Criar Item de Teste
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Itens de Teste ({testItems.length})</h4>
          {testItems.length === 0 ? (
            <p className="text-gray-500">Nenhum item encontrado</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testItems.map((item) => (
                <div key={item.id} className="p-3 bg-white rounded border">
                  <div className="font-medium text-sm">{item.specificDate}</div>
                  <div className="text-xs text-gray-600">
                    {item.startTime} - {item.endTime}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    ID: {item.id}
                  </div>
                  <div className="text-xs mt-1">
                    <span className={`inline-block px-1 rounded ${
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id) 
                        ? 'Supabase' 
                        : 'Local'}
                    </span>
                    <span className={`ml-1 inline-block px-1 rounded ${
                      item.isActive 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.isActive ? 'Bloqueado' : 'Liberado'}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTestItem(item.id)}
                    className="mt-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
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
      
      <div className="mt-3 p-2 bg-emerald-100 rounded">
        <p className="text-xs text-emerald-700">
          Este componente testa a correção final do problema de exclusão de bloqueios.
          Ele verifica se a exclusão funciona corretamente tanto para IDs no formato 
          UUID do Supabase quanto para IDs gerados localmente.
        </p>
      </div>
    </div>
  );
}
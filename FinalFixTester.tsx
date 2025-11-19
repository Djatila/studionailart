// Componente para testar a correção final
import React, { useState, useEffect } from 'react';

interface TestAvailability {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function FinalFixTester() {
  const [testMode, setTestMode] = useState<'create' | 'delete' | 'list'>('list');
  const [testData, setTestData] = useState<TestAvailability[]>([]);
  const [newItem, setNewItem] = useState({
    specificDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00'
  });
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadTestData();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const loadTestData = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      setTestData(Array.isArray(allAvailability) ? allAvailability : []);
      addLog(`Carregados ${Array.isArray(allAvailability) ? allAvailability.length : 0} itens`);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      addLog(`Erro ao carregar: ${error}`);
      setTestData([]);
    }
  };

  const createTestItem = () => {
    try {
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      const newItemData: TestAvailability = {
        id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        designerId: 'test-designer',
        specificDate: newItem.specificDate,
        startTime: newItem.startTime,
        endTime: newItem.endTime,
        isActive: true
      };
      
      allAvailability.push(newItemData);
      localStorage.setItem('nail_availability', JSON.stringify(allAvailability));
      
      setTestData(allAvailability);
      addLog(`Criado item: ${newItemData.id}`);
      addLog(`Data: ${newItemData.specificDate} ${newItemData.startTime}-${newItemData.endTime}`);
    } catch (error) {
      console.error('Erro ao criar item:', error);
      addLog(`Erro ao criar: ${error}`);
    }
  };

  const deleteTestItem = (id: string) => {
    try {
      addLog(`=== Tentando excluir item ${id} ===`);
      
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      addLog(`Total antes: ${allAvailability.length}`);
      
      // Filtrar para remover apenas o item específico
      const filtered = allAvailability.filter((item: TestAvailability) => {
        const shouldKeep = String(item.id) !== String(id);
        addLog(`Comparando: ${item.id} !== ${id} = ${shouldKeep}`);
        return shouldKeep;
      });
      
      addLog(`Total após: ${filtered.length}`);
      
      localStorage.setItem('nail_availability', JSON.stringify(filtered));
      setTestData(filtered);
      
      addLog(`Excluído item: ${id}`);
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      addLog(`Erro ao excluir: ${error}`);
    }
  };

  const clearAllData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de teste?')) {
      localStorage.removeItem('nail_availability');
      setTestData([]);
      addLog('Todos os dados removidos');
    }
  };

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mt-6">
      <h3 className="font-bold text-purple-800 mb-3">Testador da Correção Final</h3>
      
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTestMode('list')}
          className={`px-3 py-1 rounded text-sm ${
            testMode === 'list' 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Lista
        </button>
        
        <button
          onClick={() => setTestMode('create')}
          className={`px-3 py-1 rounded text-sm ${
            testMode === 'create' 
              ? 'bg-purple-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Criar
        </button>
        
        <button
          onClick={loadTestData}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Recarregar
        </button>
        
        <button
          onClick={clearAllData}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Limpar Tudo
        </button>
      </div>
      
      {testMode === 'create' && (
        <div className="mb-4 p-3 bg-white rounded border">
          <h4 className="font-medium mb-2">Criar Novo Item</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-xs text-purple-700 mb-1">Data</label>
              <input
                type="date"
                value={newItem.specificDate}
                onChange={(e) => setNewItem({...newItem, specificDate: e.target.value})}
                className="w-full p-2 border border-purple-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-purple-700 mb-1">Início</label>
              <input
                type="time"
                value={newItem.startTime}
                onChange={(e) => setNewItem({...newItem, startTime: e.target.value})}
                className="w-full p-2 border border-purple-300 rounded text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-purple-700 mb-1">Fim</label>
              <input
                type="time"
                value={newItem.endTime}
                onChange={(e) => setNewItem({...newItem, endTime: e.target.value})}
                className="w-full p-2 border border-purple-300 rounded text-sm"
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
          <h4 className="font-medium mb-2">Itens ({testData.length})</h4>
          {testData.length === 0 ? (
            <p className="text-gray-500">Nenhum item encontrado</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testData.map((item) => (
                <div key={item.id} className="p-3 bg-white rounded border">
                  <div className="font-medium text-sm">{item.specificDate}</div>
                  <div className="text-xs text-gray-600">
                    {item.startTime} - {item.endTime}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ID: {item.id.substring(0, 20)}...
                  </div>
                  <div className={`text-xs mt-1 inline-block px-1 rounded ${
                    item.isActive 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.isActive ? 'Bloqueado' : 'Liberado'}
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
      
      <div className="mt-3 p-2 bg-purple-100 rounded">
        <p className="text-xs text-purple-700">
          Este componente testa a correção final do problema de exclusão de bloqueios.
          Ele verifica se a criação, listagem e exclusão de itens está funcionando corretamente.
        </p>
      </div>
    </div>
  );
}
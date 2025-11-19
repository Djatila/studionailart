// Componente para testar todas as funções de disponibilidade juntas
import React, { useState } from 'react';

interface TestAvailability {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function AvailabilityFunctionsTester() {
  const [testDesignerId, setTestDesignerId] = useState('test-designer');
  const [testData, setTestData] = useState<TestAvailability[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Função para carregar dados
  const loadAvailability = async () => {
    setLoading(true);
    addLog('=== loadAvailability ===');
    
    try {
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      
      // Filtrar por designerId
      const filtered = allAvailability.filter((item: TestAvailability) => 
        item.designerId === testDesignerId
      );
      
      setTestData(filtered);
      addLog(`Carregado ${filtered.length} itens`);
    } catch (error) {
      addLog(`Erro ao carregar: ${error}`);
      setTestData([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar dados
  const saveAvailability = async (availability: TestAvailability) => {
    addLog('=== saveAvailability ===');
    
    try {
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      // Adicionar novo item
      const newItem = {
        ...availability,
        id: availability.id || `item-${Date.now()}`
      };
      
      allAvailability.push(newItem);
      localStorage.setItem('nail_availability', JSON.stringify(allAvailability));
      
      addLog(`Salvo item: ${newItem.id}`);
      await loadAvailability(); // Recarregar dados
    } catch (error) {
      addLog(`Erro ao salvar: ${error}`);
    }
  };

  // Função para excluir dados
  const deleteAvailability = async (id: string) => {
    addLog('=== deleteAvailability ===');
    
    try {
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      // Filtrar para remover o item específico
      const filtered = allAvailability.filter((item: TestAvailability) => {
        const shouldKeep = String(item.id) !== String(id);
        addLog(`Comparando ${item.id} !== ${id} = ${shouldKeep}`);
        return shouldKeep;
      });
      
      localStorage.setItem('nail_availability', JSON.stringify(filtered));
      addLog(`Excluído item: ${id}`);
      await loadAvailability(); // Recarregar dados
    } catch (error) {
      addLog(`Erro ao excluir: ${error}`);
    }
  };

  // Função para alternar estado
  const toggleAvailability = async (id: string) => {
    addLog('=== toggleAvailability ===');
    
    try {
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      // Atualizar o item específico
      const updated = allAvailability.map((item: TestAvailability) => {
        if (item.id === id) {
          const toggledItem = { ...item, isActive: !item.isActive };
          addLog(`Alternado ${item.id} de ${item.isActive} para ${toggledItem.isActive}`);
          return toggledItem;
        }
        return item;
      });
      
      localStorage.setItem('nail_availability', JSON.stringify(updated));
      addLog(`Atualizado item: ${id}`);
      await loadAvailability(); // Recarregar dados
    } catch (error) {
      addLog(`Erro ao alternar: ${error}`);
    }
  };

  // Criar dados de teste
  const createTestData = () => {
    const testData: TestAvailability[] = [
      {
        id: `test-1-${Date.now()}`,
        designerId: testDesignerId,
        specificDate: '2023-10-15',
        startTime: '08:00',
        endTime: '09:00',
        isActive: true
      },
      {
        id: `test-2-${Date.now()}`,
        designerId: testDesignerId,
        specificDate: '2023-10-16',
        startTime: '10:00',
        endTime: '11:00',
        isActive: false
      }
    ];
    
    localStorage.setItem('nail_availability', JSON.stringify(testData));
    addLog(`Dados de teste criados: ${testData.length} itens`);
    loadAvailability();
  };

  // Limpar dados de teste
  const clearTestData = () => {
    localStorage.removeItem('nail_availability');
    setTestData([]);
    addLog('Dados de teste removidos');
  };

  // Criar novo item
  const createNewItem = () => {
    const newItem: TestAvailability = {
      id: '',
      designerId: testDesignerId,
      specificDate: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      endTime: '14:00',
      isActive: true
    };
    
    saveAvailability(newItem);
  };

  return (
    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg mt-6">
      <h3 className="font-bold text-cyan-800 mb-3">Testador de Todas as Funções de Disponibilidade</h3>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={testDesignerId}
          onChange={(e) => setTestDesignerId(e.target.value)}
          placeholder="ID do Designer"
          className="flex-1 p-2 border border-cyan-300 rounded"
        />
        <button
          onClick={loadAvailability}
          disabled={loading}
          className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Carregar'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <h4 className="font-medium mb-2">Controles</h4>
          <div className="space-y-2">
            <button
              onClick={createTestData}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            >
              Criar Dados de Teste
            </button>
            
            <button
              onClick={clearTestData}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Limpar Dados
            </button>
            
            <button
              onClick={createNewItem}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Criar Novo Item
            </button>
          </div>
          
          <div className="mt-4 p-2 bg-white rounded border">
            <h5 className="font-medium text-sm mb-1">Itens ({testData.length})</h5>
            {testData.length === 0 ? (
              <p className="text-xs text-gray-500">Nenhum item</p>
            ) : (
              <div className="text-xs space-y-2 max-h-40 overflow-y-auto">
                {testData.map((item) => (
                  <div key={item.id} className="p-2 bg-gray-50 rounded">
                    <div className="font-medium">{item.specificDate}</div>
                    <div className="text-gray-600">{item.startTime} - {item.endTime}</div>
                    <div className={`text-xs px-1 py-0.5 rounded mt-1 inline-block ${
                      item.isActive 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {item.isActive ? 'Bloqueado' : 'Liberado'}
                    </div>
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={() => toggleAvailability(item.id)}
                        className="text-xs px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Alternar
                      </button>
                      <button
                        onClick={() => deleteAvailability(item.id)}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <h4 className="font-medium mb-2">Logs</h4>
          <div className="bg-gray-900 text-green-400 p-3 rounded text-xs h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p>Os logs do teste aparecerão aqui...</p>
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
      
      <div className="mt-3 p-2 bg-cyan-100 rounded">
        <p className="text-xs text-cyan-700">
          Este componente testa todas as funções de disponibilidade juntas:
          carregar, salvar, excluir e alternar estado. Ele simula o fluxo completo
          de gerenciamento de bloqueios de dias.
        </p>
      </div>
    </div>
  );
}
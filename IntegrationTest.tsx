// Componente para testar a integração completa da funcionalidade de exclusão
import React, { useState, useEffect } from 'react';

interface TestAvailability {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function IntegrationTest() {
  const [testData, setTestData] = useState<TestAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadTestData();
  }, []);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const loadTestData = () => {
    setLoading(true);
    addLog('Carregando dados de teste...');
    try {
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      setTestData(allAvailability);
      addLog(`Dados carregados: ${allAvailability.length} itens`);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      addLog(`Erro ao carregar dados: ${error}`);
      setTestData([]);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteFunction = async (id: string) => {
    addLog(`=== Iniciando teste de exclusão do ID: ${id} ===`);
    
    try {
      // Simular a função deleteAvailability
      addLog('Tentando deletar do localStorage...');
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      addLog(`Dados atuais: ${allAvailability.length} itens`);
      
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      // Filtrar para remover apenas o item específico
      const filtered = allAvailability.filter((avail: TestAvailability) => {
        if (!avail || !avail.id) {
          addLog('Item sem ID encontrado');
          return true;
        }
        const shouldKeep = String(avail.id) !== String(id);
        addLog(`Comparando: ${avail.id} !== ${id} = ${shouldKeep}`);
        return shouldKeep;
      });
      
      addLog(`Resultado: ${filtered.length} itens mantidos`);
      
      localStorage.setItem('nail_availability', JSON.stringify(filtered));
      addLog('Dados salvos no localStorage');
      
      // Atualizar estado local
      setTestData(filtered);
      addLog('Estado atualizado');
      
      addLog('=== Teste de exclusão concluído ===');
    } catch (error) {
      console.error('Erro durante o teste:', error);
      addLog(`Erro durante o teste: ${error}`);
    }
  };

  const createTestItem = () => {
    const newItem: TestAvailability = {
      id: `test-${Date.now()}`,
      designerId: 'test-designer',
      specificDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '09:00',
      isActive: true
    };
    
    try {
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      allAvailability.push(newItem);
      localStorage.setItem('nail_availability', JSON.stringify(allAvailability));
      setTestData(allAvailability);
      addLog(`Item de teste criado: ${newItem.id}`);
    } catch (error) {
      console.error('Erro ao criar item de teste:', error);
      addLog(`Erro ao criar item de teste: ${error}`);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg max-w-4xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">Teste de Integração - Exclusão de Bloqueios</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="font-medium mb-2">Dados de Teste</h3>
          {testData.length === 0 ? (
            <p className="text-gray-500">Nenhum dado encontrado</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {testData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium">{item.specificDate}</div>
                    <div className="text-xs text-gray-600">{item.id}</div>
                  </div>
                  <button
                    onClick={() => testDeleteFunction(item.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={createTestItem}
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Criar Item de Teste
          </button>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Logs</h3>
          <div className="bg-gray-800 text-green-400 p-2 rounded text-xs max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <p>Sem logs ainda...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index}>{log}</div>
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
      
      <div className="mt-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-700">
          Este componente testa a funcionalidade de exclusão de forma isolada. 
          Use-o para verificar se a lógica de exclusão está funcionando corretamente.
        </p>
      </div>
    </div>
  );
}
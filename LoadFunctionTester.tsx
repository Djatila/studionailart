// Componente para testar a função loadAvailability
import React, { useState } from 'react';

interface TestAvailability {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function LoadFunctionTester() {
  const [loadedData, setLoadedData] = useState<TestAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testDesignerId, setTestDesignerId] = useState('test-designer');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLoadAvailability = async () => {
    setLoading(true);
    addLog('=== Iniciando teste da função loadAvailability ===');
    
    try {
      addLog('1. Tentando carregar dados...');
      
      // Simular a função loadAvailability
      addLog('2. Chamando getAvailability...');
      
      // Simular leitura do localStorage
      const saved = localStorage.getItem('nail_availability');
      addLog(`Dados no localStorage: ${saved ? 'Encontrados' : 'Não encontrados'}`);
      
      if (saved) {
        try {
          const allAvailability = JSON.parse(saved);
          addLog(`Total de itens: ${allAvailability.length}`);
          
          // Filtrar por designerId
          const filtered = allAvailability.filter((item: TestAvailability) => 
            item.designerId === testDesignerId
          );
          
          addLog(`Itens para designer ${testDesignerId}: ${filtered.length}`);
          
          // Atualizar estado
          setLoadedData(filtered);
          addLog('Dados carregados com sucesso');
          
          // Mostrar dados carregados
          if (filtered.length > 0) {
            addLog('Dados carregados:');
            filtered.forEach((item: TestAvailability, index: number) => {
              addLog(`  ${index + 1}. ${item.specificDate} ${item.startTime}-${item.endTime} (${item.isActive ? 'Bloqueado' : 'Liberado'})`);
            });
          }
        } catch (parseError) {
          addLog(`Erro ao parsear dados: ${parseError}`);
          setLoadedData([]);
        }
      } else {
        addLog('Nenhum dado encontrado no localStorage');
        setLoadedData([]);
      }
      
      addLog('=== Teste da função loadAvailability concluído ===');
    } catch (error) {
      console.error('Erro durante o teste:', error);
      addLog(`Erro durante o teste: ${error}`);
      setLoadedData([]);
    } finally {
      setLoading(false);
    }
  };

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
      },
      {
        id: `test-3-${Date.now()}`,
        designerId: 'other-designer',
        specificDate: '2023-10-17',
        startTime: '13:00',
        endTime: '14:00',
        isActive: true
      }
    ];
    
    localStorage.setItem('nail_availability', JSON.stringify(testData));
    addLog(`Dados de teste criados: ${testData.length} itens`);
  };

  const clearTestData = () => {
    localStorage.removeItem('nail_availability');
    setLoadedData([]);
    addLog('Dados de teste removidos');
  };

  return (
    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg mt-6">
      <h3 className="font-bold text-indigo-800 mb-3">Testador da Função loadAvailability</h3>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={testDesignerId}
          onChange={(e) => setTestDesignerId(e.target.value)}
          placeholder="ID do Designer"
          className="flex-1 p-2 border border-indigo-300 rounded"
        />
        <button
          onClick={testLoadAvailability}
          disabled={loading}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Carregar Dados'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Controles de Teste</h4>
          <div className="space-y-2">
            <button
              onClick={createTestData}
              className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Criar Dados de Teste
            </button>
            
            <button
              onClick={clearTestData}
              className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Limpar Dados de Teste
            </button>
            
            <div className="p-2 bg-white rounded border">
              <h5 className="font-medium text-sm mb-1">Dados Carregados ({loadedData.length})</h5>
              {loadedData.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhum dado carregado</p>
              ) : (
                <div className="text-xs space-y-1">
                  {loadedData.map((item, index) => (
                    <div key={item.id} className="p-1 bg-gray-50 rounded">
                      <div className="font-medium">{item.specificDate}</div>
                      <div>{item.startTime} - {item.endTime}</div>
                      <div className={item.isActive ? 'text-red-600' : 'text-green-600'}>
                        {item.isActive ? 'Bloqueado' : 'Liberado'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Logs</h4>
          <div className="bg-gray-900 text-green-400 p-3 rounded text-xs max-h-60 overflow-y-auto">
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
      
      <div className="mt-3 p-2 bg-indigo-100 rounded">
        <p className="text-xs text-indigo-700">
          Este componente testa a lógica da função loadAvailability de forma isolada.
          Ele simula o processo de carregamento de dados sem afetar o componente principal.
        </p>
      </div>
    </div>
  );
}
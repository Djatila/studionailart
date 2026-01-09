// Componente para testar a função getAvailability
import React, { useState } from 'react';

interface TestAvailability {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function GetFunctionTester() {
  const [testDesignerId, setTestDesignerId] = useState('test-designer');
  const [resultData, setResultData] = useState<TestAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testGetAvailability = async () => {
    setLoading(true);
    addLog('=== Iniciando teste da função getAvailability ===');
    
    try {
      addLog(`Designer ID: ${testDesignerId}`);
      
      // Simular a função getAvailability
      addLog('1. Tentando buscar dados do Supabase...');
      
      // Como não temos acesso ao Supabase neste teste, vamos simular
      addLog('2. Supabase não disponível neste teste, usando fallback para localStorage');
      
      // Simular leitura do localStorage
      addLog('3. Lendo dados do localStorage...');
      const saved = localStorage.getItem('nail_availability');
      addLog(`Dados no localStorage: ${saved ? 'Encontrados' : 'Não encontrados'}`);
      
      if (saved) {
        try {
          let allAvailability = JSON.parse(saved);
          addLog(`Total de itens: ${allAvailability.length}`);
          
          // Verificar se é array
          if (!Array.isArray(allAvailability)) {
            addLog('Dados não são um array, convertendo...');
            allAvailability = [];
          }
          
          // Filtrar apenas os registros com specific_date (bloqueios de datas específicas)
          const filteredAvailability = allAvailability.filter((avail: any) => 
            avail.specific_date || avail.specificDate
          );
          addLog(`Itens com datas específicas: ${filteredAvailability.length}`);
          
          // Mapear dados para o formato esperado
          const mappedAvailability = filteredAvailability.map((avail: any) => {
            return {
              id: avail.id,
              designerId: avail.designer_id || avail.designerId,
              specificDate: avail.specific_date || avail.specificDate,
              startTime: avail.start_time || avail.startTime,
              endTime: avail.end_time || avail.endTime,
              isActive: avail.is_available !== undefined ? !avail.is_available : avail.isActive
            };
          });
          
          addLog(`Dados mapeados: ${mappedAvailability.length} itens`);
          
          // Filtrar por designerId
          const designerFiltered = mappedAvailability.filter((avail: TestAvailability) => 
            avail.designerId === testDesignerId
          );
          
          addLog(`Itens para designer ${testDesignerId}: ${designerFiltered.length}`);
          
          // Atualizar resultado
          setResultData(designerFiltered);
          
          // Mostrar dados retornados
          if (designerFiltered.length > 0) {
            addLog('Dados retornados:');
            designerFiltered.forEach((item: TestAvailability, index: number) => {
              addLog(`  ${index + 1}. ${item.id} - ${item.specificDate} ${item.startTime}-${item.endTime} (${item.isActive ? 'Bloqueado' : 'Liberado'})`);
            });
          }
          
          addLog('=== Função getAvailability concluída com sucesso ===');
          return designerFiltered;
        } catch (parseError) {
          addLog(`Erro ao parsear dados: ${parseError}`);
          setResultData([]);
          return [];
        }
      } else {
        addLog('Nenhum dado encontrado no localStorage');
        setResultData([]);
        return [];
      }
    } catch (error) {
      console.error('Erro durante o teste:', error);
      addLog(`Erro durante o teste: ${error}`);
      setResultData([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTestData = () => {
    const testData: any[] = [
      {
        id: `supabase-1-${Date.now()}`,
        designer_id: testDesignerId,
        specific_date: '2023-10-15',
        start_time: '08:00',
        end_time: '09:00',
        is_available: false
      },
      {
        id: `supabase-2-${Date.now()}`,
        designer_id: testDesignerId,
        specific_date: '2023-10-16',
        start_time: '10:00',
        end_time: '11:00',
        is_available: true
      },
      {
        id: `local-1-${Date.now()}`,
        designerId: testDesignerId,
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
    setResultData([]);
    addLog('Dados de teste removidos');
  };

  return (
    <div className="p-4 bg-pink-50 border border-pink-200 rounded-lg mt-6">
      <h3 className="font-bold text-pink-800 mb-3">Testador da Função getAvailability</h3>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={testDesignerId}
          onChange={(e) => setTestDesignerId(e.target.value)}
          placeholder="ID do Designer"
          className="flex-1 p-2 border border-pink-300 rounded"
        />
        <button
          onClick={testGetAvailability}
          disabled={loading}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar Dados'}
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
              <h5 className="font-medium text-sm mb-1">Resultado ({resultData.length})</h5>
              {resultData.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhum dado retornado</p>
              ) : (
                <div className="text-xs space-y-1">
                  {resultData.map((item, index) => (
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
      
      <div className="mt-3 p-2 bg-pink-100 rounded">
        <p className="text-xs text-pink-700">
          Este componente testa a lógica da função getAvailability de forma isolada.
          Ele simula o processo de busca de dados sem afetar o componente principal.
        </p>
      </div>
    </div>
  );
}
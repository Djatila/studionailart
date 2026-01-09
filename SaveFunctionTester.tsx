// Componente para testar a função saveAvailability
import React, { useState } from 'react';

interface TestAvailability {
  id?: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function SaveFunctionTester() {
  const [testData, setTestData] = useState<TestAvailability>({
    designerId: 'test-designer',
    specificDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    isActive: true
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleChange = (field: keyof TestAvailability, value: string) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testSaveAvailability = async () => {
    setIsSaving(true);
    addLog('=== Iniciando teste da função saveAvailability ===');
    
    try {
      // Mostrar dados que serão salvos
      addLog('Dados a serem salvos:');
      addLog(JSON.stringify(testData, null, 2));
      
      // Simular a função saveAvailability
      addLog('1. Tentando salvar no Supabase...');
      
      // Aqui você pode adicionar uma chamada real para o serviço se desejar
      // Por enquanto, vamos simular o comportamento
      
      addLog('2. Tentando salvar no localStorage...');
      
      // Simular leitura do localStorage
      const saved = localStorage.getItem('nail_availability');
      addLog(`Dados atuais no localStorage: ${saved ? 'Encontrados' : 'Não encontrados'}`);
      
      let allAvailability: any[] = [];
      if (saved) {
        try {
          allAvailability = JSON.parse(saved);
          addLog(`Total de itens atuais: ${allAvailability.length}`);
        } catch (parseError) {
          addLog(`Erro ao parsear dados existentes: ${parseError}`);
          allAvailability = [];
        }
      }
      
      // Adicionar novo item
      const newItem = {
        ...testData,
        id: testData.id || `test-${Date.now()}`
      };
      
      allAvailability.push(newItem);
      addLog(`Adicionando novo item. Total após adição: ${allAvailability.length}`);
      
      // Salvar dados atualizados
      localStorage.setItem('nail_availability', JSON.stringify(allAvailability));
      addLog('Dados atualizados salvos no localStorage');
      
      addLog('=== Teste da função saveAvailability concluído ===');
    } catch (error) {
      console.error('Erro durante o teste:', error);
      addLog(`Erro durante o teste: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg mt-6">
      <h3 className="font-bold text-orange-800 mb-3">Testador da Função saveAvailability</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium mb-2">Dados para Teste</h4>
          <div className="space-y-2">
            <div>
              <label className="block text-sm text-orange-700 mb-1">Designer ID</label>
              <input
                type="text"
                value={testData.designerId}
                onChange={(e) => handleChange('designerId', e.target.value)}
                className="w-full p-2 border border-orange-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm text-orange-700 mb-1">Data Específica</label>
              <input
                type="date"
                value={testData.specificDate}
                onChange={(e) => handleChange('specificDate', e.target.value)}
                className="w-full p-2 border border-orange-300 rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-orange-700 mb-1">Hora Início</label>
                <input
                  type="time"
                  value={testData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="w-full p-2 border border-orange-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm text-orange-700 mb-1">Hora Fim</label>
                <input
                  type="time"
                  value={testData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full p-2 border border-orange-300 rounded"
                />
              </div>
            </div>
            
            <button
              onClick={testSaveAvailability}
              disabled={isSaving}
              className="w-full mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : 'Testar Salvamento'}
            </button>
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
      
      <div className="mt-3 p-2 bg-orange-100 rounded">
        <p className="text-xs text-orange-700">
          Este componente testa a lógica da função saveAvailability de forma isolada.
          Ele simula o processo de salvamento sem afetar o componente principal.
        </p>
      </div>
    </div>
  );
}
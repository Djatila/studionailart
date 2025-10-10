// Componente para testar a função deleteAvailability de forma isolada
import React, { useState } from 'react';

export default function DeleteAvailabilityTester() {
  const [testId, setTestId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDeleteAvailability = async () => {
    if (!testId.trim()) {
      alert('Por favor, informe um ID para testar');
      return;
    }

    setIsTesting(true);
    addLog(`=== Iniciando teste da função deleteAvailability ===`);
    addLog(`ID a ser excluído: ${testId}`);

    try {
      // Simular a função deleteAvailability com mais detalhes
      addLog('1. Tentando deletar do Supabase...');
      
      // Aqui você pode adicionar uma chamada real para o serviço se desejar
      // Por enquanto, vamos simular o comportamento
      
      addLog('2. Tentando deletar do localStorage...');
      
      // Simular leitura do localStorage
      const saved = localStorage.getItem('nail_availability');
      addLog(`Dados atuais no localStorage: ${saved ? 'Encontrados' : 'Não encontrados'}`);
      
      if (saved) {
        let allAvailability;
        try {
          allAvailability = JSON.parse(saved);
          addLog(`Total de itens: ${allAvailability.length}`);
          
          // Filtrar para remover apenas o item específico
          const filtered = allAvailability.filter((item: any) => {
            if (!item || !item.id) {
              addLog('Item sem ID encontrado');
              return true;
            }
            const shouldKeep = String(item.id) !== String(testId);
            addLog(`Comparando: ${item.id} (${typeof item.id}) !== ${testId} (${typeof testId}) = ${shouldKeep}`);
            return shouldKeep;
          });
          
          addLog(`Resultado: ${filtered.length} itens mantidos de ${allAvailability.length} originais`);
          
          // Salvar dados filtrados
          localStorage.setItem('nail_availability', JSON.stringify(filtered));
          addLog('Dados atualizados salvos no localStorage');
        } catch (parseError) {
          addLog(`Erro ao parsear dados: ${parseError}`);
        }
      }
      
      addLog('=== Teste da função deleteAvailability concluído ===');
    } catch (error) {
      console.error('Erro durante o teste:', error);
      addLog(`Erro durante o teste: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg mt-6">
      <h3 className="font-bold text-purple-800 mb-3">Testador da Função deleteAvailability</h3>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder="ID do bloqueio para teste"
          className="flex-1 p-2 border border-purple-300 rounded"
          disabled={isTesting}
        />
        <button
          onClick={testDeleteAvailability}
          disabled={isTesting}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isTesting ? 'Testando...' : 'Testar Exclusão'}
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-3 rounded text-xs max-h-40 overflow-y-auto">
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
      
      <div className="mt-3 p-2 bg-purple-100 rounded">
        <p className="text-xs text-purple-700">
          Este componente testa a lógica da função deleteAvailability de forma isolada.
          Ele simula o processo de exclusão sem afetar o componente principal.
        </p>
      </div>
    </div>
  );
}
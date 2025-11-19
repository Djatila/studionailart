// Componente para testar se a função deleteAvailability está sendo chamada corretamente
import React, { useState } from 'react';

interface DeleteFunctionTesterProps {
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteFunctionTester({ onDelete }: DeleteFunctionTesterProps) {
  const [testId, setTestId] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const handleTestDelete = async () => {
    if (!testId.trim()) {
      alert('Por favor, informe um ID para testar');
      return;
    }

    addLog(`=== Iniciando teste de exclusão com ID: ${testId} ===`);
    
    try {
      await onDelete(testId);
      addLog('Função onDelete chamada com sucesso');
    } catch (error) {
      console.error('Erro ao chamar onDelete:', error);
      addLog(`Erro ao chamar onDelete: ${error}`);
    }
    
    addLog('=== Fim do teste ===');
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-4">
      <h3 className="font-bold text-yellow-800 mb-2">Testador da Função de Exclusão</h3>
      
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder="ID para teste"
          className="flex-1 p-2 border border-yellow-300 rounded"
        />
        <button
          onClick={handleTestDelete}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Testar Exclusão
        </button>
      </div>
      
      <div className="bg-gray-800 text-green-400 p-2 rounded text-xs max-h-32 overflow-y-auto">
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
  );
}
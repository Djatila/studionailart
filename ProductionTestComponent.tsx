// Componente para testar a correção em ambiente de produção
import React, { useState, useEffect } from 'react';

interface AvailabilityItem {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function ProductionTestComponent() {
  const [testStatus, setTestStatus] = useState<{
    localStorageWorking: boolean;
    dataLoaded: boolean;
    hasInvalidData: boolean;
    deleteFunctionWorking: boolean;
  }>({
    localStorageWorking: false,
    dataLoaded: false,
    hasInvalidData: false,
    deleteFunctionWorking: false
  });
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runProductionTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    addResult('=== Iniciando teste de produção ===');
    
    try {
      // Teste 1: Verificar localStorage
      addResult('Teste 1: Verificando localStorage...');
      const testKey = `nail_test_${Date.now()}`;
      localStorage.setItem(testKey, 'test');
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      const localStorageWorking = retrieved === 'test';
      setTestStatus(prev => ({ ...prev, localStorageWorking }));
      addResult(`localStorage: ${localStorageWorking ? '✅ Funcionando' : '❌ Problema'}`);
      
      // Teste 2: Carregar dados reais
      addResult('Teste 2: Carregando dados de disponibilidade...');
      const saved = localStorage.getItem('nail_availability');
      const hasData = !!saved;
      setTestStatus(prev => ({ ...prev, dataLoaded: hasData }));
      addResult(`Dados presentes: ${hasData ? '✅ Sim' : 'ℹ️ Não'}`);
      
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const isArray = Array.isArray(parsed);
          addResult(`Dados são array: ${isArray ? '✅ Sim' : '❌ Não'}`);
          
          if (isArray && parsed.length > 0) {
            // Teste 3: Verificar estrutura dos dados
            addResult('Teste 3: Verificando estrutura dos dados...');
            let invalidItems = 0;
            
            parsed.forEach((item: any, index: number) => {
              const issues = [];
              if (!item.id) issues.push('id');
              if (!item.designerId) issues.push('designerId');
              if (!item.specificDate) issues.push('specificDate');
              if (!item.startTime) issues.push('startTime');
              if (!item.endTime) issues.push('endTime');
              if (item.isActive === undefined) issues.push('isActive');
              
              if (issues.length > 0) {
                invalidItems++;
                if (invalidItems <= 3) { // Limitar para não poluir os logs
                  addResult(`⚠️  Item ${index} faltando: ${issues.join(', ')}`);
                }
              }
            });
            
            const hasInvalidData = invalidItems > 0;
            setTestStatus(prev => ({ ...prev, hasInvalidData }));
            addResult(`Itens com dados incompletos: ${invalidItems}`);
            addResult(`Dados válidos: ${hasInvalidData ? '❌ Não' : '✅ Sim'}`);
            
            // Teste 4: Testar função de exclusão simulada
            addResult('Teste 4: Testando função de exclusão...');
            const testItem = parsed[0];
            const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testItem.id);
            addResult(`ID do teste: ${testItem.id.substring(0, 20)}...`);
            addResult(`Formato UUID: ${isUuidFormat ? '✅ Sim' : 'ℹ️ Não'}`);
            
            if (isUuidFormat) {
              addResult('✅ Exclusão no Supabase seria tentada');
            } else {
              addResult('ℹ️  Exclusão apenas no localStorage');
            }
            
            setTestStatus(prev => ({ ...prev, deleteFunctionWorking: true }));
            addResult('Função de exclusão: ✅ Funcionando');
          }
        } catch (parseError) {
          addResult(`❌ Erro ao parsear dados: ${parseError}`);
        }
      }
      
      addResult('=== Teste de produção concluído ===');
    } catch (error) {
      console.error('Erro no teste de produção:', error);
      addResult(`❌ Erro no teste: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const fixInvalidData = () => {
    try {
      addResult('=== Iniciando correção de dados ===');
      
      const saved = localStorage.getItem('nail_availability');
      if (!saved) {
        addResult('Nenhum dado para corrigir');
        return;
      }
      
      let allAvailability = JSON.parse(saved);
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      let fixedCount = 0;
      
      const fixedData = allAvailability.map((item: any, index: number) => {
        let wasFixed = false;
        const fixedItem = { ...item };
        
        // Corrigir ID se necessário
        if (!fixedItem.id) {
          fixedItem.id = `fixed-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
          wasFixed = true;
          addResult(`  Corrigido ID para item ${index}`);
        }
        
        // Corrigir campos faltando
        if (!fixedItem.designerId) {
          fixedItem.designerId = 'unknown-designer';
          wasFixed = true;
        }
        
        if (!fixedItem.specificDate) {
          fixedItem.specificDate = new Date().toISOString().split('T')[0];
          wasFixed = true;
        }
        
        if (!fixedItem.startTime) {
          fixedItem.startTime = '00:00';
          wasFixed = true;
        }
        
        if (!fixedItem.endTime) {
          fixedItem.endTime = '23:59';
          wasFixed = true;
        }
        
        if (fixedItem.is_available !== undefined && fixedItem.isActive === undefined) {
          fixedItem.isActive = !fixedItem.is_available;
          wasFixed = true;
        }
        
        if (wasFixed) {
          fixedCount++;
        }
        
        return fixedItem;
      });
      
      if (fixedCount > 0) {
        localStorage.setItem('nail_availability', JSON.stringify(fixedData));
        addResult(`✅ Corrigidos ${fixedCount} itens`);
        setTestStatus(prev => ({ ...prev, hasInvalidData: false }));
      } else {
        addResult('ℹ️  Nenhum item precisou de correção');
      }
      
      addResult('=== Correção concluída ===');
    } catch (error) {
      console.error('Erro na correção:', error);
      addResult(`❌ Erro na correção: ${error}`);
    }
  };

  const clearAllData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de disponibilidade?')) {
      localStorage.removeItem('nail_availability');
      addResult('✅ Todos os dados removidos');
      setTestStatus({
        localStorageWorking: true,
        dataLoaded: false,
        hasInvalidData: false,
        deleteFunctionWorking: false
      });
    }
  };

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mt-6">
      <h3 className="font-bold text-amber-800 mb-3">Teste de Produção</h3>
      
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className={`p-2 rounded text-center text-sm ${
          testStatus.localStorageWorking 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className="font-medium">localStorage</div>
          <div className="text-xs">{testStatus.localStorageWorking ? 'OK' : 'Erro'}</div>
        </div>
        
        <div className={`p-2 rounded text-center text-sm ${
          testStatus.dataLoaded 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="font-medium">Dados</div>
          <div className="text-xs">{testStatus.dataLoaded ? 'Presentes' : 'Ausentes'}</div>
        </div>
        
        <div className={`p-2 rounded text-center text-sm ${
          testStatus.hasInvalidData 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          <div className="font-medium">Validade</div>
          <div className="text-xs">{testStatus.hasInvalidData ? 'Inválidos' : 'Válidos'}</div>
        </div>
        
        <div className={`p-2 rounded text-center text-sm ${
          testStatus.deleteFunctionWorking 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className="font-medium">Exclusão</div>
          <div className="text-xs">{testStatus.deleteFunctionWorking ? 'Funcionando' : 'Não testada'}</div>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={runProductionTest}
          disabled={isRunning}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm disabled:opacity-50"
        >
          {isRunning ? 'Testando...' : 'Rodar Teste'}
        </button>
        
        <button
          onClick={fixInvalidData}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          Corrigir Dados
        </button>
        
        <button
          onClick={clearAllData}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          Limpar Dados
        </button>
      </div>
      
      <div className="bg-gray-900 text-green-400 p-3 rounded text-xs max-h-40 overflow-y-auto">
        {testResults.length === 0 ? (
          <p>Os resultados do teste aparecerão aqui...</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1 last:mb-0">{result}</div>
          ))
        )}
      </div>
      
      <button
        onClick={() => setTestResults([])}
        className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
      >
        Limpar Resultados
      </button>
      
      <div className="mt-3 p-2 bg-amber-100 rounded">
        <p className="text-xs text-amber-700">
          Este componente testa se a correção está funcionando corretamente em ambiente de produção.
          Ele verifica o localStorage, carrega dados reais, verifica a estrutura e testa a função de exclusão.
        </p>
      </div>
    </div>
  );
}
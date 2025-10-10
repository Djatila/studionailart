// Componente para testar a funcionalidade de exclusão de forma isolada
import React, { useState, useEffect } from 'react';

interface TestAvailability {
  id: string;
  designerId: string;
  specificDate: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export default function DeleteTestComponent() {
  const [testData, setTestData] = useState<TestAvailability[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados de teste
  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      setTestData(allAvailability);
    } catch (error) {
      console.error('Erro ao carregar dados de teste:', error);
      setTestData([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestItem = async (id: string) => {
    console.log('=== Teste de exclusão ===');
    console.log('ID a ser excluído:', id);
    
    try {
      // Deletar do localStorage
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      console.log('Dados antes da exclusão:', allAvailability);
      
      // Filtrar para remover apenas o item específico
      const filtered = allAvailability.filter((avail: TestAvailability) => {
        if (!avail || !avail.id) return true;
        const shouldKeep = String(avail.id) !== String(id);
        console.log(`Comparando: ${avail.id} !== ${id} = ${shouldKeep}`);
        return shouldKeep;
      });
      
      console.log('Dados após filtragem:', filtered);
      
      localStorage.setItem('nail_availability', JSON.stringify(filtered));
      
      // Atualizar estado local
      setTestData(filtered);
      
      console.log('Item excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Carregando dados de teste...</div>;
  }

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h2 className="text-lg font-bold mb-4">Teste de Exclusão</h2>
      
      {testData.length === 0 ? (
        <p className="text-gray-500">Nenhum dado de teste encontrado.</p>
      ) : (
        <div className="space-y-3">
          {testData.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <div className="font-medium">{item.specificDate}</div>
                <div className="text-sm text-gray-600">{item.startTime} - {item.endTime}</div>
              </div>
              <button
                onClick={() => deleteTestItem(item.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={loadTestData}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Recarregar Dados
      </button>
    </div>
  );
}
// Componente isolado para testar a funcionalidade de exclusão
import React, { useState, useEffect } from 'react';

interface TestItem {
  id: string | number;
  name: string;
}

export default function IsolatedDeleteTest() {
  const [items, setItems] = useState<TestItem[]>([]);
  const [newItemName, setNewItemName] = useState('');

  // Inicializar com alguns itens de teste
  useEffect(() => {
    const initialItems: TestItem[] = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: 3, name: 'Item 3 (ID numérico)' },
      { id: 'abc-123', name: 'Item 4 (ID alfanumérico)' }
    ];
    setItems(initialItems);
  }, []);

  const handleDelete = (id: string | number) => {
    console.log('=== Teste de Exclusão Isolada ===');
    console.log('ID a ser excluído:', id, typeof id);
    
    // Testar diferentes abordagens de filtragem
    console.log('\nTestando filtragem com String():');
    const filtered1 = items.filter(item => {
      const keep = String(item.id) !== String(id);
      console.log(`String(${item.id}) !== String(${id}) = ${keep}`);
      return keep;
    });
    console.log('Resultado 1:', filtered1);
    
    console.log('\nTestando filtragem com === direto:');
    const filtered2 = items.filter(item => {
      const keep = item.id !== id;
      console.log(`${item.id} !== ${id} = ${keep}`);
      return keep;
    });
    console.log('Resultado 2:', filtered2);
    
    // Atualizar o estado
    setItems(filtered1);
    console.log('=== Fim do Teste de Exclusão ===');
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      const newItem: TestItem = {
        id: Date.now().toString(),
        name: newItemName
      };
      setItems([...items, newItem]);
      setNewItemName('');
    }
  };

  return (
    <div className="p-6 border border-gray-300 rounded-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Teste Isolado de Exclusão</h2>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Nome do novo item"
          className="flex-1 p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Adicionar
        </button>
      </div>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={String(item.id)} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">
                ID: {item.id} ({typeof item.id})
              </div>
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 rounded">
        <p className="text-sm text-yellow-700">
          Este componente isola a funcionalidade de exclusão para testar diferentes cenários.
          Verifique o console do navegador para ver os logs detalhados.
        </p>
      </div>
    </div>
  );
}
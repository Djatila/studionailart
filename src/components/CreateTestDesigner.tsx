import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const CreateTestDesigner: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createTestDesigner = async () => {
    setLoading(true);
    setResult('🔄 Criando designer de teste...');
    
    const testDesigner = {
      id: 'test-designer-' + Date.now(),
      name: 'Maria Silva (Teste)',
      phone: '11999999999',
      email: 'maria.teste@nail.com',
      password: '1234',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    try {
      console.log('🔄 Tentando criar designer:', testDesigner);
      
      const { data, error } = await supabase
        .from('nail_designers')
        .insert([testDesigner])
        .select();
      
      if (error) {
        console.error('❌ Erro ao criar designer:', error);
        setResult(`❌ Erro ao criar designer: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('✅ Designer criado com sucesso:', data);
        setResult(`✅ Designer criado com sucesso! ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      console.error('💥 Erro inesperado:', err);
      setResult(`💥 Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const listDesigners = async () => {
    setLoading(true);
    setResult('🔍 Listando designers...');
    
    try {
      console.log('🔍 Buscando designers no Supabase...');
      
      const { data, error } = await supabase
        .from('nail_designers')
        .select('*');
      
      if (error) {
        console.error('❌ Erro ao listar designers:', error);
        setResult(`❌ Erro ao listar designers: ${JSON.stringify(error, null, 2)}`);
      } else {
        console.log('✅ Designers encontrados:', data);
        const activeDesigners = data?.filter(d => d.isActive) || [];
        setResult(`📋 Designers no banco (${data?.length || 0} total, ${activeDesigners.length} ativos)\n\nTodos os designers:\n${JSON.stringify(data, null, 2)}\n\nDesigners ativos:\n${JSON.stringify(activeDesigners, null, 2)}`);
      }
    } catch (err: any) {
      console.error('💥 Erro inesperado:', err);
      setResult(`💥 Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '20px', 
      border: '2px solid #ccc', 
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 9999,
      maxWidth: '400px'
    }}>
      <h3>🧪 Teste de Designers</h3>
      
      <button 
        onClick={createTestDesigner}
        disabled={loading}
        style={{
          padding: '10px 15px',
          margin: '5px',
          background: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? '⏳' : '🔄'} Criar Designer Teste
      </button>
      
      <button 
        onClick={listDesigners}
        disabled={loading}
        style={{
          padding: '10px 15px',
          margin: '5px',
          background: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1
        }}
      >
        {loading ? '⏳' : '📋'} Listar Designers
      </button>
      
      {result && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          background: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '5px',
          fontSize: '12px',
          maxHeight: '200px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default CreateTestDesigner;
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const DebugSupabase: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const runDebugTest = async () => {
    setIsLoading(true);
    let info = '';
    
    try {
      // Verificar variáveis de ambiente
      info += '🔍 VARIÁVEIS DE AMBIENTE:\n';
      info += `VITE_SUPABASE_URL: ${import.meta.env.VITE_SUPABASE_URL ? '✅ Definida' : '❌ Não definida'}\n`;
      info += `VITE_SUPABASE_ANON_KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida'}\n\n`;
      
      if (import.meta.env.VITE_SUPABASE_URL) {
        info += `URL: ${import.meta.env.VITE_SUPABASE_URL}\n`;
      }
      if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
        info += `KEY: ${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 20)}...\n\n`;
      }
      
      // Testar conexão
      info += '🔗 TESTE DE CONEXÃO:\n';
      const { data, error } = await supabase
        .from('nail_designers')
        .select('count', { count: 'exact' });
      
      if (error) {
        info += `❌ Erro: ${error.message}\n`;
        info += `Código: ${error.code}\n`;
        info += `Detalhes: ${error.details}\n`;
      } else {
        info += '✅ Conexão bem-sucedida!\n';
        info += `Total de registros: ${data?.length || 0}\n`;
      }
      
      // Testar inserção simples
      info += '\n📝 TESTE DE INSERÇÃO:\n';
      const testData = {
        name: 'Teste Debug',
        email: `teste-${Date.now()}@debug.com`,
        password: '123456',
        phone: '11999999999'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('nail_designers')
        .insert([testData])
        .select();
      
      if (insertError) {
        info += `❌ Erro na inserção: ${insertError.message}\n`;
        info += `Código: ${insertError.code}\n`;
      } else {
        info += '✅ Inserção bem-sucedida!\n';
        info += `ID criado: ${insertData?.[0]?.id}\n`;
        
        // Limpar dados de teste
        if (insertData?.[0]?.id) {
          await supabase
            .from('nail_designers')
            .delete()
            .eq('id', insertData[0].id);
          info += '🧹 Dados de teste removidos\n';
        }
      }
      
    } catch (err) {
      info += `💥 Erro inesperado: ${err}\n`;
    }
    
    setDebugInfo(info);
    setIsLoading(false);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      zIndex: 9999,
      backgroundColor: 'white',
      border: '2px solid #ccc',
      borderRadius: '8px',
      padding: '10px',
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <button 
        onClick={runDebugTest}
        disabled={isLoading}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {isLoading ? '🔄 Testando...' : '🔍 Debug Supabase'}
      </button>
      
      {debugInfo && (
        <pre style={{ 
          whiteSpace: 'pre-wrap', 
          margin: 0,
          backgroundColor: '#f8f9fa',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          {debugInfo}
        </pre>
      )}
    </div>
  );
};

export default DebugSupabase;
// Script para corrigir políticas RLS da tabela availability
const { createClient } = require('@supabase/supabase-js');

// Substitua pelas suas credenciais do Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'sua_url_do_supabase_aqui';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sua_chave_anonima_do_supabase_aqui';

if (SUPABASE_URL === 'sua_url_do_supabase_aqui' || SUPABASE_ANON_KEY === 'sua_chave_anonima_do_supabase_aqui') {
  console.error('Por favor, configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixAvailabilityRLS() {
  try {
    console.log('Iniciando correção das políticas RLS para a tabela availability...');
    
    // Remover políticas existentes
    console.log('Removendo políticas existentes...');
    await supabase.rpc('drop_policy', {
      table_name: 'availability',
      policy_name: 'Designers can manage own availability'
    }).catch(() => {}); // Ignorar erros se a política não existir
    
    await supabase.rpc('drop_policy', {
      table_name: 'availability',
      policy_name: 'Anyone can view availability'
    }).catch(() => {});
    
    // Criar novas políticas
    console.log('Criando novas políticas...');
    
    // Política para INSERT
    const { error: insertError } = await supabase.rpc('create_policy', {
      table_name: 'availability',
      policy_name: 'Anyone can create availability',
      operation: 'INSERT',
      definition: 'true',
      check_definition: 'true'
    });
    
    if (insertError) {
      console.error('Erro ao criar política de INSERT:', insertError);
    } else {
      console.log('Política de INSERT criada com sucesso');
    }
    
    // Política para SELECT
    const { error: selectError } = await supabase.rpc('create_policy', {
      table_name: 'availability',
      policy_name: 'Anyone can view availability',
      operation: 'SELECT',
      definition: 'true',
      check_definition: 'true'
    });
    
    if (selectError) {
      console.error('Erro ao criar política de SELECT:', selectError);
    } else {
      console.log('Política de SELECT criada com sucesso');
    }
    
    // Política para UPDATE
    const { error: updateError } = await supabase.rpc('create_policy', {
      table_name: 'availability',
      policy_name: 'Anyone can update availability',
      operation: 'UPDATE',
      definition: 'true',
      check_definition: 'true'
    });
    
    if (updateError) {
      console.error('Erro ao criar política de UPDATE:', updateError);
    } else {
      console.log('Política de UPDATE criada com sucesso');
    }
    
    // Política para DELETE
    const { error: deleteError } = await supabase.rpc('create_policy', {
      table_name: 'availability',
      policy_name: 'Anyone can delete availability',
      operation: 'DELETE',
      definition: 'true',
      check_definition: 'true'
    });
    
    if (deleteError) {
      console.error('Erro ao criar política de DELETE:', deleteError);
    } else {
      console.log('Política de DELETE criada com sucesso');
    }
    
    // Verificar políticas criadas
    console.log('Verificando políticas criadas...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'availability');
    
    if (policiesError) {
      console.error('Erro ao verificar políticas:', policiesError);
    } else {
      console.log('Políticas atuais na tabela availability:');
      policies.forEach(policy => {
        console.log(`- ${policy.policyname} (${policy.cmd})`);
      });
    }
    
    console.log('Correção das políticas RLS concluída!');
  } catch (error) {
    console.error('Erro ao corrigir políticas RLS:', error);
  }
}

fixAvailabilityRLS();
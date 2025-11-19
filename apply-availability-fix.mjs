// Script para corrigir políticas RLS da tabela availability
import { createClient } from '@supabase/supabase-js';

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
    const policiesToRemove = [
      'Designers can manage own availability',
      'Anyone can view availability',
      'Anyone can create availability',
      'Anyone can update availability',
      'Anyone can delete availability'
    ];
    
    for (const policyName of policiesToRemove) {
      const { error } = await supabase.rpc('drop_policy', {
        table_name: 'availability',
        policy_name: policyName
      });
      
      if (error) {
        console.log(`Aviso: Erro ao remover política "${policyName}" (pode não existir):`, error.message);
      } else {
        console.log(`Política "${policyName}" removida com sucesso`);
      }
    }
    
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
      definition: 'true'
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
      definition: 'true'
    });
    
    if (deleteError) {
      console.error('Erro ao criar política de DELETE:', deleteError);
    } else {
      console.log('Política de DELETE criada com sucesso');
    }
    
    // Garantir permissões para todos os usuários
    console.log('Garantindo permissões para todos os usuários...');
    // Note: As permissões de tabela precisam ser configuradas no painel do Supabase
    
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
    console.log('ATENÇÃO: Você ainda precisa garantir permissões de tabela no painel do Supabase:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para Table Editor > availability');
    console.log('3. Clique em "Enable Realtime" e "Enable Full Replication"');
    console.log('4. Nas configurações de permissões, garanta que "anon" e "authenticated" tenham acesso completo');
  } catch (error) {
    console.error('Erro ao corrigir políticas RLS:', error);
  }
}

fixAvailabilityRLS();
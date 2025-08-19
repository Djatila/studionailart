import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Need service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables.');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  console.log('🔧 Applying RLS policies to Supabase...');
  
  try {
    // Drop existing policies first (if they exist)
    console.log('📝 Dropping existing policies...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Designers can view own profile" ON public.nail_designers;',
      'DROP POLICY IF EXISTS "Anyone can create designer account" ON public.nail_designers;',
      'DROP POLICY IF EXISTS "Anyone can view designer profiles" ON public.nail_designers;',
      'DROP POLICY IF EXISTS "Designers can update own profile" ON public.nail_designers;'
    ];
    
    for (const sql of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error && !error.message.includes('policy') && !error.message.includes('does not exist')) {
        console.warn('Warning dropping policy:', error.message);
      }
    }
    
    // Create new policies
    console.log('✨ Creating new RLS policies...');
    
    const createPolicies = [
      'CREATE POLICY "Anyone can create designer account" ON public.nail_designers FOR INSERT WITH CHECK (true);',
      'CREATE POLICY "Anyone can view designer profiles" ON public.nail_designers FOR SELECT USING (true);',
      'CREATE POLICY "Designers can update own profile" ON public.nail_designers FOR UPDATE USING (auth.uid()::text = id::text);',
      'CREATE POLICY "Allow delete designer accounts" ON public.nail_designers FOR DELETE USING (true);'
    ];
    
    for (const sql of createPolicies) {
      console.log('Executing:', sql);
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error('Error creating policy:', error.message);
      } else {
        console.log('✅ Policy created successfully');
      }
    }
    
    console.log('🎉 RLS policies applied successfully!');
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error.message);
  }
}

// Alternative method using direct SQL execution
async function applyRLSPoliciesDirectSQL() {
  console.log('🔧 Applying RLS policies using direct SQL...');
  
  const policies = `
    -- Drop existing policies
    DROP POLICY IF EXISTS "Designers can view own profile" ON public.nail_designers;
    DROP POLICY IF EXISTS "Anyone can create designer account" ON public.nail_designers;
    DROP POLICY IF EXISTS "Anyone can view designer profiles" ON public.nail_designers;
    DROP POLICY IF EXISTS "Designers can update own profile" ON public.nail_designers;
    
    -- Create new policies
    CREATE POLICY "Anyone can create designer account" ON public.nail_designers FOR INSERT WITH CHECK (true);
    CREATE POLICY "Anyone can view designer profiles" ON public.nail_designers FOR SELECT USING (true);
    CREATE POLICY "Designers can update own profile" ON public.nail_designers FOR UPDATE USING (auth.uid()::text = id::text);
    CREATE POLICY "Allow delete designer accounts" ON public.nail_designers FOR DELETE USING (true);
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: policies });
    
    if (error) {
      console.error('❌ Error applying policies:', error.message);
      return false;
    }
    
    console.log('✅ RLS policies applied successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test the connection and apply policies
async function main() {
  console.log('🚀 Starting RLS policy application...');
  
  // Test connection
  const { data, error } = await supabase.from('nail_designers').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ Connection test failed:', error.message);
    console.log('\n📋 Manual steps required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Execute the following SQL:');
    console.log(`
-- Drop existing policies
DROP POLICY IF EXISTS "Designers can view own profile" ON public.nail_designers;
DROP POLICY IF EXISTS "Anyone can create designer account" ON public.nail_designers;
DROP POLICY IF EXISTS "Anyone can view designer profiles" ON public.nail_designers;
DROP POLICY IF EXISTS "Designers can update own profile" ON public.nail_designers;

-- Create new policies
CREATE POLICY "Anyone can create designer account" ON public.nail_designers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view designer profiles" ON public.nail_designers FOR SELECT USING (true);
CREATE POLICY "Designers can update own profile" ON public.nail_designers FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Allow delete designer accounts" ON public.nail_designers FOR DELETE USING (true);
`);
    return;
  }
  
  console.log('✅ Connection successful!');
  
  // Try to apply policies
  await applyRLSPoliciesDirectSQL();
}

main().catch(console.error);
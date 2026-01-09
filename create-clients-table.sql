-- Criar tabela específica para clientes
-- Execute este script no SQL Editor do Supabase

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_clients_phone ON public.clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);

-- Create trigger for updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON public.clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
-- Allow anyone to create client accounts (registration)
CREATE POLICY "Anyone can create client account" 
    ON public.clients 
    FOR INSERT 
    WITH CHECK (true);

-- Allow anyone to view client profiles (for login and admin purposes)
CREATE POLICY "Anyone can view client profiles" 
    ON public.clients 
    FOR SELECT 
    USING (true);

-- Allow clients to update their own profile
CREATE POLICY "Clients can update own profile" 
    ON public.clients 
    FOR UPDATE 
    USING (auth.uid()::text = id::text OR true); -- Permitir admin também

-- Allow deletion (for admin purposes)
CREATE POLICY "Allow delete client accounts" 
    ON public.clients 
    FOR DELETE 
    USING (true);

-- Update appointments table to reference clients table (optional)
-- Uncomment if you want to create a foreign key relationship
-- ALTER TABLE public.appointments ADD COLUMN client_id UUID REFERENCES public.clients(id);

-- Migrate existing client data from nail_designers to clients table
-- This will move any records that have 'client-' prefix in id or email
INSERT INTO public.clients (id, name, email, password, phone, is_active, created_at)
SELECT 
    id,
    name,
    email,
    password,
    phone,
    is_active,
    created_at
FROM public.nail_designers 
WHERE 
    id::text LIKE 'client-%' 
    OR email LIKE 'client-%'
ON CONFLICT (id) DO NOTHING;

-- Clean up client records from nail_designers table
-- Uncomment after confirming migration worked
-- DELETE FROM public.nail_designers WHERE id::text LIKE 'client-%' OR email LIKE 'client-%';

COMMIT;
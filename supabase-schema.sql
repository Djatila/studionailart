-- Supabase Schema for Nail Designer Project
-- Execute these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create nail_designers table
CREATE TABLE IF NOT EXISTS public.nail_designers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    pix_key VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    designer_id UUID REFERENCES public.nail_designers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL, -- duration in minutes
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) DEFAULT 'services' CHECK (category IN ('services', 'extras')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    designer_id UUID REFERENCES public.nail_designers(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(20) NOT NULL,
    client_email VARCHAR(255),
    service VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability table
CREATE TABLE IF NOT EXISTS public.availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    designer_id UUID REFERENCES public.nail_designers(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    specific_date DATE, -- For specific date availability
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_designer_id ON public.appointments(designer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_services_designer_id ON public.services(designer_id);
CREATE INDEX IF NOT EXISTS idx_availability_designer_id ON public.availability(designer_id);
CREATE INDEX IF NOT EXISTS idx_availability_day_of_week ON public.availability(day_of_week);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_nail_designers_updated_at BEFORE UPDATE ON public.nail_designers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON public.availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.nail_designers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Create policies (basic policies - you may want to customize these)
-- Allow designers to read/write their own data
CREATE POLICY "Anyone can create designer account" ON public.nail_designers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view designer profiles" ON public.nail_designers FOR SELECT USING (true);
CREATE POLICY "Designers can update own profile" ON public.nail_designers FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Allow delete designer accounts" ON public.nail_designers FOR DELETE USING (true);

CREATE POLICY "Designers can manage own services" ON public.services FOR ALL USING (auth.uid()::text = designer_id::text);
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);

CREATE POLICY "Designers can manage own appointments" ON public.appointments FOR ALL USING (auth.uid()::text = designer_id::text);
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view appointments" ON public.appointments FOR SELECT USING (true);

CREATE POLICY "Designers can manage own availability" ON public.availability FOR ALL USING (auth.uid()::text = designer_id::text);
CREATE POLICY "Anyone can view availability" ON public.availability FOR SELECT USING (true);

-- Insert sample data (optional)
-- You can uncomment and modify these to add sample data
/*
INSERT INTO public.nail_designers (name, email, password, phone, pix_key) VALUES
('Maria Silva', 'maria@example.com', 'hashed_password_here', '(11) 99999-9999', 'maria@pix.com'),
('Ana Costa', 'ana@example.com', 'hashed_password_here', '(11) 88888-8888', '11999998888');
*/

-- Instructions:
-- 1. Copy and paste this entire SQL script into your Supabase SQL Editor
-- 2. Execute it to create all tables and relationships
-- 3. Update your .env file with your Supabase URL and anon key
-- 4. The tables will be ready for your application to use
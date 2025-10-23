import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      nail_designers: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          phone: string
          pix_key: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          slug: string | null
          bio: string | null
          photo_url: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          phone: string
          pix_key?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          slug?: string | null
          bio?: string | null
          photo_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          phone?: string
          pix_key?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          slug?: string | null
          bio?: string | null
          photo_url?: string | null
        }
      }
      services: {
        Row: {
          id: string
          designer_id: string
          name: string
          duration: number
          price: number
          category: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          designer_id: string
          name: string
          duration: number
          price: number
          category?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          designer_id?: string
          name?: string
          duration?: number
          price?: number
          category?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          designer_id: string
          client_name: string
          client_phone: string
          client_email: string | null
          service: string
          date: string
          time: string
          price: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          designer_id: string
          client_name: string
          client_phone: string
          client_email?: string | null
          service: string
          date: string
          time: string
          price: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          designer_id?: string
          client_name?: string
          client_phone?: string
          client_email?: string | null
          service?: string
          date?: string
          time?: string
          price?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      availability: {
        Row: {
          id: string
          designer_id: string
          day_of_week: number | null
          start_time: string
          end_time: string
          specific_date: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          designer_id: string
          day_of_week?: number | null
          start_time: string
          end_time: string
          specific_date?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          designer_id?: string
          day_of_week?: number | null
          start_time?: string
          end_time?: string
          specific_date?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      // Adicionando a definição da tabela clients
      clients: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          phone: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          phone: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          phone?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
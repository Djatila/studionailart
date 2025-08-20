import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

// Types
type NailDesigner = Database['public']['Tables']['nail_designers']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Availability = Database['public']['Tables']['availability']['Row']
type Client = {
  id: string
  name: string
  email: string
  password: string
  phone: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Nail Designers CRUD Operations
export const designerService = {
  // Get all designers
  async getAll(): Promise<NailDesigner[]> {
    const { data, error } = await supabase
      .from('nail_designers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching designers:', error)
      return []
    }
    
    return data || []
  },

  // Get designer by ID
  async getById(id: string): Promise<NailDesigner | null> {
    const { data, error } = await supabase
      .from('nail_designers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching designer:', error)
      return null
    }
    
    return data
  },

  // Get designer by email (for login)
  async getByEmail(email: string): Promise<NailDesigner | null> {
    const { data, error } = await supabase
      .from('nail_designers')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      console.error('Error fetching designer by email:', error)
      return null
    }
    
    return data
  },

  // Create new designer
  async create(designer: Database['public']['Tables']['nail_designers']['Insert']): Promise<NailDesigner | null> {
    const { data, error } = await supabase
      .from('nail_designers')
      .insert(designer)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating designer:', error)
      return null
    }
    
    return data
  },

  // Update designer
  async update(id: string, updates: Database['public']['Tables']['nail_designers']['Update']): Promise<NailDesigner | null> {
    const { data, error } = await supabase
      .from('nail_designers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating designer:', error)
      return null
    }
    
    return data
  },

  // Delete designer
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('nail_designers')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting designer:', error)
      return false
    }
    
    return true
  }
}

// Services CRUD Operations
export const serviceService = {
  // Get all services
  async getAll(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching all services:', error)
      return []
    }
    
    return data || []
  },

  // Get services by designer ID
  async getByDesignerId(designerId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('designer_id', designerId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching services:', error)
      return []
    }
    
    return data || []
  },

  // Create new service
  async create(service: Database['public']['Tables']['services']['Insert']): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating service:', error)
      return null
    }
    
    return data
  },

  // Update service
  async update(id: string, updates: Database['public']['Tables']['services']['Update']): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating service:', error)
      return null
    }
    
    return data
  },

  // Delete service
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting service:', error)
      return false
    }
    
    return true
  }
}

// Appointments CRUD Operations
export const appointmentService = {
  // Get all appointments
  async getAll(): Promise<Appointment[]> {
    console.log('🔍 supabaseUtils: appointmentService.getAll() chamada');
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    
    if (error) {
      console.error('❌ supabaseUtils: Error fetching all appointments:', error)
      return []
    }
    
    console.log('📊 supabaseUtils: appointmentService.getAll() retornou:', data?.length || 0, 'agendamentos');
    console.log('📋 supabaseUtils: Dados:', data);
    return data || []
  },

  // Get appointments by designer ID
  async getByDesignerId(designerId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('designer_id', designerId)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    
    if (error) {
      console.error('Error fetching appointments:', error)
      return []
    }
    
    return data || []
  },

  // Get appointments by status
  async getByStatus(designerId: string, status: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('designer_id', designerId)
      .eq('status', status)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    
    if (error) {
      console.error('Error fetching appointments by status:', error)
      return []
    }
    
    return data || []
  },

  // Create new appointment
  async create(appointment: Database['public']['Tables']['appointments']['Insert']): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating appointment:', error)
      return null
    }
    
    return data
  },

  // Update appointment
  async update(id: string, updates: Database['public']['Tables']['appointments']['Update']): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating appointment:', error)
      return null
    }
    
    return data
  },

  // Delete appointment
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting appointment:', error)
      return false
    }
    
    return true
  }
}

// Clients CRUD Operations
export const clientService = {
  // Get all clients
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }
    
    return data || []
  },

  // Get client by ID
  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching client:', error)
      return null
    }
    
    return data
  },

  // Get client by phone
  async getByPhone(phone: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (error) {
      console.error('Error fetching client by phone:', error)
      return null
    }
    
    return data
  },

  // Get client by email
  async getByEmail(email: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error) {
      console.error('Error fetching client by email:', error)
      return null
    }
    
    return data
  },

  // Create new client
  async create(client: Omit<Client, 'created_at' | 'updated_at'>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating client:', error)
      return null
    }
    
    return data
  },

  // Update client
  async update(id: string, updates: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating client:', error)
      return null
    }
    
    return data
  },

  // Delete client
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting client:', error)
      return false
    }
    
    return true
  }
}

// Availability CRUD Operations
export const availabilityService = {
  // Get availability by designer ID
  async getByDesignerId(designerId: string): Promise<Availability[]> {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('designer_id', designerId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })
    
    if (error) {
      console.error('Error fetching availability:', error)
      return []
    }
    
    return data || []
  },

  // Create new availability
  async create(availability: Database['public']['Tables']['availability']['Insert']): Promise<Availability | null> {
    const { data, error } = await supabase
      .from('availability')
      .insert(availability)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating availability:', error)
      return null
    }
    
    return data
  },

  // Update availability
  async update(id: string, updates: Database['public']['Tables']['availability']['Update']): Promise<Availability | null> {
    const { data, error } = await supabase
      .from('availability')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating availability:', error)
      return null
    }
    
    return data
  },

  // Delete availability
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('availability')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting availability:', error)
      return false
    }
    
    return true
  },

  // Bulk update availability for a designer
  async bulkUpdate(designerId: string, availabilities: Database['public']['Tables']['availability']['Insert'][]): Promise<boolean> {
    // First, delete existing availability for this designer
    const { error: deleteError } = await supabase
      .from('availability')
      .delete()
      .eq('designer_id', designerId)
    
    if (deleteError) {
      console.error('Error deleting existing availability:', deleteError)
      return false
    }
    
    // Then, insert new availability records
    const { error: insertError } = await supabase
      .from('availability')
      .insert(availabilities)
    
    if (insertError) {
      console.error('Error inserting new availability:', insertError)
      return false
    }
    
    return true
  }
}

// Legacy function exports for backward compatibility
export const getNailDesigners = async () => {
  const designers = await designerService.getAll();
  // Converter de snake_case (Supabase) para camelCase (App)
  return designers.map(designer => ({
    id: designer.id,
    name: designer.name,
    email: designer.email,
    password: designer.password,
    phone: designer.phone,
    pixKey: designer.pix_key,
    isActive: designer.is_active,
    createdAt: designer.created_at
  }));
};
export const createNailDesigner = async (designer: any) => {
  // Converter de camelCase (App) para snake_case (Supabase)
  const supabaseDesigner: Database['public']['Tables']['nail_designers']['Insert'] = {
    id: designer.id,
    name: designer.name,
    email: designer.email,
    password: designer.password,
    phone: designer.phone,
    pix_key: designer.pixKey || null,
    is_active: designer.isActive ?? true
  };
  
  return designerService.create(supabaseDesigner);
};
export const updateNailDesigner = async (id: string, updates: any) => {
  // Converter de camelCase (App) para snake_case (Supabase)
  const supabaseUpdates: Database['public']['Tables']['nail_designers']['Update'] = {};
  
  if (updates.name !== undefined) supabaseUpdates.name = updates.name;
  if (updates.email !== undefined) supabaseUpdates.email = updates.email;
  if (updates.password !== undefined) supabaseUpdates.password = updates.password;
  if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
  if (updates.pixKey !== undefined) supabaseUpdates.pix_key = updates.pixKey;
  if (updates.isActive !== undefined) supabaseUpdates.is_active = updates.isActive;
  
  return designerService.update(id, supabaseUpdates);
};
export const deleteNailDesigner = (id: string) => designerService.delete(id);
export const getNailDesignerByPhone = async (phone: string) => {
  const { data, error } = await supabase
    .from('nail_designers')
    .select('*')
    .eq('phone', phone)
    .single();

  if (error) {
    console.error('Error fetching designer by phone:', error);
    return null;
  }

  // Converter de snake_case (Supabase) para camelCase (App)
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    pixKey: data.pix_key,
    isActive: data.is_active,
    createdAt: data.created_at
  };
};

export const getNailDesignerById = async (id: string) => {
  const designer = await designerService.getById(id);
  if (!designer) return null;
  
  // Converter de snake_case (Supabase) para camelCase (App)
  return {
    id: designer.id,
    name: designer.name,
    email: designer.email,
    password: designer.password,
    phone: designer.phone,
    pixKey: designer.pix_key,
    isActive: designer.is_active,
    createdAt: designer.created_at
  };
};

export const getAppointments = () => appointmentService.getAll();
export const createAppointment = (appointment: Database['public']['Tables']['appointments']['Insert']) => appointmentService.create(appointment);
export const updateAppointment = (id: string, updates: Database['public']['Tables']['appointments']['Update']) => appointmentService.update(id, updates);
export const deleteAppointment = (id: string) => appointmentService.delete(id);

export const getServices = () => serviceService.getAll();
export const deleteService = (id: string) => serviceService.delete(id);

export const getClients = async () => {
  try {
    // Get clients from the new clients table
    const supabaseClients = await clientService.getAll()
    
    // Also get clients from localStorage for backward compatibility
    const localClients = JSON.parse(localStorage.getItem('registered_clients') || '[]')
    
    // Combine and remove duplicates, prioritizing Supabase
    const allClients = [...supabaseClients]
    
    localClients.forEach((localClient: any) => {
      const existsInSupabase = supabaseClients.some(sc => sc.phone === localClient.phone)
      if (!existsInSupabase) {
        // Convert localStorage format to match Supabase format
        allClients.push({
          id: localClient.id,
          name: localClient.name,
          phone: localClient.phone,
          email: localClient.email,
          password: localClient.password,
          is_active: localClient.isActive ?? true,
          created_at: localClient.createdAt || new Date().toISOString(),
          updated_at: localClient.createdAt || new Date().toISOString()
        })
      }
    })
    
    return allClients
  } catch (error) {
    console.error('Error fetching clients:', error)
    // Fallback to localStorage only
    return JSON.parse(localStorage.getItem('registered_clients') || '[]')
  }
};

export const updateClient = async (id: string, updates: any) => {
  return clientService.update(id, updates)
};

// New client management functions
export const createClientRecord = async (client: any) => {
  const clientData = {
    name: client.name,
    email: client.email,
    password: client.password,
    phone: client.phone,
    is_active: client.isActive ?? true
  }
  
  return clientService.create(clientData)
};

export const getClientByPhone = async (phone: string) => {
  return clientService.getByPhone(phone)
};

export const getClientByEmail = async (email: string) => {
  return clientService.getByEmail(email)
};

export const getClientById = async (id: string) => {
  return clientService.getById(id)
};

export const deleteClient = (id: string) => clientService.delete(id);

// Migration helper functions
export const migrationService = {
  // Migrate designers from localStorage to Supabase
  async migrateDesigners(): Promise<void> {
    const localDesigners = JSON.parse(localStorage.getItem('nailDesigners') || '[]')
    
    for (const designer of localDesigners) {
      const supabaseDesigner = {
        id: designer.id,
        name: designer.name,
        email: designer.email,
        password: designer.password,
        phone: designer.phone,
        pix_key: designer.pixKey || null,
        is_active: designer.isActive ?? true
      }
      
      await designerService.create(supabaseDesigner)
    }
    
    console.log('Designers migrated successfully')
  },

  // Migrate appointments from localStorage to Supabase
  async migrateAppointments(): Promise<void> {
    const localAppointments = JSON.parse(localStorage.getItem('appointments') || '[]')
    
    for (const appointment of localAppointments) {
      const supabaseAppointment = {
        id: appointment.id,
        designer_id: appointment.designerId,
        client_name: appointment.clientName,
        client_phone: appointment.clientPhone,
        client_email: appointment.clientEmail || null,
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        price: appointment.price,
        status: appointment.status || 'pending'
      }
      
      await appointmentService.create(supabaseAppointment)
    }
    
    console.log('Appointments migrated successfully')
  },

  // Migrate services from localStorage to Supabase
  async migrateServices(): Promise<void> {
    const localServices = JSON.parse(localStorage.getItem('services') || '[]')
    
    for (const service of localServices) {
      const supabaseService = {
        id: service.id,
        designer_id: service.designerId,
        name: service.name,
        duration: service.duration,
        price: service.price
      }
      
      await serviceService.create(supabaseService)
    }
    
    console.log('Services migrated successfully')
  },

  // Run complete migration
  async runCompleteMigration(): Promise<void> {
    console.log('Starting migration from localStorage to Supabase...')
    
    try {
      await this.migrateDesigners()
      await this.migrateServices()
      await this.migrateAppointments()
      
      console.log('Migration completed successfully!')
      console.log('You can now remove localStorage data if everything works correctly.')
    } catch (error) {
      console.error('Migration failed:', error)
    }
  }
}
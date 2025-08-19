import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

// Types
type NailDesigner = Database['public']['Tables']['nail_designers']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Appointment = Database['public']['Tables']['appointments']['Row']
type Availability = Database['public']['Tables']['availability']['Row']

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
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true })
    
    if (error) {
      console.error('Error fetching all appointments:', error)
      return []
    }
    
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
export const getNailDesigners = () => designerService.getAll();
export const createNailDesigner = (designer: Database['public']['Tables']['nail_designers']['Insert']) => designerService.create(designer);
export const updateNailDesigner = (id: string, updates: Database['public']['Tables']['nail_designers']['Update']) => designerService.update(id, updates);
export const deleteNailDesigner = (id: string) => designerService.delete(id);
export const getNailDesignerByPhone = async (phone: string) => {
  const { data, error } = await supabase
    .from('nail_designers')
    .select('*')
    .eq('phone', phone)
    .single()
  
  if (error) {
    console.error('Error fetching designer by phone:', error)
    return null
  }
  
  return data
};
export const getNailDesignerById = (id: string) => designerService.getById(id);

export const getAppointments = () => appointmentService.getAll();
export const createAppointment = (appointment: Database['public']['Tables']['appointments']['Insert']) => appointmentService.create(appointment);
export const updateAppointment = (id: string, updates: Database['public']['Tables']['appointments']['Update']) => appointmentService.update(id, updates);
export const deleteAppointment = (id: string) => appointmentService.delete(id);

export const getServices = () => serviceService.getAll();
export const deleteService = (id: string) => serviceService.delete(id);

export const getClients = async () => {
  // Get unique clients from appointments
  const { data, error } = await supabase
    .from('appointments')
    .select('client_name, client_phone, client_email')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }
  
  // Remove duplicates based on phone number
  const uniqueClients = data?.reduce((acc: any[], current) => {
    const existingClient = acc.find(client => client.client_phone === current.client_phone)
    if (!existingClient) {
      acc.push({
        id: current.client_phone, // Use phone as ID
        name: current.client_name,
        phone: current.client_phone,
        email: current.client_email
      })
    }
    return acc
  }, []) || []
  
  return uniqueClients
};

export const updateClient = async (id: string, updates: any) => {
  // Update all appointments with this client phone
  const { error } = await supabase
    .from('appointments')
    .update({
      client_name: updates.name,
      client_email: updates.email
    })
    .eq('client_phone', id)
  
  if (error) {
    console.error('Error updating client:', error)
    return false
  }
  
  return true
};

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
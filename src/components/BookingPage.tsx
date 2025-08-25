import React, { useState, useEffect, useCallback, useReducer } from 'react';
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, MessageCircle, CheckCircle, AlertTriangle, Copy, CreditCard } from 'lucide-react';
import { NailDesigner } from '../App';
import { supabase } from '../lib/supabase';

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  designerId: string;
}

interface Appointment {
  id: string;
  designerId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

interface BookingPageProps {
  designer?: NailDesigner;
  onBack: () => void;
  loggedClient?: NailDesigner; // Cliente logada no sistema
  onNavigateToClientDashboard?: () => void; // Função para navegar ao dashboard da cliente
}

const loadingReducer = (state: boolean, action: { type: 'START' | 'FINISH' }) => {
  switch (action.type) {
    case 'START':
      return true;
    case 'FINISH':
      return false;
    default:
      return state;
  }
};

const BookingPage: React.FC<BookingPageProps> = ({ designer: initialDesigner, onBack, loggedClient, onNavigateToClientDashboard }) => {
  const [step, setStep] = useState(1);
  const [selectedDesigner, setSelectedDesigner] = useState<NailDesigner | null>(initialDesigner || null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showPixCopied, setShowPixCopied] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [designers, setDesigners] = useState<NailDesigner[]>([]);
  const [designersLoaded, setDesignersLoaded] = useState(false); // Novo estado mais simples
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [forceReload, setForceReload] = useState(0);

  useEffect(() => {
    // Listener para cancelamentos de agendamentos
    const handleAppointmentCancelled = (event: CustomEvent) => {
      console.log('🔄 BookingPage: Recebido evento de cancelamento:', event.detail);
      
      // 🆕 NOVO: Aguardar um pouco para garantir que o Supabase foi atualizado
      setTimeout(() => {
        // Forçar atualização dos horários disponíveis
        setForceReload(prev => {
          const newValue = prev + 1;
          console.log('📊 Forçando reload devido a cancelamento:', newValue);
          return newValue;
        });
        
        // 🆕 NOVO: Forçar recarregamento dos horários se estivermos no passo 4
        if (step === 4 && selectedDate) {
          console.log('🔄 Recarregando horários imediatamente após cancelamento');
          // Trigger do useEffect que carrega os horários
          setStep(4); // Força re-render
        }
      }, 1000); // Aguardar 1 segundo para sincronização
    };
    
    // Adicionar listener
    window.addEventListener('appointmentCancelled', handleAppointmentCancelled as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('appointmentCancelled', handleAppointmentCancelled as EventListener);
    };
  }, [step, selectedDate]); // 🆕 Adicionar dependências

  // Listener para sincronização em tempo real
  useEffect(() => {
    const handleAppointmentCreated = () => {
      // Forçar atualização dos horários disponíveis
      setForceReload(prev => prev + 1);
    };

    window.addEventListener('appointmentCreated', handleAppointmentCreated);
    
    return () => {
      window.removeEventListener('appointmentCreated', handleAppointmentCreated);
    };
  }, []);

  const forceRefreshTimeSlots = useCallback(() => {
    console.log('🔄 Forçando atualização manual dos horários...');
    console.log('📅 Data selecionada:', selectedDate);
    console.log('👩‍💼 Designer selecionada:', selectedDesigner?.name);
    setForceReload(prev => {
      const newValue = prev + 1;
      console.log('🔢 ForceReload incrementado para:', newValue);
      return newValue;
    });
  }, [selectedDate, selectedDesigner]);

  useEffect(() => {
    // Preenche dados do cliente se estiver logado
    if (loggedClient) {
      setClientName(loggedClient.name);
      setClientPhone(loggedClient.phone);
      setClientEmail(loggedClient.email || '');
    }
  }, [loggedClient]);

  // Define o designer inicial se fornecido (mas não durante reset)
  useEffect(() => {
    if (initialDesigner && !isResetting) {
      setSelectedDesigner(initialDesigner);
      setStep(2); // Pula para a seleção de serviços
    }
  }, [initialDesigner, isResetting]);

  useEffect(() => {
  // Carregar designers quando o componente for montado
  const loadDesigners = async () => {
    console.log('🚀 Iniciando carregamento de designers no useEffect...');
    if (!designersLoaded) {
      setDesignersLoaded(false);
      
      try {
        const designersList = await getDesigners();
        console.log('📋 Designers carregados:', designersList?.length || 0);
        console.log('👥 Lista de designers:', designersList);
        setDesigners(designersList || []);
        setIsInitialized(true);
        setDesignersLoaded(true);
      } catch (error) {
        console.error('❌ Erro no useEffect ao carregar designers:', error);
        setDesigners([]);
        setIsInitialized(true);
        setDesignersLoaded(true);
      }
    }
  };
  
  loadDesigners();
}, [designersLoaded]); // Adicionar designersLoaded como dependência

  // Carregar serviços e disponibilidade quando designer for selecionado
  useEffect(() => {
    if (selectedDesigner) {
      const loadDesignerData = async () => {
        // Carregar serviços
        setLoadingServices(true);
        try {
          const designerServices = await getServices();
          setServices(designerServices);
        } catch (error) {
          console.error('Erro ao carregar serviços:', error);
          setServices([]);
        } finally {
          setLoadingServices(false);
        }

        // Carregar disponibilidade
        setLoadingAvailability(true);
        try {
          const designerAvailability = await getDesignerAvailability();
          setAvailability(designerAvailability);
        } catch (error) {
          console.error('Erro ao carregar disponibilidade:', error);
          setAvailability([]);
        } finally {
          setLoadingAvailability(false);
        }
      };

      loadDesignerData();
    } else {
      setServices([]);
      setAvailability([]);
    }
  }, [selectedDesigner]);

  const getDesigners = async (): Promise<NailDesigner[]> => {
    console.log('🔍 Iniciando carregamento de designers...');
    
    try {
      console.log('📡 Tentando buscar designers do Supabase...');
      // Buscar do Supabase
      const { getNailDesigners } = await import('../utils/supabaseUtils');
      const supabaseDesigners = await getNailDesigners();
      console.log('✅ Designers do Supabase:', supabaseDesigners?.length || 0);
      
      // Buscar do localStorage
      console.log('💾 Buscando designers do localStorage...');
      const saved = localStorage.getItem('nail_designers');
      const localDesigners = saved ? JSON.parse(saved) : [];
      console.log('📱 Designers do localStorage:', localDesigners?.length || 0);
      
      // Combinar e remover duplicatas, priorizando Supabase
      const allDesigners = [...(supabaseDesigners || [])];
      
      localDesigners.forEach((localDesigner: NailDesigner) => {
        if (!allDesigners.find(d => d.id === localDesigner.id)) {
          allDesigners.push(localDesigner);
        }
      });
      
      console.log('🔄 Total de designers combinados:', allDesigners?.length || 0);
      
      // Filtrar apenas designers ativos (verificar ambos os formatos de campo)
      const activeDesigners = allDesigners.filter(d => {
        const isActive = d.isActive || d.is_active;
        console.log(`👤 Designer ${d.name}: ativo = ${isActive}`);
        return isActive;
      });
      
      console.log('✅ Designers ativos encontrados:', activeDesigners?.length || 0);
      return activeDesigners;
      
    } catch (error) {
      console.error('❌ Erro detalhado ao buscar designers:', error);
      console.error('📊 Stack trace:', error.stack);
      
      // Fallback para localStorage
      console.log('🔄 Usando fallback para localStorage...');
      try {
        const saved = localStorage.getItem('nail_designers');
        const localDesigners = saved ? JSON.parse(saved) : [];
        const activeLocalDesigners = localDesigners.filter((d: NailDesigner) => d.isActive || d.is_active);
        console.log('📱 Fallback: designers ativos do localStorage:', activeLocalDesigners?.length || 0);
        return activeLocalDesigners;
      } catch (fallbackError) {
        console.error('❌ Erro no fallback:', fallbackError);
        return [];
      }
    }
  };

  const getServices = async (): Promise<Service[]> => {
    if (!selectedDesigner) return [];
    try {
      // Buscar do Supabase
      const { serviceService } = await import('../utils/supabaseUtils');
      const supabaseServices = await serviceService.getByDesignerId(selectedDesigner.id);
      
      // Mapear campos do Supabase para o formato esperado
      const mappedServices = supabaseServices.map(service => ({
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
        designerId: service.designer_id
      }));
      
      if (mappedServices.length > 0) {
        return mappedServices;
      }
      
      // Fallback para localStorage se não houver dados no Supabase
      const saved = localStorage.getItem('nail_services');
      const allServices = saved ? JSON.parse(saved) : [];
      return allServices.filter((service: Service) => service.designerId === selectedDesigner.id);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      // Fallback para localStorage em caso de erro
      const saved = localStorage.getItem('nail_services');
      const allServices = saved ? JSON.parse(saved) : [];
      return allServices.filter((service: Service) => service.designerId === selectedDesigner.id);
    }
  };

  const getAppointments = useCallback(async (): Promise<Appointment[]> => {
    if (!selectedDesigner) return [];
    
    try {
      // Buscar do Supabase primeiro
      const { getSupabaseAppointments } = await import('../utils/supabaseUtils');
      const supabaseAppointments = await getSupabaseAppointments();
      
      // Garantir que supabaseAppointments é um array válido
      if (!Array.isArray(supabaseAppointments)) {
        console.warn('⚠️ getAppointments: supabaseAppointments is not an array:', supabaseAppointments);
        throw new Error('Invalid appointments data from Supabase');
      }
      
      if (supabaseAppointments.length > 0) {
        // Filtrar agendamentos do designer e mapear campos
        const designerAppointments = supabaseAppointments
          .filter((apt: any) => {
            if (!apt) return false;
            const designerId = apt.designer_id || apt.designerId;
            return designerId === selectedDesigner.id;
          })
          .map((apt: any) => ({
              id: apt.id || crypto.randomUUID(),
              designerId: apt.designer_id || apt.designerId,
              clientName: apt.client_name || apt.clientName || '',
              clientPhone: apt.client_phone || apt.clientPhone || '',
              clientEmail: apt.client_email || apt.clientEmail || '',
              service: apt.service || '',
              date: apt.date || '',
              time: apt.time || '',
              status: apt.status || 'pending',
              price: apt.price || 0
          }));
        
        if (designerAppointments.length > 0) {
          return designerAppointments;
        }
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos do Supabase:', error);
    }
    
    // Fallback para localStorage se Supabase falhar ou não tiver dados
    try {
      const saved = localStorage.getItem('nail_appointments');
      const allAppointments = saved ? JSON.parse(saved) : [];
      
      // Garantir que allAppointments é um array válido
      if (!Array.isArray(allAppointments)) {
        console.warn('localStorage appointments is not an array');
        return [];
      }
      
      return allAppointments.filter((apt: Appointment) => 
        apt && apt.designerId === selectedDesigner.id
      );
    } catch (error) {
      console.error('Erro ao buscar agendamentos do localStorage:', error);
      return [];
    }
  }, [selectedDesigner]);

  // Get designer's availability settings
  const getDesignerAvailability = async () => {
    if (!selectedDesigner) return [];
    try {
      // Buscar do Supabase
      const { availabilityService } = await import('../utils/supabaseUtils');
      const supabaseAvailability = await availabilityService.getByDesignerId(selectedDesigner.id);
      
      // Garantir que supabaseAvailability é um array válido
      if (!Array.isArray(supabaseAvailability)) {
        console.warn('⚠️ getDesignerAvailability: supabaseAvailability is not an array:', supabaseAvailability);
        throw new Error('Invalid availability data from Supabase');
      }
      
      // Mapear campos do Supabase para o formato esperado
      const mappedAvailability = supabaseAvailability
        .filter(avail => avail && avail.is_available)
        .map(avail => ({
          id: avail.id,
          designerId: avail.designer_id,
          dayOfWeek: avail.day_of_week,
          startTime: avail.start_time,
          endTime: avail.end_time,
          isActive: avail.is_available,
          specificDate: avail.specific_date
        }));
      
      if (mappedAvailability.length > 0) {
        return mappedAvailability;
      }
      
      // Fallback para localStorage se não houver dados no Supabase
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      
      // Garantir que allAvailability é um array válido
      if (!Array.isArray(allAvailability)) {
        console.warn('⚠️ getDesignerAvailability: localStorage availability is not an array');
        return [];
      }
      
      return allAvailability.filter((avail: any) => 
        avail && avail.designerId === selectedDesigner.id && avail.isActive
      );
    } catch (error) {
      console.error('❌ Erro ao buscar disponibilidade:', error);
      // Fallback para localStorage em caso de erro
      try {
        const saved = localStorage.getItem('nail_availability');
        const allAvailability = saved ? JSON.parse(saved) : [];
        
        // Garantir que allAvailability é um array válido
        if (!Array.isArray(allAvailability)) {
          console.warn('⚠️ getDesignerAvailability fallback: localStorage availability is not an array');
          return [];
        }
        
        return allAvailability.filter((avail: any) => 
          avail && avail.designerId === selectedDesigner.id && avail.isActive
        );
      } catch (fallbackError) {
        console.error('❌ Erro no fallback de disponibilidade:', fallbackError);
        return [];
      }
    }
  };

  // Check if a specific date is available
  const isDateAvailable = async (date: string) => {
    const availability = await getDesignerAvailability();
    if (availability.length === 0) return false; // No availability configured
    
    // Normalizar datas para comparação (remover problemas de timezone)
    const normalizedDate = date.split('T')[0]; // Remove timezone se existir
    return availability.some((avail: any) => {
      if (!avail || !avail.specificDate) return false;
      const normalizedAvailDate = avail.specificDate.split('T')[0]; // Remove timezone se existir
      return normalizedAvailDate === normalizedDate;
    });
  };

  const saveAppointment = async (appointment: Appointment) => {
    try {
      // Salvar no Supabase
      const { createAppointment } = await import('../utils/supabaseUtils');
      
      // Mapear para o formato do Supabase
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
      };
      
      const savedAppointment = await createAppointment(supabaseAppointment);
      
      if (savedAppointment) {
        // Sucesso no Supabase - também salvar no localStorage para cache
        const saved = localStorage.getItem('nail_appointments');
        const allAppointments = saved ? JSON.parse(saved) : [];
        allAppointments.push(appointment);
        localStorage.setItem('nail_appointments', JSON.stringify(allAppointments));
        
        // Disparar evento para sincronizar outros componentes
        window.dispatchEvent(new CustomEvent('appointmentCreated', {
          detail: { appointment: savedAppointment }
        }));
        
        console.log('✅ Agendamento salvo no Supabase e sincronizado');
        return savedAppointment;
      } else {
        // Horário já ocupado - retornar null silenciosamente (sem aviso de conflito)
        console.log('ℹ️ Horário não disponível - agendamento não foi salvo');
        return null;
      }
    } catch (error) {
      // Erro de conexão - usar localStorage apenas como fallback temporário
      console.log('⚠️ Erro de conexão - usando localStorage como fallback temporário');
      const saved = localStorage.getItem('nail_appointments');
      const allAppointments = saved ? JSON.parse(saved) : [];
      allAppointments.push(appointment);
      localStorage.setItem('nail_appointments', JSON.stringify(allAppointments));
      return appointment;
    }
  };

 // Generate time slots
const defaultTimeSlots = [
  '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'
];

const getAvailableTimeSlots = useCallback(async (): Promise<string[]> => {
  if (!selectedDate || !selectedDesigner) {
    return defaultTimeSlots;
  }

  try {
    // Cache breaker para forçar nova busca
    const cacheBreaker = Date.now() + Math.random();
    console.log(`🔄 [${cacheBreaker}] Buscando horários disponíveis para ${selectedDate} - Designer: ${selectedDesigner.name}`);

    let appointments: any[] = [];
    let retryCount = 0;
    const maxRetries = 5; // Aumentado de 3 para 5

    // Buscar agendamentos do Supabase com retry
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('date', selectedDate)
          .eq('designer_id', selectedDesigner.id);

        if (error) throw error;
        appointments = data || [];
        console.log(`✅ [${cacheBreaker}] Agendamentos do Supabase (tentativa ${retryCount + 1}):`, appointments.length);
        break;
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ [${cacheBreaker}] Erro na tentativa ${retryCount}:`, error);
        if (retryCount >= maxRetries) {
          console.error(`❌ [${cacheBreaker}] Falha após ${maxRetries} tentativas`);
          appointments = [];
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }

    // Filtrar apenas agendamentos ativos (não cancelados)
    const activeAppointments = appointments.filter(apt => 
      apt.status !== 'cancelled' && apt.status !== 'canceled'
    );
    
    console.log(`📊 [${cacheBreaker}] Agendamentos ativos (não cancelados):`, activeAppointments.length);
    console.log(`🚫 [${cacheBreaker}] Agendamentos cancelados:`, appointments.length - activeAppointments.length);
    
    // Log detalhado dos agendamentos
    activeAppointments.forEach(apt => {
      console.log(`   ✓ Ativo: ${apt.time} - Status: ${apt.status}`);
    });
    
    const cancelledAppointments = appointments.filter(apt => 
      apt.status === 'cancelled' || apt.status === 'canceled'
    );
    cancelledAppointments.forEach(apt => {
      console.log(`   ❌ Cancelado: ${apt.time} - Status: ${apt.status}`);
    });

    // Verificar localStorage para agendamentos locais
    const localAppointments = JSON.parse(localStorage.getItem('nail_appointments') || '[]');
    const localActiveAppointments = localAppointments.filter((apt: any) => 
      apt.date === selectedDate && 
      apt.designerId === selectedDesigner.id &&
      apt.status !== 'cancelled' && 
      apt.status !== 'canceled'
    );

console.log(`💾 [${cacheBreaker}] Agendamentos locais ativos:`, localActiveAppointments.length);

    // Combinar agendamentos sem duplicatas
    const allAppointments = [...activeAppointments];
    localActiveAppointments.forEach((localApt: any) => {
      const exists = allAppointments.some(apt => 
        apt.time === localApt.time && apt.date === localApt.date
      );
      if (!exists) {
        allAppointments.push(localApt);
      }
    });

    // Log dos agendamentos cancelados
    cancelledAppointments.forEach(apt => {
      console.log(`   ❌ Cancelado: ${apt.time} - Status: ${apt.status}`);
    });

    // Extrair e normalizar horários ocupados (remover segundos se existirem)
    const bookedTimes = activeAppointments.map(apt => {
      // Normalizar formato: se tem segundos, remover (08:00:00 -> 08:00)
      return apt.time.length > 5 ? apt.time.substring(0, 5) : apt.time;
    });
    console.log(`⏰ [${cacheBreaker}] Horários ocupados (normalizados):`, bookedTimes);

    // Filtrar horários disponíveis
    const availableSlots = defaultTimeSlots.filter(time => !bookedTimes.includes(time));
    console.log(`✨ [${cacheBreaker}] Horários disponíveis:`, availableSlots);
    
    // Log dos horários liberados (cancelados)
    const freedTimes = defaultTimeSlots.filter(time => {
      const wasCancelled = cancelledAppointments.some(apt => apt.time === time);
      const isNotBooked = !bookedTimes.includes(time);
      return wasCancelled && isNotBooked;
    });
    if (freedTimes.length > 0) {
      console.log(`🔓 [${cacheBreaker}] Horários liberados por cancelamento:`, freedTimes);
    }
    
    return availableSlots;
  } catch (error) {
    console.error('❌ Erro ao buscar horários disponíveis:', error);
    return defaultTimeSlots;
  }
}, [selectedDate, selectedDesigner, forceReload]); // Adicionado forceReload como dependência

  // Load available time slots when date is selected
  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    
    if (selectedDate && step === 4) {
      const loadTimeSlots = async () => {
        setLoadingTimeSlots(true);
        
        try {
          // Forçar nova consulta sem cache
          const slots = await getAvailableTimeSlots();
          
          const defaultTimeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
          
          // Garantir que sempre temos um array válido
          const finalSlots = Array.isArray(slots) && slots.length >= 0 ? slots : defaultTimeSlots;
          
          console.log('🎯 Horários carregados no useEffect:', finalSlots);
          setAvailableTimeSlots(finalSlots);
        } catch (error) {
          console.error('Erro ao carregar horários:', error);
          const defaultTimeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
          setAvailableTimeSlots(defaultTimeSlots);
        } finally {
          setLoadingTimeSlots(false);
        }
      };
      
      loadTimeSlots();
    } else {
      // Reset time slots when not on step 4 or no date selected
      setAvailableTimeSlots([]);
      setLoadingTimeSlots(false);
    }
  }, [isInitialized, selectedDate, step, forceReload]);

  // Get unique client names from appointments for suggestions
  const getClientSuggestions = async (input: string) => {
    if (input.length < 2) return [];
    
    try {
      const appointments = await getAppointments();
      
      // Garantir que appointments é um array válido
      if (!Array.isArray(appointments)) {
        return [];
      }
      
      const validAppointments = appointments.filter(apt => apt && apt.clientName);
      const uniqueNames = [...new Set(validAppointments.map(apt => apt.clientName))];
      
      return uniqueNames.filter(name => 
        name && name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5);
    } catch (error) {
      console.error('Error in getClientSuggestions:', error);
      return [];
    }
  };

  const handleNameChange = async (value: string) => {
    setClientName(value);
    const suggestions = await getClientSuggestions(value);
    setNameSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && value.length >= 2);
  };

  const selectNameSuggestion = async (name: string) => {
    setClientName(name);
    setShowSuggestions(false);
    
    try {
      // Auto-fill phone and email if available
      const appointments = await getAppointments();
      
      // Garantir que appointments é um array válido
      if (!Array.isArray(appointments)) {
        return;
      }
      
      const existingClient = appointments.find(apt => apt && apt.clientName === name);
      if (existingClient) {
        setClientPhone(existingClient.clientPhone || '');
        setClientEmail(existingClient.clientEmail || '');
      }
    } catch (error) {
      // Silently handle error
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDesigner || !selectedService || !selectedDate || !selectedTime) return;
    
    // Remover verificação de conflito - horários ocupados devem ser filtrados no passo 4
    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      designerId: selectedDesigner.id,
      clientName,
      clientPhone,
      clientEmail,
      service: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      price: selectedService.price,
      status: 'pending'
    };
    
    try {
      await saveAppointment(newAppointment);
      
      // Forçar atualização dos horários disponíveis
      setForceReload(prev => prev + 1);
      
      setShowConfirmation(true);
    } catch (error) {
      // Apenas tratar erros de conexão/sistema, não conflitos de horário
      console.error('Erro ao salvar agendamento:', error);
      alert('❌ Erro ao salvar agendamento. Tente novamente.');
    }
  };

  const resetForm = () => {
    setIsResetting(true); // Marca que estamos resetando
    setShowConfirmation(false);
    
    // Força o reset completo
    setTimeout(() => {
      setStep(1); // Sempre volta para o step 1 (seleção de designer)
      setSelectedDesigner(null); // Sempre reseta a designer selecionada
      setSelectedService(null);
      setSelectedDate('');
      setSelectedTime('');
      
      // Se há uma cliente logada, preencher automaticamente os campos
      if (loggedClient) {
        setClientName(loggedClient.name);
        setClientPhone(loggedClient.phone);
        setClientEmail(loggedClient.email || '');
      } else {
        setClientName('');
        setClientPhone('');
        setClientEmail('');
      }
      
      setShowSuggestions(false);
      
      // Remove a flag de reset
      setIsResetting(false);
    }, 50);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const copyPixKey = () => {
    if (selectedDesigner?.pixKey) {
      navigator.clipboard.writeText(selectedDesigner.pixKey);
      setShowPixCopied(true);
      setTimeout(() => setShowPixCopied(false), 2000);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!selectedDesigner || !selectedService || !selectedDate || !selectedTime || !clientName) return '';
    
    const message = `Olá! Gostaria de confirmar meu agendamento:
    
👤 Cliente: ${clientName}
💅 Profissional: ${selectedDesigner.name}
✨ Serviço: ${selectedService.name}
📅 Data: ${formatDate(selectedDate)}
⏰ Horário: ${selectedTime}
💰 Valor: R$ ${selectedService.price.toFixed(2)}

Aguardo confirmação!`;
    
    return encodeURIComponent(message);
  };



  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <div>
                <div className="font-medium">{clientName}</div>
                <div className="text-sm text-white/60">Confirmação de Agendamento</div>
              </div>
            </button>
          </div>

          {/* Success Banner */}
          <div className="bg-gradient-to-r from-pink-500 to-yellow-500 rounded-2xl p-6 mb-6 backdrop-blur-sm border border-white/20">
            <div className="flex items-center">
              <div className="bg-white/20 rounded-full p-2 mr-3">
                <CheckCircle className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Agendamento Realizado!</h2>
                <p className="text-white/90 text-sm">Seu horário foi reservado com sucesso</p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Detalhes do Agendamento
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center text-white/80">
                  <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                  Profissional:
                </div>
                <span className="text-white font-medium">{selectedDesigner?.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-white/80">
                  <div className="w-3 h-3 bg-pink-400 rounded-full mr-3"></div>
                  Cliente:
                </div>
                <span className="text-white font-medium">{clientName}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-white/80">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                  Serviços:
                </div>
                <span className="text-white font-medium">{selectedService?.name}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-white/80">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  Data:
                </div>
                <span className="text-white font-medium">{formatDate(selectedDate)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-white/80">
                  <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                  Horário:
                </div>
                <span className="text-white font-medium">{selectedTime}</span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-white/20">
                <div className="flex items-center text-white/80">
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-yellow-400 rounded-full mr-3"></div>
                  Valor Total:
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
                  R$ {selectedService?.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>



          {/* PIX Payment Section */}
          {selectedDesigner?.pixKey && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                Pagamento PIX
              </h3>
              
              <p className="text-purple-100 text-sm mb-3">
                Copie a chave PIX abaixo para pagamento:
              </p>
              
              <p className="text-purple-100 text-sm mb-4">
                Copie e pague com o PIX abaixo:
              </p>
              
              <div className="bg-white/10 rounded-lg p-3 mb-3 border border-white/20">
                <p className="text-white font-mono text-sm break-all">
                  {selectedDesigner.pixKey}
                </p>
              </div>
              
              <button
                onClick={copyPixKey}
                className="w-full flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all"
              >
                <Copy className="w-4 h-4" />
                {showPixCopied ? 'Chave PIX Copiada!' : 'Copiar Chave PIX'}
              </button>
            </div>
          )}

          {/* PIX Payment Section */}
          <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <CreditCard className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-purple-100 font-semibold text-lg mb-2">Pagamento via PIX</h3>
              <p className="text-purple-200 text-sm mb-4">Copie a chave PIX para pagamento</p>
              
              <div className="bg-purple-900/30 rounded-lg p-4 mb-4">
                <p className="text-purple-100 font-mono text-sm break-all">
                  {selectedDesigner?.pixKey || 'chavepix@exemplo.com'}
                </p>
              </div>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedDesigner?.pixKey || 'chavepix@exemplo.com');
                  setShowPixCopied(true);
                  setTimeout(() => setShowPixCopied(false), 3000);
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-105 mb-4"
              >
                <Copy className="w-4 h-4 mr-2" />
                {showPixCopied ? 'Chave PIX Copiada!' : 'Copiar Chave PIX'}
              </button>
            </div>
            
            {/* Aviso de Comprovante */}
            <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-400/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-400/20 rounded-full p-2 flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-orange-200 text-sm">
                    ⚠️ Favor enviar comprovante de pagamento para a sua Nail
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Dashboard Button - Only show if client is logged in */}
          {loggedClient && onNavigateToClientDashboard && (
            <button
              onClick={onNavigateToClientDashboard}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 mb-4 flex items-center justify-center gap-2"
            >
              <User className="w-5 h-5" />
              Voltar ao Meu Dashboard
            </button>
          )}

          {/* New Appointment Button */}
          <button
            onClick={resetForm}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105 mb-4"
          >
            Agendar Novo Serviço
          </button>
          
          {/* Back to Home Button */}
          <button
            onClick={onBack}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105"
          >
            Voltar à Página Inicial
          </button>
        </div>
      </div>
    );
  }

  // Show loading spinner during initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/70 mx-auto mb-4"></div>
          <p className="text-white/70">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="bg-pink-500 rounded-full p-3 mr-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {selectedDesigner ? `Agendamento com ${selectedDesigner.name}` : 'Fazer Agendamento'}
              </h1>
              <p className="text-white/70">
                {selectedDesigner ? 'Complete seu agendamento' : 'Escolha sua nail designer preferida'}
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-2 rounded-xl font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-8">
                {step === 1 ? 'Escolha sua Nail Designer' : 'Agendar um Horário'}
              </h2>

              {/* Step 1: Designer Selection */}
              {step === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">1. Escolha sua Nail Designer</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
        console.log('🎨 Renderizando step 1 - designersLoaded:', designersLoaded, 'designers.length:', designers.length);
        return null;
      })()}
      {!designersLoaded ? (
        <div className="col-span-full text-center text-white py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          Carregando designers...
          <p className="text-xs text-white/50 mt-2">Debug: designersLoaded = {String(designersLoaded)}</p>
          <p className="text-xs text-white/50">Designers: {designers.length}</p>
        </div>
      ) : designers.length === 0 ? (
                      <div className="col-span-full text-center text-white py-8">
                        <p>Nenhuma nail designer encontrada.</p>
                        <p className="text-sm text-white/70 mt-2">Verifique se há designers cadastradas no sistema.</p>
                      </div>
                    ) : (
                      designers.map((designer) => (
                      <button
                        key={designer.id}
                        onClick={() => {
                          setSelectedDesigner(designer);
                          setStep(2);
                        }}
                        className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-left hover:bg-white/20 transition-all duration-300 hover:scale-105 ${
                          selectedDesigner?.id === designer.id ? 'ring-2 ring-pink-400 bg-pink-500/20' : ''
                        }`}
                      >
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-1">{designer.name}</h4>
                            <p className="text-white/70 text-sm">{designer.specialty}</p>
                          </div>
                        </div>
                        <p className="text-pink-400 font-medium text-sm">
                          Clique para ver os serviços disponíveis
                        </p>
                      </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Service Selection */}
              {step === 2 && selectedDesigner && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      2. Escolha um Serviço
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setStep(1)}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        ← Voltar
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loadingServices ? (
                      <div className="col-span-full flex items-center justify-center py-8">
                        <div className="text-white/70 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70 mx-auto mb-2"></div>
                          <p>Carregando serviços...</p>
                        </div>
                      </div>
                    ) : services.length === 0 ? (
                      <div className="col-span-full text-center py-8">
                        <p className="text-white/70">Nenhum serviço disponível para esta designer.</p>
                      </div>
                    ) : (
                      services.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            setSelectedService(service);
                            setStep(3);
                          }}
                          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-left hover:bg-white/20 transition-all duration-300 hover:scale-105"
                        >
                          <h4 className="font-semibold text-white mb-2">{service.name}</h4>
                          <p className="text-white/70 text-sm mb-3">{service.duration} minutos</p>
                          <p className="text-pink-400 font-bold text-lg">R$ {service.price.toFixed(2)}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}



              {/* Step 3: Date Selection */}
              {step === 3 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      3. Selecione a Data
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setStep(2)}
                        className="text-white/70 hover:text-white transition-colors"
                      >
                        ← Voltar
                      </button>
                    </div>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        const selectedDateValue = e.target.value;
                        // Garantir que availability é um array válido antes de usar .some()
                        if (selectedDateValue && Array.isArray(availability) && availability.length > 0) {
                          // Normalizar datas para comparação (remover problemas de timezone)
                          const normalizedSelectedDate = selectedDateValue;
                          const hasAvailableDate = availability.some((avail: any) => {
                            if (!avail || !avail.specificDate) return false;
                            // Normalizar a data de disponibilidade
                            const normalizedAvailDate = avail.specificDate.split('T')[0]; // Remove timezone se existir
                            return normalizedAvailDate === normalizedSelectedDate;
                          });
                          
                          if (!hasAvailableDate) {
                            alert('Esta data não está disponível. A designer só liberou datas específicas para agendamento.');
                            return;
                          }
                        }
                        setSelectedDate(selectedDateValue);
                        if (selectedDateValue) setStep(4);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {loadingAvailability ? (
                      <div className="mt-3 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl">
                        <div className="flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/70 mr-2"></div>
                          <p className="text-white/70 text-sm">Carregando disponibilidade...</p>
                        </div>
                      </div>
                    ) : Array.isArray(availability) && availability.length > 0 ? (
                      <div className="mt-3 p-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl">
                        <p className="text-blue-100 text-sm font-medium mb-2">📅 Datas Disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {availability.filter(avail => avail && avail.specificDate).map((avail: any) => (
                            <span key={avail.id} className="bg-blue-400/30 text-blue-100 px-2 py-1 rounded-lg text-xs">
                              {new Date(avail.specificDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl">
                        <p className="text-yellow-100 text-sm">⚠️ Esta designer ainda não configurou datas disponíveis para agendamento.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Time Selection */}
              {step === 4 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      4. Escolha o Horário
                    </h3>
                    <button
                      onClick={() => setStep(3)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      ← Voltar
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <button
                      onClick={forceRefreshTimeSlots}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      🔄 Atualizar horários disponíveis
                    </button>
                  </div>

                  {loadingTimeSlots ? (
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center">
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white/70 mr-3"></div>
                        <p className="text-white/70">Carregando horários disponíveis...</p>
                      </div>
                    </div>
                  ) : availableTimeSlots.length === 0 ? (
                    <div className="bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 text-center">
                      <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                      <p className="text-yellow-100 text-lg font-medium mb-2">
                        Todos os horários estão ocupados
                      </p>
                      <p className="text-yellow-200/80 text-sm">
                        Escolha outra data para ver os horários disponíveis
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {Array.isArray(availableTimeSlots) && availableTimeSlots.length > 0 ? (
                        availableTimeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => {
                              setSelectedTime(time);
                              setStep(5);
                            }}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl py-3 px-4 text-white font-medium hover:bg-pink-500 hover:border-pink-400 transition-all duration-300"
                          >
                            {time}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-white/70 py-4">
                          Carregando horários disponíveis...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Client Information */}
              {step === 5 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                      5. Suas Informações
                    </h3>
                    <button
                      onClick={() => setStep(4)}
                      className="text-white/70 hover:text-white transition-colors"
                    >
                      ← Voltar
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Nome *
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onFocus={() => setShowSuggestions(nameSuggestions.length > 0)}
                        placeholder="Seu nome completo"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                      
                      {/* Name Suggestions */}
                      {showSuggestions && nameSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                          {nameSuggestions.map((name, index) => (
                            <button
                              key={index}
                              onClick={() => selectNameSuggestion(name)}
                              className="w-full px-4 py-3 text-left text-white hover:bg-white/20 transition-colors"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mt-6">
                      <h4 className="text-white font-medium mb-3">Resumo do Agendamento</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-white/80">
                          <span>Data:</span>
                          <span>{formatDate(selectedDate)}</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>Horário:</span>
                          <span>{selectedTime}</span>
                        </div>
                        <div className="flex justify-between text-white/80">
                          <span>Serviços:</span>
                          <span>{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between text-white font-medium pt-2 border-t border-white/20">
                          <span>Total:</span>
                          <span>R$ {selectedService?.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleConfirmBooking}
                      disabled={!clientName || !clientPhone}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      Confirmar Agendamento
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Seu Agendamento</h3>
              <p className="text-white/70 text-sm">
                Preencha os detalhes para ver o resumo.
              </p>
              
              {selectedService && (
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-white/80">
                    <span>Serviço:</span>
                    <span className="text-white">{selectedService.name}</span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between text-white/80">
                      <span>Data:</span>
                      <span className="text-white">{new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between text-white/80">
                      <span>Horário:</span>
                      <span className="text-white">{selectedTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-medium pt-3 border-t border-white/20">
                    <span>Total:</span>
                    <span>R$ {selectedService.price.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Users, TrendingUp, Clock, Phone, MessageCircle, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight, CreditCard, Edit3 } from 'lucide-react';
import { NailDesigner, Appointment, Client, Service } from '../App';
import {
  getAppointments as getSupabaseAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getNailDesigners,
  updateNailDesigner,
  getNailDesignerById,
  getClients as getSupabaseClients
} from '../utils/supabaseUtils';
import { serviceService } from '../utils/supabaseUtils';
import { supabase } from '../lib/supabase';
import { getAvailableTimeSlots as getTimeSlotsConfig } from '../utils/timeSlots';

interface AdminDashboardProps {
  designer: NailDesigner;
  onViewChange: (view: 'admin' | 'services' | 'stats' | 'availability' | 'settings') => void;
}

export default function AdminDashboard({ designer, onViewChange }: AdminDashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showLinkCopied, setShowLinkCopied] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [existingClient, setExistingClient] = useState<Client | null>(null);
  const [showClientSuggestion, setShowClientSuggestion] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixKey, setPixKey] = useState(designer.pixKey || '');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', appointmentId: string, appointment: Appointment | null }>({ type: 'approve', appointmentId: '', appointment: null });
  const [nameSuggestions, setNameSuggestions] = useState<Client[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  // Adicionando estados para serviços e tipo de cliente
  const [services, setServices] = useState<Service[]>([]);
  const [regularServices, setRegularServices] = useState<Service[]>([]); // NOVO: Estado para serviços regulares
  const [extraServices, setExtraServices] = useState<Service[]>([]);     // NOVO: Estado para serviços extras
  const [selectedExtraServices, setSelectedExtraServices] = useState<Service[]>([]); // NOVO: Estado para serviços extras selecionados
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');
  const [newClientData, setNewClientData] = useState({
    name: '', phone: '', email: '', service: '', date: '', time: '', price: ''
  });

  // NOVO: useEffect para recalcular o preço total
  useEffect(() => {
    const mainService = regularServices.find(s => s.name === newClientData.service);
    let totalPrice = mainService ? mainService.price : 0;

    selectedExtraServices.forEach(extra => {
      totalPrice += extra.price;
    });

    setNewClientData(prev => ({
      ...prev,
      price: totalPrice.toFixed(2) // Formata para 2 casas decimais
    }));
  }, [newClientData.service, selectedExtraServices, regularServices]); // Dependências para recalcular quando mudarem

  // Estados para horários disponíveis
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [forceReload, setForceReload] = useState(0);
  // Novo estado para disponibilidade da designer
  const [designerAvailability, setDesignerAvailability] = useState<any[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  console.log('🔍 [DEBUG] Estado inicial do componente AdminDashboard:', {
    // Removido designerId pois não existe na interface Client
    // designerId: designer.id,
    clientType,
    clientsCount: clients.length,
    servicesCount: services.length,
    showClientModal
  });

  // Carregar dados iniciais
  useEffect(() => {
    console.log('🔍 [DEBUG] useEffect executado - carregando dados iniciais');
    loadAppointments();
    loadClients();
    loadServices(); // Adicionando carregamento de serviços
    loadDesignerAvailability(); // Carregar disponibilidade da designer
  }, [designer.id]);

  // Monitorar mudanças de estado para debug
  useEffect(() => {
    console.log('🔍 [DEBUG] Estado atualizado:', {
      clientType,
      showNameSuggestions,
      nameSuggestionsLength: nameSuggestions.length,
      newClientDataName: newClientData.name
    });
  }, [clientType, showNameSuggestions, nameSuggestions, newClientData.name]);

  // Adicionando função para carregar serviços
  const loadServices = async () => {
    try {
      console.log('🔍 Carregando serviços para o designer:', designer.id);
      const designerServices = await serviceService.getByDesignerId(designer.id);
      console.log('🔍 Serviços recebidos:', designerServices);

      // Converter os serviços do formato do Supabase para o formato local
      const convertedServices = designerServices.map(service => ({
        id: service.id,
        designerId: service.designer_id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description || '',
        category: (service.category as 'services' | 'extras') || 'services'
      }));

      console.log('📊 Serviços convertidos:', convertedServices);
      setServices(convertedServices);
      // NOVO: Separar serviços por categoria
      setRegularServices(convertedServices.filter(s => s.category === 'services' || !s.category));
      setExtraServices(convertedServices.filter(s => s.category === 'extras'));
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
      setError('Erro ao carregar serviços');
    }
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(event.target as Node)
      ) {
        setShowNameSuggestions(false);
      }
    };

    if (showNameSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNameSuggestions]);

  const loadAppointments = async () => {
    try {
      console.log('🔍 AdminDashboard: Carregando agendamentos para designer:', designer.id, designer.name);
      const data = await getSupabaseAppointments();
      console.log('📊 AdminDashboard: Total de agendamentos do Supabase:', data.length);
      console.log('📋 AdminDashboard: Dados brutos:', data);

      // Filter by designer_id (Supabase field) or designerId (localStorage field)
      const designerAppointments = data.filter((apt: any) => {
        const matches = apt.designer_id === designer.id || apt.designerId === designer.id;
        if (matches) {
          console.log('✅ AdminDashboard: Agendamento encontrado para designer:', apt);
        }
        return matches;
      });

      console.log('🎯 AdminDashboard: Agendamentos filtrados para designer:', designerAppointments.length);
      setAppointments(designerAppointments);
    } catch (err) {
      console.error('❌ AdminDashboard: Erro ao carregar agendamentos:', err);
      setError('Erro ao carregar agendamentos');
    }
  };

  const loadClients = async () => {
    try {
      // Carregar clientes da tabela clients correta
      const data = await getSupabaseClients();
      console.log('🔍 Clientes carregados:', data);

      // Converter para o formato Client esperado
      const convertedClients = data.map((client: any) => {
        const convertedClient: Client = {
          id: client.id,
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          password: client.password || '',
          isActive: client.is_active || client.isActive || true,
          createdAt: client.created_at || client.createdAt || new Date().toISOString()
        };
        console.log('🔍 Cliente convertido:', convertedClient);
        return convertedClient;
      });
      console.log('📊 Todos os clientes convertidos:', convertedClients);
      setClients(convertedClients);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
      setError('Erro ao carregar clientes');
    }
  };

  const getAppointments = (): Appointment[] => {
    return appointments;
  };

  const saveAppointments = async (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
  };

  const getClients = (): Client[] => {
    return clients;
  };

  const saveClient = async (client: Client) => {
    try {
      // Salvar cliente no Supabase
      const clientData = {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        password: 'default123', // Senha padrão para clientes criados manualmente
        is_active: true,
        // Removido designer_id pois não existe na interface Client
        // designer_id: client.designerId
      };

      // Usar a função createClientRecord para salvar no Supabase
      const { createClientRecord } = await import('../utils/supabaseUtils');
      const savedClient = await createClientRecord(clientData);

      if (savedClient) {
        console.log('✅ Cliente salvo no Supabase:', savedClient);

        // Atualizar estado local
        const existingIndex = clients.findIndex((c: Client) => c.id === client.id);
        let updatedClients;

        if (existingIndex >= 0) {
          updatedClients = [...clients];
          updatedClients[existingIndex] = client;
        } else {
          updatedClients = [...clients, client];
        }

        setClients(updatedClients);

        // Disparar evento para sincronizar com outros componentes
        window.dispatchEvent(new CustomEvent('clientCreated', {
          detail: { client: savedClient }
        }));
      } else {
        // Fallback para estado local apenas
        const existingIndex = clients.findIndex((c: Client) => c.id === client.id);
        let updatedClients;

        if (existingIndex >= 0) {
          updatedClients = [...clients];
          updatedClients[existingIndex] = client;
        } else {
          updatedClients = [...clients, client];
        }

        setClients(updatedClients);
      }
    } catch (err) {
      console.error('Erro ao salvar cliente no Supabase:', err);
      setError('Erro ao salvar cliente');

      // Fallback para estado local em caso de erro
      try {
        const existingIndex = clients.findIndex((c: Client) => c.id === client.id);
        let updatedClients;

        if (existingIndex >= 0) {
          updatedClients = [...clients];
          updatedClients[existingIndex] = client;
        } else {
          updatedClients = [...clients, client];
        }

        setClients(updatedClients);
      } catch (localErr) {
        console.error('Erro ao salvar cliente localmente:', localErr);
      }
    }
  };

  const findClientByPhone = (phone: string): Client | null => {
    const clients = getClients();
    // Verificar se o cliente tem o campo designerId ou se precisamos filtrar de outra forma
    return clients.find(c => c.phone === phone) || null;
  };

  const findClientsByName = (name: string): Client[] => {
    if (name.length < 1) return [];

    const clients = getClients();
    console.log('🔍 Buscando clientes por nome. Total de clientes:', clients.length, 'Nome buscado:', name);

    // Se não há clientes, retornar array vazio
    if (clients.length === 0) {
      console.log('🔍 Nenhum cliente cadastrado no sistema');
      return [];
    }

    const searchTerm = name.toLowerCase().trim();
    console.log('🔍 Termo de busca normalizado:', searchTerm);

    // Buscar por nome (apenas por nome agora)
    const matchingClients = clients.filter(c => {
      // Verificar se o cliente tem nome definido
      if (!c.name) {
        console.log('🔍 Cliente sem nome:', c);
        return false;
      }

      const clientName = c.name.toLowerCase();
      const nameMatch = clientName.includes(searchTerm);
      console.log(`🔍 Verificando cliente ${c.name}: clientName=${clientName}, searchTerm=${searchTerm}, nameMatch=${nameMatch}`);
      return nameMatch;
    });

    console.log('🔍 Clientes encontrados na busca:', matchingClients);

    // Ordenar por relevância: primeiro os que começam com o termo, depois os que contêm
    return matchingClients.sort((a, b) => {
      const aNameStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bNameStartsWith = b.name.toLowerCase().startsWith(searchTerm);

      // Priorizar nomes que começam com o termo
      if (aNameStartsWith && !bNameStartsWith) return -1;
      if (!aNameStartsWith && bNameStartsWith) return 1;

      // Se ambos começam ou ambos não começam, manter ordem original
      return 0;
    });
  };

  const handleManualBooking = async () => {
    if (!newClientData.name || !newClientData.phone || !newClientData.service ||
      !newClientData.date || !newClientData.time || !newClientData.price) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check for time conflicts
      const existingAppointments = getAppointments();
      const conflictingAppointment = existingAppointments.find(apt =>
        apt.date === newClientData.date && apt.time === newClientData.time
      );

      if (conflictingAppointment) {
        alert(`Este horário já está ocupado por ${conflictingAppointment.clientName}. Por favor, escolha outro horário.`);
        setLoading(false);
        return;
      }

      // Save client
      const clientId = existingClient?.id || crypto.randomUUID();
      const client: Client = {
        id: clientId,
        name: newClientData.name,
        phone: newClientData.phone,
        email: newClientData.email,
        password: 'default123',
        isActive: true,
        createdAt: existingClient?.createdAt || new Date().toISOString()
      };

      await saveClient(client);

      // Save appointment
      const appointment = {
        id: crypto.randomUUID(), // Usar UUID real
        designer_id: designer.id,
        client_name: newClientData.name,
        client_phone: newClientData.phone,
        client_email: newClientData.email,
        service: newClientData.service,
        date: newClientData.date,
        time: newClientData.time,
        price: parseFloat(newClientData.price),
        status: 'confirmed' as const, // Definir como confirmado por padrão em agendamento manual
        created_at: new Date().toISOString()
      };

      const savedAppointment = await createAppointment(appointment);

      if (savedAppointment) {
        console.log('✅ Agendamento salvo no Supabase:', savedAppointment);

        // Disparar evento para sincronizar com outros componentes
        window.dispatchEvent(new CustomEvent('appointmentCreated', {
          detail: { appointment: savedAppointment }
        }));

        // 🆕 NOVO: Enviar notificações de agendamento
        await sendAppointmentNotifications(savedAppointment);

        await loadAppointments(); // Recarregar lista

        // Reset form
        setNewClientData({
          name: '', phone: '', email: '', service: '', date: '', time: '', price: ''
        });
        setExistingClient(null);
        setShowClientSuggestion(false);
        setNameSuggestions([]);
        setShowNameSuggestions(false);
        setShowClientModal(false);
      } else {
        throw new Error('Falha ao salvar agendamento');
      }

    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError('Erro ao criar agendamento: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateDesignerStatus = async (isActive: boolean) => {
    try {
      setLoading(true);
      await updateNailDesigner(designer.id, { isActive });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const updatePixKey = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando atualização da chave PIX:', { designerId: designer.id, pixKey });

      const result = await updateNailDesigner(designer.id, { pixKey });
      console.log('✅ Resultado da atualização:', result);

      if (result) {
        console.log('✅ Chave PIX atualizada com sucesso no Supabase');
        // Atualizar o estado local do designer
        const updatedDesigner = { ...designer, pixKey };
        console.log('🔄 Atualizando estado local do designer:', updatedDesigner);

        // Disparar evento para atualizar dados globais
        window.dispatchEvent(new CustomEvent('designerUpdated', { detail: updatedDesigner }));

        setShowPixModal(false);
      } else {
        console.error('❌ Falha na atualização - resultado null');
        setError('Erro ao atualizar chave PIX');
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar chave PIX:', err);
      setError('Erro ao atualizar chave PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      await deleteAppointment(appointmentId);
      await loadAppointments(); // Recarregar lista
    } catch (err) {
      console.error('Erro ao deletar agendamento:', err);
      setError('Erro ao deletar agendamento');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (appointmentId: string) => {
    const allAppointments = getAppointments();
    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    setConfirmAction({ type: 'approve', appointmentId, appointment: appointment || null });
    setShowConfirmModal(true);
  };

  const handleRejectClick = (appointmentId: string) => {
    const allAppointments = getAppointments();
    const appointment = allAppointments.find(apt => apt.id === appointmentId);
    setConfirmAction({ type: 'reject', appointmentId, appointment: appointment || null });
    setShowConfirmModal(true);
  };

  const confirmAppointmentAction = async () => {
    try {
      setLoading(true);
      const status = confirmAction.type === 'approve' ? 'confirmed' as const : 'cancelled' as const;
      await updateAppointment(confirmAction.appointmentId, { status });
      await loadAppointments(); // Recarregar lista
      setShowConfirmModal(false);
      setConfirmAction({ type: 'approve', appointmentId: '', appointment: null });
    } catch (err) {
      console.error('Erro ao atualizar agendamento:', err);
      setError('Erro ao atualizar agendamento');
    } finally {
      setLoading(false);
    }
  };

  // Check for existing client when phone changes
  const handlePhoneChange = (phone: string) => {
    setNewClientData(prev => ({ ...prev, phone }));

    if (phone.length >= 10) { // Basic phone validation
      const client = findClientByPhone(phone);
      if (client) {
        setExistingClient(client);
        setShowClientSuggestion(true);
      } else {
        setExistingClient(null);
        setShowClientSuggestion(false);
      }
    } else {
      setExistingClient(null);
      setShowClientSuggestion(false);
    }
  };

  // Adicionando função para lidar com a mudança do tipo de cliente
  const handleClientTypeChange = (type: 'existing' | 'new') => {
    console.log('🔍 [DEBUG] Tipo de cliente alterado para:', type);
    setClientType(type);
    if (type === 'new') {
      // Limpar dados do cliente quando selecionar "nova cliente"
      setNewClientData(prev => ({
        ...prev,
        name: '',
        phone: '',
        email: ''
      }));
      setExistingClient(null);
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      console.log('🔍 [DEBUG] Limpar dados para nova cliente');
    } else {
      // Quando selecionar "cliente existente", garantir que as sugestões estejam visíveis
      console.log('🔍 [DEBUG] Cliente existente selecionado');

      // Sempre mostrar todas as clientes quando selecionar "cliente existente"
      const allClients = getClients();
      console.log('🔍 [DEBUG] Total de clientes disponíveis:', allClients.length);
      if (allClients.length > 0) {
        setNameSuggestions(allClients);
        setShowNameSuggestions(true);
        // Garantir que o campo de nome esteja vazio para mostrar todas as opções
        setNewClientData(prev => ({ ...prev, name: '' }));
        console.log('🔍 [DEBUG] Mostrando todas as clientes');
      } else {
        setNameSuggestions([]);
        setShowNameSuggestions(false);
        console.log('🔍 [DEBUG] Nenhuma cliente cadastrada');
      }
    }
  };

  // Adicionando função para selecionar um cliente existente
  const selectClient = (client: Client) => {
    console.log('🔍 Cliente selecionado:', client);
    setNewClientData(prev => ({
      ...prev,
      name: client.name,
      phone: client.phone,
      email: client.email || ''
    }));
    setExistingClient(client);
    setShowNameSuggestions(false);
    setNameSuggestions([]);
  };

  const handleNameChange = (name: string) => {
    console.log('🔍 [DEBUG] handleNameChange chamado com:', name);
    setNewClientData(prev => ({ ...prev, name }));

    // Apenas filtrar sugestões se estiver no modo "cliente existente"
    if (clientType === 'existing') {
      if (name.length >= 1) {
        const suggestions = findClientsByName(name);
        console.log('🔍 [DEBUG] Sugestões encontradas para', name, ':', suggestions.length);
        if (suggestions.length > 0) {
          setNameSuggestions(suggestions);
          setShowNameSuggestions(true);
          console.log('🔍 [DEBUG] Mostrando sugestões filtradas');
        } else {
          // Se não encontrar sugestões, manter a lista completa
          const allClients = getClients();
          setNameSuggestions(allClients);
          setShowNameSuggestions(true);
          console.log('🔍 [DEBUG] Nenhuma sugestão encontrada, mostrando todas as clientes');
        }
      } else {
        // Se não há texto, mostrar todas as clientes
        const allClients = getClients();
        console.log('🔍 [DEBUG] Mostrando todas as clientes (sem filtro):', allClients.length);
        if (allClients.length > 0) {
          setNameSuggestions(allClients);
          setShowNameSuggestions(true);
        }
      }
    }
  };

  const useExistingClientData = () => {
    if (existingClient) {
      setNewClientData(prev => ({
        ...prev,
        name: existingClient.name,
        phone: existingClient.phone,
        email: existingClient.email
      }));
      setShowClientSuggestion(false);
    }
  };

  const handleWhatsAppContact = (appointment: Appointment) => {
    const message = `Olá ${appointment.clientName}! 

Este é um lembrete do seu agendamento:

💅 *Serviço:* ${appointment.service}
📅 *Data:* ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')}
⏰ *Horário:* ${appointment.time}
💰 *Valor:* R$ ${appointment.price.toFixed(2)}

Nos vemos em breve! 💖`;

    const phoneNumber = appointment.clientPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const copyPersonalLink = () => {
    const slug = designer.name.toLowerCase().replace(/\s+/g, '-');
    const link = `${window.location.origin}/${slug}-nail`;
    navigator.clipboard.writeText(link);
    setShowLinkCopied(true);
    setTimeout(() => setShowLinkCopied(false), 2000);
  };

  const openPersonalLink = () => {
    const slug = designer.name.toLowerCase().replace(/\s+/g, '-');
    const link = `${window.location.origin}/${slug}-nail`;
    window.open(link, '_blank');
  };

  const formatSelectedDate = (dateStr: string) => {
    // Criar data sem problemas de timezone
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  };
  const pendingAppointments = appointments.filter(apt => (apt as any).status === 'pending');
  const todayAppointments = appointments.filter(apt => apt.date === selectedDate && apt.status !== 'cancelled' && apt.status !== 'canceled');
  const upcomingAppointments = appointments.filter(apt => apt.date > selectedDate);

  // Get next 7 days appointments - filtrar apenas agendamentos confirmados
  const nextWeekAppointments = appointments.filter(apt => {
    // Verificar se o agendamento está confirmado antes de incluir na lista
    const isConfirmed = apt.status === 'confirmed';
    const aptDate = new Date(apt.date + 'T00:00:00');
    const today = new Date(selectedDate);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return isConfirmed && aptDate > today && aptDate <= nextWeek;
  });

  // Monthly clients
  const currentMonth = new Date(selectedDate);
  const monthlyClients = appointments.filter(apt => {
    const aptDate = new Date(apt.date + 'T00:00:00');
    return aptDate.getMonth() === currentMonth.getMonth() &&
      aptDate.getFullYear() === currentMonth.getFullYear();
  });

  const todayRevenue = todayAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const monthlyRevenue = monthlyClients.reduce((sum, apt) => sum + apt.price, 0);

  // Função para carregar horários disponíveis
  const getAvailableTimeSlots = useCallback(async (): Promise<string[]> => {
    const selectedDate = newClientData.date;
    if (!selectedDate) {
      // 🎄 HORÁRIOS DINÂMICOS: Dezembro 2025 ou horários normais
      return getTimeSlotsConfig();
    }

    try {
      // Cache breaker para forçar nova busca
      const cacheBreaker = Date.now() + Math.random();
      console.log(`🔄 [${cacheBreaker}] Buscando horários disponíveis para ${selectedDate} - Designer: ${designer.name}`);

      let appointments: any[] = [];
      let retryCount = 0;
      const maxRetries = 3;

      // Buscar agendamentos do Supabase com retry
      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('date', selectedDate)
            .eq('designer_id', designer.id);

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

      // Extrair horários ocupados por agendamentos
      const bookedTimes = activeAppointments.map(apt => {
        // Normalizar formato: se tem segundos, remover (08:00:00 -> 08:00)
        return apt.time.length > 5 ? apt.time.substring(0, 5) : apt.time;
      });
      console.log(`⏰ [${cacheBreaker}] Horários ocupados por agendamentos (normalizados):`, bookedTimes);

      // 🎄 HORÁRIOS DINÂMICOS: Dezembro 2025 ou horários normais
      const defaultTimeSlots = getTimeSlotsConfig();

      // Verificar bloqueios de disponibilidade para a data selecionada
      const blockedTimes = designerAvailability
        .filter((avail: any) => {
          if (!avail || !avail.specificDate || !avail.isActive) return false;
          const normalizedAvailDate = String(avail.specificDate).split('T')[0];
          const normalizedSelectedDate = selectedDate.split('T')[0];
          return normalizedAvailDate === normalizedSelectedDate;
        })
        .map((avail: any) => {
          // Para bloqueios de horários específicos, retornar o horário de início
          if (avail.startTime !== '00:00' || avail.endTime !== '23:59') {
            return avail.startTime;
          }
          // Para bloqueios de dia inteiro, retornar todos os horários
          return null;
        })
        .filter(time => time !== null);

      console.log(`🚫 [${cacheBreaker}] Horários bloqueados por disponibilidade:`, blockedTimes);

      // Se há um bloqueio de dia inteiro, nenhum horário está disponível
      const hasFullDayBlock = designerAvailability.some((avail: any) => {
        if (!avail || !avail.specificDate || !avail.isActive) return false;
        const normalizedAvailDate = String(avail.specificDate).split('T')[0];
        const normalizedSelectedDate = selectedDate.split('T')[0];
        return normalizedAvailDate === normalizedSelectedDate &&
          avail.startTime === '00:00' && avail.endTime === '23:59';
      });

      if (hasFullDayBlock) {
        console.log(`🚫 [${cacheBreaker}] Dia inteiro bloqueado`);
        return [];
      }

      // Combinar horários ocupados por agendamentos e bloqueios de disponibilidade
      const allBlockedTimes = [...bookedTimes, ...blockedTimes];

      // Filtrar horários disponíveis
      const availableSlots = defaultTimeSlots.filter(time => !allBlockedTimes.includes(time));
      console.log(`✨ [${cacheBreaker}] Horários disponíveis:`, availableSlots);

      return availableSlots;
    } catch (err) {
      console.error('Erro ao buscar horários disponíveis:', err);
      return [];
    }
  }, [newClientData.date, designer.id, designerAvailability]);

  // Função para carregar disponibilidade da designer
  const loadDesignerAvailability = async () => {
    try {
      setLoadingAvailability(true);
      console.log('🔄 Carregando disponibilidade para designer:', designer.id);

      // Carregar disponibilidade do Supabase
      const { availabilityService } = await import('../utils/supabaseUtils');
      const supabaseAvailability = await availabilityService.getByDesignerId(designer.id);

      // Mapear campos do Supabase para o formato esperado
      // IMPORTANTE: is_available = true significa DISPONÍVEL, então isActive = !is_available significa BLOQUEADO
      const mappedAvailability = supabaseAvailability
        .filter((avail: any) => avail && avail.specific_date)
        .map((avail: any) => ({
          id: avail.id,
          designerId: avail.designer_id,
          dayOfWeek: avail.day_of_week,
          startTime: avail.start_time,
          endTime: avail.end_time,
          isActive: !avail.is_available, // isActive = bloqueio ativo (quando is_available = false)
          specificDate: avail.specific_date
        }));

      console.log('📊 Disponibilidade carregada:', mappedAvailability);
      setDesignerAvailability(mappedAvailability);
    } catch (err) {
      console.error('Erro ao carregar disponibilidade:', err);
      setError('Erro ao carregar disponibilidade');
    } finally {
      setLoadingAvailability(false);
    }
  };

  // 🆕 NOVA FUNÇÃO: Enviar notificações de agendamento
  const sendAppointmentNotifications = async (appointment: any) => {
    try {
      console.log('📤 Enviando notificações para agendamento:', appointment);

      // Enviar notificação imediata para a cliente
      await sendImmediateNotificationToClient(appointment);

      // Enviar notificação imediata para a nail designer
      await sendImmediateNotificationToDesigner(appointment);

      // Agendar lembretes (24h e 6h antes)
      await scheduleReminders(appointment);

      console.log('✅ Todas as notificações enviadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao enviar notificações:', error);
    }
  };

  // 🆕 NOVA FUNÇÃO: Enviar notificação imediata para a cliente
  const sendImmediateNotificationToClient = async (appointment: any) => {
    const message = `Olá ${appointment.client_name}! 

Seu agendamento foi confirmado:

💅 *Serviço:* ${appointment.service}
📅 *Data:* ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')}
⏰ *Horário:* ${appointment.time}
💰 *Valor:* R$ ${appointment.price.toFixed(2)}

Nos vemos em breve! 💖`;

    // Enviar via webhook para n8n
    await sendToN8nWebhook({
      project_type: 'nail_scheduler',
      type: 'appointment_created',
      recipient: 'client',
      appointment: appointment,
      message: message
    });
  };

  // 🆕 NOVA FUNÇÃO: Enviar notificação imediata para a designer
  const sendImmediateNotificationToDesigner = async (appointment: any) => {
    // Primeiro, obter dados da designer
    const designer = await getNailDesignerById(appointment.designer_id);

    if (designer) {
      const message = `Olá ${designer.name}!

Você tem um novo agendamento:

👤 *Cliente:* ${appointment.client_name}
📞 *Telefone:* ${appointment.client_phone}
💅 *Serviço:* ${appointment.service}
📅 *Data:* ${new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')}
⏰ *Horário:* ${appointment.time}
💰 *Valor:* R$ ${appointment.price.toFixed(2)}`;

      // Enviar via webhook para n8n
      await sendToN8nWebhook({
        project_type: 'nail_scheduler',
        type: 'appointment_created',
        recipient: 'designer',
        appointment: appointment,
        designer_phone: designer.phone, // Assumindo que a designer tem um campo phone
        message: message
      });
    }
  };

  // 🆕 NOVA FUNÇÃO: Agendar lembretes
  const scheduleReminders = async (appointment: any) => {
    // Agendar lembrete de 24h antes
    await sendToN8nWebhook({
      project_type: 'nail_scheduler',
      type: 'schedule_reminder',
      reminder_type: '24h',
      appointment: appointment,
      scheduled_time: calculateReminderTime(appointment.date, appointment.time, -24) // 24h antes
    });

    // Agendar lembrete de 6h antes
    await sendToN8nWebhook({
      project_type: 'nail_scheduler',
      type: 'schedule_reminder',
      reminder_type: '6h',
      appointment: appointment,
      scheduled_time: calculateReminderTime(appointment.date, appointment.time, -6) // 6h antes
    });
  };

  // 🆕 NOVA FUNÇÃO: Calcular horário do lembrete
  const calculateReminderTime = (date: string, time: string, hoursBefore: number): string => {
    // Combinar data e hora
    const dateTimeString = `${date}T${time}:00`;
    const appointmentDateTime = new Date(dateTimeString);

    // Subtrair horas
    const reminderDateTime = new Date(appointmentDateTime.getTime() + (hoursBefore * 60 * 60 * 1000));

    return reminderDateTime.toISOString();
  };

  // 🆕 NOVA FUNÇÃO: Enviar dados para webhook do n8n
  const sendToN8nWebhook = async (data: any): Promise<boolean> => {
    try {
      // 🆕 Melhor tratamento de variáveis de ambiente
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n-n8n.ojzczb.easypanel.host/webhook/3a2f1b4c-5d6e-7f8g-9h0i-jk1l2m3n4o5p';

      // Se nem a variável de ambiente nem a URL padrão estiverem disponíveis, logar erro detalhado
      if (!webhookUrl) {
        console.error("❌ VITE_N8N_WEBHOOK_URL não está definida e nenhuma URL padrão foi fornecida.");
        console.error("💡 Solução: Configure a variável de ambiente VITE_N8N_WEBHOOK_URL no seu serviço de hospedagem.");
        return false;
      }

      // Determinar a URL correta (relativa ou absoluta)
      let url: string;
      if (webhookUrl.startsWith('http')) {
        // Para URLs absolutas, usar proxy do Vite em desenvolvimento ou URL direta em produção
        url = webhookUrl;
      } else {
        // Para URLs relativas, usar o proxy do Vite
        url = webhookUrl;
      }

      // 🆕 Adicionar tratamento para ambiente de produção
      if (import.meta.env.PROD && webhookUrl.startsWith('http')) {
        // Em produção, usar URL direta (não precisa de proxy)
        url = webhookUrl;
      } else if (import.meta.env.DEV && webhookUrl.startsWith('http')) {
        // Em desenvolvimento, tentar usar proxy se for localhost
        if (webhookUrl.includes('localhost')) {
          url = webhookUrl; // O Vite já faz proxy automático para localhost
        } else if (webhookUrl.includes('railway.app')) {
          // Para URLs da Railway em desenvolvimento, usar URL direta (sem aviso de CORS)
          url = webhookUrl;
        } else {
          // Para outras URLs externas em desenvolvimento, pode haver problemas de CORS
          console.warn("⚠️ Usando URL externa em desenvolvimento, pode haver problemas de CORS");
          url = webhookUrl;
        }
      }

      // Ajuste: só enviar Authorization se ambos estiverem definidos no .env
      const username = import.meta.env.VITE_N8N_USERNAME || '';
      const password = import.meta.env.VITE_N8N_PASSWORD || '';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (username && password) {
        const credentials = btoa(`${username}:${password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(data)
      });

      // 🆕 Diagnóstico detalhado em caso de erro
      if (!response.ok) {
        let errorBody: any = '';
        try {
          errorBody = await response.json();
        } catch {
          try {
            errorBody = await response.text();
          } catch {
            errorBody = '<sem corpo>';
          }
        }
        console.error('❌ n8n respondeu com erro', {
          url,
          status: response.status,
          statusText: response.statusText,
          body: errorBody
        });
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 🆕 Sucesso tolerante a texto
      let result: any = null;
      try {
        result = await response.json();
      } catch {
        try {
          result = await response.text();
        } catch {
          result = null;
        }
      }
      console.log('✅ Dados enviados para n8n:', result ?? '<sem corpo>');
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar para n8n:', error);
      // 🆕 Adicionar mensagem de ajuda para configuração
      console.error("💡 Dica: Verifique se as variáveis de ambiente VITE_N8N_WEBHOOK_URL, VITE_N8N_USERNAME e VITE_N8N_PASSWORD estão configuradas corretamente no seu serviço de hospedagem.");
      console.error("💡 Dica adicional: Se estiver usando n8n local, certifique-se de que ele está acessível publicamente (use ngrok ou similar).");
      await saveToRetryQueue(data);
      return false;
    }
  };

  // 🆕 NOVA FUNÇÃO: Salvar em fila para reprocessamento
  const saveToRetryQueue = async (data: any) => {
    try {
      const queue = JSON.parse(localStorage.getItem('notification_queue') || '[]');
      queue.push({
        id: Date.now(),
        data: data,
        timestamp: new Date().toISOString(),
        retries: 0
      });
      localStorage.setItem('notification_queue', JSON.stringify(queue));
      console.log('📥 Dados salvos na fila para reprocessamento');
    } catch (error) {
      console.error('❌ Erro ao salvar na fila:', error);
    }
  };

  // Carregar horários disponíveis quando a data é selecionada
  useEffect(() => {
    if (newClientData.date) {
      const loadTimeSlots = async () => {
        setLoadingTimeSlots(true);

        try {
          const slots = await getAvailableTimeSlots();
          setAvailableTimeSlots(slots);
        } catch (error) {
          console.error('Erro ao carregar horários:', error);
          // 🎄 HORÁRIOS DINÂMICOS: Dezembro 2025 ou horários normais
          setAvailableTimeSlots(getTimeSlotsConfig());
        } finally {
          setLoadingTimeSlots(false);
        }
      };

      loadTimeSlots();
    } else {
      // Reset time slots when no date selected
      setAvailableTimeSlots([]);
    }
  }, [newClientData.date, getAvailableTimeSlots]);

  // Função para forçar recarregamento dos horários
  const forceRefreshTimeSlots = () => {
    setForceReload(prev => prev + 1);
  };

  // Adicionando função para carregar a disponibilidade da designer
  /*
  const loadDesignerAvailability = async () => {
    try {
      setLoadingAvailability(true);
      console.log('🔍 Carregando disponibilidade para o designer:', designer.id);
      
      // Buscar do Supabase
      const { availabilityService } = await import('../utils/supabaseUtils');
      const supabaseAvailability = await availabilityService.getByDesignerId(designer.id);
      
      // Mapear campos do Supabase para o formato esperado
      const mappedAvailability = supabaseAvailability
        .filter((avail: any) => avail && avail.is_available)
        .map((avail: any) => ({
          id: avail.id,
          designerId: avail.designer_id,
          dayOfWeek: avail.day_of_week,
          startTime: avail.start_time,
          endTime: avail.end_time,
          isActive: avail.is_available,
          specificDate: avail.specific_date
        }));
      
      console.log('📊 Disponibilidade carregada:', mappedAvailability);
      setDesignerAvailability(mappedAvailability);
    } catch (err) {
      console.error('Erro ao carregar disponibilidade:', err);
      setError('Erro ao carregar disponibilidade');
    } finally {
      setLoadingAvailability(false);
    }
  };
  */

  // Função para verificar se uma data e horário específicos estão disponíveis
  const isDateAvailable = (date: string, startTime: string, endTime: string): boolean => {
    if (!designerAvailability || designerAvailability.length === 0) return true; // Sem bloqueios, calendário livre

    const normalizedDate = date.split('T')[0];

    // Converter horários para minutos para fácil comparação
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const slotStartMinutes = timeToMinutes(startTime);
    const slotEndMinutes = timeToMinutes(endTime);

    return !designerAvailability.some((avail: any) => {
      if (!avail || !avail.specificDate) return false;
      const normalizedAvailDate = String(avail.specificDate).split('T')[0];

      if (normalizedAvailDate === normalizedDate) {
        // Se for um bloqueio de dia inteiro (00:00-23:59), o dia inteiro está bloqueado
        if (avail.startTime === '00:00' && avail.endTime === '23:59') {
          return true; // Dia inteiro bloqueado
        }

        const blockedStartMinutes = timeToMinutes(avail.startTime);
        const blockedEndMinutes = timeToMinutes(avail.endTime);

        // Verifica se há sobreposição com um bloqueio de horário específico
        if (
          (slotStartMinutes < blockedEndMinutes && slotEndMinutes > blockedStartMinutes) &&
          avail.isActive // Considera apenas bloqueios ativos
        ) {
          return true; // Slot bloqueado
        }
      }
      return false; // Não bloqueado
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></div>
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Manual Booking Modal */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Agendar Manualmente</h2>

            <div className="space-y-4">
              {/* Seletor de tipo de cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cliente *</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleClientTypeChange('existing')}
                    className={`flex-1 p-3 rounded-lg font-semibold transition-colors ${clientType === 'existing'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Cliente Existente
                  </button>
                  <button
                    type="button"
                    onClick={() => handleClientTypeChange('new')}
                    className={`flex-1 p-3 rounded-lg font-semibold transition-colors ${clientType === 'new'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Nova Cliente
                  </button>
                </div>
              </div>

              {/* Campo de seleção de cliente existente ou entrada de nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {clientType === 'existing' ? 'Selecione a Cliente *' : 'Nome *'}
                </label>
                {clientType === 'existing' ? (
                  <div className="relative">
                    <input
                      type="text"
                      ref={nameInputRef}
                      value={newClientData.name}
                      onChange={(e) => {
                        console.log('🔍 [DEBUG] Input de nome alterado:', e.target.value);
                        handleNameChange(e.target.value);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                      placeholder="Digite o nome da cliente"
                    />

                    {/* Debug info */}
                    <div className="mt-1 text-xs text-gray-500">
                      Debug: clientType={clientType}, name="{newClientData.name}", showNameSuggestions={showNameSuggestions.toString()}, suggestions={nameSuggestions.length}
                    </div>

                    {/* Name Suggestions */}
                    {showNameSuggestions && nameSuggestions.length > 0 && (
                      <div ref={suggestionsRef} className="mt-2 border border-gray-200 rounded-lg bg-white shadow-lg max-h-60 overflow-y-auto z-10 relative">
                        <div className="p-2 bg-gradient-to-r from-pink-50 to-rose-50 border-b">
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Users className="w-4 h-4 text-pink-600" />
                            {nameSuggestions.length === 1 ? 'Cliente encontrada:' : `${nameSuggestions.length} clientes encontradas:`}
                          </p>
                        </div>
                        {nameSuggestions.map((client, index) => {
                          // Calcular quantos agendamentos a cliente teve
                          const allAppointments = getAppointments();
                          const clientAppointments = allAppointments.filter(apt => apt.clientPhone === client.phone);
                          const completedAppointments = clientAppointments.filter(apt => (apt as any).status === 'completed' || !(apt as any).status);

                          return (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => {
                                console.log('🔍 [DEBUG] Cliente selecionado:', client);
                                selectClient(client);
                              }}
                              className="w-full text-left p-3 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 border-b border-gray-100 last:border-b-0 transition-all duration-200 group"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-semibold text-gray-800 group-hover:text-pink-700">{client.name}</p>
                                    {completedAppointments.length > 0 && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                        {completedAppointments.length} agendamento{completedAppointments.length > 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                    <Phone className="w-3 h-3" />
                                    <span>{client.phone}</span>
                                  </div>
                                  {client.email && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                      <span>📧</span>
                                      {client.email}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right ml-3">
                                  <p className="text-xs text-pink-600 font-medium">
                                    Último agendamento:
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {client.createdAt ?
                                      new Date(client.createdAt).toLocaleDateString('pt-BR') :
                                      'Nunca'
                                    }
                                  </p>
                                  {completedAppointments.length > 0 && (
                                    <p className="text-xs text-green-600 mt-1">
                                      Cliente recorrente ⭐
                                    </p>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Mensagem quando não há clientes cadastrados */}
                    {showNameSuggestions && nameSuggestions.length === 0 && newClientData.name.length > 0 && (
                      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Nenhuma cliente encontrada com esse nome. Verifique se a cliente está cadastrada ou selecione "Nova Cliente".
                        </p>
                      </div>
                    )}

                    {/* Mensagem quando não há texto digitado */}
                    {showNameSuggestions && nameSuggestions.length === 0 && newClientData.name.length === 0 && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Digite o nome da cliente para buscar nas sugestões.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={newClientData.name}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    placeholder="Nome da cliente"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                <input
                  type="tel"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="(11) 99999-9999"
                  // Desabilitar edição se for cliente existente
                  disabled={clientType === 'existing' && !!existingClient}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="email@exemplo.com"
                  // Desabilitar edição se for cliente existente
                  disabled={clientType === 'existing' && !!existingClient}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serviço *</label>
                <select
                  value={newClientData.service}
                  onChange={(e) => {
                    const selectedService = services.find(s => s.name === e.target.value);
                    setNewClientData(prev => ({
                      ...prev,
                      service: e.target.value,
                      // O preço será calculado pelo useEffect, então não precisamos definir aqui
                      // price: selectedService ? selectedService.price.toString() : prev.price
                    }));
                    setSelectedExtraServices([]); // Limpa serviços extras ao mudar o serviço principal
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">Selecione um serviço</option>
                  {regularServices.map((service) => ( // Alterado para regularServices
                    <option key={service.id} value={service.name}>
                      {service.name} - R$ {service.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* NOVO: Seção de Serviços Extras */}
              {newClientData.service && extraServices.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Serviços Extras (Opcional)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {extraServices.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setSelectedExtraServices(prev =>
                            prev.some(s => s.id === service.id)
                              ? prev.filter(s => s.id !== service.id)
                              : [...prev, service]
                          );
                        }}
                        className={`p-3 border rounded-lg text-left transition-colors ${selectedExtraServices.some(s => s.id === service.id)
                          ? 'border-pink-500 bg-pink-50 text-pink-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-sm text-gray-600">R$ {service.price.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                  <input
                    type="date"
                    value={newClientData.date}
                    onChange={(e) => {
                      const selectedDateValue = e.target.value;
                      // Bloqueado = indisponível para agendamento
                      if (selectedDateValue && !isDateAvailable(selectedDateValue, '00:00', '23:59')) {
                        alert('Este dia está bloqueado pela designer e não pode ser agendado.');
                        return;
                      }
                      setNewClientData(prev => ({ ...prev, date: selectedDateValue }));
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                  {loadingAvailability ? (
                    <div className="mt-2 text-sm text-gray-500 flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                      Carregando disponibilidade...
                    </div>
                  ) : designerAvailability.filter(avail => avail && avail.isActive).length > 0 ? (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">🚫 Dias indisponíveis (bloqueados):</p>
                      <div className="flex flex-wrap gap-1">
                        {designerAvailability
                          .filter(avail => avail && avail.specificDate && avail.isActive)
                          .slice(0, 5) // Mostrar apenas as primeiras 5 datas
                          .map((avail: any) => (
                            <span
                              key={avail.id}
                              className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                            >
                              {new Date(String(avail.specificDate) + 'T00:00:00').toLocaleDateString('pt-BR')}
                              {avail.startTime === '00:00' && avail.endTime === '23:59' ? '' : ' (horários específicos)'}
                            </span>
                          ))}
                        {designerAvailability.filter(avail => avail && avail.specificDate && avail.isActive).length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{designerAvailability.filter(avail => avail && avail.specificDate && avail.isActive).length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-green-600">✅ Calendário liberado. Nenhum dia bloqueado.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário *</label>
                  {loadingTimeSlots ? (
                    <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500 mr-2"></div>
                      <span className="text-gray-500 text-sm">Carregando...</span>
                    </div>
                  ) : newClientData.date ? (
                    <select
                      value={newClientData.time}
                      onChange={(e) => setNewClientData(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="">Selecione um horário</option>
                      {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                      {availableTimeSlots.length === 0 && (
                        <option value="" disabled>
                          Nenhum horário disponível
                        </option>
                      )}
                    </select>
                  ) : (
                    <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                      Selecione uma data primeiro
                    </div>
                  )}

                  {newClientData.date && (
                    <button
                      onClick={forceRefreshTimeSlots}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      🔄 Atualizar horários
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newClientData.price}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowClientModal(false)}
                className="flex-1 p-3 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleManualBooking}
                disabled={loading}
                className="flex-1 p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Agendando...' : 'Agendar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIX Configuration Modal */}
      {showPixModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Configurar Chave PIX</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chave PIX para Pagamentos
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Digite sua chave PIX (CPF, email, telefone ou chave aleatóora)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta chave será mostrada para as clientes realizarem o pagamento
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPixModal(false)}
                className="flex-1 p-3 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={updatePixKey}
                disabled={loading}
                className="flex-1 p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {confirmAction.type === 'approve' ? 'Aprovar Agendamento' : 'Rejeitar Agendamento'}
            </h2>

            {confirmAction.appointment && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-800 mb-2">{confirmAction.appointment.clientName}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Serviço:</strong> {confirmAction.appointment.service}</p>
                  <p><strong>Data:</strong> {new Date(confirmAction.appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                  <p><strong>Horário:</strong> {confirmAction.appointment.time}</p>
                  <p><strong>Valor:</strong> R$ {confirmAction.appointment.price.toFixed(2)}</p>
                  <p><strong>Telefone:</strong> {confirmAction.appointment.clientPhone}</p>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              {confirmAction.type === 'approve'
                ? 'Tem certeza que deseja aprovar este agendamento? A cliente será notificada da confirmação.'
                : 'Tem certeza que deseja rejeitar este agendamento? A cliente será notificada do cancelamento.'}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 p-3 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAppointmentAction}
                disabled={loading}
                className={`flex-1 p-3 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${confirmAction.type === 'approve'
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
              >
                {loading
                  ? (confirmAction.type === 'approve' ? 'Aprovando...' : 'Rejeitando...')
                  : (confirmAction.type === 'approve' ? 'Aprovar' : 'Rejeitar')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">Olá, {designer.name}! 👋</h1>
        <p className="opacity-90">Aqui está um resumo do seu dia</p>
      </div>

      {/* Personal Link & Status */}
      <div className={`backdrop-blur-md rounded-xl p-4 shadow-sm border ${designer.isActive
        ? 'bg-green-500/20 border-green-300/30'
        : 'bg-red-500/20 border-red-300/30'
        }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Seu Link Pessoal</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-purple-100">Status:</span>
            <button
              onClick={() => updateDesignerStatus(!designer.isActive)}
              className="flex items-center gap-1"
            >
              {designer.isActive ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-red-500" />
              )}
              <span className={`text-sm font-medium ${designer.isActive ? 'text-green-600' : 'text-red-500'}`}>
                {designer.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <p className="text-sm text-purple-100 break-all">
            /{designer.name.toLowerCase().replace(/\s+/g, '-')}-nail
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyPersonalLink}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {showLinkCopied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            onClick={openPersonalLink}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-gold-100 text-gold-600 rounded-lg hover:bg-gold-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir
          </button>
        </div>
      </div>

      {/* PIX Configuration */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-white">Chave PIX</h3>
          </div>
          <button
            onClick={() => setShowPixModal(true)}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white/10 rounded-lg p-3 mb-3">
          <p className="text-sm text-purple-100 break-all">
            {designer.pixKey || 'Nenhuma chave PIX configurada'}
          </p>
        </div>

        {!designer.pixKey && (
          <p className="text-xs text-yellow-300">
            Configure sua chave PIX para receber pagamentos das clientes
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <p className="text-sm text-purple-100">Hoje</p>
              <p className="text-lg font-bold text-white">R$ {todayRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-purple-100">Agendamentos</p>
              <p className="text-lg font-bold text-white">{todayAppointments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Appointments */}
      {pendingAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200">
          <div className="p-4 border-b border-yellow-200 bg-yellow-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Agendamentos Pendentes ({pendingAppointments.length})
            </h2>
            <p className="text-sm text-yellow-700 mt-1">Aguardando sua aprovação</p>
          </div>

          <div className="divide-y divide-yellow-100">
            {pendingAppointments
              .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
              .map((appointment) => (
                <div key={appointment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold text-gray-800">
                          {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appointment.time}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-800">{appointment.clientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {appointment.clientPhone}
                        </span>
                        <span className="text-sm font-medium text-yellow-600">
                          R$ {appointment.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApproveClick(appointment.id)}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        title="Aprovar agendamento"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleRejectClick(appointment.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        title="Rejeitar agendamento"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Date Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="w-4 h-4 inline mr-1" />
          Visualizar agendamentos do dia
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100">
        <div className="p-4 border-b border-pink-100">
          <h2 className="font-semibold text-gray-800">
            Agendamentos - {selectedDate ? formatSelectedDate(selectedDate) : 'Selecione uma data'}
          </h2>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-600">Nenhum agendamento para este dia.</p>
          </div>
        ) : (
          <div className="divide-y divide-pink-50">
            {todayAppointments
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((appointment) => (
                <div key={appointment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-pink-600" />
                        <span className="font-semibold text-gray-800">{appointment.time}</span>
                      </div>
                      <h3 className="font-medium text-gray-800">{appointment.clientName}</h3>
                      <p className="text-sm text-gray-600">{appointment.service}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {appointment.clientPhone}
                        </span>
                        <span className="text-sm font-medium text-pink-600">
                          R$ {appointment.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleWhatsAppContact(appointment)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Enviar mensagem WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir agendamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Next Week Appointments */}
      {nextWeekAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-pink-100">
          <div className="p-4 border-b border-pink-100">
            <h2 className="font-semibold text-gray-800">Próximos 7 Dias</h2>
          </div>
          <div className="p-4 space-y-3">
            {nextWeekAppointments
              .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
              .slice(0, 5)
              .map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{appointment.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appointment.time}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-pink-600">
                    {appointment.service}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Monthly Clients Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-pink-100">
        <div className="p-4 border-b border-pink-100">
          <h2 className="font-semibold text-gray-800">Resumo do Mês</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-600">{monthlyClients.length}</p>
              <p className="text-sm text-gray-600">Clientes Atendidas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gold-600">R$ {monthlyRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Faturamento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setShowClientModal(true)}
          className="p-4 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Agendar Cliente
        </button>
        <button
          onClick={() => onViewChange('services')}
          className="p-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Gerenciar Serviços
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button
          onClick={() => onViewChange('availability')}
          className="p-4 bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          Gerenciar Horários
        </button>
      </div>
    </div>
  );
}
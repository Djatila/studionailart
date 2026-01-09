import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, MapPin, ArrowLeft, History, CalendarDays, Plus, X, Trash2 } from 'lucide-react';
import { getSupabaseAppointments, getNailDesigners, updateAppointment, updateNailDesigner } from '../utils/supabaseUtils';

// Definir a interface Client
interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: string;
}

interface Appointment {
  id: string;
  designerId: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  createdAt: string;
}

interface NailDesigner {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  pixKey?: string;
  isActive: boolean;
  createdAt: string;
}

interface ClientDashboardProps {
  client: Client;
  onBack: () => void;
  onBookService?: () => void;
}

export default function ClientDashboard({ client, onBack, onBookService }: ClientDashboardProps) {
  const [currentView, setCurrentView] = useState<'current' | 'history' | 'cancelled' | 'profile'>('current');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [designers, setDesigners] = useState<NailDesigner[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [showBookingWarning, setShowBookingWarning] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Estados para dados do cliente
  const [clientData, setClientData] = useState({
    name: client.name,
    email: client.email || '',
    phone: client.phone
  });
  
  const [profileData, setProfileData] = useState({
    name: client.name,
    email: client.email || '',
    phone: client.phone,
    password: ''
  });

  // Atualizar dados quando a prop client mudar
  useEffect(() => {
    setClientData({
      name: client.name,
      email: client.email || '',
      phone: client.phone
    });
    setProfileData({
      name: client.name,
      email: client.email || '',
      phone: client.phone,
      password: ''
    });
  }, [client]);

  useEffect(() => {
    loadData();
  }, [client.phone]);

  const loadData = async () => {
    try {
      console.log('🔄 ClientDashboard: Carregando dados do cliente:', client);
      console.log('🔍 ClientDashboard: Telefone do cliente:', client.phone);
      console.log('🔍 ClientDashboard: Tipo do telefone:', typeof client.phone);
      let clientAppointments: Appointment[] = [];
      
      // Buscar agendamentos do Supabase
      try {
        const { getSupabaseAppointments } = await import('../utils/supabaseUtils');
        const supabaseAppointments = await getSupabaseAppointments();
        console.log('📊 ClientDashboard: Total de agendamentos no Supabase:', supabaseAppointments.length);
        console.log('📋 ClientDashboard: Todos os agendamentos do Supabase (primeiros 5):', JSON.stringify(supabaseAppointments.slice(0, 5), null, 2));
        
        // Filtrar agendamentos do cliente pelo telefone
        clientAppointments = supabaseAppointments.filter((apt: any) => {
          // Verificação mais robusta para o telefone
          const clientPhoneFromDB = apt.client_phone || apt.clientPhone || '';
          // Normalizar ambos os telefones para comparação
          const normalizedDBPhone = String(clientPhoneFromDB).replace(/\D/g, '');
          const normalizedClientPhone = String(client.phone).replace(/\D/g, '');
          
          const matchesPhone = normalizedDBPhone === normalizedClientPhone;
          console.log(`🔍 ClientDashboard: Verificando agendamento ${apt.id}:`, {
            dbPhone: clientPhoneFromDB,
            dbPhoneNormalized: normalizedDBPhone,
            clientPhone: client.phone,
            clientPhoneNormalized: normalizedClientPhone,
            matches: matchesPhone
          });
          return matchesPhone;
        }).map((apt: any) => ({
          id: apt.id,
          designerId: apt.designer_id || apt.designerId || '',
          clientName: apt.client_name || apt.clientName || '',
          clientPhone: apt.client_phone || apt.clientPhone || '',
          service: apt.service || '',
          date: apt.date || '',
          time: apt.time || '',
          status: apt.status || 'pending',
          price: apt.price || 0,
          createdAt: apt.created_at || apt.createdAt || new Date().toISOString()
        }));
        
        console.log(`✅ ClientDashboard: ${clientAppointments.length} agendamentos encontrados no Supabase`);
        console.log('📋 ClientDashboard: Agendamentos filtrados (primeiros 5):', JSON.stringify(clientAppointments.slice(0, 5), null, 2));
      } catch (supabaseError) {
        console.error('❌ ClientDashboard: Erro ao buscar do Supabase, usando localStorage:', supabaseError);
        
        // Fallback para localStorage se Supabase falhar
        const allAppointments = JSON.parse(localStorage.getItem('nail_appointments') || '[]');
        console.log('📱 ClientDashboard: Todos os agendamentos do localStorage:', JSON.stringify(allAppointments, null, 2));
        clientAppointments = allAppointments.filter((apt: Appointment) => {
          // Normalizar telefones para comparação
          const normalizedAptPhone = String(apt.clientPhone || '').replace(/\D/g, '');
          const normalizedClientPhone = String(client.phone).replace(/\D/g, '');
          const matchesPhone = normalizedAptPhone === normalizedClientPhone;
          
          console.log(`🔍 ClientDashboard: Verificando agendamento localStorage ${apt.id}:`, {
            aptPhone: apt.clientPhone,
            aptPhoneNormalized: normalizedAptPhone,
            clientPhone: client.phone,
            clientPhoneNormalized: normalizedClientPhone,
            matches: matchesPhone
          });
          return matchesPhone;
        });
        console.log(`📱 ClientDashboard: ${clientAppointments.length} agendamentos encontrados no localStorage (fallback)`);
      }
      
      setAppointments(clientAppointments);

      // SEMPRE buscar designers do Supabase (removendo dependência do localStorage)
      console.log('🔍 ClientDashboard: Buscando designers diretamente do Supabase...');
      try {
        const { getNailDesigners } = await import('../utils/supabaseUtils');
        const supabaseDesigners = await getNailDesigners();
        console.log('📊 ClientDashboard: Designers do Supabase:', supabaseDesigners.length);
        console.log('👥 ClientDashboard: Designers encontradas:', supabaseDesigners.map(d => `${d.name} (ID: ${d.id})`));
        
        setDesigners(supabaseDesigners);
        
        // Opcional: atualizar localStorage com dados atualizados
        localStorage.setItem('nail_designers', JSON.stringify(supabaseDesigners));
      } catch (error) {
        console.error('❌ ClientDashboard: Erro ao buscar designers do Supabase:', error);
        
        // Fallback para localStorage apenas em caso de erro
        const savedDesigners = JSON.parse(localStorage.getItem('nail_designers') || '[]');
        console.log('📱 ClientDashboard: Usando designers do localStorage como fallback:', savedDesigners.length);
        setDesigners(savedDesigners);
      }
    } catch (error) {
      console.error('❌ ClientDashboard: Erro ao carregar dados:', error);
    }
  };

  const getDesignerName = (designerId: string) => {
    console.log('🔍 ClientDashboard: Buscando designer com ID:', designerId);
    console.log('📊 ClientDashboard: Designers disponíveis:', designers.length);
    
    // Buscar por ID exato
    const designer = designers.find(d => d.id === designerId);
    
    if (designer) {
      console.log('✅ ClientDashboard: Designer encontrada:', designer.name);
      return designer.name;
    }
    
    console.log('❌ ClientDashboard: Designer não encontrada para ID:', designerId);
    console.log('📋 ClientDashboard: IDs disponíveis:', designers.map(d => `${d.name}: ${d.id}`));
    return `Designer (${designerId})`;
  };

  const getCurrentMonthAppointments = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00');
      return aptDate >= now && (apt.status === 'confirmed' || apt.status === 'pending');
    }).sort((a, b) => new Date(a.date + 'T00:00:00').getTime() - new Date(b.date + 'T00:00:00').getTime());
  };

  const getHistoryAppointments = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00');
      return (aptDate.getMonth() !== currentMonth || aptDate.getFullYear() !== currentYear) ||
             apt.status === 'completed' || apt.status === 'cancelled';
    }).sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime());
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleSaveProfile = async () => {
    try {
      console.log('🔄 Iniciando salvamento do perfil do cliente...');
      
      // Tentar salvar no Supabase primeiro
      try {
        const { updateClient } = await import('../utils/supabaseUtils');
        const updatedClient = await updateClient(client.id, {
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          ...(profileData.password && { password: profileData.password })
        });
        
        if (updatedClient) {
          console.log('✅ Dados do cliente salvos no Supabase:', updatedClient);
        }
      } catch (supabaseError) {
        console.error('❌ Erro ao salvar cliente no Supabase:', supabaseError);
      }
      
      // Atualizar agendamentos se o telefone mudou
      if (profileData.phone !== client.phone) {
        try {
          // Atualizar agendamentos no Supabase
          try {
            const { getSupabaseAppointments, updateAppointment } = await import('../utils/supabaseUtils');
            const allAppointments = await getSupabaseAppointments();
            const clientAppointments = allAppointments.filter((apt: any) => {
              const normalizedDBPhone = String(apt.client_phone || apt.clientPhone || '').replace(/\D/g, '');
              const normalizedOldPhone = String(client.phone).replace(/\D/g, '');
              return normalizedDBPhone === normalizedOldPhone;
            });
            
            // Atualizar cada agendamento do cliente com o novo telefone
            for (const apt of clientAppointments) {
              await updateAppointment(apt.id, {
                client_phone: profileData.phone,
                client_name: profileData.name
              });
            }
            
            console.log(`✅ ${clientAppointments.length} agendamentos atualizados no Supabase`);
          } catch (supabaseError) {
            console.error('❌ Erro ao atualizar agendamentos no Supabase:', supabaseError);
            
            // Fallback para localStorage se Supabase falhar
            const allAppointments = JSON.parse(localStorage.getItem('nail_appointments') || '[]');
            const updatedAppointments = allAppointments.map((apt: Appointment) => {
              if (apt.clientPhone === client.phone) {
                return { ...apt, clientPhone: profileData.phone, clientName: profileData.name };
              }
              return apt;
            });
            localStorage.setItem('nail_appointments', JSON.stringify(updatedAppointments));
            console.log('📱 Agendamentos atualizados no localStorage (fallback)');
          }
        } catch (error) {
          console.error('❌ Erro ao atualizar agendamentos:', error);
        }
      }
      
      // Atualizar clientData com os novos dados
      setClientData({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      });
      
      // Criar objeto atualizado do cliente
      const updatedClient = {
        ...client,
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      };
      
      // Disparar evento para notificar o App.tsx
      const event = new CustomEvent('clientUpdated', {
        detail: updatedClient
      });
      window.dispatchEvent(event);
      console.log('📡 Evento clientUpdated disparado:', updatedClient);
      
      setIsEditing(false);
      setSaveMessage('Dados salvos com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
      
      // Recarregar dados
      loadData();
      console.log('✅ Salvamento concluído com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados:', error);
      setSaveMessage('Erro ao salvar dados. Tente novamente.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      password: ''
    });
    setIsEditing(false);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    try {
      // Tentar cancelar no Supabase primeiro
      try {
        console.log('🔄 ClientDashboard: Cancelando agendamento no Supabase...', appointmentToCancel);
        const { updateAppointment } = await import('../utils/supabaseUtils');
        
        const updatedAppointment = await updateAppointment(appointmentToCancel, {
          status: 'cancelled'
        });
        
        if (updatedAppointment) {
          console.log('✅ ClientDashboard: Agendamento cancelado no Supabase');
        }
      } catch (supabaseError) {
        console.error('❌ ClientDashboard: Erro ao cancelar no Supabase:', supabaseError);
        
        // Fallback para localStorage se Supabase falhar
        const allAppointments = JSON.parse(localStorage.getItem('nail_appointments') || '[]');
        const updatedAppointments = allAppointments.map((apt: Appointment) => {
          if (apt.id === appointmentToCancel) {
            return { ...apt, status: 'cancelled' as const };
          }
          return apt;
        });
        
        localStorage.setItem('nail_appointments', JSON.stringify(updatedAppointments));
        console.log('📱 ClientDashboard: Agendamento cancelado no localStorage (fallback)');
      }
      
      // 🆕 NOVO: Disparar evento para notificar outras páginas sobre o cancelamento
      const cancelEvent = new CustomEvent('appointmentCancelled', {
        detail: { appointmentId: appointmentToCancel }
      });
      window.dispatchEvent(cancelEvent);
      console.log('📡 Evento appointmentCancelled disparado:', appointmentToCancel);
      
      // Recarregar dados e fechar modal
      await loadData();
      setShowCancelModal(false);
      setAppointmentToCancel(null);
    } catch (error) {
      console.error('❌ ClientDashboard: Erro ao cancelar agendamento:', error);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setAppointmentToCancel(null);
  };

  const getCancelledAppointments = () => {
    return appointments.filter(apt => apt.status === 'cancelled')
      .sort((a, b) => new Date(b.date + 'T00:00:00').getTime() - new Date(a.date + 'T00:00:00').getTime());
  };

  const currentMonthAppointments = getCurrentMonthAppointments();
  const historyAppointments = getHistoryAppointments();
  const cancelledAppointments = getCancelledAppointments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-pink-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Olá, {client.name}!</h1>
              <p className="text-purple-200 text-sm">Bem-vinda ao seu painel</p>
            </div>
            <div className="w-16"></div>
          </div>
          
          <div className="flex items-center gap-3 text-purple-100">
            <Phone className="w-5 h-5" />
            <span>{client.phone}</span>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowBookingWarning(true)}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl p-4 font-semibold text-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Plus className="w-6 h-6" />
            Agendar Novo Serviço
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('current')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                currentView === 'current'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              Próximos ({currentMonthAppointments.length})
            </button>
            <button
              onClick={() => setCurrentView('cancelled')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                currentView === 'cancelled'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <X className="w-5 h-5" />
              Cancelados ({cancelledAppointments.length})
            </button>
            <button
              onClick={() => setCurrentView('history')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                currentView === 'history'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <History className="w-5 h-5" />
              Histórico ({historyAppointments.length})
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl font-semibold transition-all ${
                currentView === 'profile'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-5 h-5" />
              Perfil
            </button>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {currentView === 'current' && (
            <>
              {currentMonthAppointments.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                  <CalendarDays className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum agendamento futuro</h3>
                  <p className="text-purple-200 mb-4">Você não possui agendamentos futuros confirmados.</p>
                  <button
                    onClick={() => setShowBookingWarning(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Fazer Primeiro Agendamento
                  </button>
                </div>
              ) : (
                currentMonthAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{appointment.service}</h3>
                        <div className="flex items-center gap-2 text-purple-200 mb-2">
                          <User className="w-4 h-4" />
                          <span>{getDesignerName(appointment.designerId)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-100 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-green-300">R$ {appointment.price.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 border border-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancelar Agendamento
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {currentView === 'cancelled' && (
            <>
              {cancelledAppointments.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                  <X className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum agendamento cancelado</h3>
                  <p className="text-purple-200">Você não possui agendamentos cancelados.</p>
                </div>
              ) : (
                cancelledAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{appointment.service}</h3>
                        <div className="flex items-center gap-2 text-purple-200 mb-2">
                          <User className="w-4 h-4" />
                          <span>{getDesignerName(appointment.designerId)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-green-300">R$ {appointment.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {currentView === 'history' && (
            <>
              {historyAppointments.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 text-center">
                  <History className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Nenhum histórico</h3>
                  <p className="text-purple-200">Você ainda não possui histórico de agendamentos.</p>
                </div>
              ) : (
                historyAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{appointment.service}</h3>
                        <div className="flex items-center gap-2 text-purple-200 mb-2">
                          <User className="w-4 h-4" />
                          <span>{getDesignerName(appointment.designerId)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-purple-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-green-300">R$ {appointment.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {currentView === 'profile' && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <User className="w-6 h-6" />
                  Meus Dados
                </h3>
              </div>

              {saveMessage && (
                <div className={`mb-4 p-3 rounded-xl text-center font-semibold ${
                  saveMessage.includes('sucesso') 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {saveMessage}
                </div>
              )}

              <div className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Digite seu email"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Digite seu telefone"
                  />
                </div>

                {/* Botão de Salvar */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Warning Modal */}
      {showBookingWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-start z-50 p-2 pt-16 pl-4">
          <div className="bg-white rounded-3xl shadow-xl p-4 max-w-sm w-full">
            <button
              onClick={() => setShowBookingWarning(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Warning Content */}
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-4">
                  ATENÇÃO LEIA ANTES DE AGENDAR!!! ✨🙏🏼
                </h2>
              </div>

              <div className="text-left space-y-3 mb-8 text-gray-700 leading-relaxed">
                <p className="font-medium">
                  Olá! No nosso Studio agora você pode escolher com qual profissional você deseja fazer!
                </p>
                <p>
                  Fica a vontade pra fazer seu agendamento com a Nail de sua preferência!
                </p>
                <p className="font-semibold text-pink-600">
                  AGENDAMENTOS COM UMA SEMANA DE ANTECEDÊNCIA!
                </p>
                <p className="font-semibold text-pink-600">
                  TOLERÂNCIA DE ATRASO DE 10 MINUTOS
                </p>
              </div>

              {/* Concordo Button */}
              <button
                onClick={() => {
                  setShowBookingWarning(false);
                  onBookService();
                }}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Concordo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Cancelar Agendamento</h3>
              <p className="text-purple-200 mb-6">
                Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all border border-gray-500/30"
                >
                  Manter Agendamento
                </button>
                <button
                  onClick={confirmCancelAppointment}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 px-6 py-3 rounded-xl font-semibold transition-all border border-red-500/30"
                >
                  Sim, Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
   );
 };
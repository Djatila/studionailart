import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, TrendingUp, Clock, Phone, MessageCircle, Trash2, Copy, ExternalLink, ToggleLeft, ToggleRight, CreditCard, Edit3 } from 'lucide-react';
import { NailDesigner, Appointment, Client } from '../App';
import {
  getAppointments as getSupabaseAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getNailDesigners,
  updateNailDesigner,
  getNailDesignerById
} from '../utils/supabaseUtils';

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
  const [newClientData, setNewClientData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
    price: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadAppointments();
    loadClients();
  }, [designer.id]);

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
      // Como não temos tabela de clientes, vamos usar os designers como clientes
      const data = await getNailDesigners();
      const designerClients = data.filter((client: any) => client.designerId === designer.id);
      setClients(designerClients);
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
      // Como não temos tabela de clientes, vamos simular salvando no estado
      const existingIndex = clients.findIndex((c: Client) => c.id === client.id);
      let updatedClients;
      
      if (existingIndex >= 0) {
        updatedClients = [...clients];
        updatedClients[existingIndex] = client;
      } else {
        updatedClients = [...clients, client];
      }
      
      setClients(updatedClients);
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Erro ao salvar cliente');
    }
  };

  const findClientByPhone = (phone: string): Client | null => {
    const clients = getClients();
    return clients.find(c => c.phone === phone && c.designerId === designer.id) || null;
  };

  const findClientsByName = (name: string): Client[] => {
    if (name.length < 1) return [];
    
    const clients = getClients();
    const searchTerm = name.toLowerCase().trim();
    
    // Buscar por nome ou telefone
    const matchingClients = clients.filter(c => 
      c.designerId === designer.id && (
        c.name.toLowerCase().includes(searchTerm) ||
        c.phone.includes(searchTerm)
      )
    );
    
    // Ordenar por relevância: primeiro os que começam com o termo, depois os que contêm
    // E também por data do último agendamento (mais recentes primeiro)
    return matchingClients.sort((a, b) => {
      const aNameStartsWith = a.name.toLowerCase().startsWith(searchTerm);
      const bNameStartsWith = b.name.toLowerCase().startsWith(searchTerm);
      
      // Priorizar nomes que começam com o termo
      if (aNameStartsWith && !bNameStartsWith) return -1;
      if (!aNameStartsWith && bNameStartsWith) return 1;
      
      // Se ambos começam ou ambos não começam, ordenar por último agendamento
      const aDate = a.lastAppointment ? new Date(a.lastAppointment).getTime() : 0;
      const bDate = b.lastAppointment ? new Date(b.lastAppointment).getTime() : 0;
      
      return bDate - aDate; // Mais recentes primeiro
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
      const clientId = existingClient?.id || Date.now().toString();
      const client: Client = {
        id: clientId,
        name: newClientData.name,
        phone: newClientData.phone,
        email: newClientData.email,
        designerId: designer.id,
        createdAt: existingClient?.createdAt || new Date().toISOString(),
        lastAppointment: new Date().toISOString()
      };
      
      await saveClient(client);

      // Save appointment
      const appointment: Appointment = {
        id: (Date.now() + 1).toString(),
        designerId: designer.id,
        clientName: newClientData.name,
        clientPhone: newClientData.phone,
        service: newClientData.service,
        date: newClientData.date,
        time: newClientData.time,
        price: parseFloat(newClientData.price),
        createdAt: new Date().toISOString()
      };

      await createAppointment(appointment);
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
      
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError('Erro ao criar agendamento');
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
      await updateNailDesigner(designer.id, { pixKey });
      setShowPixModal(false);
    } catch (err) {
      console.error('Erro ao atualizar chave PIX:', err);
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

  const handleNameChange = (name: string) => {
    setNewClientData(prev => ({ ...prev, name }));
    
    if (name.length >= 1) {
      const suggestions = findClientsByName(name);
      if (suggestions.length > 0) {
        setNameSuggestions(suggestions);
        setShowNameSuggestions(true);
      } else {
        setNameSuggestions([]);
        setShowNameSuggestions(false);
      }
    } else {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
    }
  };

  const selectClientFromName = (client: Client) => {
    setNewClientData(prev => ({
      ...prev,
      name: client.name,
      phone: client.phone,
      email: client.email
    }));
    setExistingClient(client);
    setShowNameSuggestions(false);
    setNameSuggestions([]);
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
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);
  const upcomingAppointments = appointments.filter(apt => apt.date > selectedDate);
  
  // Get next 7 days appointments
  const nextWeekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date + 'T00:00:00');
    const today = new Date(selectedDate);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    return aptDate > today && aptDate <= nextWeek;
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
                <input
                  type="text"
                  ref={nameInputRef}
                  value={newClientData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Nome da cliente"
                />
                
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
                      const completedAppointments = clientAppointments.filter(apt => apt.status === 'completed' || !apt.status);
                      
                      return (
                        <button
                          key={client.id}
                          type="button"
                          onClick={() => selectClientFromName(client)}
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
                                {client.lastAppointment ? 
                                  new Date(client.lastAppointment).toLocaleDateString('pt-BR') : 
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
                <input
                  type="tel"
                  value={newClientData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="(11) 99999-9999"
                />
                
                {/* Client Suggestion */}
                {showClientSuggestion && existingClient && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Cliente encontrado: {existingClient.name}
                        </p>
                        <p className="text-xs text-blue-600">
                          Último agendamento: {existingClient.lastAppointment ? 
                            new Date(existingClient.lastAppointment).toLocaleDateString('pt-BR') : 
                            'Nunca'
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={useExistingClientData}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Usar Dados
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={newClientData.email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Serviço *</label>
                <input
                  type="text"
                  value={newClientData.service}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, service: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Esmaltação, Alongamento..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                  <input
                    type="date"
                    value={newClientData.date}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário *</label>
                  <input
                    type="time"
                    value={newClientData.time}
                    onChange={(e) => setNewClientData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
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
                  placeholder="Digite sua chave PIX (CPF, email, telefone ou chave aleatória)"
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
                className={`flex-1 p-3 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  confirmAction.type === 'approve' 
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
      <div className={`backdrop-blur-md rounded-xl p-4 shadow-sm border ${
        designer.isActive 
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
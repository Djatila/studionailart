import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Phone, Mail, Calendar, CheckCircle, XCircle, Clock, Eye, Key, RotateCcw } from 'lucide-react';
import { NailDesigner, Appointment } from '../App';
import { getClients } from '../utils/supabaseUtils';
import { supabase } from '../lib/supabase';

interface RegisteredClient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password: string;
  createdAt: string;
}

interface ClientsManagerProps {
  designer: NailDesigner;
  onBack: () => void;
}

export default function ClientsManager({ designer, onBack }: ClientsManagerProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'serviced' | 'missed' | 'no_show' | 'new_registrations'>('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<RegisteredClient | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [clients, setClients] = useState<RegisteredClient[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar clientes do Supabase + localStorage
  const loadClients = async () => {
    try {
      setLoading(true);
      // Use the updated getClients function that already combines Supabase and localStorage
      const allClients = await getClients();
      setClients(allClients);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      // Fallback para localStorage apenas
      const localClients = JSON.parse(localStorage.getItem('registered_clients') || '[]');
      setClients(localClients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Função para obter todos os nail designers
  const getAllDesigners = (): NailDesigner[] => {
    const saved = localStorage.getItem('nail_designers');
    return saved ? JSON.parse(saved) : [];
  };

  // Função para obter todos os agendamentos (não filtrados por designer)
  const getAllAppointments = (): Appointment[] => {
    const saved = localStorage.getItem('nail_appointments');
    return saved ? JSON.parse(saved) : [];
  };

  // Função para obter clientes cadastrados (do estado que já inclui Supabase + localStorage)
  const getRegisteredClients = (): RegisteredClient[] => {
    return clients;
  };

  // Função para salvar clientes no localStorage e atualizar estado
  const saveRegisteredClients = (updatedClients: RegisteredClient[]) => {
    localStorage.setItem('registered_clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
  };

  // Função para resetar senha de um cliente
  const resetClientPassword = (clientId: string, newPassword: string) => {
    const clients = getRegisteredClients();
    const updatedClients = clients.map(client => 
      client.id === clientId ? { ...client, password: newPassword } : client
    );
    saveRegisteredClients(updatedClients);
  };

  // Função para abrir modal de senha
  const openPasswordModal = (client: RegisteredClient) => {
    setSelectedClient(client);
    setShowPasswordModal(true);
    setShowPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  // Função para fechar modal de senha
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedClient(null);
    setShowPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  // Função para alterar senha
  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) return;
    
    if (newPassword.length < 4) {
      setPasswordError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }
    
    resetClientPassword(selectedClient.id, newPassword);
    setPasswordSuccess(true);
    setPasswordError('');
    
    // Fechar modal após 2 segundos
    setTimeout(() => {
      closePasswordModal();
      // Forçar atualização da lista
      window.dispatchEvent(new Event('storage'));
    }, 2000);
  };

  // Função para obter agendamentos
  const getAppointments = (): Appointment[] => {
    const saved = localStorage.getItem('nail_appointments');
    const allAppointments = saved ? JSON.parse(saved) : [];
    return allAppointments.filter((apt: Appointment) => apt.designerId === designer.id);
  };

  // Obter mês atual
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  const registeredClients = getRegisteredClients();
  const appointments = getAppointments();
  const currentMonth = getCurrentMonth();

  // Filtrar agendamentos do mês atual
  const currentMonthAppointments = appointments.filter(apt => 
    apt.date.startsWith(currentMonth)
  );

  // Clientes que fizeram serviço no mês atual (agendamentos com status 'completed')
  const servicedClients = registeredClients.filter(client => 
    currentMonthAppointments.some(apt => 
      apt.clientPhone === client.phone && 
      apt.status === 'completed'
    )
  );

  // Clientes que faltaram (tinham agendamento mas não compareceram - status 'missed')
  const missedClients = registeredClients.filter(client => 
    currentMonthAppointments.some(apt => 
      apt.clientPhone === client.phone && 
      apt.status === 'missed'
    )
  );

  // Clientes que não apareceram no mês (não têm nenhum agendamento no mês atual)
  const noShowClients = registeredClients.filter(client => 
    !currentMonthAppointments.some(apt => apt.clientPhone === client.phone)
  );

  // Cadastros novos (últimos 30 dias)
  const getNewRegistrations = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return registeredClients.filter(client => {
      const registrationDate = new Date(client.createdAt);
      return registrationDate >= thirtyDaysAgo;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getAppointmentsByDesigner = () => {
    const allDesigners = getAllDesigners();
    const allAppointments = getAllAppointments();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const appointmentsByDesigner: { [key: string]: { designer: NailDesigner; appointments: Appointment[] } } = {};
    
    allDesigners.forEach(designer => {
      appointmentsByDesigner[designer.id] = {
        designer,
        appointments: allAppointments.filter(appointment => 
          appointment.designerId === designer.id &&
          new Date(appointment.date + 'T00:00:00').getMonth() === currentMonth &&
        new Date(appointment.date + 'T00:00:00').getFullYear() === currentYear
        )
      };
    });
    
    return appointmentsByDesigner;
  };

  const newRegistrations = getNewRegistrations();

  // Função para obter estatísticas de um cliente
  const getClientStats = (client: RegisteredClient) => {
    const clientAppointments = appointments.filter(apt => apt.clientPhone === client.phone);
    const currentMonthClientAppointments = currentMonthAppointments.filter(apt => apt.clientPhone === client.phone);
    
    return {
      totalAppointments: clientAppointments.length,
      currentMonthAppointments: currentMonthClientAppointments.length,
      lastAppointment: clientAppointments.length > 0 
        ? clientAppointments[clientAppointments.length - 1].date 
        : null
    };
  };

  const getFilteredClients = () => {
    switch (activeTab) {
      case 'serviced':
        return servicedClients;
      case 'missed':
        return missedClients;
      case 'no_show':
        return noShowClients;
      case 'new_registrations':
        return newRegistrations;
      default:
        return registeredClients;
    }
  };

  const filteredClients = getFilteredClients();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold text-white">Clientes Cadastrados</h1>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Total de Clientes</p>
              <p className="text-2xl font-bold text-white">{registeredClients.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Atendidas este Mês</p>
              <p className="text-2xl font-bold text-white">{servicedClients.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Faltaram este Mês</p>
              <p className="text-2xl font-bold text-white">{missedClients.length}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Não Apareceram</p>
              <p className="text-2xl font-bold text-white">{noShowClients.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm">Cadastros Novos</p>
              <p className="text-2xl font-bold text-white">{newRegistrations.length}</p>
            </div>
            <Users className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            Todas ({registeredClients.length})
          </button>
          <button
            onClick={() => setActiveTab('serviced')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-all ${
              activeTab === 'serviced'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Atendidas ({servicedClients.length})
          </button>
          <button
            onClick={() => setActiveTab('missed')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-all ${
              activeTab === 'missed'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Faltaram ({missedClients.length})
          </button>
          <button
            onClick={() => setActiveTab('no_show')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-all ${
              activeTab === 'no_show'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            Não Apareceram ({noShowClients.length})
          </button>
          <button
            onClick={() => setActiveTab('new_registrations')}
            className={`flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-all ${
              activeTab === 'new_registrations'
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-purple-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            Cadastros Novos ({newRegistrations.length})
          </button>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="p-4 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white">
            {activeTab === 'all' && 'Todas as Clientes Cadastradas'}
            {activeTab === 'serviced' && 'Clientes Atendidas este Mês'}
            {activeTab === 'missed' && 'Clientes que Faltaram este Mês'}
            {activeTab === 'no_show' && 'Clientes que Não Apareceram este Mês'}
            {activeTab === 'new_registrations' && 'Cadastros Novos (Últimos 30 dias)'}
          </h3>
        </div>
        
        <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <p className="text-purple-200">
                {activeTab === 'all' && 'Nenhuma cliente cadastrada ainda'}
                {activeTab === 'serviced' && 'Nenhuma cliente atendida este mês'}
                {activeTab === 'missed' && 'Nenhuma cliente faltou este mês'}
                {activeTab === 'no_show' && 'Todas as clientes apareceram este mês'}
                {activeTab === 'new_registrations' && 'Nenhum cadastro novo nos últimos 30 dias'}
              </p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const stats = getClientStats(client);
              const isServiced = servicedClients.some(sc => sc.phone === client.phone);
              const isMissed = missedClients.some(mc => mc.phone === client.phone);
              const isNoShow = noShowClients.some(nc => nc.phone === client.phone);
              
              return (
                <div key={client.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-white">{client.name}</h4>
                        {isServiced && (
                          <CheckCircle className="w-4 h-4 text-green-400" title="Atendida este mês" />
                        )}
                        {isMissed && (
                          <XCircle className="w-4 h-4 text-red-400" title="Faltou este mês" />
                        )}
                        {isNoShow && (
                          <Clock className="w-4 h-4 text-orange-400" title="Não apareceu este mês" />
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-purple-200">
                          <Phone className="w-4 h-4" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-purple-200">
                            <Mail className="w-4 h-4" />
                            {client.email}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-purple-200">
                          <Calendar className="w-4 h-4" />
                          Cadastrada em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {stats.lastAppointment && (
                          <div className="flex items-center gap-2 text-sm text-purple-200">
                            <Clock className="w-4 h-4" />
                            Último agendamento: {new Date(stats.lastAppointment).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                        {activeTab === 'new_registrations' && (
                          <div className="flex items-center gap-2 text-sm text-cyan-200">
                            <Users className="w-4 h-4" />
                            Data de cadastro: {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-purple-200 mb-3">
                        <p>Total: {stats.totalAppointments} agendamentos</p>
                        <p>Este mês: {stats.currentMonthAppointments}</p>
                      </div>
                      
                      {/* Botões de ação para senhas */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPasswordModal(client)}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
                          title="Gerenciar senha"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Agendamentos por Designer */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Agendamentos por Nail Designer (Este Mês)</h3>
        
        {Object.entries(getAppointmentsByDesigner()).map(([designerId, { designer, appointments }]) => (
          <div key={designerId} className="mb-6 last:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {designer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-medium text-white">{designer.name}</h4>
                <p className="text-sm text-purple-200">{appointments.length} agendamentos</p>
              </div>
            </div>
            
            {appointments.length === 0 ? (
              <p className="text-purple-200 text-sm ml-13">Nenhum agendamento este mês</p>
            ) : (
              <div className="ml-13 space-y-2">
                {appointments.map((appointment) => {
                  const client = registeredClients.find(c => c.phone === appointment.clientPhone);
                  return (
                    <div key={appointment.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">{client?.name || appointment.clientPhone}</p>
                          <p className="text-sm text-purple-200">
                            {new Date(appointment.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appointment.time}
                          </p>
                          <p className="text-sm text-purple-200">{appointment.service}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            appointment.status === 'missed' ? 'bg-red-500/20 text-red-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {appointment.status === 'completed' ? 'Concluído' :
                             appointment.status === 'missed' ? 'Faltou' : 'Agendado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal de Gerenciamento de Senhas */}
      {showPasswordModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-center text-white mb-6">
              Gerenciar Senha - {selectedClient.name}
            </h2>
            
            {passwordSuccess ? (
              <div className="text-center space-y-4">
                <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4">
                  <p className="text-green-200 text-sm">
                    ✅ <strong>Senha alterada com sucesso!</strong><br/>
                    A cliente já pode fazer login com a nova senha.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Visualizar senha atual */}
                <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-yellow-200">
                      Senha Atual:
                    </label>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-yellow-300 hover:text-yellow-100 transition-colors"
                      title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-white font-mono text-lg">
                    {showPassword ? selectedClient.password : '••••••••'}
                  </p>
                </div>
                
                {/* Formulário para nova senha */}
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-100 mb-2">
                      Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                      placeholder="Digite a nova senha"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-100 mb-2">
                      Confirmar Nova Senha *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                      placeholder="Confirme a nova senha"
                      required
                    />
                  </div>
                  
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-1">{passwordError}</p>
                  )}
                  
                  <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-3 mb-4">
                    <p className="text-blue-200 text-sm">
                      🔐 <strong>Importante:</strong> A cliente precisará usar a nova senha para fazer login no sistema.
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closePasswordModal}
                      className="flex-1 p-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!newPassword || !confirmPassword}
                      className="flex-1 p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Alterar Senha
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a cliente ${clientName}? Esta ação é irreversível.`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId);

        if (error) {
          throw error;
        }

        // Atualiza a lista de clientes após a exclusão
        setRegisteredClients(prevClients => prevClients.filter(client => client.id !== clientId));
        alert(`Cliente ${clientName} excluída com sucesso!`);
      } catch (err: any) {
        console.error('Erro ao excluir cliente:', err.message);
        setError('Erro ao excluir cliente. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };
};

export default ClientsManager;
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Calendar, TrendingUp, Shield, UserCheck, UserX, Eye, Settings, BarChart3, Clock, Phone, Mail, Trash2, CheckCircle, XCircle, Plus, User, Key, RotateCcw } from 'lucide-react';
import { NailDesigner, Appointment, Service } from '../App';
import {
  getNailDesigners,
  createNailDesigner,
  updateNailDesigner,
  deleteNailDesigner,
  getAppointments,
  deleteAppointment,
  getServices,
  deleteService,
  getClients,
  updateClient
} from '../utils/supabaseUtils';

interface SuperAdminDashboardProps {
  onBack: () => void;
}

export default function SuperAdminDashboard({ onBack }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'designers' | 'appointments' | 'pending' | 'clients'>('overview');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<NailDesigner | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDesigner, setNewDesigner] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  // Estados para dados do Supabase
  const [designers, setDesigners] = useState<NailDesigner[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para gerenciamento de senhas dos clientes
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [designersData, appointmentsData, servicesData, clientsData] = await Promise.all([
        getNailDesigners(),
        getAppointments(),
        getServices(),
        getClients()
      ]);
      
      setDesigners(designersData);
      setAppointments(appointmentsData);
      setServices(servicesData);
      setClients(clientsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciar dados
  const getAllDesigners = (): NailDesigner[] => {
    return designers;
  };

  const getPendingDesigners = (): NailDesigner[] => {
    return designers.filter(d => !d.isActive && d.status === 'pending');
  };

  const getAllAppointments = (): Appointment[] => {
    return appointments;
  };

  const getAllServices = (): Service[] => {
    return services;
  };

  const approveDesigner = async (designerId: string) => {
    try {
      setLoading(true);
      await updateNailDesigner(designerId, { isActive: true, status: 'approved' });
      await loadAllData(); // Recarregar dados
    } catch (err) {
      console.error('Erro ao aprovar designer:', err);
      setError('Erro ao aprovar designer');
    } finally {
      setLoading(false);
    }
  };

  const rejectDesigner = async (designerId: string) => {
    try {
      setLoading(true);
      await deleteNailDesigner(designerId);
      await loadAllData(); // Recarregar dados
    } catch (err) {
      console.error('Erro ao rejeitar designer:', err);
      setError('Erro ao rejeitar designer');
    } finally {
      setLoading(false);
    }
  };

  const toggleDesignerStatus = async (designerId: string) => {
    try {
      setLoading(true);
      const designer = designers.find(d => d.id === designerId);
      if (designer) {
        await updateNailDesigner(designerId, { isActive: !designer.isActive });
        await loadAllData(); // Recarregar dados
      }
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      setError('Erro ao alterar status do designer');
    } finally {
      setLoading(false);
    }
  };

  const deleteDesigner = async (designerId: string) => {
    if (confirm('Tem certeza que deseja excluir esta nail designer? Esta ação não pode ser desfeita.')) {
      try {
        setLoading(true);
        
        // Remover agendamentos relacionados
        const designerAppointments = allAppointments.filter(a => a.designerId === designerId);
        for (const appointment of designerAppointments) {
          await deleteAppointment(appointment.id);
        }
        
        // Remover serviços relacionados
        const designerServices = services.filter(s => s.designerId === designerId);
        for (const service of designerServices) {
          await deleteService(service.id);
        }
        
        // Remover designer
        await deleteNailDesigner(designerId);
        await loadAllData(); // Recarregar dados
      } catch (err) {
        console.error('Erro ao excluir designer:', err);
        setError('Erro ao excluir designer');
      } finally {
        setLoading(false);
      }
    }
  };

  const createNewDesigner = async () => {
    if (!newDesigner.name || !newDesigner.phone || !newDesigner.email || !newDesigner.password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Verificar se email já existe
    if (designers.some(d => d.email === newDesigner.email)) {
      setError('Este email já está cadastrado no sistema.');
      return;
    }

    try {
      setLoading(true);
      
      const designer: Omit<NailDesigner, 'id'> = {
        name: newDesigner.name,
        phone: newDesigner.phone,
        email: newDesigner.email,
        password: newDesigner.password,
        isActive: true,
        status: 'approved'
      };

      await createNailDesigner(designer);
      await loadAllData(); // Recarregar dados

      // Limpar formulário
      setNewDesigner({ name: '', phone: '', email: '', password: '' });
      setShowCreateForm(false);
      
      alert('Nail designer criada com sucesso!');
    } catch (err) {
      console.error('Erro ao criar designer:', err);
      setError('Erro ao criar designer');
    } finally {
      setLoading(false);
    }
  };

  // Funções para gerenciamento de senhas dos clientes
  const resetClientPassword = async (clientPhone: string, newPassword: string) => {
    try {
      const client = clients.find((c: any) => c.phone === clientPhone);
      if (client) {
        await updateClient(client.id, { password: newPassword });
        await loadAllData(); // Recarregar dados
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      setError('Erro ao alterar senha do cliente');
      return false;
    }
  };

  const openPasswordModal = (client: any) => {
    setSelectedClient(client);
    setShowPasswordModal(true);
    setShowPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setSelectedClient(null);
    setShowPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const handlePasswordReset = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError('Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);
      const success = await resetClientPassword(selectedClient.phone, newPassword);
      
      if (success) {
        setPasswordSuccess(true);
        setPasswordError('');
        setTimeout(() => {
          closePasswordModal();
        }, 2000);
      } else {
        setPasswordError('Erro ao alterar a senha. Tente novamente.');
      }
    } catch (err) {
      setPasswordError('Erro ao alterar a senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Dados para estatísticas
  const pendingDesigners = getPendingDesigners();
  const allAppointments = getAllAppointments();
  const allServices = getAllServices();
  
  const activeDesigners = designers.filter(d => d.isActive);
  const inactiveDesigners = designers.filter(d => !d.isActive);
  
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = allAppointments.filter(a => a.date === today);
  
  const totalRevenue = allAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const monthlyRevenue = allAppointments.filter(apt => {
    const aptDate = new Date(apt.date + 'T00:00:00');
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
  }).reduce((sum, apt) => sum + apt.price, 0);

  // Estatísticas por designer
  const designerStats = designers.map(designer => {
    const designerAppointments = allAppointments.filter(a => a.designerId === designer.id);
    const designerRevenue = designerAppointments.reduce((sum, apt) => sum + apt.price, 0);
    const todayCount = designerAppointments.filter(a => a.date === today).length;
    
    return {
      ...designer,
      totalAppointments: designerAppointments.length,
      totalRevenue: designerRevenue,
      todayAppointments: todayCount
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Indicador de Erro */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/90 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError('')}
              className="ml-3 text-white hover:text-red-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Indicador de Carregamento */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <span className="text-white font-medium">Carregando...</span>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <nav className="bg-black/20 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-yellow-400" />
                <h1 className="text-xl font-bold text-white drop-shadow-lg">
                  Orbital Admin
                </h1>
              </div>
            </div>
            <div className="text-sm text-purple-200">
              Controle Total do Sistema
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('designers')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'designers'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Nail Designers ({activeDesigners.length})
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Agendamentos ({allAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap relative ${
              activeTab === 'pending'
                ? 'bg-white/20 text-white'
                : 'text-purple-200 hover:bg-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4 inline mr-2" />
            Pendentes
            {pendingDesigners.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingDesigners.length}
              </span>
            )}
          </button>
          <button
             onClick={() => setActiveTab('clients')}
             className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
               activeTab === 'clients'
                 ? 'bg-white/20 text-white'
                 : 'text-purple-200 hover:bg-white/10'
             }`}
           >
             <User className="w-4 h-4 inline mr-2" />
             Clientes Cadastradas
           </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">Nail Designers Ativas</p>
                    <p className="text-2xl font-bold text-white">{activeDesigners.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">Agendamentos Hoje</p>
                    <p className="text-2xl font-bold text-white">{todayAppointments.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">Receita Total</p>
                    <p className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm">Receita Mensal</p>
                    <p className="text-2xl font-bold text-white">R$ {monthlyRevenue.toFixed(2)}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-pink-400" />
                </div>
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
              <div className="space-y-3">
                {designerStats.slice(0, 5).map((designer, index) => (
                  <div key={designer.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-purple-600 text-white'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{designer.name}</p>
                        <p className="text-sm text-purple-200">{designer.totalAppointments} agendamentos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">R$ {designer.totalRevenue.toFixed(2)}</p>
                      <p className="text-sm text-purple-200">{designer.todayAppointments} hoje</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Designers Tab */}
        {activeTab === 'designers' && (
          <div className="space-y-4">
            {/* Botão Criar Nova Designer */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <Plus size={16} />
                Criar Nova Designer
              </button>
            </div>

            {/* Formulário de Criação */}
            {showCreateForm && (
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User size={20} />
                    Criar Nova Nail Designer
                  </h3>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={newDesigner.name}
                      onChange={(e) => setNewDesigner({ ...newDesigner, name: e.target.value })}
                      className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite o nome completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Celular
                    </label>
                    <input
                      type="tel"
                      value={newDesigner.phone}
                      onChange={(e) => setNewDesigner({ ...newDesigner, phone: e.target.value })}
                      className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={newDesigner.email}
                      onChange={(e) => setNewDesigner({ ...newDesigner, email: e.target.value })}
                      className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={newDesigner.password}
                      onChange={(e) => setNewDesigner({ ...newDesigner, password: e.target.value })}
                      className="w-full p-3 bg-black/30 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Digite uma senha segura"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={createNewDesigner}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Criando...' : 'Criar Designer'}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="p-4 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Gerenciar Nail Designers</h3>
              </div>
              <div className="divide-y divide-white/10">
                {designers.map((designer) => {
                  const stats = designerStats.find(s => s.id === designer.id);
                  return (
                    <div key={designer.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            designer.isActive ? 'bg-green-400' : 'bg-red-400'
                          }`}></div>
                          <div>
                            <h4 className="font-medium text-white">{designer.name}</h4>
                            <p className="text-sm text-purple-200">{designer.email}</p>
                            <p className="text-sm text-purple-200">{designer.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-white">{stats?.totalAppointments || 0} agendamentos</p>
                            <p className="text-sm text-purple-200">R$ {stats?.totalRevenue.toFixed(2) || '0.00'}</p>
                            <p className="text-xs text-purple-300">{stats?.todayAppointments || 0} hoje</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleDesignerStatus(designer.id)}
                              disabled={loading}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                designer.isActive
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={designer.isActive ? 'Desativar' : 'Ativar'}
                            >
                              {designer.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button
                              onClick={() => deleteDesigner(designer.id)}
                              disabled={loading}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {designers.length === 0 && (
                  <div className="p-8 text-center text-purple-200">
                    Nenhuma nail designer cadastrada ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="p-4 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Todos os Agendamentos</h3>
              </div>
              <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
                {allAppointments.slice().reverse().map((appointment) => {
                  const designer = designers.find(d => d.id === appointment.designerId);
                  return (
                    <div key={appointment.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{appointment.clientName}</h4>
                          <p className="text-sm text-purple-200">{appointment.service}</p>
                          <p className="text-sm text-purple-300">
                            {designer?.name || 'Designer não encontrada'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-white">{appointment.date} às {appointment.time}</p>
                          <p className="text-sm text-green-400">R$ {appointment.price.toFixed(2)}</p>
                          <p className="text-xs text-purple-300">{appointment.clientPhone}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {allAppointments.length === 0 && (
                  <div className="p-8 text-center text-purple-200">
                    Nenhum agendamento encontrado.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
              <div className="p-4 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white">Aprovações Pendentes</h3>
                <p className="text-sm text-purple-200">Nail designers aguardando aprovação para entrar no sistema</p>
              </div>
              <div className="divide-y divide-white/10">
                {pendingDesigners.map((designer) => (
                  <div key={designer.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">{designer.name}</h4>
                        <p className="text-sm text-purple-200">{designer.email}</p>
                        <p className="text-sm text-purple-200">{designer.phone}</p>
                        <p className="text-xs text-purple-300">
                          Solicitado em: {new Date(designer.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => approveDesigner(designer.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle size={16} />
                          {loading ? 'Aprovando...' : 'Aprovar'}
                        </button>
                        <button
                          onClick={() => rejectDesigner(designer.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle size={16} />
                          {loading ? 'Rejeitando...' : 'Rejeitar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingDesigners.length === 0 && (
                  <div className="p-8 text-center text-purple-200">
                    Nenhuma solicitação pendente.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-6">Todos os Clientes Cadastrados</h2>
              
              {(() => {
                // Use clients from state (already loaded from Supabase + localStorage)
                const registeredClients = clients;
                const allAppointments = appointments;
                
                // Get current month appointments
                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();
                const currentMonthAppointments = allAppointments.filter(appointment => {
                  const appointmentDate = new Date(appointment.date + 'T00:00:00');
                  return appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear;
                });
                
                // Calculate statistics
                const totalClients = registeredClients.length;
                const servicedClients = registeredClients.filter(client => 
                  currentMonthAppointments.some(apt => apt.clientPhone === client.phone && apt.status === 'completed')
                );
                const missedClients = registeredClients.filter(client => 
                  currentMonthAppointments.some(apt => apt.clientPhone === client.phone && apt.status === 'missed')
                );
                const noShowClients = registeredClients.filter(client => 
                  !currentMonthAppointments.some(apt => apt.clientPhone === client.phone)
                );
                
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const newRegistrations = registeredClients.filter(client => 
                  new Date(client.createdAt) >= thirtyDaysAgo
                );
                
                return (
                  <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-200 text-sm">Total</p>
                            <p className="text-2xl font-bold text-white">{totalClients}</p>
                          </div>
                          <User className="w-8 h-8 text-blue-400" />
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-200 text-sm">Atendidas</p>
                            <p className="text-2xl font-bold text-white">{servicedClients.length}</p>
                          </div>
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-200 text-sm">Faltaram</p>
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
                    
                    {/* Clients List */}
                    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <div className="p-4 border-b border-white/20">
                        <h3 className="text-lg font-semibold text-white">Lista de Clientes</h3>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {registeredClients.length === 0 ? (
                          <div className="p-8 text-center text-purple-200">
                            Nenhuma cliente cadastrada ainda.
                          </div>
                        ) : (
                          registeredClients.map((client: any) => {
                            const isServiced = servicedClients.some((sc: any) => sc.phone === client.phone);
                            const isMissed = missedClients.some((mc: any) => mc.phone === client.phone);
                            const isNoShow = noShowClients.some((nc: any) => nc.phone === client.phone);
                            const isNewRegistration = newRegistrations.some((nr: any) => nr.phone === client.phone);
                            
                            return (
                              <div key={client.id} className="p-4 hover:bg-white/5 transition-colors border-b border-white/10 last:border-b-0">
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
                                      {isNewRegistration && (
                                        <Users className="w-4 h-4 text-cyan-400" title="Cadastro novo" />
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
                                    </div>
                                  </div>
                                  
                                  {/* Botão de gerenciar senha */}
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => openPasswordModal(client)}
                                      className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                      title="Gerenciar senha"
                                    >
                                      <Key className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Gerenciamento de Senhas */}
      {showPasswordModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">
              Gerenciar Senha - {selectedClient.name}
            </h3>
            
            {/* Senha atual */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Senha Atual
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={selectedClient.password}
                  readOnly
                  className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-3 text-purple-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nova senha */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Nova Senha
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                placeholder="Digite a nova senha"
              />
            </div>

            {/* Confirmar senha */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300"
                placeholder="Confirme a nova senha"
              />
            </div>

            {/* Mensagens */}
            {passwordError && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-200 text-sm">Senha alterada com sucesso!</p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={closePasswordModal}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordReset}
                disabled={passwordSuccess || loading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
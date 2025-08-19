import React, { useState, useEffect } from 'react';
import { Sparkles, User, UserPlus, Palette, Eye, EyeOff, Shield } from 'lucide-react';
import { NailDesigner } from '../App';
import { 
  getNailDesigners, 
  createNailDesigner, 
  updateNailDesigner,
  getNailDesignerByPhone,
  getNailDesignerById 
} from '../utils/supabaseUtils';

interface LoginPageProps {
  onLogin: (designer: NailDesigner, asClient?: boolean) => void;
  onSuperAdminLogin?: () => void;
}

export default function LoginPage({ onLogin, onSuperAdminLogin }: LoginPageProps) {
  const [showRegister, setShowRegister] = useState(false);
  const [showDesignerLogin, setShowDesignerLogin] = useState(false);
  const [showClientLogin, setShowClientLogin] = useState(false);
  const [showClientRegister, setShowClientRegister] = useState(false);
  const [showSuperAdmin, setShowSuperAdmin] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [loginError, setLoginError] = useState('');
  const [superAdminCredentials, setSuperAdminCredentials] = useState({ username: '', password: '' });
  const [orbitalClickCount, setOrbitalClickCount] = useState(0);
  const [lastOrbitalClick, setLastOrbitalClick] = useState(0);
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [clientLoginError, setClientLoginError] = useState('');
  const [clientRegisterData, setClientRegisterData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });
  const [clientRegisterError, setClientRegisterError] = useState('');
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryPhone, setRecoveryPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [designers, setDesigners] = useState<NailDesigner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDesigners();
  }, []);

  const loadDesigners = async () => {
    try {
      setLoading(true);
      const designersData = await getNailDesigners();
      setDesigners(designersData.filter(d => d.isActive));
    } catch (error) {
      console.error('Erro ao carregar designers:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDesigner = async (designer: NailDesigner) => {
    try {
      // Salvar como pendente para aprovação do super-admin
      const newDesigner = { ...designer, isActive: false };
      await createNailDesigner(newDesigner);
      return true;
    } catch (error) {
      console.error('Erro ao salvar designer:', error);
      return false;
    }
  };

  const handleDesignerAreaClick = () => {
    const now = Date.now();
    
    // Reset counter if more than 2 seconds passed since last click
    if (now - lastClickTime > 2000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(now);
    
    if (clickCount >= 3) { // Will be 4 after this click
      setShowRegister(true);
      setClickCount(0);
    } else if (clickCount === 0) {
      setShowDesignerLogin(true);
    }
  };

  const handleDesignerAreaLongPress = () => {
    setShowAccessDenied(true);
    setTimeout(() => setShowAccessDenied(false), 3000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (formData.password.length < 4) {
      alert('A senha deve ter pelo menos 4 caracteres!');
      return;
    }
    
    setLoading(true);
    
    const newDesigner: NailDesigner = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
      isActive: false, // Inativo até aprovação
      createdAt: new Date().toISOString()
    };
    
    const success = await saveDesigner(newDesigner);
    
    setLoading(false);
    
    if (success) {
      // Mostrar mensagem de sucesso e voltar para login
      alert('Cadastro realizado com sucesso! Aguarde a aprovação do administrador para acessar o sistema.');
      setShowRegister(false);
      setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
    } else {
      alert('Erro ao realizar cadastro. Tente novamente.');
    }
  };

  const handleDesignerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      const designer = await getNailDesignerById(selectedDesigner);
      
      if (designer && designer.password === password) {
        if (!designer.isActive) {
          setLoginError('Esta conta foi desativada.');
          return;
        }
        onLogin(designer);
      } else {
        setLoginError('Senha incorreta!');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperContact = () => {
    const message = `Olá Átila! Vim através do app Irmãs Nail Art e gostaria de conversar sobre desenvolvimento de sistemas.`;
    const whatsappUrl = `https://wa.me/5573988821486?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleIconClick = () => {
    const now = Date.now();
    
    // Reset counter if more than 3 seconds passed since last click
    if (now - lastOrbitalClick > 3000) {
      setOrbitalClickCount(1);
    } else {
      setOrbitalClickCount(prev => prev + 1);
    }
    
    setLastOrbitalClick(now);
    
    // Se clicar 4 vezes seguidas, abre acesso orbital
    if (orbitalClickCount >= 3) { // Will be 4 after this click
      setShowSuperAdmin(true);
      setOrbitalClickCount(0);
    }
  };

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Credenciais do super admin orbital
    if (superAdminCredentials.username === 'Atila' && superAdminCredentials.password === 'admin123') {
      if (onSuperAdminLogin) {
        onSuperAdminLogin();
      }
    } else {
      setLoginError('Credenciais de acesso orbital inválidas!');
    }
  };

  const getClients = async () => {
    try {
      // Buscar clientes do Supabase
      const designers = await getNailDesigners();
      const supabaseClients = designers.filter(d => d.email?.includes('client-') || d.id?.includes('client-'));
      
      // Buscar clientes do localStorage
      const localClients = JSON.parse(localStorage.getItem('registered_clients') || '[]');
      
      // Combinar e remover duplicatas (priorizar Supabase)
      const allClients = [...supabaseClients];
      
      localClients.forEach((localClient: any) => {
        const existsInSupabase = supabaseClients.some(sc => sc.phone === localClient.phone);
        if (!existsInSupabase) {
          allClients.push(localClient);
        }
      });
      
      return allClients;
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      // Se falhar o Supabase, retornar apenas do localStorage
      return JSON.parse(localStorage.getItem('registered_clients') || '[]');
    }
  };

  const saveClient = async (client: any) => {
    try {
      // Salvar no Supabase
      const existingClient = await getNailDesignerByPhone(client.phone);
      
      if (existingClient) {
        // Atualizar cliente existente
        await updateNailDesigner(existingClient.id, client);
      } else {
        // Criar novo cliente
        await createNailDesigner(client);
      }
      
      // Também salvar no localStorage para compatibilidade
      const registeredClients = JSON.parse(localStorage.getItem('registered_clients') || '[]');
      const existingIndex = registeredClients.findIndex((c: any) => c.phone === client.phone);
      
      const clientData = {
        id: client.id,
        name: client.name,
        phone: client.phone,
        email: client.email,
        password: client.password,
        createdAt: client.createdAt
      };
      
      if (existingIndex >= 0) {
        registeredClients[existingIndex] = clientData;
      } else {
        registeredClients.push(clientData);
      }
      
      localStorage.setItem('registered_clients', JSON.stringify(registeredClients));
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      return false;
    }
  };

  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setClientLoginError('');
    
    try {
      // Verificar se o cliente existe no sistema de cadastros
      const clients = await getClients();
      const client = clients.find((c: any) => c.phone === clientPhone && c.password === clientPassword);
      
      if (client) {
        // Login bem-sucedido
        const clientData = {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email,
          password: client.password,
          isActive: true,
          createdAt: client.createdAt
        };
        onLogin(clientData, true);
      } else {
        setClientLoginError('Telefone ou senha incorretos.');
      }
    } catch (error) {
      console.error('Erro no login do cliente:', error);
      setClientLoginError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClientRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientRegisterData.name || !clientRegisterData.phone || !clientRegisterData.password) {
      setClientRegisterError('Nome, telefone e senha são obrigatórios!');
      return;
    }

    setLoading(true);
    setClientRegisterError('');

    try {
      // Verificar se o telefone já está cadastrado
      const existingClient = await getNailDesignerByPhone(clientRegisterData.phone);
      
      if (existingClient) {
        setClientRegisterError('Este telefone já está cadastrado!');
        setLoading(false);
        return;
      }

      // Criar novo cliente
      const newClient = {
        id: 'client-' + clientRegisterData.phone,
        name: clientRegisterData.name,
        phone: clientRegisterData.phone,
        email: clientRegisterData.email || 'client-' + clientRegisterData.phone + '@nail.app',
        password: clientRegisterData.password,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Salvar cliente no Supabase
      const success = await saveClient(newClient);
      
      if (success) {
        // Fazer login automático após cadastro
        const clientData: NailDesigner = {
          id: newClient.id,
          name: newClient.name,
          phone: newClient.phone,
          email: newClient.email,
          password: newClient.password,
          isActive: true,
          createdAt: newClient.createdAt
        };
        
        onLogin(clientData, true);
      } else {
        setClientRegisterError('Erro ao criar conta. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no registro do cliente:', error);
      setClientRegisterError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryPhone || !newPassword || !confirmNewPassword) {
      setRecoveryError('Todos os campos são obrigatórios!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setRecoveryError('As senhas não coincidem!');
      return;
    }

    if (newPassword.length < 4) {
      setRecoveryError('A senha deve ter pelo menos 4 caracteres!');
      return;
    }

    setLoading(true);
    setRecoveryError('');

    try {
      // Verificar se o telefone existe no sistema
      const existingClient = await getNailDesignerByPhone(recoveryPhone);
      
      if (!existingClient) {
        setRecoveryError('Este telefone não está cadastrado no sistema!');
        setLoading(false);
        return;
      }

      // Atualizar a senha do cliente
      const updatedClient = {
        ...existingClient,
        password: newPassword
      };
      
      // Salvar cliente atualizado
      const success = await saveClient(updatedClient);
      
      if (success) {
        // Mostrar sucesso
        setRecoverySuccess(true);
        setRecoveryError('');
        
        // Limpar campos após 2 segundos e voltar ao login
        setTimeout(() => {
          setShowPasswordRecovery(false);
          setRecoveryPhone('');
          setNewPassword('');
          setConfirmNewPassword('');
          setRecoverySuccess(false);
          setShowClientLogin(true);
        }, 2000);
      } else {
        setRecoveryError('Erro ao atualizar senha. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro na recuperação de senha:', error);
      setRecoveryError('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // designers já está sendo carregado no useEffect e filtrado no loadDesigners

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <button
              onClick={handleIconClick}
              className="p-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <div className="relative">
                <Palette className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            Studio Nail Art
          </h1>
          <p className="text-purple-100">Sistema de agendamento profissional</p>
        </div>

        {/* Access Denied Popup */}
        {showAccessDenied && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">🔒 Área Restrita</h3>
              <p className="text-gray-600 mb-4">Área de acesso da sua Nail Designer</p>
              <button
                onClick={() => setShowAccessDenied(false)}
                className="w-full p-3 bg-pink-500 text-white rounded-xl font-semibold"
              >
                Entendi
              </button>
            </div>
          </div>
        )}

        {/* Client Login */}
        {showClientLogin && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-center text-white mb-6">
              Login do Cliente
            </h2>
            
            <form onSubmit={handleClientLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Número do WhatsApp
                </label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => {
                    setClientPhone(e.target.value);
                    setClientLoginError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={clientPassword}
                  onChange={(e) => {
                    setClientPassword(e.target.value);
                    setClientLoginError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="Digite sua senha"
                  required
                />
                {clientLoginError && (
                  <p className="text-red-400 text-sm mt-1">{clientLoginError}</p>
                )}
              </div>
              
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-3 mb-4">
                <p className="text-blue-200 text-sm">
                  💡 <strong>Dica:</strong> Use o mesmo número de telefone que você usou para fazer seus agendamentos.
                </p>
              </div>
              
              <div className="text-center mb-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientLogin(false);
                    setShowClientRegister(true);
                  }}
                  className="block w-full text-sm text-blue-300 hover:text-blue-200 underline transition-colors"
                >
                  Acessou pela primeira vez? Cadastre-se aqui.
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowClientLogin(false);
                    setShowPasswordRecovery(true);
                  }}
                  className="block w-full text-sm text-yellow-300 hover:text-yellow-200 underline transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientLogin(false);
                    setClientPhone('');
                    setClientPassword('');
                    setClientLoginError('');
                  }}
                  className="flex-1 p-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!clientPhone || !clientPassword || loading}
                  className="flex-1 p-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Client Register */}
        {showClientRegister && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-center text-white mb-6">
              Cadastro de Cliente
            </h2>
            
            <form onSubmit={handleClientRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={clientRegisterData.name}
                  onChange={(e) => {
                    setClientRegisterData({...clientRegisterData, name: e.target.value});
                    setClientRegisterError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Número do WhatsApp *
                </label>
                <input
                  type="tel"
                  value={clientRegisterData.phone}
                  onChange={(e) => {
                    setClientRegisterData({...clientRegisterData, phone: e.target.value});
                    setClientRegisterError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={clientRegisterData.email}
                  onChange={(e) => {
                    setClientRegisterData({...clientRegisterData, email: e.target.value});
                    setClientRegisterError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="seu@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  value={clientRegisterData.password}
                  onChange={(e) => {
                    setClientRegisterData({...clientRegisterData, password: e.target.value});
                    setClientRegisterError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              
              {clientRegisterError && (
                <p className="text-red-400 text-sm mt-1">{clientRegisterError}</p>
              )}
              
              <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3 mb-4">
                <p className="text-green-200 text-sm">
                  ✨ <strong>Bem-vindo(a)!</strong> Após o cadastro, você poderá agendar seus serviços e acompanhar seu histórico.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientRegister(false);
                    setShowClientLogin(true);
                    setClientRegisterData({ name: '', phone: '', email: '', password: '' });
                    setClientRegisterError('');
                  }}
                  className="flex-1 p-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!clientRegisterData.name || !clientRegisterData.phone || !clientRegisterData.password || loading}
                  className="flex-1 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Recovery */}
        {showPasswordRecovery && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-center text-white mb-6">
              Recuperar Senha
            </h2>
            
            {recoverySuccess ? (
              <div className="text-center space-y-4">
                <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4">
                  <p className="text-green-200 text-sm">
                    ✅ <strong>Senha alterada com sucesso!</strong><br/>
                    Redirecionando para o login...
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePasswordRecovery} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-2">
                    Número do WhatsApp *
                  </label>
                  <input
                    type="tel"
                    value={recoveryPhone}
                    onChange={(e) => {
                      setRecoveryPhone(e.target.value);
                      setRecoveryError('');
                    }}
                    className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                    placeholder="(11) 99999-9999"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-2">
                    Nova Senha *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setRecoveryError('');
                    }}
                    className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                    placeholder="Digite sua nova senha"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-purple-100 mb-2">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setRecoveryError('');
                    }}
                    className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                    placeholder="Confirme sua nova senha"
                    required
                  />
                </div>
                
                {recoveryError && (
                  <p className="text-red-400 text-sm mt-1">{recoveryError}</p>
                )}
                
                <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3 mb-4">
                  <p className="text-yellow-200 text-sm">
                    🔐 <strong>Importante:</strong> Use o mesmo número de telefone que você usou para se cadastrar.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordRecovery(false);
                      setShowClientLogin(true);
                      setRecoveryPhone('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setRecoveryError('');
                    }}
                    className="flex-1 p-3 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!recoveryPhone || !newPassword || !confirmNewPassword || loading}
                    className="flex-1 p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                  >
                    {loading ? 'Alterando...' : 'Alterar Senha'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {!showRegister && !showDesignerLogin && !showClientLogin && !showClientRegister && !showPasswordRecovery && !showSuperAdmin && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-center text-gray-100 mb-6">
              Como deseja acessar?
            </h2>
            
            <button
              onClick={() => setShowClientLogin(true)}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <User className="w-5 h-5" />
              Login Cliente / Agendar Serviço
            </button>

            <button
              onClick={handleDesignerAreaClick}
              onContextMenu={(e) => {
                e.preventDefault();
                handleDesignerAreaLongPress();
              }}
              className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5" />
              Área da Nail Designer
            </button>
          </div>
        )}



        {/* Designer Login */}
        {showDesignerLogin && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
            <h2 className="text-xl font-semibold text-center text-white mb-6">
              Área da Nail Designer
            </h2>
            
            <form onSubmit={handleDesignerLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Selecione seu perfil
                </label>
                <select
                  value={selectedDesigner}
                  onChange={(e) => {
                    setSelectedDesigner(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-purple-800/80 backdrop-blur-sm text-white placeholder-purple-200"
                  style={{
                    backgroundColor: 'rgba(107, 33, 168, 0.8)',
                    color: 'white'
                  }}
                  required
                >
                  <option value="" style={{ backgroundColor: '#6b21a8', color: 'white' }}>Escolha...</option>
                  {designers.map((designer) => (
                    <option key={designer.id} value={designer.id} style={{ backgroundColor: '#6b21a8', color: 'white' }}>
                      {designer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError('');
                    }}
                    className="w-full p-3 pr-12 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-red-500 text-sm mt-1">{loginError}</p>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDesignerLogin(false);
                    setSelectedDesigner('');
                    setPassword('');
                    setLoginError('');
                  }}
                  className="flex-1 p-3 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={!selectedDesigner || !password || loading}
                  className="flex-1 p-3 bg-gradient-to-r from-gold-400 to-yellow-400 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Registration Form */}
        {showRegister && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
              Cadastro de Nail Designer
            </h2>
            
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Mínimo 4 caracteres"
                  minLength={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Digite a senha novamente"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
                  className="flex-1 p-3 border border-gray-300 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 p-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                >
                  {loading ? 'Cadastrando...' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Super Admin Login */}
        {showSuperAdmin && (
          <div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-yellow-500/50 p-6">
            <div className="text-center mb-6">
              <Shield className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h2 className="text-xl font-semibold text-yellow-400">Acesso Orbital</h2>
              <p className="text-sm text-yellow-200">Sistema de Controle Total</p>
            </div>
            
            <form onSubmit={handleSuperAdminLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-2">
                  Usuário Orbital
                </label>
                <input
                  type="text"
                  value={superAdminCredentials.username}
                  onChange={(e) => setSuperAdminCredentials({ ...superAdminCredentials, username: e.target.value })}
                  className="w-full p-3 bg-black/30 border border-yellow-500/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Digite: Atila"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-yellow-200 mb-2">
                  Senha Orbital
                </label>
                <input
                  type="password"
                  value={superAdminCredentials.password}
                  onChange={(e) => setSuperAdminCredentials({ ...superAdminCredentials, password: e.target.value })}
                  className="w-full p-3 bg-black/30 border border-yellow-500/30 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Digite: admin123"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowSuperAdmin(false);
                    setLoginError('');
                    setSuperAdminCredentials({ username: '', password: '' });
                  }}
                  className="flex-1 p-3 border border-gray-500 text-gray-300 rounded-xl font-semibold hover:bg-gray-800/50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {loading ? 'Acessando...' : 'Acessar Orbital'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Developer Credits */}
        <div className="text-center mt-8">
          <button
            onClick={handleDeveloperContact}
            className="text-xs text-gray-300 hover:text-pink-600 transition-colors"
          >
            Desenvolvido por Átila Azevedo - WhatsApp: 73988821486
          </button>
        </div>
      </div>
    </div>
  );
}
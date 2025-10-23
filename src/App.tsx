import { useState, useEffect } from 'react';
import { Calendar, Users, Settings, BarChart3, Lock } from 'lucide-react';
import LoginPage from './components/LoginPage';
import BookingPage from './components/BookingPage';
import AdminDashboard from './components/AdminDashboard';
import ServicesManager from './components/ServicesManager';
import Statistics from './components/Statistics';
import AvailabilityManager from './components/AvailabilityManager';
import DesignerSettings from './components/DesignerSettings';
// Remove unused import
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import ConnectionStatus from './components/ConnectionStatus';

import { cleanOldAppointments } from './utils/appointmentUtils';
import { notificationService } from './services/notificationService';
import { extractSlugFromPath, generateSlug } from './utils/slugUtils';
import { designerService } from './utils/supabaseUtils';

export interface NailDesigner {
  id: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  isActive: boolean;
  is_active?: boolean; // Campo do Supabase (snake_case)
  createdAt: string;
  created_at?: string; // Campo do Supabase (snake_case)
  updated_at?: string; // Campo do Supabase (snake_case)
  pixKey?: string;
  pix_key?: string; // Campo do Supabase (snake_case)
  slug?: string; // Link personalizado (ex: klivia-azevedo)
  bio?: string; // Biografia da designer
  photoUrl?: string; // URL da foto de perfil
  photo_url?: string; // Campo do Supabase (snake_case)
}

export interface Service {
  id: string;
  designerId: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: 'services' | 'extras';
}

export interface Appointment {
  id: string;
  designerId: string;
  clientName: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Availability {
  id?: string; // Optional - Supabase will generate UUID automatically
  designerId: string;
  specificDate: string; // YYYY-MM-DD format
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'superadmin' | 'client' | 'booking'>('login');
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [currentDesigner, setCurrentDesigner] = useState<NailDesigner | null>(null);
  const [isOnline, setIsOnline] = useState(true); // Estado global de conexão
  const [isClient, setIsClient] = useState(false);
  const [designerSlug, setDesignerSlug] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Listen for storage events to refresh data
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };
    
    // Listen for designer updates from components
    const handleDesignerUpdate = (event: CustomEvent) => {
      const updatedDesigner = event.detail;
      console.log('🔄 App recebeu evento designerUpdated:', updatedDesigner);
      if (currentDesigner && updatedDesigner.id === currentDesigner.id) {
        console.log('✅ Atualizando currentDesigner no App');
        setCurrentDesigner(updatedDesigner);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('designerUpdated', handleDesignerUpdate as EventListener);
    
    // 🆕 NOVO: Check if accessing via designer's personal link
    const checkPersonalLink = async () => {
      const slug = extractSlugFromPath(window.location.pathname);
      console.log('🔍 Verificando URL:', window.location.pathname, '| Slug extraído:', slug);
      
      // Verificar se tem slug salvo no localStorage
      const savedSlug = localStorage.getItem('designerSlug');
      const activeSlug = slug || savedSlug;
      
      if (activeSlug) {
        console.log('🔗 Link personalizado detectado:', activeSlug, slug ? '(da URL)' : '(do localStorage)');
        setDesignerSlug(activeSlug);
        
        // Salvar no localStorage para persistir após navegação
        if (slug) {
          localStorage.setItem('designerSlug', slug);
        }
        
        try {
          // Buscar designer pelo slug no Supabase
          const designers = await designerService.getAll();
          console.log('📋 Designers encontradas:', designers.map(d => ({
            name: d.name,
            slug: d.slug || generateSlug(d.name),
            active: d.is_active
          })));
          
          const designer = designers.find(d => {
            const designerSlug = d.slug || generateSlug(d.name);
            console.log(`🔎 Comparando: "${designerSlug}" === "${slug}"?`, designerSlug === slug);
            return designerSlug === slug && d.is_active;
          });
          
          if (designer) {
            console.log('✅ Designer encontrada:', designer.name);
            // Converter campos do Supabase para formato do App
            const mappedDesigner: NailDesigner = {
              id: designer.id,
              name: designer.name,
              email: designer.email,
              phone: designer.phone,
              password: designer.password,
              isActive: designer.is_active,
              is_active: designer.is_active,
              createdAt: designer.created_at,
              created_at: designer.created_at,
              updated_at: designer.updated_at,
              pixKey: designer.pix_key || undefined,
              pix_key: designer.pix_key || undefined,
              slug: designer.slug || generateSlug(designer.name),
              bio: designer.bio || undefined,
              photoUrl: designer.photo_url || undefined,
              photo_url: designer.photo_url || undefined,
            };
            
            // Salvar designer mas NÃO fazer login automático
            // Cliente precisa fazer login normalmente primeiro
            setCurrentDesigner(mappedDesigner);
            // Salvar no localStorage para persistir após login
            localStorage.setItem('preSelectedDesigner', JSON.stringify(mappedDesigner));
            console.log('✅ Designer salva para uso após login da cliente');
          } else {
            console.warn('❌ Designer não encontrada ou inativa para slug:', activeSlug);
            // Limpar localStorage se designer não for encontrada
            localStorage.removeItem('designerSlug');
            localStorage.removeItem('preSelectedDesigner');
            setCurrentView('login');
          }
        } catch (error) {
          console.error('❌ Erro ao buscar designer:', error);
          setCurrentView('login');
        }
      } else {
        // Se não tem slug na URL, verificar se tem designer salva no localStorage
        const savedDesignerStr = localStorage.getItem('preSelectedDesigner');
        if (savedDesignerStr) {
          try {
            const savedDesigner = JSON.parse(savedDesignerStr);
            setCurrentDesigner(savedDesigner);
            setDesignerSlug(savedDesigner.slug);
            console.log('✅ Designer recuperada do localStorage:', savedDesigner.name);
          } catch (e) {
            console.error('❌ Erro ao recuperar designer do localStorage:', e);
            localStorage.removeItem('preSelectedDesigner');
          }
        }
      }
    };
    
    checkPersonalLink();

    // Clean old appointments on app load
    cleanOldAppointments();
    
    // Set up daily cleanup
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      cleanOldAppointments();
      // Set up recurring daily cleanup
      setInterval(cleanOldAppointments, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    
    // 🆕 NOVO: Iniciar serviço de notificações
    console.log('🚀 Iniciando serviço de notificações');
    notificationService.startQueueProcessing();
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('designerUpdated', handleDesignerUpdate as EventListener);
      // 🆕 NOVO: Parar serviço de notificações
      console.log('⏹️ Parando serviço de notificações');
      notificationService.stopQueueProcessing();
    };
  }, []);

  // Update currentDesigner when refreshKey changes (localStorage updates)
  useEffect(() => {
    if (currentDesigner) {
      const designers = getDesigners();
      const updatedDesigner = designers.find(d => d.id === currentDesigner.id);
      if (updatedDesigner) {
        setCurrentDesigner(updatedDesigner);
      }
    }
  }, [refreshKey]);

  const getDesigners = (): NailDesigner[] => {
    const saved = localStorage.getItem('nail_designers');
    return saved ? JSON.parse(saved) : [];
  };

  const handleLogin = (user: NailDesigner | Client, asClient: boolean = false) => {
    if (asClient) {
      // Se for cliente, armazenar como currentClient
      setCurrentClient(user as Client);
      setCurrentDesigner(null);
      setIsClient(true);
      setCurrentView('client');
    } else {
      // Se for designer, armazenar como currentDesigner
      setCurrentDesigner(user as NailDesigner);
      setCurrentClient(null);
      setIsClient(false);
      setCurrentView('admin');
    }
  };

  const handleSuperAdminLogin = () => {
    setCurrentDesigner(null);
    setIsClient(false);
    setCurrentView('superadmin');
  };

  const handleLogout = () => {
    setCurrentDesigner(null);
    setIsClient(false);
    setDesignerSlug(null);
    setCurrentView('login');
    // Limpar localStorage ao fazer logout
    localStorage.removeItem('designerSlug');
    localStorage.removeItem('preSelectedDesigner');
    // Reset URL if accessed via personal link
    if (window.location.pathname !== '/') {
      window.history.pushState({}, '', '/');
    }
  };

  // Check if designer is inactive and show message
  if (designerSlug && currentDesigner && !currentDesigner.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ops...</h2>
          <p className="text-gray-600 mb-6">
            Este(a) profissional não oferece mais agendamento online.
            Entre em contato diretamente com o profissional.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    return (
      <>
        <ConnectionStatus onConnectionChange={setIsOnline} />
        <LoginPage onLogin={handleLogin} onSuperAdminLogin={handleSuperAdminLogin} isOnline={isOnline} />
      </>
    );
  }

  if (currentView === 'superadmin') {
    return (
      <>
        <ConnectionStatus />
        <SuperAdminDashboard onBack={handleLogout} />
      </>
    );
  }

  if (currentView === 'client') {
    return (
      <>
        <ConnectionStatus />
        <ClientDashboard 
          client={currentClient!} 
          onBack={handleLogout}
          onBookService={() => {
            // Antes de abrir booking, recuperar designer do localStorage se necessário
            const savedSlug = localStorage.getItem('designerSlug');
            const savedDesignerStr = localStorage.getItem('preSelectedDesigner');
            
            if (savedSlug && savedDesignerStr && !currentDesigner) {
              try {
                const savedDesigner = JSON.parse(savedDesignerStr);
                setCurrentDesigner(savedDesigner);
                setDesignerSlug(savedSlug);
                console.log('🔄 Recuperando designer do localStorage antes de abrir booking:', savedDesigner.name);
              } catch (e) {
                console.error('❌ Erro ao recuperar designer:', e);
              }
            }
            
            setCurrentView('booking');
          }}
        />
      </>
    );
  }

  // 🆕 NOVO: Se for cliente e estiver na view de booking
  if (isClient && currentView === 'booking') {
    // Sempre verificar localStorage primeiro (mais confiável que estado)
    const savedSlug = localStorage.getItem('designerSlug');
    const savedDesignerStr = localStorage.getItem('preSelectedDesigner');
    
    let initialDesigner: NailDesigner | undefined = currentDesigner || undefined;
    
    // Se tem no localStorage mas não no estado, usar do localStorage
    if (savedSlug && savedDesignerStr && !currentDesigner) {
      try {
        const parsed = JSON.parse(savedDesignerStr) as NailDesigner;
        initialDesigner = parsed;
        console.log('🔄 Usando designer do localStorage:', initialDesigner?.name);
      } catch (e) {
        console.error('❌ Erro ao parsear designer do localStorage:', e);
        initialDesigner = undefined;
      }
    }
    
    console.log('🎯 Abrindo BookingPage:', {
      temSlug: !!(designerSlug || savedSlug),
      temDesigner: !!initialDesigner,
      passandoDesigner: !!initialDesigner,
      nomeDesigner: initialDesigner?.name,
      fonte: currentDesigner ? 'estado' : 'localStorage'
    });
    
    return (
      <>
        <ConnectionStatus onConnectionChange={setIsOnline} />
        <BookingPage 
          designer={initialDesigner}
          onBack={handleLogout}
          loggedClient={currentClient || undefined}
          isOnline={isOnline}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600">
      {/* Connection Status Monitor */}
      <ConnectionStatus />
      
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white drop-shadow-lg">
              Studio Nail Art
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {currentView === 'admin' && (
          <AdminDashboard 
            designer={currentDesigner!}
            onViewChange={setCurrentView}
          />
        )}
        
        {currentView === 'services' && (
          <ServicesManager 
            designer={currentDesigner!}
            onBack={() => setCurrentView('admin')}
          />
        )}
        
        {currentView === 'stats' && (
          <Statistics 
            designer={currentDesigner!}
            onBack={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'availability' && (
          <AvailabilityManager 
            designer={currentDesigner!}
            onBack={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'settings' && (
          <DesignerSettings 
            designer={currentDesigner!}
            onBack={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'booking' && (
          <BookingPage 
            designer={undefined} // Sempre undefined para começar no step 1 (seleção de designer)
            onBack={() => {
              // Se é uma cliente logada, volta para o painel da cliente
              if (isClient && currentClient) {
                console.log('🔙 Voltando ao dashboard do cliente');
                setCurrentView('client');
              } else {
                // Se não é cliente ou não está logada, faz logout
                console.log('🔚 Fazendo logout');
                handleLogout();
              }
            }}
            loggedClient={isClient ? (currentClient || undefined) : undefined}
            onNavigateToClientDashboard={() => setCurrentView('client')}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      {!isClient && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
          <div className="max-w-lg mx-auto px-4 py-2">
            <div className="flex justify-around">
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  currentView === 'admin' 
                    ? 'bg-white/20 text-pink-300' 
                    : 'text-purple-100 hover:text-pink-300'
                }`}
              >
                <Calendar size={18} />
                <span className="text-xs mt-1">Agenda</span>
              </button>
              
              <button
                onClick={() => setCurrentView('services')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  currentView === 'services' 
                    ? 'bg-white/20 text-pink-300' 
                    : 'text-purple-100 hover:text-pink-300'
                }`}
              >
                <Settings size={18} />
                <span className="text-xs mt-1">Serviços</span>
              </button>

              <button
                onClick={() => setCurrentView('availability')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  currentView === 'availability' 
                    ? 'bg-white/20 text-pink-300' 
                    : 'text-purple-100 hover:text-pink-300'
                }`}
              >
                <Users size={18} />
                <span className="text-xs mt-1">Horários</span>
              </button>
              
              <button
                onClick={() => setCurrentView('stats')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  currentView === 'stats' 
                    ? 'bg-white/20 text-pink-300' 
                    : 'text-purple-100 hover:text-pink-300'
                }`}
              >
                <BarChart3 size={18} />
                <span className="text-xs mt-1">Estatísticas</span>
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  currentView === 'settings' 
                    ? 'bg-white/20 text-pink-300' 
                    : 'text-purple-100 hover:text-pink-300'
                }`}
              >
                <Lock size={18} />
                <span className="text-xs mt-1">Configurações</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
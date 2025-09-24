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

import { cleanOldAppointments } from './utils/appointmentUtils';
import { notificationService } from './services/notificationService';

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
  designerId: string;
  createdAt: string;
  lastAppointment?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'login' | 'booking' | 'admin' | 'services' | 'stats' | 'availability' | 'settings' | 'superadmin' | 'client'>('login');
  const [currentDesigner, setCurrentDesigner] = useState<NailDesigner | null>(null);
  const [isClient, setIsClient] = useState(false);
// Removed unused state variable isSuperAdmin
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
    
    // Check if accessing via designer's personal link
    const path = window.location.pathname;
    const match = path.match(/^\/([^\/]+)-nail$/);
    if (match) {
      const slug = match[1];
      setDesignerSlug(slug);
      
      // Find designer by slug
      const designers = getDesigners();
      const designer = designers.find(d => 
        d.name.toLowerCase().replace(/\s+/g, '-') === slug && d.isActive
      );
      
      if (designer) {
        setCurrentDesigner(designer);
        setIsClient(true);
        setCurrentView('booking');
      } else {
        // Designer not found or inactive
        setCurrentView('login');
      }
    }

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

  const handleLogin = (designer: NailDesigner, asClient: boolean = false) => {
    setCurrentDesigner(designer);
    setIsClient(asClient);
    
    if (asClient) {
      // Se for cliente logando pelo sistema de login, vai para o painel do cliente
      setCurrentView('client');
    } else {
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
    return <LoginPage onLogin={handleLogin} onSuperAdminLogin={handleSuperAdminLogin} />;
  }

  if (currentView === 'superadmin') {
    return <SuperAdminDashboard onBack={handleLogout} />;
  }

  if (currentView === 'client') {
    return (
      <ClientDashboard 
        client={currentDesigner!} 
        onBack={handleLogout}
        onBookService={() => {
          setCurrentView('booking');
          // Não passa designer quando cliente agenda novo serviço
        }}
      />
    );
  }

  if (isClient) {
    return (
      <BookingPage 
        designer={undefined} // Não passa designer para começar sempre no step 1
        onBack={handleLogout}
        loggedClient={isClient ? currentDesigner : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600">
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
            if (isClient && currentDesigner) {
              setCurrentView('client');
            } else {
              // Se não é cliente ou não está logada, faz logout
              handleLogout();
            }
            }}
            loggedClient={isClient ? currentDesigner : undefined}
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
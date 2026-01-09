import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, Users, Settings, BarChart3, Lock } from 'lucide-react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DesignerSignup from './components/DesignerSignup';
import BookingPage from './components/BookingPage';
import AdminDashboard from './components/AdminDashboard';
import ServicesManager from './components/ServicesManager';
import Statistics from './components/Statistics';
import AvailabilityManager from './components/AvailabilityManager';
import DesignerSettings from './components/DesignerSettings';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import ConnectionStatus from './components/ConnectionStatus';
// 🎄 Holiday Theme Components
import SnowEffect from './components/SnowEffect';
import HolidayDecorations from './components/HolidayDecorations';

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
  is_active?: boolean;
  createdAt: string;
  created_at?: string;
  updated_at?: string;
  pixKey?: string;
  pix_key?: string;
  slug?: string;
  bio?: string;
  photoUrl?: string;
  photo_url?: string;
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
  id?: string;
  designerId: string;
  specificDate: string;
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

// Component for handling designer slug routes
const DesignerSlugRoute = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentDesigner, setCurrentDesigner] = useState<NailDesigner | null>(null);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'client' | 'booking'>('login');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const loadDesigner = async () => {
      if (slug) {
        localStorage.setItem('designerSlug', slug);

        try {
          const designers = await designerService.getAll();
          const designer = designers.find(d => {
            const designerSlug = d.slug || generateSlug(d.name);
            return designerSlug === slug && d.is_active;
          });

          if (designer) {
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

            setCurrentDesigner(mappedDesigner);
            localStorage.setItem('preSelectedDesigner', JSON.stringify(mappedDesigner));
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error loading designer:', error);
          navigate('/');
        }
      }
    };

    loadDesigner();
  }, [slug, navigate]);

  const handleLogin = (user: NailDesigner | Client, asClient: boolean = false) => {
    if (asClient) {
      setCurrentClient(user as Client);
      setCurrentView('client');
    }
  };

  const handleLogout = () => {
    setCurrentClient(null);
    setCurrentView('login');
    localStorage.removeItem('designerSlug');
    localStorage.removeItem('preSelectedDesigner');
    navigate('/');
  };

  if (!currentDesigner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (!currentDesigner.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ops...</h2>
          <p className="text-gray-600 mb-6">
            Este(a) profissional não oferece mais agendamento online.
          </p>
          <button
            onClick={() => navigate('/')}
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
        <SnowEffect />
        <HolidayDecorations />
        <ConnectionStatus onConnectionChange={setIsOnline} />
        <LoginPage onLogin={handleLogin} onSuperAdminLogin={() => { }} isOnline={isOnline} showOnlyDesignerLogin={false} />
      </>
    );
  }

  if (currentView === 'client') {
    return (
      <>
        <SnowEffect />
        <HolidayDecorations />
        <ConnectionStatus />
        <ClientDashboard
          client={currentClient!}
          onBack={handleLogout}
          onBookService={() => setCurrentView('booking')}
        />
      </>
    );
  }

  if (currentView === 'booking') {
    return (
      <>
        <SnowEffect />
        <HolidayDecorations />
        <ConnectionStatus onConnectionChange={setIsOnline} />
        <BookingPage
          designer={currentDesigner}
          onBack={() => currentClient ? setCurrentView('client') : handleLogout()}
          loggedClient={currentClient || undefined}
          isOnline={isOnline}
        />
      </>
    );
  }

  return null;
};

// Main dashboard component for logged-in designers
const DashboardRoute = () => {
  const navigate = useNavigate();
  const [currentDesigner, setCurrentDesigner] = useState<NailDesigner | null>(null);
  const [currentView, setCurrentView] = useState<'admin' | 'services' | 'stats' | 'availability' | 'settings' | 'booking'>('admin');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Check if designer is logged in
    const savedDesigner = localStorage.getItem('currentDesigner');
    if (savedDesigner) {
      try {
        setCurrentDesigner(JSON.parse(savedDesigner));
      } catch (e) {
        navigate('/login');
      }
    } else {
      navigate('/login');
    }

    // Listen for storage events
    const handleStorageChange = () => {
      setRefreshKey(prev => prev + 1);
    };

    const handleDesignerUpdate = (event: CustomEvent) => {
      const updatedDesigner = event.detail;
      if (currentDesigner && updatedDesigner.id === currentDesigner.id) {
        setCurrentDesigner(updatedDesigner);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('designerUpdated', handleDesignerUpdate as EventListener);

    // Clean old appointments
    cleanOldAppointments();

    // Start notification service
    notificationService.startQueueProcessing();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('designerUpdated', handleDesignerUpdate as EventListener);
      notificationService.stopQueueProcessing();
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentDesigner');
    navigate('/login');
  };

  if (!currentDesigner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-600">
      <SnowEffect />
      <HolidayDecorations />
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
            designer={currentDesigner}
            onViewChange={setCurrentView}
          />
        )}

        {currentView === 'services' && (
          <ServicesManager
            designer={currentDesigner}
            onBack={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'stats' && (
          <Statistics
            designer={currentDesigner}
            onBack={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'availability' && (
          <AvailabilityManager
            designer={currentDesigner}
            onBack={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'settings' && (
          <DesignerSettings
            designer={currentDesigner}
            onBack={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'booking' && (
          <BookingPage
            designer={undefined}
            onBack={() => setCurrentView('admin')}
            loggedClient={undefined}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button
              onClick={() => setCurrentView('admin')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${currentView === 'admin' ? 'bg-white/20 text-pink-300' : 'text-purple-100 hover:text-pink-300'
                }`}
            >
              <Calendar size={18} />
              <span className="text-xs mt-1">Agenda</span>
            </button>

            <button
              onClick={() => setCurrentView('services')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${currentView === 'services' ? 'bg-white/20 text-pink-300' : 'text-purple-100 hover:text-pink-300'
                }`}
            >
              <Settings size={18} />
              <span className="text-xs mt-1">Serviços</span>
            </button>

            <button
              onClick={() => setCurrentView('availability')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${currentView === 'availability' ? 'bg-white/20 text-pink-300' : 'text-purple-100 hover:text-pink-300'
                }`}
            >
              <Users size={18} />
              <span className="text-xs mt-1">Horários</span>
            </button>

            <button
              onClick={() => setCurrentView('stats')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${currentView === 'stats' ? 'bg-white/20 text-pink-300' : 'text-purple-100 hover:text-pink-300'
                }`}
            >
              <BarChart3 size={18} />
              <span className="text-xs mt-1">Estatísticas</span>
            </button>

            <button
              onClick={() => setCurrentView('settings')}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${currentView === 'settings' ? 'bg-white/20 text-pink-300' : 'text-purple-100 hover:text-pink-300'
                }`}
            >
              <Lock size={18} />
              <span className="text-xs mt-1">Configurações</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login route handler
const LoginRoute = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(true);

  const handleLogin = (user: NailDesigner | Client, asClient: boolean = false) => {
    if (!asClient) {
      // Designer login
      localStorage.setItem('currentDesigner', JSON.stringify(user));
      navigate('/dashboard');
    }
  };

  const handleSuperAdminLogin = () => {
    navigate('/superadmin');
  };

  return (
    <>
      <SnowEffect />
      <HolidayDecorations />
      <ConnectionStatus onConnectionChange={setIsOnline} />
      <LoginPage onLogin={handleLogin} onSuperAdminLogin={handleSuperAdminLogin} isOnline={isOnline} showOnlyDesignerLogin={true} />
    </>
  );
};

// SuperAdmin route
const SuperAdminRoute = () => {
  const navigate = useNavigate();

  return (
    <>
      <SnowEffect />
      <HolidayDecorations />
      <ConnectionStatus />
      <SuperAdminDashboard onBack={() => navigate('/login')} />
    </>
  );
};

// Main App component with routing
function App() {
  useEffect(() => {
    // Set up daily cleanup
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      cleanOldAppointments();
      setInterval(cleanOldAppointments, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Login */}
      <Route path="/login" element={<LoginRoute />} />

      {/* Signup */}
      <Route path="/cadastro" element={<DesignerSignup />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardRoute />} />

      {/* SuperAdmin */}
      <Route path="/superadmin" element={<SuperAdminRoute />} />

      {/* Designer Slug - Client booking */}
      <Route path="/:slug" element={<DesignerSlugRoute />} />
    </Routes>
  );
}

export default App;
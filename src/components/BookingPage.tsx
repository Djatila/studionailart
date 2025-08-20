import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User, Phone, Mail, MessageCircle, CheckCircle, AlertTriangle, Copy, CreditCard } from 'lucide-react';
import { NailDesigner } from '../App';

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

const BookingPage: React.FC<BookingPageProps> = ({ designer: initialDesigner, onBack, loggedClient, onNavigateToClientDashboard }) => {
  const [step, setStep] = useState(1);
  const [selectedDesigner, setSelectedDesigner] = useState<NailDesigner | null>(null);
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
  const [loadingDesigners, setLoadingDesigners] = useState(true);

  useEffect(() => {
    // Preenche dados do cliente se estiver logado
    if (loggedClient) {
      setClientName(loggedClient.name);
      setClientPhone(loggedClient.phone);
      setClientEmail(loggedClient.email || '');
    }
  }, [loggedClient]);

  useEffect(() => {
    // Carregar designers quando o componente for montado
    const loadDesigners = async () => {
      setLoadingDesigners(true);
      try {
        const designersList = await getDesigners();
        setDesigners(designersList);
      } catch (error) {
        console.error('Erro ao carregar designers:', error);
      } finally {
        setLoadingDesigners(false);
      }
    };
    
    loadDesigners();
  }, []);

  const getDesigners = async (): Promise<NailDesigner[]> => {
    try {
      // Buscar do Supabase
      const { getNailDesigners } = await import('../utils/supabaseUtils');
      const supabaseDesigners = await getNailDesigners();
      
      // Buscar do localStorage
      const saved = localStorage.getItem('nail_designers');
      const localDesigners = saved ? JSON.parse(saved) : [];
      
      // Combinar e remover duplicatas, priorizando Supabase
      const allDesigners = [...supabaseDesigners];
      
      localDesigners.forEach((localDesigner: NailDesigner) => {
        if (!allDesigners.find(d => d.id === localDesigner.id)) {
          allDesigners.push(localDesigner);
        }
      });
      
      // Filtrar apenas designers ativos (verificar ambos os formatos de campo)
      const activeDesigners = allDesigners.filter(d => d.isActive || d.is_active);
      return activeDesigners;
    } catch (error) {
      console.error('Erro ao buscar designers:', error);
      // Fallback para localStorage
      const saved = localStorage.getItem('nail_designers');
      const localDesigners = saved ? JSON.parse(saved) : [];
      return localDesigners.filter((d: NailDesigner) => d.isActive || d.is_active);
    }
  };

  const getServices = (): Service[] => {
    if (!selectedDesigner) return [];
    const saved = localStorage.getItem('nail_services');
    const allServices = saved ? JSON.parse(saved) : [];
    return allServices.filter((service: Service) => service.designerId === selectedDesigner.id);
  };

  const getAppointments = (): Appointment[] => {
    if (!selectedDesigner) return [];
    const saved = localStorage.getItem('nail_appointments');
    const allAppointments = saved ? JSON.parse(saved) : [];
    return allAppointments.filter((apt: Appointment) => apt.designerId === selectedDesigner.id);
  };

  // Get designer's availability settings
  const getDesignerAvailability = () => {
    if (!selectedDesigner) return [];
    const saved = localStorage.getItem('nail_availability');
    const allAvailability = saved ? JSON.parse(saved) : [];
    return allAvailability.filter((avail: any) => 
      avail.designerId === selectedDesigner.id && avail.isActive
    );
  };

  // Check if a specific date is available
  const isDateAvailable = (date: string) => {
    const availability = getDesignerAvailability();
    if (availability.length === 0) return false; // No availability configured
    return availability.some((avail: any) => avail.specificDate === date);
  };

  const saveAppointment = (appointment: Appointment) => {
    const saved = localStorage.getItem('nail_appointments');
    const allAppointments = saved ? JSON.parse(saved) : [];
    allAppointments.push(appointment);
    localStorage.setItem('nail_appointments', JSON.stringify(allAppointments));
  };

  // Generate time slots
  const timeSlots = [
    '08:00', '10:00', '12:00', '14:00', '16:00', '18:00'
  ];

  // Get available time slots for selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return timeSlots;
    
    const appointments = getAppointments();
    const bookedTimes = appointments
      .filter(apt => apt.date === selectedDate)
      .map(apt => apt.time);
    
    return timeSlots.filter(time => !bookedTimes.includes(time));
  };

  // Get unique client names from appointments for suggestions
  const getClientSuggestions = (input: string) => {
    if (input.length < 2) return [];
    
    const appointments = getAppointments();
    const uniqueNames = [...new Set(appointments.map(apt => apt.clientName))];
    return uniqueNames.filter(name => 
      name.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
  };

  const handleNameChange = (value: string) => {
    setClientName(value);
    const suggestions = getClientSuggestions(value);
    setNameSuggestions(suggestions);
    setShowSuggestions(suggestions.length > 0 && value.length >= 2);
  };

  const selectNameSuggestion = (name: string) => {
    setClientName(name);
    setShowSuggestions(false);
    
    // Auto-fill phone and email if available
    const appointments = getAppointments();
    const existingClient = appointments.find(apt => apt.clientName === name);
    if (existingClient) {
      setClientPhone(existingClient.clientPhone);
      setClientEmail(existingClient.clientEmail);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientName || !clientPhone || !selectedDesigner) {
      return;
    }

    const newAppointment: Appointment = {
      id: Date.now().toString(),
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

    saveAppointment(newAppointment);
    setShowConfirmation(true);
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

  const services = getServices();

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
                    {loadingDesigners ? (
                      <div className="col-span-full text-center text-white py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                        Carregando designers...
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
                    {getServices().map((service) => (
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
                    ))}
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
                        if (selectedDateValue && !isDateAvailable(selectedDateValue)) {
                          alert('Esta data não está disponível. A designer só liberou datas específicas para agendamento.');
                          return;
                        }
                        setSelectedDate(selectedDateValue);
                        if (selectedDateValue) setStep(4);
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    {getDesignerAvailability().length > 0 && (
                      <div className="mt-3 p-3 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl">
                        <p className="text-blue-100 text-sm font-medium mb-2">📅 Datas Disponíveis:</p>
                        <div className="flex flex-wrap gap-2">
                          {getDesignerAvailability().map((avail: any) => (
                            <span key={avail.id} className="bg-blue-400/30 text-blue-100 px-2 py-1 rounded-lg text-xs">
                              {new Date(avail.specificDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {getDesignerAvailability().length === 0 && (
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
                  
                  {getAvailableTimeSlots().length === 0 ? (
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
                      {getAvailableTimeSlots().map((time) => (
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
                      ))}
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
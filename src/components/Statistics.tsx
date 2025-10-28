import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Award, BarChart } from 'lucide-react';
import { NailDesigner, Appointment, Service } from '../App';
import { getAppointments, getServices } from '../utils/supabaseUtils';

interface StatisticsProps {
  designer: NailDesigner;
  onBack: () => void;
}

export default function Statistics({ designer, onBack }: StatisticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [designer.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Buscar do Supabase
      const allAppointments = await getAppointments();
      const allServices = await getServices();
      
      // Filtrar apenas desta designer
      const designerAppointments = allAppointments.filter(
        (apt: Appointment) => apt.designerId === designer.id
      );
      
      // Converter serviços do Supabase (snake_case) para o formato do App (camelCase)
      const designerServices = allServices
        .filter((service: any) => service.designer_id === designer.id)
        .map((service: any) => ({
          id: service.id,
          designerId: service.designer_id,
          name: service.name,
          duration: service.duration,
          price: service.price,
          category: service.category,
          description: service.description
        }));
      
      const cancelledCount = designerAppointments.filter(apt => apt.status === 'cancelled').length;
      const activeCount = designerAppointments.filter(apt => apt.status !== 'cancelled').length;
      
      console.log('📊 Estatísticas - Serviços carregados:', designerServices.length);
      console.log('📊 Estatísticas - Agendamentos carregados:', designerAppointments.length);
      console.log('📊 Estatísticas - Agendamentos ativos:', activeCount);
      console.log('📊 Estatísticas - Agendamentos cancelados (excluídos):', cancelledCount);
      
      setAppointments(designerAppointments);
      setServices(designerServices);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Zerar horas para comparação correta
    
    return appointments.filter(apt => {
      // ❌ Excluir agendamentos cancelados
      if (apt.status === 'cancelled') {
        return false;
      }
      
      const aptDate = new Date(apt.date + 'T00:00:00');
      aptDate.setHours(0, 0, 0, 0);
      
      switch (selectedPeriod) {
        case 'week': {
          // Próximos 7 dias (incluindo hoje)
          const weekAhead = new Date(now);
          weekAhead.setDate(now.getDate() + 7);
          return aptDate >= now && aptDate <= weekAhead;
        }
        
        case 'month': {
          // Próximos 30 dias (incluindo hoje)
          const monthAhead = new Date(now);
          monthAhead.setDate(now.getDate() + 30);
          return aptDate >= now && aptDate <= monthAhead;
        }
        
        case 'year': {
          // Próximos 365 dias (incluindo hoje)
          const yearAhead = new Date(now);
          yearAhead.setFullYear(now.getFullYear() + 1);
          return aptDate >= now && aptDate <= yearAhead;
        }
        
        default:
          return true;
      }
    });
  };

  const filteredAppointments = getFilteredAppointments();
  
  const totalRevenue = filteredAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const totalAppointments = filteredAppointments.length;
  const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
  
  // 📊 Calcular ticket médio de referência baseado nos últimos 30 dias
  const getLast30DaysAverageTicket = () => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const last30DaysAppointments = appointments.filter(apt => {
      // Excluir cancelados
      if (apt.status === 'cancelled') return false;
      
      const aptDate = new Date(apt.date + 'T00:00:00');
      aptDate.setHours(0, 0, 0, 0);
      
      return aptDate >= thirtyDaysAgo && aptDate <= now;
    });
    
    if (last30DaysAppointments.length === 0) {
      // Se não houver histórico, usar média dos preços dos serviços
      return services.length > 0
        ? services.reduce((sum, s) => sum + s.price, 0) / services.length
        : 50; // Fallback para R$ 50 se não houver serviços
    }
    
    const totalLast30Days = last30DaysAppointments.reduce((sum, apt) => sum + apt.price, 0);
    return totalLast30Days / last30DaysAppointments.length;
  };
  
  const referenceTicket = getLast30DaysAverageTicket();
  
  console.log('📊 Ticket Médio - Período atual:', averageTicket.toFixed(2));
  console.log('📊 Ticket Médio - Referência (últimos 30 dias):', referenceTicket.toFixed(2));
  console.log('📊 Comparação:', averageTicket > referenceTicket ? 'ACIMA ↑' : 'ABAIXO ↓');
  
  // Service popularity
  const serviceStats = services.map(service => {
    const serviceAppointments = filteredAppointments.filter(apt => apt.service === service.name);
    return {
      name: service.name,
      count: serviceAppointments.length,
      revenue: serviceAppointments.reduce((sum, apt) => sum + apt.price, 0)
    };
  }).sort((a, b) => b.count - a.count);

  // Daily revenue for next 30 days
  const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i); // Próximos dias
    const dateStr = date.toISOString().split('T')[0];
    
    const dayRevenue = filteredAppointments
      .filter(apt => apt.date === dateStr)
      .reduce((sum, apt) => sum + apt.price, 0);
    
    const dayCount = filteredAppointments.filter(apt => apt.date === dateStr).length;
    
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      revenue: dayRevenue,
      count: dayCount
    };
  });

  const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return 'Próximos 7 Dias';
      case 'month': return 'Próximos 30 Dias';
      case 'year': return 'Próximo Ano';
      default: return 'Período';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-pink-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-pink-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Estatísticas</h1>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-pink-500 text-white'
                  : 'text-gray-600 hover:bg-pink-50'
              }`}
            >
              {period === 'week' && '7 Dias'}
              {period === 'month' && '30 Dias'}
              {period === 'year' && '1 Ano'}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Faturamento</p>
              <p className="text-lg font-bold">R$ {totalRevenue.toFixed(2)}</p>
              <p className="text-xs opacity-75">{getPeriodLabel()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gold-400 to-yellow-400 text-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Agendamentos</p>
              <p className="text-lg font-bold">{totalAppointments}</p>
              <p className="text-xs opacity-75">{getPeriodLabel()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Ticket Médio</p>
              <p className="text-lg font-bold">R$ {averageTicket.toFixed(2)}</p>
              <p className="text-xs opacity-75">Por atendimento</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-teal-400 to-teal-500 text-white rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Serviços</p>
              <p className="text-lg font-bold">{services.length}</p>
              <p className="text-xs opacity-75">Cadastrados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-800">Agendamentos dos Próximos 30 Dias</h3>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {dailyRevenue.map((day, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-12">{day.date}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: maxDailyRevenue > 0 ? `${(day.revenue / maxDailyRevenue) * 100}%` : '0%'
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 w-20 text-right">
                {day.count > 0 ? `${day.count} agend.` : '-'}
              </span>
              <span className="text-xs font-medium text-gray-700 w-20 text-right">
                R$ {day.revenue.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Service Performance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-pink-600" />
          <h3 className="font-semibold text-gray-800">Performance dos Serviços</h3>
        </div>
        
        {services.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Nenhum serviço cadastrado ainda.
          </p>
        ) : serviceStats.every(s => s.count === 0) ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-3">
              Nenhum agendamento para o período selecionado.
            </p>
            <p className="text-sm text-gray-500">
              Você tem {services.length} serviço{services.length > 1 ? 's' : ''} cadastrado{services.length > 1 ? 's' : ''}, mas sem agendamentos em {getPeriodLabel().toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {serviceStats.filter(s => s.count > 0).map((service, index) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-gold-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{service.name}</p>
                    <p className="text-sm text-gray-600">{service.count} agendamentos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-pink-600">R$ {service.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="font-semibold text-gray-800 mb-3">💡 Insights Rápidos</h3>
        <div className="space-y-2 text-sm text-gray-700">
          {totalAppointments === 0 && (
            <p>• Ainda não há agendamentos futuros para este período.</p>
          )}
          {totalAppointments > 0 && (
            <p>• Você tem {totalAppointments} agendamento{totalAppointments > 1 ? 's' : ''} confirmado{totalAppointments > 1 ? 's' : ''} para {getPeriodLabel().toLowerCase()}.</p>
          )}
          {serviceStats.length > 0 && serviceStats[0].count > 0 && (
            <p>• Seu serviço mais popular é "{serviceStats[0].name}" com {serviceStats[0].count} agendamentos.</p>
          )}
          {averageTicket > 0 && (
            <p>• Seu ticket médio de R$ {averageTicket.toFixed(2)} está {averageTicket > referenceTicket ? 'acima' : 'abaixo'} da média dos últimos 30 dias (R$ {referenceTicket.toFixed(2)}).</p>
          )}
          {services.length < 3 && (
            <p>• Considere adicionar mais serviços para diversificar suas opções.</p>
          )}
          {totalRevenue > 0 && (
            <p>• Faturamento previsto de R$ {totalRevenue.toFixed(2)} para {getPeriodLabel().toLowerCase()}.</p>
          )}
        </div>
      </div>
    </div>
  );
}

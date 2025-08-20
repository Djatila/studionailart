import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Users, Award, BarChart } from 'lucide-react';
import { NailDesigner, Appointment, Service } from '../App';

interface StatisticsProps {
  designer: NailDesigner;
  onBack: () => void;
}

export default function Statistics({ designer, onBack }: StatisticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  const getAppointments = (): Appointment[] => {
    const saved = localStorage.getItem('nail_appointments');
    const allAppointments = saved ? JSON.parse(saved) : [];
    return allAppointments.filter((apt: Appointment) => apt.designerId === designer.id);
  };

  const getServices = (): Service[] => {
    const saved = localStorage.getItem('nail_services');
    const allServices = saved ? JSON.parse(saved) : [];
    return allServices.filter((service: Service) => service.designerId === designer.id);
  };

  const getFilteredAppointments = () => {
    const appointments = getAppointments();
    const now = new Date();
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date + 'T00:00:00');
      
      switch (selectedPeriod) {
        case 'week':
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          return aptDate >= weekAgo && aptDate <= now;
        
        case 'month':
          return aptDate.getMonth() === now.getMonth() && 
                 aptDate.getFullYear() === now.getFullYear();
        
        case 'year':
          return aptDate.getFullYear() === now.getFullYear();
        
        default:
          return true;
      }
    });
  };

  const appointments = getFilteredAppointments();
  const services = getServices();
  
  const totalRevenue = appointments.reduce((sum, apt) => sum + apt.price, 0);
  const totalAppointments = appointments.length;
  const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;
  
  // Service popularity
  const serviceStats = services.map(service => {
    const serviceAppointments = appointments.filter(apt => apt.service === service.name);
    return {
      name: service.name,
      count: serviceAppointments.length,
      revenue: serviceAppointments.reduce((sum, apt) => sum + apt.price, 0)
    };
  }).sort((a, b) => b.count - a.count);

  // Daily revenue for current month
  const dailyRevenue = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const dayRevenue = appointments
      .filter(apt => apt.date === dateStr)
      .reduce((sum, apt) => sum + apt.price, 0);
    
    return {
      date: date.getDate(),
      revenue: dayRevenue
    };
  });

  const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.revenue));

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return 'Última Semana';
      case 'month': return 'Este Mês';
      case 'year': return 'Este Ano';
      default: return 'Período';
    }
  };

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
              {period === 'week' && 'Semana'}
              {period === 'month' && 'Mês'}
              {period === 'year' && 'Ano'}
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
              <p className="text-sm opacity-90">Atendimentos</p>
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
          <h3 className="font-semibold text-gray-800">Faturamento dos Últimos 30 Dias</h3>
        </div>
        
        <div className="space-y-2">
          {dailyRevenue.map((day, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-6">{day.date}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-pink-400 to-rose-400 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: maxDailyRevenue > 0 ? `${(day.revenue / maxDailyRevenue) * 100}%` : '0%'
                  }}
                />
              </div>
              <span className="text-xs text-gray-600 w-16 text-right">
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
        
        {serviceStats.length === 0 ? (
          <p className="text-gray-600 text-center py-4">
            Nenhum dado de serviço disponível para o período selecionado.
          </p>
        ) : (
          <div className="space-y-4">
            {serviceStats.map((service, index) => (
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
            <p>• Ainda não há agendamentos para analisar neste período.</p>
          )}
          {serviceStats.length > 0 && serviceStats[0].count > 0 && (
            <p>• Seu serviço mais popular é "{serviceStats[0].name}" com {serviceStats[0].count} agendamentos.</p>
          )}
          {averageTicket > 0 && (
            <p>• Seu ticket médio de R$ {averageTicket.toFixed(2)} está {averageTicket > 50 ? 'acima' : 'abaixo'} de R$ 50,00.</p>
          )}
          {services.length < 3 && (
            <p>• Considere adicionar mais serviços para diversificar suas opções.</p>
          )}
        </div>
      </div>
    </div>
  );
}
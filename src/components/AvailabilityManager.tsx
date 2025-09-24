import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { NailDesigner, Availability } from '../App';

interface AvailabilityManagerProps {
  designer: NailDesigner;
  onBack: () => void;
}


export default function AvailabilityManager({ designer, onBack }: AvailabilityManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    specificDate: '',
    startTime: '00:00',
    endTime: '23:59'
  });

  // Load availability data on component mount
  useEffect(() => {
    loadAvailability();
  }, [designer.id]);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const data = await getAvailability();
      setAvailability(data);
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailability = async (): Promise<Availability[]> => {
    try {
      const { availabilityService } = await import('../utils/supabaseUtils');
      const supabaseAvailability = await availabilityService.getByDesignerId(designer.id);
      
      const filteredAvailability = supabaseAvailability.filter(avail => avail.specific_date);
      const mappedAvailability = filteredAvailability.map(avail => {
        return {
          id: avail.id,
          designerId: avail.designer_id,
          specificDate: avail.specific_date!,
          startTime: avail.start_time,
          endTime: avail.end_time,
          isActive: !avail.is_available // isActive = bloqueio ativo
        };
      });
      
      if (mappedAvailability.length > 0) {
        return mappedAvailability;
      }
    } catch (error) {
      console.error('Erro ao buscar disponibilidade do Supabase:', error);
    }
    
    // Fallback para localStorage
    const saved = localStorage.getItem('nail_availability');
    const allAvailability = saved ? JSON.parse(saved) : [];
    return allAvailability
      .filter((avail: any) => 
        avail.designerId === designer.id && 
        avail.specificDate && 
        typeof avail.specificDate === 'string'
      );
  };

  const saveAvailability = async (availability: Availability) => {
    try {
      const { availabilityService } = await import('../utils/supabaseUtils');
      const supabaseAvailability = {
        designer_id: availability.designerId,
        day_of_week: availability.specificDate ? new Date(availability.specificDate).getDay() : 0,
        start_time: availability.startTime,
        end_time: availability.endTime,
        is_available: false, // criar como BLOQUEADO
        specific_date: availability.specificDate
      };
      const savedAvailability = await availabilityService.create(supabaseAvailability);
      
      if (savedAvailability) {
        console.log('Disponibilidade salva no Supabase:', savedAvailability);
      }
    } catch (error) {
      console.error('Erro ao salvar disponibilidade no Supabase:', error);
    }
    
    // Também salvar no localStorage para compatibilidade
    const saved = localStorage.getItem('nail_availability');
    const allAvailability = saved ? JSON.parse(saved) : [];
    allAvailability.push(availability);
    localStorage.setItem('nail_availability', JSON.stringify(allAvailability));
  };

  const deleteAvailability = async (availabilityId: string) => {
    try {
      // Deletar do Supabase
      const { availabilityService } = await import('../utils/supabaseUtils');
      const deleted = await availabilityService.delete(availabilityId);
      
      if (deleted) {
        console.log('Disponibilidade deletada do Supabase:', availabilityId);
      }
    } catch (error) {
      console.error('Erro ao deletar disponibilidade do Supabase:', error);
    }
    
    // Também deletar do localStorage
    const saved = localStorage.getItem('nail_availability');
    const allAvailability = saved ? JSON.parse(saved) : [];
    const filtered = allAvailability.filter((avail: Availability) => avail.id !== availabilityId);
    localStorage.setItem('nail_availability', JSON.stringify(filtered));
    // Reload availability data
    await loadAvailability();
  };

  const toggleAvailability = async (availabilityId: string) => {
    try {
      const saved = localStorage.getItem('nail_availability');
      const allAvailability = saved ? JSON.parse(saved) : [];
      const currentAvail = allAvailability.find((avail: Availability) => avail.id === availabilityId);
      
      if (currentAvail) {
        const { availabilityService } = await import('../utils/supabaseUtils');
        // Se bloqueado (isActive = true), ao alternar vira liberado => is_available: true
        const updated = await availabilityService.update(availabilityId, {
          is_available: currentAvail.isActive ? true : false
        });
        if (updated) {
          console.log('Disponibilidade (bloqueio) atualizada no Supabase:', updated);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar disponibilidade no Supabase:', error);
    }
    // Atualizar localStorage (inverter bloqueio)
    const saved = localStorage.getItem('nail_availability');
    const allAvailability = saved ? JSON.parse(saved) : [];
    const updated = allAvailability.map((avail: Availability) => 
      avail.id === availabilityId ? { ...avail, isActive: !avail.isActive } : avail
    );
    localStorage.setItem('nail_availability', JSON.stringify(updated));
    await loadAvailability();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if this specific date already has availability
    const existing = availability.find(avail => 
      avail.specificDate === formData.specificDate && avail.isActive
    );
    
    if (existing) {
      alert('Já existe um horário ativo para esta data!');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert('O horário de início deve ser anterior ao horário de fim!');
      return;
    }
    
    const newAvailability: Availability = {
      designerId: designer.id,
      specificDate: formData.specificDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      isActive: true
    };
    
    await saveAvailability(newAvailability);
    setShowForm(false);
    setFormData({ specificDate: '', startTime: '09:00', endTime: '18:00' });
    // Reload availability data
    await loadAvailability();
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ specificDate: '', startTime: '09:00', endTime: '18:00' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-pink-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Bloqueios de Dias</h1>
        </div>
        
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Bloqueio
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 Como funciona</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• O calendário fica liberado por padrão</li>
          <li>• Bloqueie os dias em que você não vai atender</li>
          <li>• Você pode desbloquear dias temporariamente</li>
          <li>• Por padrão, o bloqueio é para o dia inteiro</li>
        </ul>
      </div>

      {/* Availability Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Novo Bloqueio de Dia
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Data Específica
              </label>
              <input
                type="date"
                value={formData.specificDate}
                onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário de Início
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Horário de Fim
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 p-3 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Availability List */}
      {!showForm && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando horários...</p>
            </div>
          ) : availability.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhum horário de atendimento configurado ainda.</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Configurar Primeiro Horário
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {availability
                .sort((a, b) => a.specificDate.localeCompare(b.specificDate))
                .map((avail) => (
                  <div key={avail.id} className="bg-white rounded-xl p-4 shadow-sm border border-pink-100">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      {new Date(avail.specificDate + 'T00:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </h3>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-pink-600" />
                        <span className="font-medium text-gray-800">
                          {avail.startTime} - {avail.endTime}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          avail.isActive 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          {avail.isActive ? 'Bloqueado' : 'Liberado'}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleAvailability(avail.id!)}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                            avail.isActive
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          }`}
                        >
                          {avail.isActive ? 'Desbloquear' : 'Bloquear'}
                        </button>
                        <button
                          onClick={() => deleteAvailability(avail.id!)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
      )}
    </div>
  );
}
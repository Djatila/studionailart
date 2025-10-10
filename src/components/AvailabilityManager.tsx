import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Clock, Calendar, X } from 'lucide-react';
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
    endTime: '23:59',
    blockType: 'fullDay', // 'fullDay' ou 'specificHours'
    specificHours: [] as string[]
  });

  // Monitorar mudanças no estado de disponibilidade
  useEffect(() => {
    console.log('Estado de availability atualizado:', availability);
  }, [availability]);

  // Horários específicos disponíveis
  const availableHours = ['08:00', '10:00', '13:00', '15:00', '17:00'];

  // Load availability data on component mount
  useEffect(() => {
    loadAvailability();
  }, [designer.id]);

  const loadAvailability = async () => {
    console.log('=== Iniciando loadAvailability ===');
    setLoading(true);
    try {
      const data = await getAvailability();
      console.log('Dados recebidos de getAvailability:', data);
      // Garantir que data é um array antes de definir o estado
      if (Array.isArray(data)) {
        console.log('Definindo estado com dados:', data);
        setAvailability(data);
      } else {
        console.warn('Dados de disponibilidade não são um array:', data);
        setAvailability([]); // Definir como array vazio se não for um array válido
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
      setAvailability([]); // Definir como array vazio em caso de erro
    } finally {
      setLoading(false);
      console.log('=== Finalizando loadAvailability ===');
    }
  };

  const getAvailability = async (): Promise<Availability[]> => {
    console.log('=== Iniciando getAvailability ===');
    try {
      const { availabilityService } = await import('../utils/supabaseUtils');
      const supabaseAvailability = await availabilityService.getByDesignerId(designer.id);
      console.log('Dados do Supabase:', supabaseAvailability);
      
      // Filtrar apenas os registros com specific_date (bloqueios de datas específicas)
      const filteredAvailability = supabaseAvailability.filter(avail => avail.specific_date);
      console.log('Dados filtrados:', filteredAvailability);
      
      const mappedAvailability = filteredAvailability.map(avail => {
        return {
          id: avail.id, // Usar o ID do Supabase
          designerId: avail.designer_id,
          specificDate: avail.specific_date!,
          startTime: avail.start_time,
          endTime: avail.end_time,
          isActive: !avail.is_available // isActive = bloqueio ativo (quando is_available = false)
        };
      });
      
      console.log('Dados mapeados:', mappedAvailability);
      
      // Sempre salvar os dados do Supabase no localStorage para manter consistência local
      localStorage.setItem('nail_availability', JSON.stringify(mappedAvailability));
      
      console.log('=== Finalizando getAvailability (com dados do Supabase) ===');
      return mappedAvailability;
    } catch (error) {
      console.error('Erro ao buscar disponibilidade do Supabase:', error);
      return [];
    }
  };

  const saveAvailability = async (availability: Availability) => {
    // Gerar um ID único se não houver um
    const availabilityWithId = {
      ...availability,
      id: availability.id || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('Salvando disponibilidade:', availabilityWithId);
    
    try {
      const { availabilityService } = await import('../utils/supabaseUtils');
      const supabaseAvailability = {
        designer_id: availabilityWithId.designerId,
        day_of_week: availabilityWithId.specificDate ? new Date(availabilityWithId.specificDate).getDay() : 0,
        start_time: availabilityWithId.startTime,
        end_time: availabilityWithId.endTime,
        is_available: false, // criar como BLOQUEADO
        specific_date: availabilityWithId.specificDate
      };
      const savedAvailability = await availabilityService.create(supabaseAvailability);
      
      if (savedAvailability) {
        console.log('Disponibilidade salva no Supabase:', savedAvailability);
        // Atualizar o ID se foi gerado pelo Supabase
        availabilityWithId.id = savedAvailability.id;
      }
    } catch (error) {
      console.error('Erro ao salvar disponibilidade no Supabase:', error);
      // Mesmo em caso de erro, continuar com o processo de salvamento local
    }
    
    // Também salvar no localStorage para compatibilidade
    const saved = localStorage.getItem('nail_availability');
    let allAvailability = saved ? JSON.parse(saved) : [];
    
    // Garantir que allAvailability seja um array
    if (!Array.isArray(allAvailability)) {
      allAvailability = [];
    }
    
    console.log('Dados atuais no localStorage antes de salvar:', allAvailability);
    
    // Verificar se já existe um item com este ID
    const existingIndex = allAvailability.findIndex((item: Availability) => item.id === availabilityWithId.id);
    if (existingIndex >= 0) {
      // Atualizar item existente
      console.log('Atualizando item existente no índice:', existingIndex);
      allAvailability[existingIndex] = availabilityWithId;
    } else {
      // Adicionar novo item
      console.log('Adicionando novo item');
      allAvailability.push(availabilityWithId);
    }
    
    console.log('Dados a serem salvos no localStorage:', allAvailability);
    localStorage.setItem('nail_availability', JSON.stringify(allAvailability));
    
    // Recarregar os dados para garantir consistência
    await loadAvailability();
  };

  const deleteAvailability = async (availabilityId: string) => {
    console.log('=== Iniciando deleteAvailability ===');
    console.log('ID a ser excluído:', availabilityId);
    console.log('Tipo do ID:', typeof availabilityId);
    
    // Verificar se o ID parece ser um UUID válido do Supabase antes de tentar deletar
    const isUuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(availabilityId);
    console.log('ID está no formato UUID válido:', isUuidFormat);
    
    // Deletar do Supabase apenas se for um UUID válido
    if (isUuidFormat) {
      try {
        const { availabilityService } = await import('../utils/supabaseUtils');
        console.log('Tentando deletar do Supabase...');
        const deleted = await availabilityService.delete(availabilityId);
        
        if (deleted) {
          console.log('Disponibilidade deletada do Supabase:', availabilityId);
        } else {
          console.warn('Falha ao deletar disponibilidade do Supabase:', availabilityId);
        }
      } catch (error) {
        console.error('Erro ao deletar disponibilidade do Supabase:', error);
      }
    } else {
      console.log('Pulando deleção no Supabase - ID não é UUID válido:', availabilityId);
    }
    
    // Também deletar do localStorage
    try {
      console.log('Tentando deletar do localStorage...');
      const saved = localStorage.getItem('nail_availability');
      let allAvailability = saved ? JSON.parse(saved) : [];
      
      console.log('Dados atuais no localStorage:', allAvailability);
      console.log('Tipo de allAvailability:', typeof allAvailability);
      console.log('É array?', Array.isArray(allAvailability));
      
      // Verificar se allAvailability é um array
      if (!Array.isArray(allAvailability)) {
        allAvailability = [];
      }
      
      console.log('Total de itens antes da filtragem:', allAvailability.length);
      
      // Filtrar para remover apenas o item específico
      const filtered = allAvailability.filter((avail: any) => {
        // Verificar se avail existe
        if (!avail) {
          console.log('Item nulo ou indefinido encontrado');
          return true; // Manter itens válidos
        }
        
        // Verificar se o item tem ID
        const itemId = avail.id;
        if (!itemId) {
          console.log('Item sem ID encontrado:', avail);
          return true; // Manter itens válidos
        }
        
        // Comparar IDs como strings para garantir compatibilidade
        const shouldKeep = String(itemId) !== String(availabilityId);
        console.log(`Comparando IDs - Item: ${itemId} (${typeof itemId}) | Target: ${availabilityId} (${typeof availabilityId}) | Manter: ${shouldKeep}`);
        return shouldKeep;
      });
      
      console.log('Resultado da filtragem:', filtered);
      console.log('Total de itens após filtragem:', filtered.length);
      
      localStorage.setItem('nail_availability', JSON.stringify(filtered));
      
      // Atualizar o estado local imediatamente para refletir a mudança
      setAvailability(prev => {
        console.log('Atualizando estado local...');
        const newState = prev.filter(avail => {
          if (!avail) return true;
          const itemId = avail.id;
          if (!itemId) return true;
          const shouldKeep = String(itemId) !== String(availabilityId);
          console.log(`Filtrando estado - Item: ${itemId} | Target: ${availabilityId} | Manter: ${shouldKeep}`);
          return shouldKeep;
        });
        console.log('Novo estado:', newState);
        return newState;
      });
    } catch (error) {
      console.error('Erro ao deletar do localStorage:', error);
    }
    
    // Recarregar dados do Supabase para garantir consistência
    try {
      console.log('Recarregando dados do Supabase...');
      const data = await getAvailability();
      console.log('Dados recarregados:', data);
      // Garantir que data é um array antes de definir o estado
      if (Array.isArray(data)) {
        setAvailability(data);
      } else {
        console.warn('Dados de disponibilidade não são um array:', data);
        setAvailability([]); // Definir como array vazio se não for um array válido
      }
    } catch (error) {
      console.error('Erro ao recarregar disponibilidade:', error);
      // Em caso de erro, manter os dados atuais filtrados
      setAvailability(prev => prev.filter(avail => {
        if (!avail) return true;
        const itemId = avail.id;
        if (!itemId) return true;
        return String(itemId) !== String(availabilityId);
      }));
    }
    
    console.log('=== Finalizando deleteAvailability ===');
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
    
    // Verificar se já existe um bloqueio para esta data
    const existing = availability.find(avail => 
      avail.specificDate === formData.specificDate && avail.isActive
    );
    
    if (existing) {
      alert('Já existe um bloqueio ativo para esta data!');
      return;
    }

    if (formData.blockType === 'fullDay') {
      // Bloqueio de dia inteiro
      if (formData.startTime >= formData.endTime) {
        alert('O horário de início deve ser anterior ao horário de fim!');
        return;
      }
      
      const newAvailability: Availability = {
        id: `avail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID único
        designerId: designer.id,
        specificDate: formData.specificDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        isActive: true
      };
      
      await saveAvailability(newAvailability);
    } else {
      // Bloqueio de horários específicos
      if (formData.specificHours.length === 0) {
        alert('Selecione pelo menos um horário para bloquear!');
        return;
      }
      
      // Criar um bloqueio para cada horário selecionado
      for (const hour of formData.specificHours) {
        // Converter hora para formato de início e fim (ex: '08:00' -> '08:00' a '09:00')
        const [hours, minutes] = hour.split(':').map(Number);
        const startHour = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Calcular hora de término (adicionar 1 hora)
        const endHours = (hours + 1) % 24;
        const endHour = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        const newAvailability: Availability = {
          id: `avail-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // ID único
          designerId: designer.id,
          specificDate: formData.specificDate,
          startTime: startHour,
          endTime: endHour,
          isActive: true
        };
        
        await saveAvailability(newAvailability);
      }
    }
    
    setShowForm(false);
    setFormData({ 
      specificDate: '', 
      startTime: '00:00', 
      endTime: '23:59',
      blockType: 'fullDay',
      specificHours: []
    });
    // Reload availability data
    await loadAvailability();
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ 
      specificDate: '', 
      startTime: '00:00', 
      endTime: '23:59',
      blockType: 'fullDay',
      specificHours: []
    });
  };

  // Função para alternar seleção de horário específico
  const toggleSpecificHour = (hour: string) => {
    setFormData(prev => {
      const newHours = prev.specificHours.includes(hour)
        ? prev.specificHours.filter(h => h !== hour)
        : [...prev.specificHours, hour];
      
      return {
        ...prev,
        specificHours: newHours
      };
    });
  };

  // Função para sincronizar dados locais com Supabase
  const syncLocalAvailabilityToSupabase = async () => {
    try {
      console.log('=== Iniciando sincronização de dados locais com Supabase ===');
      
      const saved = localStorage.getItem('nail_availability');
      let localAvailability = saved ? JSON.parse(saved) : [];
      
      // Garantir que localAvailability seja um array
      if (!Array.isArray(localAvailability)) {
        localAvailability = [];
      }
      
      if (localAvailability.length === 0) {
        console.log('Nenhum dado local encontrado para sincronização');
        return;
      }
      
      console.log(`Encontrados ${localAvailability.length} itens para sincronização`);
      
      const { availabilityService } = await import('../utils/supabaseUtils');
      
      // Processar cada item local
      for (const localItem of localAvailability) {
        // Verificar se o item já tem um ID válido do Supabase
        if (localItem.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(localItem.id)) {
          console.log(`Item ${localItem.id} já possui ID do Supabase, pulando...`);
          continue;
        }
        
        // Criar item no Supabase
        const supabaseItem = {
          designer_id: localItem.designerId || designer.id,
          day_of_week: localItem.specificDate ? new Date(localItem.specificDate).getDay() : 0,
          start_time: localItem.startTime || '00:00',
          end_time: localItem.endTime || '23:59',
          is_available: localItem.isActive !== undefined ? !localItem.isActive : true,
          specific_date: localItem.specificDate
        };
        
        console.log('Criando item no Supabase:', supabaseItem);
        const created = await availabilityService.create(supabaseItem);
        
        if (created) {
          console.log('Item criado com sucesso no Supabase:', created.id);
          
          // Atualizar o item local com o ID do Supabase
          localItem.id = created.id;
        } else {
          console.warn('Falha ao criar item no Supabase:', localItem);
        }
      }
      
      // Salvar os itens atualizados no localStorage
      localStorage.setItem('nail_availability', JSON.stringify(localAvailability));
      console.log('=== Finalizando sincronização de dados locais com Supabase ===');
      
      // Recarregar os dados para garantir consistência
      await loadAvailability();
    } catch (error) {
      console.error('Erro ao sincronizar dados locais com Supabase:', error);
    }
  };

  // Sincronizar dados locais com Supabase quando o componente montar
  useEffect(() => {
    syncLocalAvailabilityToSupabase();
  }, []);

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
          <li>• Agora você pode bloquear horários específicos ou o dia inteiro</li>
        </ul>
      </div>

      {/* Availability Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Novo Bloqueio de Dia
            </h2>
            <button
              onClick={handleCancel}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
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
            
            {/* Tipo de bloqueio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Bloqueio
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, blockType: 'fullDay' })}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    formData.blockType === 'fullDay'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dia Inteiro
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, blockType: 'specificHours' })}
                  className={`p-3 rounded-lg font-medium transition-colors ${
                    formData.blockType === 'specificHours'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Apenas Horários Específicos
                </button>
              </div>
            </div>
            
            {formData.blockType === 'fullDay' ? (
              // Formulário para bloqueio de dia inteiro
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
            ) : (
              // Formulário para bloqueio de horários específicos
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Selecione os Horários para Bloquear
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableHours.map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => toggleSpecificHour(hour)}
                      className={`p-3 rounded-lg font-medium transition-colors ${
                        formData.specificHours.includes(hour)
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
                {formData.specificHours.length > 0 && (
                  <div className="mt-3 p-3 bg-pink-50 rounded-lg">
                    <p className="text-sm text-pink-700">
                      Horários selecionados: {formData.specificHours.join(', ')}
                    </p>
                    <p className="text-xs text-pink-600 mt-1">
                      Cada horário bloqueará um intervalo de 1 hora (ex: 08:00 bloqueia de 08:00 a 09:00)
                    </p>
                  </div>
                )}
              </div>
            )}
            
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
                Adicionar Bloqueio
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
                .sort((a, b) => {
                  // Ordenar por data e depois por horário de início
                  const dateComparison = a.specificDate.localeCompare(b.specificDate);
                  if (dateComparison !== 0) return dateComparison;
                  return a.startTime.localeCompare(b.startTime);
                })
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
                          onClick={() => {
                            console.log('Botão de exclusão clicado. ID:', avail.id);
                            if (avail.id) {
                              deleteAvailability(avail.id);
                            } else {
                              console.error('ID não encontrado para exclusão:', avail);
                            }
                          }}
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

  // Função para sincronizar dados locais com Supabase quando necessário
  const syncLocalDataWithSupabaseIfNeeded = async (supabaseData: Availability[]) => {
    try {
      const saved = localStorage.getItem('nail_availability');
      let localAvailability = saved ? JSON.parse(saved) : [];
      
      // Garantir que localAvailability seja um array
      if (!Array.isArray(localAvailability)) {
        localAvailability = [];
      }
      
      if (localAvailability.length === 0) {
        return;
      }
      
      // Verificar se há itens locais que não estão no Supabase
      const localItemsNotInSupabase = localAvailability.filter(localItem => {
        // Verificar se o item local já tem um ID do Supabase
        if (localItem.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(localItem.id)) {
          // Verificar se o item já existe no Supabase
          return !supabaseData.some(supabaseItem => supabaseItem.id === localItem.id);
        }
        // Itens locais sem ID do Supabase precisam ser sincronizados
        return true;
      });
      
      if (localItemsNotInSupabase.length > 0) {
        console.log(`Encontrados ${localItemsNotInSupabase.length} itens locais para sincronização com Supabase`);
        
        const { availabilityService } = await import('../utils/supabaseUtils');
        
        // Sincronizar cada item local
        for (const localItem of localItemsNotInSupabase) {
          // Criar item no Supabase
          const supabaseItem = {
            designer_id: localItem.designerId || designer.id,
            day_of_week: localItem.specificDate ? new Date(localItem.specificDate).getDay() : 0,
            start_time: localItem.startTime || '00:00',
            end_time: localItem.endTime || '23:59',
            is_available: localItem.isActive !== undefined ? !localItem.isActive : true,
            specific_date: localItem.specificDate
          };
          
          console.log('Sincronizando item local com Supabase:', supabaseItem);
          const created = await availabilityService.create(supabaseItem);
          
          if (created) {
            console.log('Item sincronizado com sucesso:', created.id);
            
            // Atualizar o item local com o ID do Supabase
            localItem.id = created.id;
          } else {
            console.warn('Falha ao sincronizar item local:', localItem);
          }
        }
        
        // Salvar os itens atualizados no localStorage
        localStorage.setItem('nail_availability', JSON.stringify(localAvailability));
        console.log('Dados locais atualizados após sincronização');
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados locais com Supabase:', error);
    }
  };


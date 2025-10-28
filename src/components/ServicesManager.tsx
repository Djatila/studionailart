import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, DollarSign, Clock, Tag } from 'lucide-react';
import { NailDesigner, Service } from '../App';
import { serviceService } from '../utils/supabaseUtils';

interface ServicesManagerProps {
  designer: NailDesigner;
  onBack: () => void;
}

export default function ServicesManager({ designer, onBack }: ServicesManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [activeTab, setActiveTab] = useState<'services' | 'extras'>('services');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
    category: 'services' as 'services' | 'extras'
  });

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      setLoading(true);
      // Primeiro tenta buscar do Supabase
      const supabaseServices = await serviceService.getByDesignerId(designer.id);
      
      if (supabaseServices && supabaseServices.length > 0) {
        // Converte os dados do Supabase para o formato local
        const convertedServices = supabaseServices.map(service => ({
          id: service.id,
          designerId: service.designer_id,
          name: service.name,
          price: service.price,
          duration: service.duration,
          description: service.description || '',
          category: service.category || 'services'
        }));
        setServices(convertedServices);
      } else {
        // Fallback para localStorage se não houver dados no Supabase
        const saved = localStorage.getItem('nail_services');
        const allServices = saved ? JSON.parse(saved) : [];
        const localServices = allServices.filter((service: Service) => service.designerId === designer.id);
        setServices(localServices);
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      // Em caso de erro, usa localStorage como fallback
      const saved = localStorage.getItem('nail_services');
      const allServices = saved ? JSON.parse(saved) : [];
      const localServices = allServices.filter((service: Service) => service.designerId === designer.id);
      setServices(localServices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [designer.id]);

  const saveService = async (service: Service) => {
    try {
      if (editingService) {
        // Atualiza no Supabase
        const updateData = {
          designer_id: service.designerId,
          name: service.name,
          price: service.price,
          duration: service.duration,
          description: service.description,
          category: service.category
        };
        await serviceService.update(editingService.id, updateData);
      } else {
        // Cria no Supabase (sem ID, deixa o Supabase gerar)
        const createData = {
          designer_id: service.designerId,
          name: service.name,
          price: service.price,
          duration: service.duration,
          description: service.description,
          category: service.category
        };
        await serviceService.create(createData);
      }

      // Também salva no localStorage para compatibilidade
      const saved = localStorage.getItem('nail_services');
      const allServices = saved ? JSON.parse(saved) : [];
      
      if (editingService) {
        const index = allServices.findIndex((s: Service) => s.id === editingService.id);
        if (index >= 0) {
          allServices[index] = service;
        }
      } else {
        allServices.push(service);
      }
      
      localStorage.setItem('nail_services', JSON.stringify(allServices));
      
      // Recarrega os serviços
      await loadServices();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      // Em caso de erro, salva apenas no localStorage
      const saved = localStorage.getItem('nail_services');
      const allServices = saved ? JSON.parse(saved) : [];
      
      if (editingService) {
        const index = allServices.findIndex((s: Service) => s.id === editingService.id);
        if (index >= 0) {
          allServices[index] = service;
        }
      } else {
        allServices.push(service);
      }
      
      localStorage.setItem('nail_services', JSON.stringify(allServices));
      await loadServices();
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      // Deleta do Supabase
      await serviceService.delete(serviceId);
      
      // Também deleta do localStorage para compatibilidade
      const saved = localStorage.getItem('nail_services');
      const allServices = saved ? JSON.parse(saved) : [];
      const filtered = allServices.filter((service: Service) => service.id !== serviceId);
      localStorage.setItem('nail_services', JSON.stringify(filtered));
      
      // Recarrega os serviços
      await loadServices();
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      // Em caso de erro, deleta apenas do localStorage
      const saved = localStorage.getItem('nail_services');
      const allServices = saved ? JSON.parse(saved) : [];
      const filtered = allServices.filter((service: Service) => service.id !== serviceId);
      localStorage.setItem('nail_services', JSON.stringify(filtered));
      await loadServices();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const service: Service = {
      id: editingService?.id || crypto.randomUUID(),
      designerId: designer.id,
      name: formData.name,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      description: formData.description,
      category: formData.category
    };
    
    await saveService(service);
    setShowForm(false);
    setEditingService(null);
    setFormData({ name: '', price: '', duration: '', description: '', category: 'services' });
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString(),
      description: service.description,
      category: service.category
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    setFormData({ name: '', price: '', duration: '', description: '', category: 'services' });
  };

  const handleNewService = (category: 'services' | 'extras') => {
    setFormData({ ...formData, category });
    setShowForm(true);
  };

  const regularServices = services.filter(s => s.category === 'services');
  const extraServices = services.filter(s => s.category === 'extras');

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-pink-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-pink-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">Gerenciar Serviços</h1>
        </div>
      </div>

      {/* Service Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-pink-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingService ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as 'services' | 'extras' })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              >
                <option value="services">Serviços</option>
                <option value="extras">Serviços Extras</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Serviço
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Ex: Esmaltação Simples"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duração (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="60"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={3}
                placeholder="Descrição detalhada do serviço..."
                required
              />
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
                {editingService ? 'Salvar' : 'Adicionar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <span className="ml-3 text-gray-600">Carregando serviços...</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!showForm && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-pink-100">
          <div className="flex border-b border-pink-100">
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeTab === 'services'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Serviços ({regularServices.length})
            </button>
            <button
              onClick={() => setActiveTab('extras')}
              className={`flex-1 py-3 px-4 font-medium transition-colors ${
                activeTab === 'extras'
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-600 hover:text-pink-600'
              }`}
            >
              Serviços Extras ({extraServices.length})
            </button>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {activeTab === 'services' ? 'Serviços Principais' : 'Serviços Extras'}
              </h3>
              <button
                onClick={() => handleNewService(activeTab)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Novo
              </button>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {(activeTab === 'services' ? regularServices : extraServices).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Nenhum {activeTab === 'services' ? 'serviço' : 'serviço extra'} cadastrado ainda.
                  </p>
                  <button
                    onClick={() => handleNewService(activeTab)}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Cadastrar Primeiro {activeTab === 'services' ? 'Serviço' : 'Serviço Extra'}
                  </button>
                </div>
              ) : (
                (activeTab === 'services' ? regularServices : extraServices).map((service) => (
                  <div key={service.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">{service.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            service.category === 'services' 
                              ? 'bg-pink-100 text-pink-600' 
                              : 'bg-gold-100 text-gold-600'
                          }`}>
                            {service.category === 'services' ? 'Serviço' : 'Extra'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-lg font-bold text-pink-600">
                            R$ {service.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration}min
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteService(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
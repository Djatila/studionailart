import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { NailDesigner } from '../App';

interface DesignerSettingsProps {
  designer: NailDesigner;
  onBack: () => void;
}

export default function DesignerSettings({ designer, onBack }: DesignerSettingsProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = () => {
    setError('');
    setSuccess(false);

    // Validações
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (passwords.current !== designer.password) {
      setError('Senha atual incorreta.');
      return;
    }

    if (passwords.new.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setError('A confirmação da nova senha não confere.');
      return;
    }

    if (passwords.new === passwords.current) {
      setError('A nova senha deve ser diferente da senha atual.');
      return;
    }

    // Atualizar senha no localStorage
    const designers = JSON.parse(localStorage.getItem('nail_designers') || '[]');
    const updatedDesigners = designers.map((d: NailDesigner) => 
      d.id === designer.id ? { ...d, password: passwords.new } : d
    );
    
    localStorage.setItem('nail_designers', JSON.stringify(updatedDesigners));
    
    // Limpar campos e mostrar sucesso
    setPasswords({ current: '', new: '', confirm: '' });
    setSuccess(true);
    
    // Disparar evento para atualizar dados
    window.dispatchEvent(new Event('storage'));
    
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-pink-200">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Lock className="w-6 h-6 text-pink-600" />
                <h1 className="text-xl font-bold text-gray-800">
                  Configurações de Segurança
                </h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {designer.name}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Alterar Senha */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl font-semibold text-gray-800">Alterar Senha</h2>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-600 text-sm">Senha alterada com sucesso!</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Senha Atual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha Atual
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-10"
                  placeholder="Digite sua senha atual"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-10"
                  placeholder="Digite sua nova senha (mín. 6 caracteres)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-10"
                  placeholder="Confirme sua nova senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handlePasswordChange}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
            >
              Alterar Senha
            </button>
          </div>
        </div>

        {/* Informações da Conta */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações da Conta</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Nome:</span>
              <span className="font-medium text-gray-800">{designer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-800">{designer.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Telefone:</span>
              <span className="font-medium text-gray-800">{designer.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${designer.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {designer.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
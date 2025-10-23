import React, { useState } from 'react';
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Link2, Copy, Check, User, FileText, Image, QrCode } from 'lucide-react';
import { NailDesigner } from '../App';
import { updateNailDesigner } from '../utils/supabaseUtils'; // ✅ Adicionar import
import { generateSlug, generatePersonalLink } from '../utils/slugUtils';
import QRCodeGenerator from './QRCodeGenerator';

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
  const [loading, setLoading] = useState(false); // ✅ Adicionar estado de loading
  
  // 🆕 NOVO: Estados para perfil
  const [profileData, setProfileData] = useState({
    bio: designer.bio || '',
    photoUrl: designer.photoUrl || designer.photo_url || ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Gerar slug e link personalizado
  const personalSlug = designer.slug || generateSlug(designer.name);
  const personalLink = generatePersonalLink(personalSlug);

  // 🆕 NOVO: Função para copiar link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(personalLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
    }
  };

  // 🆕 NOVO: Função para salvar perfil
  const handleProfileSave = async () => {
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      // Atualizar no Supabase
      const updateResult = await updateNailDesigner(designer.id, {
        bio: profileData.bio || null,
        photo_url: profileData.photoUrl || null,
        slug: personalSlug
      });

      if (!updateResult) {
        setProfileError('Erro ao atualizar perfil. Tente novamente.');
        return;
      }

      // Atualizar localStorage
      const designers = JSON.parse(localStorage.getItem('nail_designers') || '[]');
      const updatedDesigners = designers.map((d: NailDesigner) => 
        d.id === designer.id ? { 
          ...d, 
          bio: profileData.bio,
          photoUrl: profileData.photoUrl,
          photo_url: profileData.photoUrl,
          slug: personalSlug
        } : d
      );
      
      localStorage.setItem('nail_designers', JSON.stringify(updatedDesigners));
      
      setProfileSuccess(true);
      
      // Disparar evento para atualizar dados no componente pai
      const updatedDesigner = { 
        ...designer, 
        bio: profileData.bio,
        photoUrl: profileData.photoUrl,
        photo_url: profileData.photoUrl,
        slug: personalSlug
      };
      window.dispatchEvent(new CustomEvent('designerUpdated', { 
        detail: updatedDesigner 
      }));
      
      setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setProfileError('Erro interno. Tente novamente mais tarde.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => { // ✅ Tornar função async
    setError('');
    setSuccess(false);
    setLoading(true); // ✅ Ativar loading

    try {
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

      // ✅ ATUALIZAR NO SUPABASE PRIMEIRO
      const updateResult = await updateNailDesigner(designer.id, {
        password: passwords.new
      });

      if (!updateResult) {
        setError('Erro ao atualizar senha no servidor. Tente novamente.');
        return;
      }

      // ✅ Atualizar senha no localStorage (manter compatibilidade)
      const designers = JSON.parse(localStorage.getItem('nail_designers') || '[]');
      const updatedDesigners = designers.map((d: NailDesigner) => 
        d.id === designer.id ? { ...d, password: passwords.new } : d
      );
      
      localStorage.setItem('nail_designers', JSON.stringify(updatedDesigners));
      
      // ✅ Limpar campos e mostrar sucesso
      setPasswords({ current: '', new: '', confirm: '' });
      setSuccess(true);
      
      // ✅ Disparar evento para atualizar dados no componente pai
      const updatedDesigner = { ...designer, password: passwords.new };
      window.dispatchEvent(new CustomEvent('designerUpdated', { 
        detail: updatedDesigner 
      }));
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setError('Erro interno. Tente novamente mais tarde.');
    } finally {
      setLoading(false); // ✅ Desativar loading
    }
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
        {/* 🆕 NOVO: Perfil e Link Personalizado */}
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-pink-600" />
            <h2 className="text-xl font-semibold text-gray-800">Perfil Público</h2>
          </div>

          {profileError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{profileError}</p>
            </div>
          )}

          {profileSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-green-600 text-sm">Perfil atualizado com sucesso!</p>
            </div>
          )}

          {/* Link Personalizado */}
          <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-5 h-5 text-pink-600" />
              <h3 className="font-semibold text-gray-800">Seu Link Personalizado</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Compartilhe este link com suas clientes para agendamento direto:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={personalLink}
                readOnly
                className="flex-1 p-3 bg-white border border-pink-300 rounded-lg text-sm text-gray-700 font-mono"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
              >
                {linkCopied ? (
                  <>
                    <Check size={16} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copiar
                  </>
                )}
              </button>
            </div>
            
            {/* 🆕 NOVO: Botão para mostrar QR Code */}
            <button
              onClick={() => setShowQRCode(!showQRCode)}
              className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <QrCode size={16} />
              {showQRCode ? 'Ocultar QR Code' : 'Gerar QR Code'}
            </button>
            
            {/* QR Code */}
            {showQRCode && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <QRCodeGenerator value={personalLink} size={200} />
              </div>
            )}
          </div>

          {/* Foto de Perfil */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Image className="w-4 h-4" />
              URL da Foto de Perfil
            </label>
            <input
              type="url"
              value={profileData.photoUrl}
              onChange={(e) => setProfileData({ ...profileData, photoUrl: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="https://exemplo.com/sua-foto.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cole o link de uma imagem hospedada online (ex: Imgur, Google Drive público)
            </p>
            {profileData.photoUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Pré-visualização:</p>
                <img 
                  src={profileData.photoUrl} 
                  alt="Preview" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-pink-400"
                  onError={(e) => {
                    // Ocultar imagem se falhar ao carregar
                    e.currentTarget.style.display = 'none';
                    const errorMsg = document.createElement('p');
                    errorMsg.className = 'text-red-500 text-xs mt-2';
                    errorMsg.textContent = '⚠️ Não foi possível carregar a imagem. Verifique se o link está correto.';
                    e.currentTarget.parentElement?.appendChild(errorMsg);
                  }}
                />
              </div>
            )}
          </div>

          {/* Biografia */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Biografia
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="Conte um pouco sobre você e seu trabalho..."
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {profileData.bio.length}/300 caracteres
            </p>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {profileLoading ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>

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
              disabled={loading} // ✅ Desabilitar durante loading
            >
              Cancelar
            </button>
            <button
              onClick={handlePasswordChange}
              disabled={loading} // ✅ Desabilitar durante loading
              className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Alterando...' : 'Alterar Senha'} {/* ✅ Mostrar estado de loading */}
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
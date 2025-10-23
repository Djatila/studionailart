#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para transformar o login das nail designers de dropdown para campos individuais
Agora cada designer faz login com telefone + senha (sem ver outras designers)
"""

def fix_designer_login():
    file_path = r'src\components\LoginPage.tsx'
    
    try:
        # Ler o arquivo
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("✅ Arquivo lido com sucesso")
        
        # 1. Adicionar estado para telefone da designer
        old_state = """  const [selectedDesigner, setSelectedDesigner] = useState<string>('');
  const [password, setPassword] = useState('');"""
        
        new_state = """  const [selectedDesigner, setSelectedDesigner] = useState<string>('');
  const [password, setPassword] = useState('');
  const [designerPhone, setDesignerPhone] = useState('');"""
        
        if old_state in content:
            content = content.replace(old_state, new_state)
            print("✅ Estado designerPhone adicionado")
        else:
            print("⚠️ Estados não encontrados ou já modificados")
        
        # 2. Modificar handleDesignerLogin para buscar por telefone
        old_login = """  const handleDesignerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      // Primeiro, obter o designer selecionado para pegar o email
      const designer = await getNailDesignerById(selectedDesigner);
      
      if (!designer) {
        setLoginError('Designer não encontrado!');
        return;
      }
      
      if (!designer.isActive) {
        setLoginError('Esta conta foi desativada.');
        return;
      }
      
      // Verificar senha diretamente com os dados da designer
      if (designer.password !== password) {
        setLoginError('Senha incorreta!');
        return;
      }
      
      // Login bem-sucedido - usar dados da designer diretamente
      onLogin(designer);
      
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };"""
        
        new_login = """  const handleDesignerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    // Verificar conexão antes de tentar login
    if (!isOnline) {
      setLoginError('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      setLoading(false);
      return;
    }
    
    try {
      // Buscar designer pelo telefone
      const designer = await getNailDesignerByPhone(designerPhone);
      
      if (!designer) {
        setLoginError('Telefone não encontrado!');
        setLoading(false);
        return;
      }
      
      if (!designer.isActive) {
        setLoginError('Esta conta foi desativada.');
        setLoading(false);
        return;
      }
      
      // Verificar senha diretamente com os dados da designer
      if (designer.password !== password) {
        setLoginError('Senha incorreta!');
        setLoading(false);
        return;
      }
      
      // Login bem-sucedido - usar dados da designer diretamente
      onLogin(designer);
      
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };"""
        
        if old_login in content:
            content = content.replace(old_login, new_login)
            print("✅ handleDesignerLogin atualizado para buscar por telefone")
        else:
            print("⚠️ handleDesignerLogin não encontrado ou já modificado")
        
        # 3. Substituir o formulário de login (dropdown por campo de texto)
        old_form = """            <form onSubmit={handleDesignerLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Selecione seu perfil
                </label>
                <select
                  value={selectedDesigner}
                  onChange={(e) => {
                    setSelectedDesigner(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-purple-800/80 backdrop-blur-sm text-white placeholder-purple-200"
                  style={{
                    backgroundColor: 'rgba(107, 33, 168, 0.8)',
                    color: 'white'
                  }}
                  required
                >
                  <option value="" style={{ backgroundColor: '#6b21a8', color: 'white' }}>Escolha...</option>
                  {designers.map((designer) => (
                    <option key={designer.id} value={designer.id} style={{ backgroundColor: '#6b21a8', color: 'white' }}>
                      {designer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Senha
                </label>"""
        
        new_form = """            <form onSubmit={handleDesignerLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Número do WhatsApp
                </label>
                <input
                  type="tel"
                  value={designerPhone}
                  onChange={(e) => {
                    setDesignerPhone(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Senha
                </label>"""
        
        if old_form in content:
            content = content.replace(old_form, new_form)
            print("✅ Formulário atualizado: dropdown → campo de telefone")
        else:
            print("⚠️ Formulário não encontrado ou já modificado")
        
        # 4. Atualizar botão Voltar para limpar designerPhone
        old_back = """                  onClick={() => {
                    setShowDesignerLogin(false);
                    setSelectedDesigner('');
                    setPassword('');
                    setLoginError('');
                  }}"""
        
        new_back = """                  onClick={() => {
                    setShowDesignerLogin(false);
                    setDesignerPhone('');
                    setPassword('');
                    setLoginError('');
                  }}"""
        
        if old_back in content:
            content = content.replace(old_back, new_back)
            print("✅ Botão Voltar atualizado")
        else:
            print("⚠️ Botão Voltar não encontrado ou já modificado")
        
        # 5. Atualizar validação do botão submit
        old_submit = """                  disabled={!selectedDesigner || !password || loading}"""
        new_submit = """                  disabled={!designerPhone || !password || loading}"""
        
        if old_submit in content:
            content = content.replace(old_submit, new_submit)
            print("✅ Validação do botão submit atualizada")
        else:
            print("⚠️ Validação do submit não encontrada ou já modificada")
        
        # Salvar o arquivo
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("\n🎉 Arquivo LoginPage.tsx atualizado com sucesso!")
        print("✅ Login das designers agora é individual (telefone + senha)")
        print("✅ Nenhuma designer vê as outras cadastradas")
        print("✅ Verificação de conexão também adicionada")
        
    except FileNotFoundError:
        print(f"❌ Erro: Arquivo {file_path} não encontrado")
    except Exception as e:
        print(f"❌ Erro ao processar arquivo: {e}")

if __name__ == "__main__":
    print("🔧 Iniciando transformação do login das designers...\n")
    fix_designer_login()

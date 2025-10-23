#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para transformar o login de designer de dropdown para campos individuais
"""

import re

def fix_login_page():
    file_path = r'src\components\LoginPage.tsx'
    
    print("🔧 Lendo arquivo LoginPage.tsx...")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("✅ Arquivo lido com sucesso!")
    print("\n📝 Aplicando mudanças...\n")
    
    # Mudança 1: Trocar selectedDesigner por designerPhone no estado
    content = content.replace(
        "const [selectedDesigner, setSelectedDesigner] = useState<string>('');",
        "const [designerPhone, setDesignerPhone] = useState('');"
    )
    print("✅ 1/5 - Estado alterado: selectedDesigner → designerPhone")
    
    # Mudança 2: Trocar a função de login
    old_login = """  const handleDesignerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      // Primeiro, obter o designer selecionado para pegar o email
      const designer = await getNailDesignerById(selectedDesigner);
      
      if (!designer) {
        setLoginError('Designer não encontrado!');"""
    
    new_login = """  const handleDesignerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    
    try {
      // Buscar designer pelo telefone
      const designer = await getNailDesignerByPhone(designerPhone);
      
      if (!designer) {
        setLoginError('Telefone não encontrado!');"""
    
    content = content.replace(old_login, new_login)
    print("✅ 2/5 - Função de login alterada: busca por telefone")
    
    # Mudança 3: Trocar o select por input
    old_select = """              <div>
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
              </div>"""
    
    new_input = """              <div>
                <label className="block text-sm font-medium text-purple-100 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={designerPhone}
                  onChange={(e) => {
                    setDesignerPhone(e.target.value);
                    setLoginError('');
                  }}
                  className="w-full p-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-purple-200"
                  placeholder="Digite seu telefone"
                  required
                />
              </div>"""
    
    content = content.replace(old_select, new_input)
    print("✅ 3/5 - Dropdown substituído por campo de telefone")
    
    # Mudança 4: Trocar no botão Voltar
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
    
    content = content.replace(old_back, new_back)
    print("✅ 4/5 - Botão Voltar atualizado")
    
    # Mudança 5: Trocar validação do botão Entrar
    content = content.replace(
        "disabled={!selectedDesigner || !password || loading}",
        "disabled={!designerPhone || !password || loading}"
    )
    print("✅ 5/5 - Validação do botão Entrar atualizada")
    
    # Salvar arquivo
    print("\n💾 Salvando alterações...")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Arquivo salvo com sucesso!")
    print("\n🎉 CONCLUÍDO! Login individual implementado!")
    print("\n📋 O que mudou:")
    print("   • Dropdown removido (não mostra mais lista de designers)")
    print("   • Campo de telefone adicionado")
    print("   • Login agora usa telefone + senha")
    print("   • Cada designer só vê seus próprios dados")
    print("\n🧪 Teste agora:")
    print("   1. Recarregue a página (F5)")
    print("   2. Clique em 'Área da Nail Designer'")
    print("   3. Digite o telefone e senha")
    print("   4. Faça login!")

if __name__ == '__main__':
    try:
        fix_login_page()
    except FileNotFoundError:
        print("❌ ERRO: Arquivo LoginPage.tsx não encontrado!")
        print("   Certifique-se de estar na pasta raiz do projeto.")
    except Exception as e:
        print(f"❌ ERRO: {e}")

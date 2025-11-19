#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para adicionar verificação de conexão no login da cliente
"""

import re

def fix_login_page():
    file_path = r'src\components\LoginPage.tsx'
    
    try:
        # Ler o arquivo
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("✅ Arquivo lido com sucesso")
        
        # 1. Adicionar isOnline na interface LoginPageProps
        old_interface = """interface LoginPageProps {
  onLogin: (designer: NailDesigner, asClient?: boolean) => void;
  onSuperAdminLogin?: () => void;
}"""
        
        new_interface = """interface LoginPageProps {
  onLogin: (designer: NailDesigner, asClient?: boolean) => void;
  onSuperAdminLogin?: () => void;
  isOnline?: boolean;
}"""
        
        if old_interface in content:
            content = content.replace(old_interface, new_interface)
            print("✅ Interface LoginPageProps atualizada")
        else:
            print("⚠️ Interface LoginPageProps não encontrada ou já modificada")
        
        # 2. Adicionar isOnline no destructuring dos props
        old_function = "export default function LoginPage({ onLogin, onSuperAdminLogin }: LoginPageProps) {"
        new_function = "export default function LoginPage({ onLogin, onSuperAdminLogin, isOnline = true }: LoginPageProps) {"
        
        if old_function in content:
            content = content.replace(old_function, new_function)
            print("✅ Props do componente atualizadas")
        else:
            print("⚠️ Declaração da função não encontrada ou já modificada")
        
        # 3. Adicionar verificação de conexão no handleClientLogin
        old_login = """  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setClientLoginError('');
    
    try {
      // ✅ SEMPRE consultar Supabase primeiro (não localStorage)
      const client = await getClientByPhone(clientPhone);"""
        
        new_login = """  const handleClientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setClientLoginError('');
    
    // Verificar conexão antes de tentar login
    if (!isOnline) {
      setClientLoginError('Sem conexão com a internet. Verifique sua conexão e tente novamente.');
      setLoading(false);
      return;
    }
    
    try {
      // ✅ SEMPRE consultar Supabase primeiro (não localStorage)
      const client = await getClientByPhone(clientPhone);"""
        
        if old_login in content:
            content = content.replace(old_login, new_login)
            print("✅ Verificação de conexão adicionada no handleClientLogin")
        else:
            print("⚠️ handleClientLogin não encontrado ou já modificado")
        
        # Salvar o arquivo
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("\n🎉 Arquivo LoginPage.tsx atualizado com sucesso!")
        print("✅ Verificação de conexão implementada no login da cliente")
        
    except FileNotFoundError:
        print(f"❌ Erro: Arquivo {file_path} não encontrado")
    except Exception as e:
        print(f"❌ Erro ao processar arquivo: {e}")

if __name__ == "__main__":
    print("🔧 Iniciando correção do LoginPage.tsx...\n")
    fix_login_page()

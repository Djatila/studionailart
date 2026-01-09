#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para fazer o calendário abrir automaticamente no step 3
"""

def fix_calendar():
    file_path = r'src\components\BookingPage.tsx'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("✅ Arquivo lido com sucesso")
        
        # 1. Adicionar ref após const [step, setStep]
        old_step = "  const [step, setStep] = useState(initialDesigner ? 2 : 1);"
        new_step = """  const [step, setStep] = useState(initialDesigner ? 2 : 1);
  const dateInputRef = useRef<HTMLInputElement>(null);"""
        
        if old_step in content:
            content = content.replace(old_step, new_step)
            print("✅ Ref adicionado")
        else:
            print("⚠️ Linha do step não encontrada")
        
        # 2. Adicionar ref no input
        old_input = """                  <div>
                    <input
                      type="date"
                      value={selectedDate}"""
        
        new_input = """                  <div>
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={selectedDate}"""
        
        if old_input in content:
            content = content.replace(old_input, new_input)
            print("✅ Ref adicionado ao input")
        else:
            print("⚠️ Input não encontrado")
        
        # 3. Adicionar useEffect para abrir calendário automaticamente
        # Procurar onde adicionar o useEffect (após outros useEffects)
        marker = "  }, [step, selectedDate]); // 🆕 Adicionar dependências"
        
        new_effect = """
  // Abrir calendário automaticamente quando chegar no step 3
  useEffect(() => {
    if (step === 3 && dateInputRef.current) {
      // Pequeno delay para garantir que o DOM está pronto
      setTimeout(() => {
        dateInputRef.current?.showPicker?.();
      }, 100);
    }
  }, [step]);
"""
        
        if marker in content:
            content = content.replace(marker, marker + new_effect)
            print("✅ useEffect adicionado")
        else:
            print("⚠️ Marcador não encontrado, tentando outro local...")
            # Tentar adicionar após o useEffect de cancelamento
            alt_marker = "  }, [step, selectedDate]); // 🆕 Adicionar dependências\n\n  // Listener para sincronização em tempo real"
            if alt_marker in content:
                content = content.replace(alt_marker, marker + new_effect + "\n\n  // Listener para sincronização em tempo real")
                print("✅ useEffect adicionado (local alternativo)")
        
        # Salvar
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("\n🎉 Calendário configurado para abrir automaticamente!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    print("🔧 Configurando abertura automática do calendário...\n")
    fix_calendar()

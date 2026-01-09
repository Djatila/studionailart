/**
 * Gerenciador de Horários - Studio Nail Art
 * 
 * Este arquivo centraliza a configuração de horários disponíveis para agendamento.
 * 
 * HISTÓRICO DE MUDANÇAS:
 * - Dezembro 2025: Horários temporários para alta demanda
 * - Janeiro 2026+: Retornar aos horários normais
 */

// ============================================================================
// CONFIGURAÇÃO DE HORÁRIOS
// ============================================================================

/**
 * Horários NORMAIS (Janeiro 2026 em diante)
 * Configuração padrão do sistema
 */
export const NORMAL_TIME_SLOTS = [
    '08:00',  // Manhã
    '10:00',  // Manhã
    '13:00',  // Tarde
    '15:00',  // Tarde
    '17:00'   // Tarde
];

/**
 * Horários TEMPORÁRIOS para DEZEMBRO 2025
 * Mais horários para atender demanda de fim de ano
 * 
 * Manhã: 08:00, 09:00, 10:00
 * Tarde: 13:00, 14:00, 15:00, 16:00, 17:00
 */
export const DECEMBER_2025_TIME_SLOTS = [
    '08:00',  // Manhã
    '09:00',  // Manhã
    '10:00',  // Manhã
    '13:00',  // Tarde
    '14:00',  // Tarde
    '15:00',  // Tarde
    '16:00',  // Tarde
    '17:00'   // Tarde
];

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

/**
 * Retorna os horários disponíveis baseado na data atual
 * 
 * REGRA:
 * - Se estamos em DEZEMBRO 2025 → Usa horários temporários
 * - Caso contrário → Usa horários normais
 * 
 * @returns Array de horários no formato 'HH:MM'
 */
export function getAvailableTimeSlots(): string[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 = Janeiro, 11 = Dezembro

    // Verificar se estamos em Dezembro de 2025
    const isDecember2025 = currentYear === 2025 && currentMonth === 11;

    if (isDecember2025) {
        console.log('🎄 Usando horários especiais de Dezembro 2025');
        return DECEMBER_2025_TIME_SLOTS;
    }

    console.log('📅 Usando horários normais');
    return NORMAL_TIME_SLOTS;
}

/**
 * Retorna informação sobre qual conjunto de horários está ativo
 */
export function getTimeSlotInfo(): {
    slots: string[];
    isTemporary: boolean;
    description: string;
} {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const isDecember2025 = currentYear === 2025 && currentMonth === 11;

    if (isDecember2025) {
        return {
            slots: DECEMBER_2025_TIME_SLOTS,
            isTemporary: true,
            description: 'Horários especiais de Dezembro 2025 (8 horários disponíveis)'
        };
    }

    return {
        slots: NORMAL_TIME_SLOTS,
        isTemporary: false,
        description: 'Horários normais (5 horários disponíveis)'
    };
}

// ============================================================================
// INSTRUÇÕES PARA REVERSÃO (JANEIRO 2026)
// ============================================================================

/**
 * 🔄 COMO REVERTER PARA HORÁRIOS NORMAIS EM JANEIRO 2026:
 * 
 * OPÇÃO 1 - Automática (Recomendada):
 * - Não fazer nada! O sistema automaticamente voltará aos horários normais
 *   quando o calendário mudar para janeiro de 2026.
 * 
 * OPÇÃO 2 - Manual (Se quiser forçar antes):
 * 1. Abrir este arquivo (timeSlots.ts)
 * 2. Na função getAvailableTimeSlots(), comentar a verificação de dezembro:
 *    // const isDecember2025 = currentYear === 2025 && currentMonth === 11;
 * 3. Forçar retorno dos horários normais:
 *    return NORMAL_TIME_SLOTS;
 * 
 * OPÇÃO 3 - Remover completamente:
 * 1. Substituir todas as chamadas de getAvailableTimeSlots() por NORMAL_TIME_SLOTS
 * 2. Deletar este arquivo
 * 3. Restaurar as definições inline nos componentes
 */

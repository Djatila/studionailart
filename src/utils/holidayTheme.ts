/**
 * 🎄 Holiday Theme Utility
 * 
 * Detecta se estamos no período festivo de Natal e Ano Novo
 * Período ativo: 05 de dezembro de 2025 até 06 de janeiro de 2026
 * Desativação automática: 07 de janeiro de 2026
 */

/**
 * Verifica se estamos no período festivo
 * @returns true se estiver entre 05/12/2025 e 06/01/2026
 */
export function isHolidayPeriod(): boolean {
    const now = new Date();

    // Início: 05 de dezembro de 2025, 00:00:00
    const startDate = new Date(2025, 11, 5, 0, 0, 0);

    // Fim: 06 de janeiro de 2026, 23:59:59
    const endDate = new Date(2026, 0, 6, 23, 59, 59);

    const isActive = now >= startDate && now <= endDate;

    if (isActive) {
        console.log('🎄 Tema festivo ativo!');
    }

    return isActive;
}

/**
 * Retorna a mensagem de felicitações apropriada para o período
 * @returns Mensagem festiva com emojis
 */
export function getHolidayMessage(): string {
    if (!isHolidayPeriod()) {
        return '';
    }

    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Dezembro antes do Natal (05-24)
    if (month === 11 && day < 25) {
        return '🎄 Feliz Natal!';
    }

    // Natal até Ano Novo (25-31 de dezembro)
    if (month === 11 && day >= 25) {
        return '🎄 Feliz Natal! 🎉';
    }

    // Ano Novo (01-06 de janeiro)
    if (month === 0 && day <= 6) {
        return '🎉 Feliz Ano Novo! ✨';
    }

    return '🎄 Boas Festas!';
}

/**
 * Retorna informações detalhadas sobre o período festivo
 */
export function getHolidayInfo() {
    const isActive = isHolidayPeriod();
    const message = getHolidayMessage();
    const now = new Date();

    return {
        isActive,
        message,
        currentDate: now.toLocaleDateString('pt-BR'),
        startDate: '05/12/2025',
        endDate: '06/01/2026',
        daysRemaining: isActive ? Math.ceil((new Date(2026, 0, 6, 23, 59, 59).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
    };
}

/**
 * Retorna as cores do tema festivo
 */
export function getHolidayColors() {
    return {
        red: '#C41E3A',      // Vermelho Natal
        green: '#0F8644',    // Verde Natal
        gold: '#FFD700',     // Dourado
        silver: '#C0C0C0',   // Prata
        white: '#FFFAFA',    // Branco Neve
    };
}

import React, { useEffect, useState } from 'react';
import { isHolidayPeriod, getHolidayMessage } from '../utils/holidayTheme';

/**
 * 🎄 Holiday Decorations Component
 * 
 * Adiciona decorações natalinas nos cantos da tela
 * Ativo apenas durante o período festivo (05/12/2025 - 06/01/2026)
 */

export default function HolidayDecorations() {
    const [showDecorations, setShowDecorations] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const isHoliday = isHolidayPeriod();
        setShowDecorations(isHoliday);
        setMessage(getHolidayMessage());

        if (isHoliday) {
            console.log('🎄 Decorações natalinas ativadas!');
        }
    }, []);

    if (!showDecorations) return null;

    return (
        <>
            {/* Árvore de Natal - Canto inferior esquerdo */}
            <div
                className="fixed bottom-4 left-4 text-6xl z-50 pointer-events-none animate-pulse"
                style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8)' }}
            >
                🎄
            </div>

            {/* Estrela - Canto superior direito */}
            <div
                className="fixed top-4 right-4 text-4xl z-50 pointer-events-none"
                style={{
                    animation: 'spin 3s linear infinite',
                    textShadow: '0 0 15px rgba(255, 215, 0, 1)'
                }}
            >
                ⭐
            </div>

            {/* Presente - Canto inferior direito */}
            <div
                className="fixed bottom-4 right-4 text-5xl z-50 pointer-events-none"
                style={{
                    animation: 'bounce 2s infinite',
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                }}
            >
                🎁
            </div>

            {/* Sino - Canto superior esquerdo */}
            <div
                className="fixed top-4 left-4 text-4xl z-50 pointer-events-none"
                style={{
                    animation: 'swing 2s ease-in-out infinite',
                    transformOrigin: 'top center',
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.6)'
                }}
            >
                🔔
            </div>

            {/* Mensagem de felicitações - Topo central (descido 2%) */}
            {message && (
                <div
                    className="fixed left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
                    style={{ top: 'calc(5rem + 2vh)' }}
                >
                    <div
                        className="bg-gradient-to-r from-red-600 via-green-600 to-red-600 text-white px-8 py-4 rounded-full shadow-2xl animate-pulse"
                        style={{
                            boxShadow: '0 0 30px rgba(255, 215, 0, 0.6), 0 10px 40px rgba(0, 0, 0, 0.3)'
                        }}
                    >
                        <span className="font-bold text-xl drop-shadow-lg">{message}</span>
                    </div>
                </div>
            )}

            {/* Luzes piscantes decorativas */}
            <div className="fixed top-0 left-0 w-full h-2 z-50 pointer-events-none">
                <div
                    className="h-full bg-gradient-to-r from-red-500 via-green-500 via-yellow-500 via-blue-500 to-red-500"
                    style={{
                        animation: 'lights 3s linear infinite',
                        backgroundSize: '200% 100%'
                    }}
                />
            </div>
        </>
    );
}

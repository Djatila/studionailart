import React, { useEffect, useState } from 'react';
import { isHolidayPeriod } from '../utils/holidayTheme';

/**
 * 🎄 Snow Effect Component
 * 
 * Cria um efeito de neve caindo na tela
 * Ativo apenas durante o período festivo (05/12/2025 - 06/01/2026)
 */

interface Snowflake {
    id: number;
    left: string;
    animationDelay: string;
    animationDuration: string;
    opacity: number;
    fontSize: string;
}

export default function SnowEffect() {
    const [showSnow, setShowSnow] = useState(false);
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

    useEffect(() => {
        const isHoliday = isHolidayPeriod();
        setShowSnow(isHoliday);

        if (isHoliday) {
            // Gerar 50 flocos de neve com propriedades aleatórias
            const flakes: Snowflake[] = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
                opacity: Math.random() * 0.6 + 0.4,
                fontSize: `${10 + Math.random() * 10}px`
            }));

            setSnowflakes(flakes);
            console.log('❄️ Efeito de neve ativado!');
        }
    }, []);

    if (!showSnow) return null;

    return (
        <div className="snow-container">
            {snowflakes.map((flake) => (
                <div
                    key={flake.id}
                    className="snowflake"
                    style={{
                        left: flake.left,
                        animationDelay: flake.animationDelay,
                        animationDuration: flake.animationDuration,
                        opacity: flake.opacity,
                        fontSize: flake.fontSize
                    }}
                >
                    ❄
                </div>
            ))}
        </div>
    );
}

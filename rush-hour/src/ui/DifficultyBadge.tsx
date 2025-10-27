// src/ui/DifficultyBadge.tsx
import { useMemo } from 'react';
import { useGame } from '../game/store';
import { solveLevelBFS } from '../game/solver/core';

export default function DifficultyBadge() {
    const size   = useGame(s => s.size);
    const exit   = useGame(s => s.exit);
    const pieces = useGame(s => s.pieces);

    const result = useMemo(() => {
        if (!exit) return null;
        // pasamos solo lo necesario al solver
        return solveLevelBFS({ size, exit }, pieces);
    }, [size, exit, pieces]);

    const label = !exit
        ? '—'
        : result
            ? `${result.moves.length} movs óptimos`
            : 'sin solución';

    return (
        <div
            style={{
                position: 'absolute',
                top: 56,
                right: 12,
                padding: '6px 10px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 600,
            }}
        >
            Dificultad (BFS): {label}
        </div>
    );
}

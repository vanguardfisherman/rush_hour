// src/ui/DifficultyBadge.tsx
import { useMemo } from 'react';
import { useGame } from '../game/store';
import { solveLevelBFS } from '../game/solver/core';
import './DifficultyBadge.css';

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
        <div className="difficulty-badge">
            <span className="difficulty-badge__title">Dificultad (BFS)</span>
            <span className="difficulty-badge__value">{label}</span>
        </div>
    );
}

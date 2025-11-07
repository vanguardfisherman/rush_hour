// src/ui/DifficultyBadge.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useGame } from '../game/store';
import { solveLevelBFS } from '../game/solver/core';
import './DifficultyBadge.css';

export default function DifficultyBadge() {
    const size   = useGame(s => s.size);
    const exit   = useGame(s => s.exit);
    const pieces = useGame(s => s.pieces);

    const [result, setResult] = useState(() => (exit ? solveLevelBFS({ size, exit }, pieces) : null));
    const [isComputing, setIsComputing] = useState(false);
    const pending = useRef<number | null>(null);

    useEffect(() => {
        if (!exit) {
            setResult(null);
            setIsComputing(false);
            return;
        }

        setIsComputing(true);

        let cancelled = false;
        const runSolver = () => {
            if (cancelled) return;
            const solution = solveLevelBFS({ size, exit }, pieces);
            if (!cancelled) {
                setResult(solution);
                setIsComputing(false);
            }
        };

        pending.current = window.setTimeout(runSolver, 0);

        return () => {
            cancelled = true;
            if (pending.current !== null) {
                window.clearTimeout(pending.current);
                pending.current = null;
            }
        };
    }, [size, exit, pieces]);

    const label = useMemo(() => {
        if (!exit) return '—';
        if (isComputing) return 'calculando…';
        if (!result) return 'sin solución';
        return `${result.moves.length} movs óptimos`;
    }, [exit, isComputing, result]);

    return (
        <div className="difficulty-badge">
            <span className="difficulty-badge__title">Dificultad (BFS)</span>
            <span className="difficulty-badge__value">{label}</span>
        </div>
    );
}

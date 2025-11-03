import { useState, useMemo, useEffect } from 'react';
import { useGame } from './game/store';
import type { LevelDef } from './game/types';
import { EASY_LEVELS, NORMAL_LEVELS } from './game/levels';
import GameCanvas from './components/GameCanvas';
import './App.css';
import SolverControls from './ui/SolverControls';
import DifficultyBadge from './ui/DifficultyBadge';

const DIFFS = ['easy', 'normal'] as const;
type Diff = (typeof DIFFS)[number];

export default function App() {
    // === store ===
    const loadLevel  = useGame(s => s.loadLevel);
    const resetLevel = useGame(s => s.resetLevel);
    const undo       = useGame(s => s.undo);
    const redo       = useGame(s => s.redo);
    const canUndo    = useGame(s => s.canUndo);
    const canRedo    = useGame(s => s.canRedo);
    const moves      = useGame(s => s.moves);
    const won        = useGame(s => s.won);
    const isSolving  = useGame(s => s.isSolving);

    // === UI local ===
    const [diff, setDiff] = useState<Diff>('easy');
    const levelList: LevelDef[] = useMemo(
        () => (diff === 'easy' ? EASY_LEVELS : NORMAL_LEVELS),
        [diff]
    );
    const [idx, setIdx] = useState(0);
    const [mobileMode, setMobileMode] = useState(false);

    const onPickLevel = (i: number) => {
        setIdx(i);
        loadLevel(levelList[i]);
    };

    // carga inicial (usar efecto, no useMemo)
    useEffect(() => {
        loadLevel(levelList[idx]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // una vez al montar

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const orientation = window.screen?.orientation as (ScreenOrientation & {
            lock?: (orientation: string) => Promise<void>;
            unlock?: () => void;
        }) | undefined;

        if (!mobileMode) {
            if (orientation && typeof orientation.unlock === 'function') {
                try {
                    orientation.unlock();
                } catch (err) {
                    console.warn('No se pudo liberar el bloqueo de orientación.', err);
                }
            }
            return;
        }

        let cancelled = false;

        const lockOrientation = async () => {
            if (!orientation || typeof orientation.lock !== 'function') {
                window.alert('Tu navegador no soporta el bloqueo de orientación.');
                if (!cancelled) {
                    setMobileMode(false);
                }
                return;
            }

            try {
                await orientation.lock('landscape');
            } catch (error) {
                console.warn('No se pudo bloquear la orientación.', error);
                window.alert('No se pudo bloquear la orientación de la pantalla.');
                if (!cancelled) {
                    setMobileMode(false);
                }
            }
        };

        lockOrientation();

        return () => {
            cancelled = true;
            if (orientation && typeof orientation.unlock === 'function') {
                try {
                    orientation.unlock();
                } catch (err) {
                    console.warn('No se pudo liberar el bloqueo de orientación al desmontar.', err);
                }
            }
        };
    }, [mobileMode]);

    return (
        <div className="app">
            {/* HUD superior */}
            <div className="hud">
                <div className="row">
                    <label> Dificultad: </label>
                    <select
                        value={diff}
                        disabled={isSolving}
                        onChange={(e) => {
                            const d = e.target.value as Diff;
                            setDiff(d);
                            setIdx(0);
                            loadLevel((d === 'easy' ? EASY_LEVELS : NORMAL_LEVELS)[0]);
                        }}
                    >
                        <option value="easy">Fácil</option>
                        <option value="normal">Normal</option>
                    </select>

                    <label style={{ marginLeft: 12 }}> Nivel: </label>
                    <select
                        value={idx}
                        disabled={isSolving}
                        onChange={(e) => onPickLevel(Number(e.target.value))}
                    >
                        {levelList.map((lv, i) => (
                            <option key={lv.id ?? i} value={i}>
                                {lv.id ?? `${diff}-${i + 1}`}
                            </option>
                        ))}
                    </select>

                    <button onClick={resetLevel} disabled={isSolving}>Reiniciar</button>
                    <button onClick={undo} disabled={!canUndo || isSolving}>Deshacer</button>
                    <button onClick={redo} disabled={!canRedo || isSolving}>Rehacer</button>
                    <button
                        onClick={() => setMobileMode((prev) => !prev)}
                        className={mobileMode ? 'active' : undefined}
                    >
                        {mobileMode ? 'Desktop version' : 'Mobile version'}
                    </button>


                    <span style={{ marginLeft: 12 }}>Movs: {moves}</span>
                    {won && <span className="badge">¡Ganaste! 🎉</span>}
                </div>
            </div>

            {/* Escena 3D */}
            <GameCanvas />

            {/* Controles del solver (overlay) */}
            <SolverControls />
            <DifficultyBadge />
        </div>
    );
}


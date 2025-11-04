// src/App.tsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { useGame } from './game/store';
import type { LevelDef } from './game/types';
import { EASY_LEVELS, NORMAL_LEVELS } from './game/levels';
import GameCanvas from './components/GameCanvas';
import './App.css';
import SolverControls from './ui/SolverControls';
import DifficultyBadge from './ui/DifficultyBadge';

const DIFFS = ['easy', 'normal'] as const;
type Diff = (typeof DIFFS)[number];

type ExtendedScreenOrientation = ScreenOrientation & {
    lock?: (orientation: string) => Promise<void>;
    unlock?: () => void;
};

const getOrientation = (): ExtendedScreenOrientation | undefined => {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return window.screen?.orientation as ExtendedScreenOrientation | undefined;
};

const unlockOrientation = () => {
    const orientation = getOrientation();
    if (orientation && typeof orientation.unlock === 'function') {
        try {
            orientation.unlock();
        } catch (err) {
            console.warn('No se pudo liberar el bloqueo de orientación.', err);
        }
    }
};

const requestFullscreen = async (element: HTMLElement) => {
    const anyElement = element as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void> | void;
        msRequestFullscreen?: () => Promise<void> | void;
    };

    if (element.requestFullscreen) {
        await element.requestFullscreen();
        return true;
    }

    if (anyElement.webkitRequestFullscreen) {
        const result = anyElement.webkitRequestFullscreen.call(element);
        if (result instanceof Promise) {
            await result;
        }
        return true;
    }

    if (anyElement.msRequestFullscreen) {
        const result = anyElement.msRequestFullscreen.call(element);
        if (result instanceof Promise) {
            await result;
        }
        return true;
    }

    return false;
};

const exitFullscreen = async () => {
    if (typeof document === 'undefined') {
        return false;
    }

    const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void> | void;
        msExitFullscreen?: () => Promise<void> | void;
    };

    if (document.fullscreenElement && document.exitFullscreen) {
        await document.exitFullscreen();
        return true;
    }

    if (document.fullscreenElement && doc.webkitExitFullscreen) {
        const result = doc.webkitExitFullscreen.call(document);
        if (result instanceof Promise) {
            await result;
        }
        return true;
    }

    if (document.fullscreenElement && doc.msExitFullscreen) {
        const result = doc.msExitFullscreen.call(document);
        if (result instanceof Promise) {
            await result;
        }
        return true;
    }

    return false;
};

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
    const ownsFullscreenRef = useRef(false);

    const disableMobileMode = async () => {
        unlockOrientation();

        if (ownsFullscreenRef.current) {
            try {
                await exitFullscreen();
            } catch (err) {
                console.warn('No se pudo salir de pantalla completa.', err);
            }
        }

        ownsFullscreenRef.current = false;
        setMobileMode(false);
    };

    const handleToggleMobileMode = async () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        if (mobileMode) {
            await disableMobileMode();
            return;
        }

        const orientation = getOrientation();

        if (!orientation || typeof orientation.lock !== 'function') {
            window.alert('El bloqueo de orientación solo está disponible en navegadores móviles compatibles.');
            return;
        }

        const wasFullscreen = Boolean(document.fullscreenElement);

        if (!wasFullscreen) {
            try {
                const fullscreenGranted = await requestFullscreen(document.documentElement);
                if (!fullscreenGranted) {
                    window.alert('Tu navegador no soporta entrar en pantalla completa automáticamente.');
                    return;
                }
            } catch (error) {
                console.warn('No se pudo entrar en pantalla completa.', error);
                window.alert('No se pudo activar la pantalla completa, requisito para el modo móvil.');
                return;
            }
        }

        try {
            await orientation.lock('landscape');
            ownsFullscreenRef.current = !wasFullscreen;
            setMobileMode(true);
        } catch (error) {
            console.warn('No se pudo bloquear la orientación.', error);
            window.alert('No se pudo bloquear la orientación de la pantalla. Algunos navegadores solo lo permiten cuando la aplicación está instalada o en dispositivos móviles.');

            if (!wasFullscreen && document.fullscreenElement) {
                try {
                    await exitFullscreen();
                } catch (err) {
                    console.warn('No se pudo salir de pantalla completa tras fallar el bloqueo.', err);
                }
            }
        }
    };

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
        if (typeof document === 'undefined') {
            return;
        }

        const onFullscreenChange = () => {
            if (!document.fullscreenElement && mobileMode) {
                unlockOrientation();
                ownsFullscreenRef.current = false;
                setMobileMode(false);
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
        };
    }, [mobileMode]);

    useEffect(() => {
        return () => {
            unlockOrientation();
            if (ownsFullscreenRef.current) {
                void exitFullscreen();
            }
        };
    }, []);

    return (
        <div className="app">
            {/* HUD superior */}
            <div className="hud">
                <div className="hud-card">
                    <span className="hud-card-title">Configuración</span>
                    <div className="hud-card-grid">
                        <div className="hud-field">
                            <label htmlFor="difficulty-select">Dificultad</label>
                            <select
                                id="difficulty-select"
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
                        </div>

                        <div className="hud-field">
                            <label htmlFor="level-select">Nivel</label>
                            <select
                                id="level-select"
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
                        </div>
                    </div>
                </div>

                <div className="hud-card">
                    <span className="hud-card-title">Acciones</span>
                    <div className="hud-actions">
                        <button onClick={resetLevel} disabled={isSolving}>Reiniciar</button>
                        <button onClick={undo} disabled={!canUndo || isSolving}>Deshacer</button>
                        <button onClick={redo} disabled={!canRedo || isSolving}>Rehacer</button>
                        <button
                            onClick={handleToggleMobileMode}
                            className={mobileMode ? 'active' : undefined}
                            aria-pressed={mobileMode}
                        >
                            {mobileMode ? 'Desktop version' : 'Mobile version'}
                        </button>
                    </div>
                </div>

                <div className="hud-card">
                    <span className="hud-card-title">Estado</span>
                    <div className="hud-status">
                        <span className="hud-moves">Movs: {moves}</span>
                        {won && <span className="badge">¡Ganaste! 🎉</span>}
                    </div>
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
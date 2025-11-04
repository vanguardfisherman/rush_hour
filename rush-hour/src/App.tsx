// src/App.tsx
import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react';
import { useGame } from './game/store';
import type { LevelDef } from './game/types';
import { EASY_LEVELS, NORMAL_LEVELS } from './game/levels';
import GameCanvas from './components/GameCanvas';
import './App.css';
import SolverControls from './ui/SolverControls';
import DifficultyBadge from './ui/DifficultyBadge';

type Diff = 'easy' | 'normal';

const UI_SCALES = [
    { label: 'X1', value: 1 },
    { label: 'X2', value: 0.9 },
    { label: 'X3', value: 0.8 },
    { label: 'X4', value: 0.7 },
    { label: 'X5', value: 0.6 },
    { label: 'X6', value: 0.5 },
    { label: 'X7', value: 0.4 },
    { label: 'X8', value: 0.3 },
    { label: 'X9', value: 0.2 },
    { label: 'X10', value: 0.1 },
] as const;

type LevelButtonProps = {
    label: string;
    isActive: boolean;
    isLocked: boolean;
    isDisabled: boolean;
    onClick: () => void;
};

function LevelButton({ label, isActive, isLocked, isDisabled, onClick }: LevelButtonProps) {
    return (
        <button
            type="button"
            className={[
                'level-button',
                isActive ? 'active level-button--active' : undefined,
                isLocked ? 'level-button--locked' : undefined,
            ]
                .filter(Boolean)
                .join(' ')}
            aria-pressed={isActive}
            aria-disabled={isDisabled}
            disabled={isDisabled}
            onClick={onClick}
        >
            <span className="level-button__label">{label}</span>
            {isLocked && (
                <span className="level-button__lock" aria-hidden="true">
                    🔒
                </span>
            )}
        </button>
    );
}

type LevelGridProps = {
    levels: LevelDef[];
    activeIndex: number;
    unlockedLevels: boolean[];
    isSolving: boolean;
    diff: Diff;
    labelId: string;
    onPickLevel: (index: number) => void;
};

function LevelGrid({ levels, activeIndex, unlockedLevels, isSolving, diff, labelId, onPickLevel }: LevelGridProps) {
    return (
        <div className="level-grid" role="group" aria-labelledby={labelId}>
            {levels.map((level, index) => {
                const isLocked = !unlockedLevels[index];
                const isDisabled = isLocked || isSolving;
                const label = level.id ?? `${diff}-${index + 1}`;

                return (
                    <LevelButton
                        key={level.id ?? index}
                        label={label}
                        isActive={activeIndex === index}
                        isLocked={isLocked}
                        isDisabled={isDisabled}
                        onClick={() => onPickLevel(index)}
                    />
                );
            })}
        </div>
    );
}

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
    const [unlockedLevels, setUnlockedLevels] = useState<boolean[]>(() =>
        EASY_LEVELS.map((_, index) => index === 0)
    );
    const [mobileMode, setMobileMode] = useState(false);
    const [uiScale, setUiScale] = useState<number>(UI_SCALES[0].value);
    const ownsFullscreenRef = useRef(false);

    const levelLabelId = 'level-grid-label';

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
        if (isSolving || !unlockedLevels[i]) {
            return;
        }

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

    useEffect(() => {
        setUnlockedLevels((prev) => {
            if (prev.length === levelList.length) {
                return prev;
            }

            return levelList.map((_, index) => prev[index] ?? index === 0);
        });
    }, [levelList]);

    useEffect(() => {
        if (!won) {
            return;
        }

        setUnlockedLevels((prev) => {
            const nextIndex = idx + 1;

            if (nextIndex >= levelList.length) {
                return prev;
            }

            if (prev[nextIndex]) {
                return prev;
            }

            const normalized = levelList.map((_, index) => prev[index] ?? index === 0);
            normalized[nextIndex] = true;
            return normalized;
        });
    }, [won, idx, levelList]);

    return (
        <div className="app">
            {/* HUD superior */}
            <div
                className="hud"
                style={{ '--hud-scale': uiScale.toString() } as CSSProperties}
            >
                <div className="hud-inner">
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
                                        const nextLevels = d === 'easy' ? EASY_LEVELS : NORMAL_LEVELS;
                                        setDiff(d);
                                        setIdx(0);
                                        setUnlockedLevels(nextLevels.map((_, index) => index === 0));
                                        loadLevel(nextLevels[0]);
                                    }}
                                >
                                    <option value="easy">Fácil</option>
                                    <option value="normal">Normal</option>
                                </select>
                            </div>

                            <div className="hud-field">
                                <span className="hud-field-label" id={levelLabelId}>
                                    Nivel
                                </span>
                                <LevelGrid
                                    levels={levelList}
                                    activeIndex={idx}
                                    unlockedLevels={unlockedLevels}
                                    isSolving={isSolving}
                                    diff={diff}
                                    labelId={levelLabelId}
                                    onPickLevel={onPickLevel}
                                />
                            </div>

                            <div className="hud-field">
                                <span className="hud-field-label" id="ui-scale-options-label">
                                    Interfaz
                                </span>
                                <div
                                    className="hud-scale-options"
                                    role="group"
                                    aria-labelledby="ui-scale-options-label"
                                >
                                    {UI_SCALES.map((option) => (
                                        <button
                                            key={option.label}
                                            type="button"
                                            className={
                                                uiScale === option.value
                                                    ? 'hud-scale-option active'
                                                    : 'hud-scale-option'
                                            }
                                            aria-pressed={uiScale === option.value}
                                            onClick={() => setUiScale(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
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
            </div>

            {/* Escena 3D */}
            <GameCanvas />

            {/* Controles del solver + badge de dificultad */}
            <div className="hud-overlays">
                <div
                    className="hud-overlays-inner"
                    style={{ '--hud-scale': uiScale.toString() } as CSSProperties}
                >
                    <SolverControls />
                    <DifficultyBadge />
                </div>
            </div>
        </div>
    );
}
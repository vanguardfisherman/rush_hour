// src/App.tsx
import { useState, useMemo, useEffect, useRef, type CSSProperties } from 'react';
import { useGame } from './game/store';
import type { LevelDef } from './game/types';
import { EASY_LEVELS, NORMAL_LEVELS } from './game/levels';
import {
    createDefaultProgress,
    getBestMoves,
    loadProgress,
    saveProgress,
    type Progress,
    setBestMoves,
    updateProgress,
} from './game/progress';
import GameCanvas from './components/GameCanvas';
import TutorialModal from './components/TutorialModal';
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
    bestMoves?: number;
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
    bestMoves: (number | undefined)[];
    isSolving: boolean;
    diff: Diff;
    labelId: string;
    onPickLevel: (index: number) => void;
};

function LevelGrid({ levels, activeIndex, unlockedLevels, bestMoves, isSolving, diff, labelId, onPickLevel }: LevelGridProps) {
    return (
        <div className="level-grid" role="group" aria-labelledby={labelId}>
            {levels.map((level, index) => {
                const isLocked = !unlockedLevels[index];
                const isDisabled = isLocked || isSolving;
                const label = buildLevelKey(level, diff, index);
                const moves = bestMoves[index];

                return (
                    <LevelButton
                        key={level.id ?? index}
                        label={label}
                        isActive={activeIndex === index}
                        isLocked={isLocked}
                        isDisabled={isDisabled}
                        bestMoves={moves}
                        onClick={() => onPickLevel(index)}
                    />
                );
            })}
        </div>
    );
}

type CompletionModalProps = {
    isOpen: boolean;
    hasNextLevel: boolean;
    onNextLevel: () => void;
    onClose: () => void;
    currentMoves: number;
    bestMoves?: number;
};

function CompletionModal({ isOpen, hasNextLevel, onNextLevel, onClose, currentMoves, bestMoves }: CompletionModalProps) {
    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="completion-modal__backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="completion-modal-title"
            onClick={onClose}
        >
            <div
                className="completion-modal__content"
                role="document"
                onClick={(event) => event.stopPropagation()}
            >
                <h2 className="completion-modal__title" id="completion-modal-title">
                    ¡Nivel completado!
                </h2>
                <p className="completion-modal__message">
                    {hasNextLevel
                        ? 'Prepárate para el siguiente desafío.'
                        : '¡Has completado todos los niveles disponibles!'}
                </p>
                <ul className="completion-modal__stats">
                    <li className="completion-modal__stats-item">Movimientos: {currentMoves}</li>
                    {typeof bestMoves === 'number' && (
                        <li className="completion-modal__stats-item completion-modal__stats-item--best">
                            Mejor: {bestMoves} movimientos
                        </li>
                    )}
                </ul>
                <div className="completion-modal__actions">
                    <button type="button" className="completion-modal__button" onClick={hasNextLevel ? onNextLevel : onClose}>
                        {hasNextLevel ? 'Siguiente nivel' : 'Cerrar'}
                    </button>
                    {hasNextLevel && (
                        <button
                            type="button"
                            className="completion-modal__button completion-modal__button--secondary"
                            onClick={onClose}
                        >
                            Seguir en este nivel
                        </button>
                    )}
                </div>
            </div>
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

const buildLevelKey = (level: LevelDef, diff: Diff, index: number) => level.id ?? `${diff}-${index + 1}`;

const areBestMovesEqual = (a: Record<string, number>, b: Record<string, number>) => {
    if (a === b) {
        return true;
    }

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
        return false;
    }

    return aKeys.every((key) => a[key] === b[key]);
};

const isSameProgress = (a: Progress, b: Progress) => {
    if (a === b) {
        return true;
    }

    return (
        a.unlocked.easy === b.unlocked.easy &&
        a.unlocked.normal === b.unlocked.normal &&
        areBestMovesEqual(a.bestMoves.easy, b.bestMoves.easy) &&
        areBestMovesEqual(a.bestMoves.normal, b.bestMoves.normal)
    );
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
    const [progress, setProgress] = useState<Progress>(() => createDefaultProgress());
    const [mobileMode, setMobileMode] = useState(false);
    const [uiScale, setUiScale] = useState<number>(UI_SCALES[0].value);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [showTutorial, setShowTutorial] = useState(false);
    const [showTargetIndicator, setShowTargetIndicator] = useState(false);
    const ownsFullscreenRef = useRef(false);
    const previousWonRef = useRef(won);

    const levelLabelId = 'level-grid-label';

    const maxUnlockedIndex = useMemo(() => {
        if (levelList.length === 0) {
            return 0;
        }

        const maxIndex = levelList.length - 1;
        return Math.max(0, Math.min(progress.unlocked[diff] ?? 0, maxIndex));
    }, [diff, levelList, progress]);

    const unlockedLevels = useMemo(
        () => levelList.map((_, index) => index <= maxUnlockedIndex),
        [levelList, maxUnlockedIndex]
    );

    const bestMovesByLevel = useMemo(() => {
        const activeBestMoves = progress.bestMoves[diff] ?? {};
        return levelList.map((level, index) => activeBestMoves[buildLevelKey(level, diff, index)]);
    }, [diff, levelList, progress]);

    const currentLevel = levelList[idx];
    const currentLevelKey = currentLevel ? buildLevelKey(currentLevel, diff, idx) : undefined;
    const activeBestMoves = useMemo(() => {
        if (!currentLevelKey) {
            return undefined;
        }

        return getBestMoves(progress, diff, currentLevelKey);
    }, [currentLevelKey, diff, progress]);

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


    const handleOpenTutorial = () => setShowTutorial(true);
    const handleCloseTutorial = () => setShowTutorial(false);
    const handleToggleTargetIndicator = () => {
        setShowTargetIndicator((current) => !current);
    };


    const onPickLevel = (i: number) => {
        if (isSolving || i > maxUnlockedIndex || !levelList[i]) {
            return;
        }

        setIdx(i);
        setShowCompletionModal(false);
    };

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
        setProgress(loadProgress());
    }, []);

    useEffect(() => {
        setIdx((current) => {
            if (levelList.length === 0) {
                return current;
            }

            const safeMax = Math.max(0, maxUnlockedIndex);
            if (current <= safeMax) {
                return current;
            }

            return safeMax;
        });
    }, [levelList, maxUnlockedIndex]);

    useEffect(() => {
        const level = levelList[idx];
        if (!level) {
            return;
        }

        loadLevel(level);
    }, [idx, levelList, loadLevel]);

    useEffect(() => {
        const level = levelList[idx];
        const levelKey = level ? buildLevelKey(level, diff, idx) : undefined;

        if (won && !previousWonRef.current) {
            setShowCompletionModal(true);
            setProgress((prev) => {
                let next = updateProgress(prev, diff, idx + 1);

                if (level && levelKey) {
                    const previousBest = getBestMoves(prev, diff, levelKey);
                    if (previousBest === undefined || moves < previousBest) {
                        next = setBestMoves(next, diff, levelKey, moves);
                    }
                }

                if (isSameProgress(next, prev)) {
                    return prev;
                }

                saveProgress(next);
                return next;
            });
        } else if (!won && previousWonRef.current) {
            setShowCompletionModal(false);
        }

        previousWonRef.current = won;
    }, [won, diff, idx, moves, levelList]);

    const hasNextLevel = idx + 1 < levelList.length;

    const handleCloseCompletionModal = () => {
        setShowCompletionModal(false);
    };

    const handleNextLevel = () => {
        if (!hasNextLevel) {
            setShowCompletionModal(false);
            return;
        }

        const nextIndex = idx + 1;
        const nextLevel = levelList[nextIndex];

        if (nextLevel) {
            loadLevel(nextLevel);
        }

        setIdx(nextIndex);
        resetLevel();
        setShowCompletionModal(false);
    };

    const handleResetLevel = () => {
        setShowCompletionModal(false);
        resetLevel();
    };

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
                                        const nextMaxUnlocked = Math.min(
                                            progress.unlocked[d] ?? 0,
                                            nextLevels.length - 1,
                                        );
                                        const nextIndex = Math.max(0, Math.min(idx, nextMaxUnlocked));
                                        setShowCompletionModal(false);
                                        setDiff(d);
                                        setIdx(nextIndex);
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
                                    bestMoves={bestMovesByLevel}
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
                            <button onClick={handleResetLevel} disabled={isSolving}>Reiniciar</button>
                            <button onClick={undo} disabled={!canUndo || isSolving}>Deshacer</button>
                            <button onClick={redo} disabled={!canRedo || isSolving}>Rehacer</button>
                            <button type="button" onClick={handleOpenTutorial} aria-haspopup="dialog">
                                Tutorial
                            </button>
                            <button
                                type="button"
                                onClick={handleToggleTargetIndicator}
                                className={showTargetIndicator ? 'active' : undefined}
                                aria-pressed={showTargetIndicator}
                            >
                                {showTargetIndicator ? 'Ocultar objetivo' : 'Resaltar objetivo'}
                            </button>
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
                            {typeof activeBestMoves === 'number' && (
                                <span className="hud-best">Mejor: {activeBestMoves}</span>
                            )}
                            {won && <span className="badge">¡Ganaste! 🎉</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Escena 3D */}
            <GameCanvas showTargetIndicator={showTargetIndicator} />

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

            <TutorialModal isOpen={showTutorial} onClose={handleCloseTutorial} />

            <CompletionModal
                isOpen={showCompletionModal}
                hasNextLevel={hasNextLevel}
                onClose={handleCloseCompletionModal}
                onNextLevel={handleNextLevel}
                currentMoves={moves}
                bestMoves={activeBestMoves}
            />
        </div>
    );
}

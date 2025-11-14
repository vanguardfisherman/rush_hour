import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { useGame } from '../game/store';
import type { ExitSide, PieceSpec } from '../game/types';
import { canPlace, clampRangeWithBlocks } from '../game/logic';
import '../styles/board.css';

const PIXEL_DEADZONE = 5;
const SNAP_THRESHOLD = 0.5;
const EXIT_EXTRA = 1.2;
const BASE_CELL_SIZE = 96;

function roundHalfUp(value: number, threshold = SNAP_THRESHOLD) {
    return value >= 0 ? Math.floor(value + threshold) : Math.ceil(value - threshold);
}

type DragAxis = 'x' | 'y';

type DragState = {
    id: string;
    axis: DragAxis;
    pointerId: number;
    startValue: number;
    previewValue: number;
    min: number;
    max: number;
    startClientX: number;
    startClientY: number;
    cellSizePx: number;
    active: boolean;
};

type ExitAnimation = {
    direction: ExitSide;
};

type StageMetrics = {
    cellSize: number;
    boardSize: number;
};

const ASSET_COLORS: Record<string, string> = {
    red: '#f25f5c',
    blue: '#247ba0',
    pink: '#ff8fa3',
    yellow: '#f6bd60',
    orange: '#f5973c',
    gray: '#8d99ae',
    purple: '#9d4edd',
    mili: '#586f7c',
};

function resolveAssetColor(asset: string) {
    const parts = asset.split('_');
    const colorKey = parts[parts.length - 1];
    return ASSET_COLORS[colorKey] ?? '#94a3b8';
}

function pieceClasses(piece: PieceSpec, isDragging: boolean) {
    const classes = ['board-piece', `board-piece--length-${piece.len}`];
    if (piece.id === 'P') classes.push('board-piece--player');
    if (piece.dir === 'h') classes.push('board-piece--horizontal');
    else classes.push('board-piece--vertical');
    if (isDragging) classes.push('board-piece--dragging');
    return classes.join(' ');
}

function shadowClasses(piece: PieceSpec, isDragging: boolean) {
    const classes = ['board-piece-shadow'];
    if (piece.id === 'P') classes.push('board-piece-shadow--player');
    if (isDragging) classes.push('board-piece-shadow--dragging');
    return classes.join(' ');
}

function computeStageMetrics(stage: HTMLDivElement | null, size: 6 | 7): StageMetrics {
    if (!stage) {
        const fallback = BASE_CELL_SIZE;
        return { cellSize: fallback, boardSize: fallback * size };
    }

    const rect = stage.getBoundingClientRect();
    const available = Math.min(rect.width, rect.height);
    const maxBoard = Math.max(220, available * 0.72);
    const cellSize = Math.min(BASE_CELL_SIZE, maxBoard / size);
    const boardSize = cellSize * size;
    return { cellSize, boardSize };
}

function useStageMetrics(stageRef: RefObject<HTMLDivElement | null>, size: 6 | 7) {
    const [metrics, setMetrics] = useState<StageMetrics>(() => computeStageMetrics(stageRef.current, size));

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) {
            setMetrics(computeStageMetrics(stage, size));
            return;
        }

        const update = () => setMetrics(computeStageMetrics(stageRef.current, size));
        update();

        const observer = new ResizeObserver(update);
        observer.observe(stage);
        window.addEventListener('resize', update);
        return () => {
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [size, stageRef]);

    return metrics;
}

export default function Board() {
    const stageRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const size = useGame(s => s.size) as 6 | 7;
    const pieces = useGame(s => s.pieces);
    const exit = useGame(s => s.exit);
    const moveTo = useGame(s => s.moveTo);
    const setWon = useGame(s => s.setWon);
    const won = useGame(s => s.won);
    const isSolving = useGame(s => s.isSolving);
    const levelSerial = useGame(s => s.levelSerial);
    const setBoardMetrics = useGame(s => s.setBoardMetrics);
    const resetBoardMetrics = useGame(s => s.resetBoardMetrics);

    const [drag, setDrag] = useState<DragState | null>(null);
    const [exitAnimation, setExitAnimation] = useState<ExitAnimation | null>(null);
    const exitTimeoutRef = useRef<number | null>(null);

    const { cellSize, boardSize } = useStageMetrics(stageRef, size);

    useEffect(() => {
        return () => {
            if (exitTimeoutRef.current !== null) {
                window.clearTimeout(exitTimeoutRef.current);
                exitTimeoutRef.current = null;
            }
            document.body.style.cursor = 'auto';
        };
    }, []);

    useEffect(() => {
        setBoardMetrics({ cellSize, originOffset: [0, 0, 0] });
        return () => {
            resetBoardMetrics();
        };
    }, [cellSize, setBoardMetrics, resetBoardMetrics]);

    useEffect(() => {
        setExitAnimation(null);
        if (exitTimeoutRef.current !== null) {
            window.clearTimeout(exitTimeoutRef.current);
            exitTimeoutRef.current = null;
        }
    }, [levelSerial, size]);

    useEffect(() => {
        if (isSolving) {
            setDrag(null);
        }
    }, [isSolving]);

    const cells = useMemo(() => {
        return Array.from({ length: size * size }, (_, index) => {
            const x = index % size;
            const y = Math.floor(index / size);
            return <div key={`cell-${x}-${y}`} className="board-cell" />;
        });
    }, [size]);

    const boardStyle = useMemo(() => ({
        '--cell-size': `${cellSize}px`,
        '--board-size': size,
        '--board-size-px': `${boardSize}px`,
    }) as CSSProperties, [cellSize, boardSize, size]);

    const exitElement = useMemo(() => {
        if (!exit) return null;
        const style: CSSProperties = { '--cell-size': `${cellSize}px` } as CSSProperties;
        const offset = exit.index * cellSize;
        switch (exit.side) {
            case 'right':
                style.transform = `translate3d(${boardSize}px, ${offset}px, 4px)`;
                break;
            case 'left':
                style.transform = `translate3d(${-cellSize}px, ${offset}px, 4px)`;
                break;
            case 'bottom':
                style.transform = `translate3d(${offset}px, ${boardSize}px, 4px)`;
                break;
            case 'top':
                style.transform = `translate3d(${offset}px, ${-cellSize}px, 4px)`;
                break;
            default:
                break;
        }
        return <div className="board-exit" style={style} />;
    }, [exit, boardSize, cellSize]);

    const getPieceStyle = useCallback((piece: PieceSpec, previewValue: number | null, isDraggingPiece: boolean) => {
        const color = resolveAssetColor(piece.asset);
        const baseX = piece.x * cellSize;
        const baseY = piece.y * cellSize;
        const width = (piece.dir === 'h' ? piece.len : 1) * cellSize;
        const height = (piece.dir === 'v' ? piece.len : 1) * cellSize;

        let translateX = baseX;
        let translateY = baseY;

        if (isDraggingPiece && previewValue !== null) {
            if (piece.dir === 'h') translateX = previewValue * cellSize;
            else translateY = previewValue * cellSize;
        }

        let exitOffsetX = 0;
        let exitOffsetY = 0;
        if (piece.id === 'P' && exitAnimation) {
            const extra = cellSize * EXIT_EXTRA;
            if (exitAnimation.direction === 'right') exitOffsetX = extra;
            if (exitAnimation.direction === 'left') exitOffsetX = -extra;
            if (exitAnimation.direction === 'bottom') exitOffsetY = extra;
            if (exitAnimation.direction === 'top') exitOffsetY = -extra;
        }

        translateX += exitOffsetX;
        translateY += exitOffsetY;

        const translateZ = piece.id === 'P' ? 64 : 52;
        const draggingLift = isDraggingPiece ? 12 : 0;

        return {
            '--piece-color': color,
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ + draggingLift}px)`,
        } as CSSProperties;
    }, [cellSize, exitAnimation]);

    const getShadowStyle = useCallback((piece: PieceSpec, previewValue: number | null, isDraggingPiece: boolean) => {
        const baseX = piece.x * cellSize;
        const baseY = piece.y * cellSize;
        const width = (piece.dir === 'h' ? piece.len : 1) * cellSize;
        const height = (piece.dir === 'v' ? piece.len : 1) * cellSize;
        let translateX = baseX;
        let translateY = baseY;

        if (isDraggingPiece && previewValue !== null) {
            if (piece.dir === 'h') translateX = previewValue * cellSize;
            else translateY = previewValue * cellSize;
        }

        let exitOffsetX = 0;
        let exitOffsetY = 0;
        if (piece.id === 'P' && exitAnimation) {
            const extra = cellSize * EXIT_EXTRA;
            if (exitAnimation.direction === 'right') exitOffsetX = extra;
            if (exitAnimation.direction === 'left') exitOffsetX = -extra;
            if (exitAnimation.direction === 'bottom') exitOffsetY = extra;
            if (exitAnimation.direction === 'top') exitOffsetY = -extra;
        }

        translateX += exitOffsetX;
        translateY += exitOffsetY;

        const translateZ = 2;
        const draggingLift = isDraggingPiece ? 4 : 0;

        return {
            width: `${width}px`,
            height: `${height}px`,
            transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ + draggingLift}px)`,
        } as CSSProperties;
    }, [cellSize, exitAnimation]);

    const handlePointerDown = useCallback((piece: PieceSpec) => (event: React.PointerEvent<HTMLDivElement>) => {
        if (won || isSolving) return;

        const boardEl = boardRef.current;
        if (!boardEl) return;

        const rect = boardEl.getBoundingClientRect();
        const axis: DragAxis = piece.dir === 'h' ? 'x' : 'y';
        const cellSizePx = axis === 'x' ? rect.width / size : rect.height / size;
        const limits = clampRangeWithBlocks(piece, size, pieces);
        const min = axis === 'x' ? limits.minX : limits.minY;
        const max = axis === 'x' ? limits.maxX : limits.maxY;

        setDrag({
            id: piece.id,
            axis,
            pointerId: event.pointerId,
            startValue: axis === 'x' ? piece.x : piece.y,
            previewValue: axis === 'x' ? piece.x : piece.y,
            min,
            max,
            startClientX: event.clientX,
            startClientY: event.clientY,
            cellSizePx,
            active: false,
        });

        event.currentTarget.setPointerCapture(event.pointerId);
        document.body.style.cursor = 'grabbing';
        event.preventDefault();
        event.stopPropagation();
    }, [pieces, size, won, isSolving]);

    const handlePointerMove = useCallback((piece: PieceSpec) => (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDrag(state => {
            if (!state || state.id !== piece.id || event.pointerId !== state.pointerId) return state;
            const deltaPx = state.axis === 'x'
                ? event.clientX - state.startClientX
                : event.clientY - state.startClientY;
            const raw = state.startValue + deltaPx / state.cellSizePx;
            const previewValue = Math.min(state.max, Math.max(state.min, raw));
            const moved = state.active || Math.abs(deltaPx) >= PIXEL_DEADZONE;
            return {
                ...state,
                previewValue,
                active: moved,
            };
        });
    }, []);

    const finalizeDrag = useCallback((piece: PieceSpec, pointerId: number, direction: 'forward' | 'backward' | 'none') => {
        if (!drag || drag.id !== piece.id || drag.pointerId !== pointerId) return;

        const axis = drag.axis;
        const raw = drag.previewValue;
        let snapped = roundHalfUp(raw);
        snapped = Math.min(drag.max, Math.max(drag.min, snapped));

        const nextX = axis === 'x' ? snapped : piece.x;
        const nextY = axis === 'y' ? snapped : piece.y;

        if (canPlace(piece, nextX, nextY, pieces, size)) {
            moveTo(piece.id, nextX, nextY);
        }

        if (piece.id === 'P' && exit) {
            const aligned = exit.side === 'left' || exit.side === 'right'
                ? piece.dir === 'h' && piece.y === exit.index
                : piece.dir === 'v' && piece.x === exit.index;

            if (aligned) {
                if (exit.side === 'right' && nextX === size - piece.len && direction === 'forward') {
                    setExitAnimation({ direction: 'right' });
                    if (exitTimeoutRef.current !== null) window.clearTimeout(exitTimeoutRef.current);
                    exitTimeoutRef.current = window.setTimeout(() => {
                        setWon(true);
                        exitTimeoutRef.current = null;
                    }, 400);
                } else if (exit.side === 'left' && nextX === 0 && direction === 'backward') {
                    setExitAnimation({ direction: 'left' });
                    if (exitTimeoutRef.current !== null) window.clearTimeout(exitTimeoutRef.current);
                    exitTimeoutRef.current = window.setTimeout(() => {
                        setWon(true);
                        exitTimeoutRef.current = null;
                    }, 400);
                } else if (exit.side === 'bottom' && nextY === size - piece.len && direction === 'forward') {
                    setExitAnimation({ direction: 'bottom' });
                    if (exitTimeoutRef.current !== null) window.clearTimeout(exitTimeoutRef.current);
                    exitTimeoutRef.current = window.setTimeout(() => {
                        setWon(true);
                        exitTimeoutRef.current = null;
                    }, 400);
                } else if (exit.side === 'top' && nextY === 0 && direction === 'backward') {
                    setExitAnimation({ direction: 'top' });
                    if (exitTimeoutRef.current !== null) window.clearTimeout(exitTimeoutRef.current);
                    exitTimeoutRef.current = window.setTimeout(() => {
                        setWon(true);
                        exitTimeoutRef.current = null;
                    }, 400);
                }
            }
        }

        setDrag(null);
        document.body.style.cursor = 'auto';
    }, [drag, exit, moveTo, pieces, setWon, size]);

    const handlePointerUp = useCallback((piece: PieceSpec) => (event: React.PointerEvent<HTMLDivElement>) => {
        if (!drag || drag.id !== piece.id || event.pointerId !== drag.pointerId) return;
        const movement = drag.previewValue - drag.startValue;
        const direction = movement > 0.01 ? 'forward' : movement < -0.01 ? 'backward' : 'none';
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        finalizeDrag(piece, event.pointerId, direction);
    }, [drag, finalizeDrag]);

    const handlePointerCancel = useCallback((piece: PieceSpec) => (event: React.PointerEvent<HTMLDivElement>) => {
        if (!drag || drag.id !== piece.id || event.pointerId !== drag.pointerId) return;
        event.currentTarget.releasePointerCapture?.(event.pointerId);
        setDrag(null);
        document.body.style.cursor = 'auto';
    }, [drag]);

    const renderPiece = useCallback((piece: PieceSpec) => {
        const isDraggingPiece = drag?.id === piece.id;
        const previewValue = isDraggingPiece ? drag.previewValue : null;
        const pieceStyle = getPieceStyle(piece, previewValue, Boolean(isDraggingPiece));
        const shadowStyle = getShadowStyle(piece, previewValue, Boolean(isDraggingPiece));

        return (
            <div key={piece.id}>
                <div className={shadowClasses(piece, Boolean(isDraggingPiece))} style={shadowStyle} />
                <div
                    role="button"
                    tabIndex={-1}
                    className={pieceClasses(piece, Boolean(isDraggingPiece))}
                    style={pieceStyle}
                    onPointerDown={handlePointerDown(piece)}
                    onPointerMove={handlePointerMove(piece)}
                    onPointerUp={handlePointerUp(piece)}
                    onPointerCancel={handlePointerCancel(piece)}
                >
                    <span className="board-piece__label">{piece.id}</span>
                </div>
            </div>
        );
    }, [drag, getPieceStyle, getShadowStyle, handlePointerCancel, handlePointerDown, handlePointerMove, handlePointerUp]);

    return (
        <div className="board-stage" ref={stageRef}>
            <div className="board-wrapper">
                <div className="board-surface" ref={boardRef} style={boardStyle}>
                    <div className="board-grid">{cells}</div>
                    {exitElement}
                    <div className="board-pieces">
                        {pieces.map(renderPiece)}
                    </div>
                </div>
            </div>
            <span className="board-stage-hint">Arrastra los coches para liberar al rojo</span>
        </div>
    );
}

// src/game/store.ts
import { create } from 'zustand';
import type { LevelDef, PieceSpec, Size } from './types';
import { solveLevelBFS } from './solver/core'; // ← solver BFS

type Snapshot = { pieces: PieceSpec[]; moves: number };

function clonePieces(arr: PieceSpec[]): PieceSpec[] {
    return arr.map(p => ({ ...p }));
}

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

export type BoardMetrics = {
    cellSize: number | null;
    originOffset: [number, number, number] | null;
    padding: number;
};

export const selectBoardMetrics = (state: GameState) => state.boardMetrics;
export const selectCellSize = (state: GameState) => state.boardMetrics.cellSize;
export const selectOriginOffset = (state: GameState) => state.boardMetrics.originOffset;
export const selectBoardPadding = (state: GameState) => state.boardMetrics.padding;

export type GameState = {
    size: Size;
    exit: LevelDef['exit'] | null;
    pieces: PieceSpec[];
    moves: number;
    won: boolean;
    levelSerial: number;

    // para reset
    initial: { size: Size; exit: LevelDef['exit']; pieces: PieceSpec[] } | null;

    // undo/redo
    past: Snapshot[];
    future: Snapshot[];
    canUndo: boolean;
    canRedo: boolean;

    boardMetrics: BoardMetrics;
    setBoardMetrics: (metrics: Partial<BoardMetrics>) => void;
    resetBoardMetrics: () => void;
    setBoardPadding: (padding: number) => void;

    // acciones base
    loadLevel: (level: LevelDef) => void;
    moveTo: (id: string, x: number, y: number) => void;
    resetLevel: () => void;
    undo: () => void;
    redo: () => void;
    setWon: (v: boolean) => void;

    // --- Solver (animación paso a paso) ---
    isSolving: boolean;         // true mientras se reproduce la solución
    solverSpeedMs: number;      // delay entre pasos
    solverSerial: number;       // token para cancelar reproducciones en curso
    setSolverSpeed: (ms: number) => void;
    cancelSolve: () => void;

    // mover SIN historial/contador (para animación)
    moveToSilent: (id: string, x: number, y: number) => void;

    // calcula solución y la reproduce animada
    solveAndAnimate: () => Promise<void>;
};

export const useGame = create<GameState>((set, get) => ({
    size: 6 as Size,
    exit: null,
    pieces: [],
    moves: 0,
    won: false,
    levelSerial: 0,

    initial: null,

    past: [],
    future: [],
    canUndo: false,
    canRedo: false,

    boardMetrics: {
        cellSize: null,
        originOffset: null,
        padding: 0,
    },

    setBoardMetrics: (metrics) =>
        set((state) => ({
            boardMetrics: { ...state.boardMetrics, ...metrics },
        })),

    resetBoardMetrics: () =>
        set((state) => ({
            boardMetrics: {
                cellSize: null,
                originOffset: null,
                padding: state.boardMetrics.padding,
            },
        })),

    setBoardPadding: (padding) =>
        set((state) => ({
            boardMetrics: { ...state.boardMetrics, padding },
        })),

    loadLevel: (level) => {
        set((state) => ({
            size: level.size,
            exit: level.exit,
            pieces: clonePieces(level.pieces),
            moves: 0,
            won: false,
            levelSerial: state.levelSerial + 1,
            initial: {
                size: level.size,
                exit: level.exit,
                pieces: clonePieces(level.pieces),
            },
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
            boardMetrics: {
                ...state.boardMetrics,
                cellSize: null,
                originOffset: null,
            },
        }));
    },

    moveTo: (id, x, y) => {
        const { pieces, moves, won } = get();
        if (won) return; // si ya ganó, ignora

        const idx = pieces.findIndex(p => p.id === id);
        if (idx < 0) return;

        const cur = pieces[idx];
        if (cur.x === x && cur.y === y) return; // nada que hacer

        // guarda snapshot en past
        const snap: Snapshot = { pieces: clonePieces(pieces), moves };
        const past = [...get().past, snap].slice(-100); // límite opcional

        // aplica movimiento
        const nextPieces = clonePieces(pieces);
        nextPieces[idx] = { ...nextPieces[idx], x, y };

        set({
            pieces: nextPieces,
            moves: moves + 1,
            past,
            future: [],
            canUndo: past.length > 0,
            canRedo: false,
        });
    },

    resetLevel: () => {
        const init = get().initial;
        if (!init) return;
        set({
            size: init.size,
            exit: init.exit,
            pieces: clonePieces(init.pieces),
            moves: 0,
            won: false,
            past: [],
            future: [],
            canUndo: false,
            canRedo: false,
        });
    },

    undo: () => {
        const { past, pieces, moves, future } = get();
        if (past.length === 0) return;

        const prev = past[past.length - 1];
        const newPast = past.slice(0, -1);
        const curSnap: Snapshot = { pieces: clonePieces(pieces), moves };

        set({
            pieces: clonePieces(prev.pieces),
            moves: prev.moves,
            past: newPast,
            future: [...future, curSnap],
            canUndo: newPast.length > 0,
            canRedo: true,
            won: false, // por si estabas saliendo
        });
    },

    redo: () => {
        const { past, pieces, moves, future } = get();
        if (future.length === 0) return;

        const next = future[future.length - 1];
        const newFuture = future.slice(0, -1);
        const curSnap: Snapshot = { pieces: clonePieces(pieces), moves };

        set({
            pieces: clonePieces(next.pieces),
            moves: next.moves,
            past: [...past, curSnap],
            future: newFuture,
            canUndo: true,
            canRedo: newFuture.length > 0,
            won: false,
        });
    },

    setWon: (v) => set({ won: v }),

    // --- Solver state ---
    isSolving: false,
    solverSpeedMs: 350,
    solverSerial: 0,
    setSolverSpeed: (ms) => set({ solverSpeedMs: ms }),
    cancelSolve: () =>
        set((s) => ({ isSolving: false, solverSerial: s.solverSerial + 1 })),

    // mover SIN historial (para animación del solver)
    moveToSilent: (id, x, y) =>
        set((s) => {
            const idx = s.pieces.findIndex(p => p.id === id);
            if (idx < 0) return s;
            const next = clonePieces(s.pieces);
            next[idx] = { ...next[idx], x, y };
            return { pieces: next };
        }),

    // calcula y reproduce la solución animada
    solveAndAnimate: async () => {
        const { size, exit, pieces } = get();
        if (!exit) return;

        // token de reproducción (para cancelar si el usuario vuelve a pulsar "Resolver")
        const serial = get().solverSerial + 1;
        set({ isSolving: true, solverSerial: serial });

        // Nota: el solver solo necesita size+exit; casteamos para evitar exigir metadatos
        const levelLike = { size, exit } as unknown as LevelDef;
        const solution = solveLevelBFS(levelLike, clonePieces(pieces));

        if (!solution || solution.moves.length === 0) {
            // sin solución o ya libre
            if (get().solverSerial === serial) set({ isSolving: false });
            return;
        }

        // Reproducir paso a paso
        for (const mv of solution.moves) {
            // cancelado?
            if (get().solverSerial !== serial) return;
            get().moveToSilent(mv.pieceId, mv.to.x, mv.to.y);
            await sleep(get().solverSpeedMs);
        }

        // Opcional: deslizar automáticamente el Player hasta el borde de salida
        if (get().solverSerial === serial) {
            const P = get().pieces.find(q => q.id === 'P');
            if (P) {
                if (exit.side === 'top') {
                    get().moveToSilent(P.id, P.x, 0);
                } else if (exit.side === 'bottom') {
                    get().moveToSilent(P.id, P.x, get().size - P.len);
                } else if (exit.side === 'left') {
                    get().moveToSilent(P.id, 0, P.y);
                } else if (exit.side === 'right') {
                    get().moveToSilent(P.id, get().size - P.len, P.y);
                }
            }
            set({ isSolving: false });
        }
    },
}));

export const useBoardMetrics = () => useGame(selectBoardMetrics);

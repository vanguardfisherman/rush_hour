// src/game/solver/core.ts
import type { LevelDef, PieceSpec } from '../types';

export type Move = {
    pieceId: string;
    from: { x: number; y: number };
    to: { x: number; y: number };
};

export type Solution = {
    moves: Move[];   // secuencia óptima (mínimo nº de movimientos)
    visited: number; // estados explorados (debug/perf)
};

// --- Helpers de estado ------------------------------------------------------

type Canon = { order: string[]; idx: Record<string, number> };

function canonFromPieces(pieces: PieceSpec[]): Canon {
    const order = [...pieces].map(p => p.id).sort();  // orden estable por id
    const idx: Record<string, number> = {};
    order.forEach((id, i) => (idx[id] = i));
    return { order, idx };
}

function encode(pieces: PieceSpec[], canon: Canon): string {
    // codifica solo posiciones para hashing
    const key: number[] = new Array(canon.order.length * 2);
    for (const p of pieces) {
        const i = canon.idx[p.id] * 2;
        key[i] = p.x;
        key[i + 1] = p.y;
    }
    return key.join(',');
}

function clonePieces(pieces: PieceSpec[]): PieceSpec[] {
    return pieces.map(p => ({ ...p }));
}

function makeGrid(size: number): number[][] {
    // -1 libre, si no: guarda len del vehículo ocupante (solo debug)
    return Array.from({ length: size }, () => Array(size).fill(-1));
}

function occupy(grid: number[][], p: PieceSpec, ignoreId?: string) {
    if (ignoreId && p.id === ignoreId) return;
    if (p.dir === 'h') {
        for (let dx = 0; dx < p.len; dx++) grid[p.y][p.x + dx] = p.len;
    } else {
        for (let dy = 0; dy < p.len; dy++) grid[p.y + dy][p.x] = p.len;
    }
}

function buildGrid(size: number, pieces: PieceSpec[], ignoreId?: string) {
    const g = makeGrid(size);
    for (const p of pieces) occupy(g, p, ignoreId);
    return g;
}

// devuelve todos los "x" (si h) o "y" (si v) posibles a los que puede moverse el origen del vehículo
function slideTargets(size: number, grid: number[][], p: PieceSpec): number[] {
    const res: number[] = [];
    if (p.dir === 'h') {
        // hacia la izquierda
        for (let nx = p.x - 1; nx >= 0; nx--) {
            if (grid[p.y][nx] !== -1) break;
            res.push(nx);
        }
        // hacia la derecha (desde la cola)
        for (let nx = p.x + 1; nx + p.len - 1 < size; nx++) {
            if (grid[p.y][nx + p.len - 1] !== -1) break;
            res.push(nx);
        }
    } else {
        // hacia arriba
        for (let ny = p.y - 1; ny >= 0; ny--) {
            if (grid[ny][p.x] !== -1) break;
            res.push(ny);
        }
        // hacia abajo (desde la cola)
        for (let ny = p.y + 1; ny + p.len - 1 < size; ny++) {
            if (grid[ny + p.len - 1][p.x] !== -1) break;
            res.push(ny);
        }
    }
    return res;
}

// ---------------------------------------------------------------------------
// El solver solo necesita size y exit del nivel
type MinimalLevel = Pick<LevelDef, 'size' | 'exit'>;

// condición de meta: el player puede deslizarse hasta SALIR sin mover a nadie más
function isGoal(level: MinimalLevel, pieces: PieceSpec[]): boolean {
    const { exit } = level;
    const P = pieces.find(q => q.id === 'P');
    if (!P) return false;

    const grid = buildGrid(level.size, pieces, 'P'); // excluye al player

    if (P.dir === 'v' && (exit.side === 'top' || exit.side === 'bottom') && P.x === exit.index) {
        if (exit.side === 'top') {
            for (let y = P.y - 1; y >= 0; y--) if (grid[y][P.x] !== -1) return false;
            return true; // nada encima: puede salir
        } else {
            for (let y = P.y + P.len; y < level.size; y++) if (grid[y][P.x] !== -1) return false;
            return true;
        }
    }
    if (P.dir === 'h' && (exit.side === 'left' || exit.side === 'right') && P.y === exit.index) {
        if (exit.side === 'left') {
            for (let x = P.x - 1; x >= 0; x--) if (grid[P.y][x] !== -1) return false;
            return true;
        } else {
            for (let x = P.x + P.len; x < level.size; x++) if (grid[P.y][x] !== -1) return false;
            return true;
        }
    }
    return false;
}

// --- BFS --------------------------------------------------------------------

export function solveLevelBFS(
    level: MinimalLevel,
    start: PieceSpec[]
): Solution | null {
    const canon = canonFromPieces(start);
    const startKey = encode(start, canon);
    const q: string[] = [startKey];

    const stateByKey = new Map<string, PieceSpec[]>();
    stateByKey.set(startKey, clonePieces(start));

    const parent = new Map<string, { prev: string | null; move: Move | null }>();
    parent.set(startKey, { prev: null, move: null });

    let head = 0;
    let visited = 0;

    while (head < q.length) {
        const key = q[head++];
        visited++;

        const pieces = stateByKey.get(key)!;
        if (isGoal(level, pieces)) {
            // reconstruir solución
            const moves: Move[] = [];
            let cur: string | null = key;
            while (cur && parent.get(cur)?.move) {
                const step = parent.get(cur)!.move!;
                moves.push(step);
                cur = parent.get(cur)!.prev!;
            }
            moves.reverse();
            return { moves, visited };
        }

        // expandir vecinos: mover cada pieza a todas sus posiciones posibles
        // (1 movimiento = deslizar a cualquier target permitido)
        for (const p of pieces) {
            const grid = buildGrid(level.size, pieces, p.id);
            const targets = slideTargets(level.size, grid, p);
            for (const t of targets) {
                const next = clonePieces(pieces);
                const me = next.find(x => x.id === p.id)!;
                const from = { x: me.x, y: me.y };
                if (me.dir === 'h') me.x = t; else me.y = t;

                const nextKey = encode(next, canon);
                if (stateByKey.has(nextKey)) continue;

                stateByKey.set(nextKey, next);
                parent.set(nextKey, {
                    prev: key,
                    move: { pieceId: p.id, from, to: { x: me.x, y: me.y } },
                });
                q.push(nextKey);
            }
        }
    }

    return null; // sin solución
}

// src/game/logic.ts
import type { PieceSpec } from './types';

/** Rangos por bordes (sin bloquear por otros coches) */
export function clampRangeFor(piece: PieceSpec, size: 6 | 7) {
    if (piece.dir === 'h') {
        return { minX: 0, maxX: size - piece.len, minY: piece.y, maxY: piece.y };
    } else {
        return { minX: piece.x, maxX: piece.x, minY: 0, maxY: size - piece.len };
    }
}

/** ¿Puedo colocar `piece` en (x,y) sin salirme ni chocar? */
export function canPlace(
    piece: PieceSpec,
    x: number,
    y: number,
    pieces: PieceSpec[],
    size: 6 | 7
) {
    // 1) bordes
    if (piece.dir === 'h') {
        if (x < 0 || x > size - piece.len) return false;
        if (y < 0 || y >= size) return false;
    } else {
        if (y < 0 || y > size - piece.len) return false;
        if (x < 0 || x >= size) return false;
    }

    // 2) solapamiento con otros
    const cellsOf = (p: PieceSpec, xx: number, yy: number): string[] => {
        const cells: string[] = [];
        if (p.dir === 'h') {
            for (let k = 0; k < p.len; k++) cells.push(`${yy}:${xx + k}`);
        } else {
            for (let k = 0; k < p.len; k++) cells.push(`${yy + k}:${xx}`);
        }
        return cells;
    };

    const here = cellsOf(piece, x, y);
    const occupied = new Set<string>();
    for (const q of pieces) {
        if (q.id === piece.id) continue;
        cellsOf(q, q.x, q.y).forEach(c => occupied.add(c));
    }
    return here.every(c => !occupied.has(c));
}

/** Rango permitido respetando bloqueos de otros coches */
export function clampRangeWithBlocks(
    piece: PieceSpec,
    size: 6 | 7,
    pieces: PieceSpec[]
) {
    // grid de ocupación (excluye a `piece`)
    const blocked: boolean[][] = Array.from({ length: size }, () =>
        Array<boolean>(size).fill(false)
    );
    for (const q of pieces) {
        if (q.id === piece.id) continue;
        if (q.dir === 'h') {
            for (let k = 0; k < q.len; k++) {
                const xx = q.x + k, yy = q.y;
                if (xx >= 0 && xx < size && yy >= 0 && yy < size) blocked[yy][xx] = true;
            }
        } else {
            for (let k = 0; k < q.len; k++) {
                const xx = q.x, yy = q.y + k;
                if (xx >= 0 && xx < size && yy >= 0 && yy < size) blocked[yy][xx] = true;
            }
        }
    }

    if (piece.dir === 'h') {
        const row = blocked[piece.y];
        const freeAt = (x: number) => {
            for (let k = 0; k < piece.len; k++) if (row[x + k]) return false;
            return true;
        };
        let minX = piece.x, maxX = piece.x;
        while (minX > 0 && freeAt(minX - 1)) minX--;
        while (maxX < size - piece.len && freeAt(maxX + 1)) maxX++;
        return { minX, maxX, minY: piece.y, maxY: piece.y };
    } else {
        const freeAt = (y: number) => {
            for (let k = 0; k < piece.len; k++) if (blocked[y + k][piece.x]) return false;
            return true;
        };
        let minY = piece.y, maxY = piece.y;
        while (minY > 0 && freeAt(minY - 1)) minY--;
        while (maxY < size - piece.len && freeAt(maxY + 1)) maxY++;
        return { minX: piece.x, maxX: piece.x, minY, maxY };
    }
}

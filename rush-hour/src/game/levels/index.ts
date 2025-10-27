// src/game/levels/index.ts
export type Size = 6 | 7;
export type Dir = 'h' | 'v';
export type PieceLen = 2 | 3 | 4;

export type PieceSpec = {
    id: string;    // "P" para el player
    len: PieceLen; // 2 / 3 / 4
    dir: Dir;      // 'h' | 'v'
    x: number;     // columna (0..size-1)
    y: number;     // fila    (0..size-1)
    asset: string; // clave del asset
};

// Salida del tablero
export type ExitSide = 'left' | 'right' | 'top' | 'bottom';
export type ExitSpec = { side: ExitSide; index: number };

// Nuevo: metadatos para ordenar/filtrar en el selector
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

// Definición de nivel (alineado con tu e01)
export type LevelDef = {
    id: string;            // <— requerido
    size: Size;
    pieces: PieceSpec[];
    exit: ExitSpec;
    difficulty?: Difficulty; // opcional
    name?: string;           // opcional (para mostrar en UI)
};

// Importa colecciones por dificultad
import { EASY_LEVELS }   from './easy';
import { NORMAL_LEVELS } from './normal';

// Re-export si ya los consumías en otros lados
export { EASY_LEVELS, NORMAL_LEVELS };

// Registry unificado
export const LEVELS: LevelDef[] = [
    ...EASY_LEVELS,
    ...NORMAL_LEVELS,
];

// Accesos útiles para store/selector
export const LEVELS_BY_ID: Record<string, LevelDef> =
    Object.fromEntries(LEVELS.map(l => [l.id, l])) as Record<string, LevelDef>;

export const LEVEL_ORDER: string[] = LEVELS.map(l => l.id);

export function getLevel(id: string): LevelDef {
    const lvl = LEVELS_BY_ID[id];
    if (!lvl) throw new Error(`Nivel no encontrado: ${id}`);
    return lvl;
}

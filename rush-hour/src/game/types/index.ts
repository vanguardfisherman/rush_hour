// src/game/types/index.ts
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

export type ExitSide = 'left' | 'right' | 'top' | 'bottom';
export type ExitSpec = { side: ExitSide; index: number };

export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

export type LevelDef = {
    id: string;
    size: Size;
    pieces: PieceSpec[];
    exit: ExitSpec;
    difficulty?: Difficulty; // ← opcional para que no rompa
    name?: string;
};

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

// Asegúrate de tener la exportación de AssetId aquí
export type AssetId =
    | 'player_len2_red'
    | 'car_len2_blue'
    | 'car_len2_gray'
    | 'car_len2_orange'
    | 'car_len2_pink'
    | 'car_len2_yellow'
    | 'car_len3_red'
    | 'car_len3_purple'
    | 'car_len3_mili'
    | 'car_len4_red'
    | 'car_len4_yellow'
    | 'car_len4_gray';

export type LevelDef = {
    id: string;
    size: Size;
    pieces: PieceSpec[];
    exit: ExitSpec;
    difficulty?: Difficulty; // opcional
    name?: string;
};

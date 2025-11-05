import type { LevelDef } from '../types';

export const NORMAL_LEVELS: LevelDef[] = [
    {
        size: 7,
        // en tu GLB 7x7, la salida está en el borde derecho, fila 4 (0-index)
        exit: {side: 'right', index: 4},
        // Nota: (x, y) = (columna, fila) con índices 0.
        pieces: [
            {id: 'P', len: 2, dir: 'h', x: 1, y: 4, asset: 'player_len2_red'},
            {id: 'A', len: 3, dir: 'v', x: 0, y: 1, asset: 'car_len3_red'},
            {id: 'B', len: 3, dir: 'v', x: 3, y: 1, asset: 'car_len3_purple'},
            {id: 'C', len: 2, dir: 'h', x: 3, y: 4, asset: 'car_len2_yellow'},
        ],
        id: "",
        difficulty: "easy"
    },
];
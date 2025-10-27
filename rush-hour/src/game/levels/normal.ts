import type { LevelDef } from '../types';

export const NORMAL_LEVELS: LevelDef[] = [
    {
        size: 7,
        // en tu GLB 7x7, la salida está típicamente en fila 3
        exit: {side: 'right', index: 3},
        pieces: [
            {id: 'P', len: 2, dir: 'h', x: 2, y: 3, asset: 'player_len2_red'},
        ],
        id: "",
        difficulty: "easy"
    },
];

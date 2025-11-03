// src/game/levels/easy.ts
// src/game/levels/easy.ts
import type { LevelDef } from '../types';

export const EASY_LEVELS: LevelDef[] = [
    // e01
    {
        id: 'e01',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',  len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',  len: 2, dir: 'h', x: 2, y: 2, asset: 'car_len2_pink' },
            { id: 'N15',len: 3, dir: 'v', x: 2, y: 3, asset: 'car_len3_mili' },
            { id: 'N18',len: 4, dir: 'v', x: 4, y: 2, asset: 'car_len4_yellow' },
            { id: 'N2', len: 2, dir: 'h', x: 4, y: 0, asset: 'car_len2_yellow' }, // ← antes blue
            { id: 'N20',len: 3, dir: 'v', x: 0, y: 0, asset: 'car_len3_purple' },
            { id: 'N33',len: 3, dir: 'h', x: 1, y: 1, asset: 'car_len3_purple' },
            { id: 'N4', len: 3, dir: 'v', x: 5, y: 1, asset: 'car_len3_purple' },
            { id: 'N5', len: 3, dir: 'v', x: 1, y: 2, asset: 'car_len3_mili' },
            { id: 'N6', len: 3, dir: 'h', x: 1, y: 0, asset: 'car_len3_mili' },
        ],
    },

    // e02
    {
        id: 'e02',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',  len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',  len: 3, dir: 'h', x: 3, y: 2, asset: 'car_len3_mili' },
            { id: 'N1', len: 2, dir: 'v', x: 4, y: 0, asset: 'car_len2_orange' }, // ← antes blue
            { id: 'N16',len: 3, dir: 'h', x: 1, y: 0, asset: 'car_len3_red' },
            { id: 'N2', len: 2, dir: 'v', x: 2, y: 3, asset: 'car_len2_pink' },   // ← antes gray
            { id: 'N21',len: 2, dir: 'v', x: 5, y: 0, asset: 'car_len2_yellow' }, // ← antes blue
            { id: 'N26',len: 3, dir: 'h', x: 2, y: 5, asset: 'car_len3_purple' },
            { id: 'N38',len: 3, dir: 'v', x: 1, y: 2, asset: 'car_len3_mili' },
            { id: 'N4', len: 3, dir: 'h', x: 1, y: 1, asset: 'car_len3_red' },
            { id: 'N6', len: 3, dir: 'v', x: 0, y: 1, asset: 'car_len3_red' },
        ],
    },

    // e03
    {
        id: 'e03',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',  len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',  len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_yellow' }, // ← antes gray
            { id: 'N1', len: 2, dir: 'h', x: 4, y: 5, asset: 'car_len2_orange' }, // ← antes yellow
            { id: 'N11',len: 4, dir: 'v', x: 2, y: 2, asset: 'car_len4_red' },
            { id: 'N19',len: 3, dir: 'h', x: 3, y: 1, asset: 'car_len3_mili' },
            { id: 'N2', len: 3, dir: 'h', x: 1, y: 0, asset: 'car_len3_mili' },
            { id: 'N27',len: 2, dir: 'v', x: 0, y: 1, asset: 'car_len2_orange' },
            { id: 'N32',len: 2, dir: 'h', x: 4, y: 3, asset: 'car_len2_pink' },
            { id: 'N6', len: 2, dir: 'v', x: 0, y: 3, asset: 'car_len2_gray' },   // ← antes blue
            { id: 'N8', len: 3, dir: 'v', x: 1, y: 3, asset: 'car_len3_purple' },
        ],
    },

    // e04
    {
        id: 'e04',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',    len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',    len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_pink' },    // ← antes gray
            { id: 'N1',   len: 3, dir: 'v', x: 2, y: 1, asset: 'car_len3_red' },
            { id: 'N15',  len: 3, dir: 'v', x: 1, y: 2, asset: 'car_len3_purple' },
            { id: 'N169', len: 2, dir: 'h', x: 0, y: 1, asset: 'car_len2_yellow' },  // ← antes gray
            { id: 'N182', len: 2, dir: 'v', x: 5, y: 0, asset: 'car_len2_orange' },  // ← antes blue
            { id: 'N20',  len: 3, dir: 'v', x: 0, y: 2, asset: 'car_len3_purple' },
            { id: 'N26',  len: 2, dir: 'h', x: 3, y: 0, asset: 'car_len2_blue' },    // ← mantiene blue
            { id: 'N3',   len: 2, dir: 'h', x: 2, y: 5, asset: 'car_len2_gray' },    // ← antes gray (igual)
            { id: 'N5',   len: 2, dir: 'h', x: 0, y: 0, asset: 'car_len2_gray' },    // ← antes blue
            { id: 'N6',   len: 2, dir: 'h', x: 4, y: 4, asset: 'car_len2_pink' },    // ← antes gray
            { id: 'N79',  len: 2, dir: 'h', x: 3, y: 1, asset: 'car_len2_yellow' },  // ← antes blue
            { id: 'N8',   len: 2, dir: 'v', x: 5, y: 2, asset: 'car_len2_blue' },    // ← mantiene blue
        ],
    },

    // e05
    {
        id: 'e05',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',   len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',   len: 3, dir: 'h', x: 1, y: 2, asset: 'car_len3_mili' },
            { id: 'N10', len: 2, dir: 'v', x: 1, y: 0, asset: 'car_len2_orange' }, // ← antes blue
            { id: 'N11', len: 2, dir: 'h', x: 1, y: 5, asset: 'car_len2_pink' },   // ← antes gray
            { id: 'N17', len: 2, dir: 'v', x: 5, y: 4, asset: 'car_len2_yellow' }, // ← antes blue
            { id: 'N2',  len: 3, dir: 'h', x: 3, y: 1, asset: 'car_len3_purple' },
            { id: 'N3',  len: 3, dir: 'h', x: 3, y: 0, asset: 'car_len3_purple' },
            { id: 'N30', len: 3, dir: 'h', x: 0, y: 3, asset: 'car_len3_purple' },
            { id: 'N7',  len: 2, dir: 'h', x: 0, y: 4, asset: 'car_len2_blue' },   // ← antes gray
        ],
    },

    // e06
    {
        id: 'e06',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',   len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',   len: 3, dir: 'h', x: 3, y: 2, asset: 'car_len3_purple' },
            { id: 'N15', len: 3, dir: 'h', x: 3, y: 5, asset: 'car_len3_purple' },
            { id: 'N2',  len: 2, dir: 'v', x: 1, y: 0, asset: 'car_len2_orange' }, // ← antes gray
            { id: 'N21', len: 3, dir: 'v', x: 0, y: 0, asset: 'car_len3_red' },
            { id: 'N26', len: 2, dir: 'h', x: 4, y: 1, asset: 'car_len2_pink' },   // ← antes gray
            { id: 'N31', len: 2, dir: 'h', x: 0, y: 5, asset: 'car_len2_yellow' }, // ← antes gray
            { id: 'N47', len: 2, dir: 'h', x: 0, y: 3, asset: 'car_len2_blue' },   // ← antes gray
            { id: 'N5',  len: 2, dir: 'v', x: 2, y: 3, asset: 'car_len2_gray' },   // ← mantiene gray
            { id: 'N6',  len: 3, dir: 'h', x: 2, y: 0, asset: 'car_len3_red' },
        ],
    },

    // e07
    {
        id: 'e07',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',   len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',   len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_pink' },    // ← antes gray
            { id: 'N10', len: 4, dir: 'h', x: 1, y: 5, asset: 'car_len4_gray' },
            { id: 'N16', len: 3, dir: 'h', x: 3, y: 0, asset: 'car_len3_mili' },
            { id: 'N2',  len: 2, dir: 'v', x: 5, y: 2, asset: 'car_len2_yellow' },  // ← antes blue
            { id: 'N22', len: 2, dir: 'v', x: 0, y: 4, asset: 'car_len2_orange' },  // ← antes gray
            { id: 'N25', len: 3, dir: 'v', x: 1, y: 0, asset: 'car_len3_purple' },
            { id: 'N4',  len: 3, dir: 'h', x: 0, y: 3, asset: 'car_len3_mili' },
            { id: 'N48', len: 2, dir: 'h', x: 3, y: 1, asset: 'car_len2_blue' },    // ← antes gray
            { id: 'N7',  len: 2, dir: 'v', x: 2, y: 0, asset: 'car_len2_pink' },    // ← antes gray
            { id: 'N74', len: 2, dir: 'h', x: 4, y: 4, asset: 'car_len2_yellow' },  // ← antes gray
        ],
    },

    // e08
    {
        id: 'e08',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',   len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',   len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_pink' },    // ← antes blue
            { id: 'N1',  len: 2, dir: 'v', x: 2, y: 3, asset: 'car_len2_yellow' },  // ← antes blue
            { id: 'N10', len: 2, dir: 'v', x: 4, y: 3, asset: 'car_len2_orange' },  // ← antes blue
            { id: 'N11', len: 2, dir: 'v', x: 0, y: 1, asset: 'car_len2_gray' },    // ← antes blue
            { id: 'N2',  len: 2, dir: 'h', x: 3, y: 5, asset: 'car_len2_blue' },    // ← antes gray
            { id: 'N49', len: 3, dir: 'h', x: 3, y: 1, asset: 'car_len3_purple' },
            { id: 'N5',  len: 3, dir: 'v', x: 1, y: 0, asset: 'car_len3_red' },
            { id: 'N6',  len: 2, dir: 'h', x: 0, y: 5, asset: 'car_len2_yellow' },  // ← antes gray
            { id: 'N9',  len: 2, dir: 'h', x: 0, y: 3, asset: 'car_len2_orange' },  // ← antes gray
        ],
    },

    // e09
    {
        id: 'e09',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',    len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',    len: 3, dir: 'h', x: 3, y: 2, asset: 'car_len3_purple' },
            { id: 'N1',   len: 3, dir: 'v', x: 5, y: 3, asset: 'car_len3_red' },
            { id: 'N112', len: 2, dir: 'h', x: 3, y: 0, asset: 'car_len2_pink' },    // ← antes gray
            { id: 'N13',  len: 3, dir: 'h', x: 1, y: 1, asset: 'car_len3_mili' },
            { id: 'N2',   len: 3, dir: 'v', x: 0, y: 1, asset: 'car_len3_mili' },
            { id: 'N25',  len: 3, dir: 'v', x: 1, y: 2, asset: 'car_len3_red' },
            { id: 'N3',   len: 3, dir: 'h', x: 0, y: 0, asset: 'car_len3_mili' },
            { id: 'N46',  len: 2, dir: 'v', x: 4, y: 4, asset: 'car_len2_yellow' },  // ← antes gray
            { id: 'N55',  len: 2, dir: 'h', x: 0, y: 5, asset: 'car_len2_orange' },  // ← antes blue
            { id: 'N7',   len: 3, dir: 'v', x: 2, y: 3, asset: 'car_len3_red' },
            { id: 'N8',   len: 2, dir: 'v', x: 5, y: 0, asset: 'car_len2_gray' },    // ← antes blue
        ],
    },
];

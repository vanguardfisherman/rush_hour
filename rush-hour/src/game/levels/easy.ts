// src/game/levels/easy.ts
// src/game/levels/easy.ts
import type { LevelDef } from '../types';

export const EASY_LEVELS: LevelDef[] = [
    // e01
    {
        id: '1',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 1, y: 2, asset: 'car_len3_red' },
            { id: 'N1', len: 4, dir: 'v', x: 4, y: 1, asset: 'car_len4_red' },
            { id: 'N10', len: 3, dir: 'h', x: 1, y: 5, asset: 'car_len3_purple' },
            { id: 'N13', len: 3, dir: 'v', x: 0, y: 2, asset: 'car_len3_red' },
            { id: 'N15', len: 3, dir: 'h', x: 1, y: 1, asset: 'car_len3_mili' },
            { id: 'N22', len: 4, dir: 'v', x: 5, y: 0, asset: 'car_len4_gray' },
            { id: 'N229', len: 2, dir: 'h', x: 3, y: 0, asset: 'car_len2_redclassicar' },
            { id: 'N4', len: 2, dir: 'h', x: 1, y: 3, asset: 'car_len2_redferrari' },
            { id: 'N9', len: 3, dir: 'h', x: 0, y: 0, asset: 'car_len3_red' }
        ],
    },
    {
        id: '2',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A', len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_redclassicar' },
            { id: 'N1', len: 2, dir: 'h', x: 3, y: 1, asset: 'car_len2_redferrari' },
            { id: 'N14', len: 3, dir: 'h', x: 0, y: 5, asset: 'car_len3_mili' },
            { id: 'N148', len: 3, dir: 'h', x: 1, y: 0, asset: 'car_len3_mili' },
            { id: 'N20', len: 3, dir: 'v', x: 4, y: 3, asset: 'car_len3_red' },
            { id: 'N22', len: 3, dir: 'v', x: 5, y: 2, asset: 'car_len3_red' },
            { id: 'N28', len: 3, dir: 'v', x: 2, y: 2, asset: 'car_len3_black' },
            { id: 'N36', len: 3, dir: 'v', x: 1, y: 2, asset: 'car_len3_mili' },
            { id: 'N4', len: 2, dir: 'h', x: 4, y: 0, asset: 'car_len2_redmotorbike' },
            { id: 'N5', len: 2, dir: 'v', x: 0, y: 0, asset: 'car_len2_pinkferrari' },
            { id: 'N7', len: 3, dir: 'v', x: 0, y: 2, asset: 'car_len3_mili' },
            { id: 'N74', len: 2, dir: 'h', x: 1, y: 1, asset: 'car_len2_pinkmotorbike' }
        ],
    },
    {
        id: '3',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A', len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_redmotorbike' },
            { id: 'N1', len: 3, dir: 'h', x: 2, y: 0, asset: 'car_len3_purple' },
            { id: 'N101', len: 2, dir: 'h', x: 0, y: 3, asset: 'car_len2_pinkmotorbike' },
            { id: 'N11', len: 2, dir: 'h', x: 1, y: 4, asset: 'car_len2_eva01motorbike' },
            { id: 'N15', len: 3, dir: 'h', x: 1, y: 5, asset: 'car_len3_mili' },
            { id: 'N2', len: 3, dir: 'v', x: 5, y: 2, asset: 'car_len3_black' },
            { id: 'N22', len: 2, dir: 'h', x: 3, y: 1, asset: 'car_len2_pinkclassiccar' },
            { id: 'N3', len: 3, dir: 'v', x: 2, y: 1, asset: 'car_len3_red' },
            { id: 'N39', len: 2, dir: 'v', x: 0, y: 1, asset: 'car_len2_pinkmotorbike' },
            { id: 'N6', len: 2, dir: 'v', x: 0, y: 4, asset: 'car_len2_pinkferrari' },
            { id: 'N64', len: 3, dir: 'v', x: 1, y: 0, asset: 'car_len3_mili' }
        ],
    },
    {
        id: '4',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A', len: 2, dir: 'h', x: 2, y: 2, asset: 'car_len2_redclassicar' },
            { id: 'N28', len: 3, dir: 'v', x: 1, y: 0, asset: 'car_len3_black' },
            { id: 'N3', len: 3, dir: 'v', x: 5, y: 2, asset: 'car_len3_purple' },
            { id: 'N37', len: 2, dir: 'h', x: 0, y: 4, asset: 'car_len2_redferrari' },
            { id: 'N38', len: 2, dir: 'v', x: 2, y: 4, asset: 'car_len2_pinkmotorbike' },
            { id: 'N39', len: 3, dir: 'h', x: 3, y: 0, asset: 'car_len3_purple' },
            { id: 'N5', len: 3, dir: 'h', x: 3, y: 1, asset: 'car_len3_purple' },
            { id: 'N6', len: 3, dir: 'v', x: 0, y: 0, asset: 'car_len3_purple' },
            { id: 'N7', len: 3, dir: 'v', x: 4, y: 2, asset: 'car_len3_mili' },
            { id: 'N9', len: 3, dir: 'h', x: 3, y: 5, asset: 'car_len3_purple' }
        ],
    },
    {
        id: '5',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',   len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',   len: 3, dir: 'h', x: 1, y: 2, asset: 'car_len3_mili' },
            { id: 'N10', len: 2, dir: 'v', x: 1, y: 0, asset: 'car_len2_eva01motorbike' }, // ← antes blue
            { id: 'N11', len: 2, dir: 'h', x: 1, y: 5, asset: 'car_len2_eva01motorbike' },   // ← antes gray
            { id: 'N17', len: 2, dir: 'v', x: 5, y: 4, asset: 'car_len2_eva01motorbike' }, // ← antes blue
            { id: 'N3',  len: 3, dir: 'h', x: 3, y: 0, asset: 'car_len3_mili' },
            { id: 'N30', len: 3, dir: 'h', x: 0, y: 3, asset: 'car_len3_mili' },
            { id: 'N7',  len: 2, dir: 'h', x: 0, y: 4, asset: 'car_len2_eva01motorbike' },   // ← antes gray
        ],
    },
    {
        id: '6',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 2, y: 2, asset: 'car_len3_red' },
            { id: 'N1', len: 3, dir: 'v', x: 5, y: 1, asset: 'car_len3_red' },
            { id: 'N12', len: 3, dir: 'h', x: 1, y: 0, asset: 'car_len3_black' },
            { id: 'N18', len: 3, dir: 'h', x: 0, y: 5, asset: 'car_len3_purple' },
            { id: 'N2', len: 3, dir: 'v', x: 0, y: 2, asset: 'car_len3_red' },
            { id: 'N29', len: 3, dir: 'h', x: 1, y: 1, asset: 'car_len3_mili' },
            { id: 'N7', len: 2, dir: 'h', x: 1, y: 4, asset: 'car_len2_pinkferrari' },
            { id: 'N8', len: 2, dir: 'v', x: 1, y: 2, asset: 'car_len2_grayclassiccar' }
        ],
    },
    {
        id: '7',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 1, y: 2, asset: 'car_len3_mili' },
            { id: 'N1', len: 2, dir: 'v', x: 1, y: 0, asset: 'car_len2_pinkclassiccar' },
            { id: 'N11', len: 2, dir: 'h', x: 1, y: 3, asset: 'car_len2_redclassicar' },
            { id: 'N12', len: 3, dir: 'h', x: 1, y: 5, asset: 'car_len3_black' },
            { id: 'N14', len: 3, dir: 'v', x: 5, y: 1, asset: 'car_len3_black' },
            { id: 'N3', len: 3, dir: 'h', x: 2, y: 1, asset: 'car_len3_red' },
            { id: 'N30', len: 3, dir: 'v', x: 0, y: 0, asset: 'car_len3_red' },
            { id: 'N31', len: 3, dir: 'v', x: 4, y: 3, asset: 'car_len3_black' },
            { id: 'N33', len: 3, dir: 'h', x: 3, y: 0, asset: 'car_len3_red' }
        ],

    },
    {
        id: '8',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 2, y: 2, asset: 'car_len3_black' },
            { id: 'N1', len: 3, dir: 'v', x: 0, y: 0, asset: 'car_len3_black' },
            { id: 'N11', len: 3, dir: 'h', x: 3, y: 0, asset: 'car_len3_black' },
            { id: 'N13', len: 3, dir: 'v', x: 5, y: 2, asset: 'car_len3_black' },
            { id: 'N3', len: 3, dir: 'v', x: 1, y: 0, asset: 'car_len3_black' },
            { id: 'N35', len: 3, dir: 'h', x: 2, y: 1, asset: 'car_len3_black' },
            { id: 'N7', len: 2, dir: 'v', x: 2, y: 3, asset: 'car_len2_yellowblackmotorbike' },
            { id: 'N8', len: 3, dir: 'h', x: 1, y: 5, asset: 'car_len3_mili' },
            { id: 'N9', len: 2, dir: 'h', x: 0, y: 3, asset: 'car_len2_eva01ferrari' }
        ],
    },


    // e06
    {
        id: '9',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',   len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',   len: 3, dir: 'h', x: 3, y: 2, asset: 'car_len3_mili' },
            { id: 'N15', len: 3, dir: 'h', x: 3, y: 5, asset: 'car_len3_mili' },
            { id: 'N2',  len: 2, dir: 'v', x: 1, y: 0, asset: 'car_len2_eva01motorbike' }, // ← antes gray
            { id: 'N21', len: 3, dir: 'v', x: 0, y: 0, asset: 'car_len3_mili' },
            { id: 'N26', len: 2, dir: 'h', x: 4, y: 1, asset: 'car_len2_eva01motorbike' },   // ← antes gray
            { id: 'N31', len: 2, dir: 'h', x: 0, y: 5, asset: 'car_len2_eva01motorbike' }, // ← antes gray
            { id: 'N47', len: 2, dir: 'h', x: 0, y: 3, asset: 'car_len2_eva01motorbike' },   // ← antes gray
            { id: 'N5',  len: 2, dir: 'v', x: 2, y: 3, asset: 'car_len2_eva01motorbike' },   // ← mantiene gray
            { id: 'N6',  len: 3, dir: 'h', x: 2, y: 0, asset: 'car_len3_mili' },
        ],
    },

    // e07
    {
        id: '10',
        size: 6,
        difficulty: 'easy',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P',   len: 2, dir: 'v', x: 3, y: 3, asset: 'player_len2_red' },
            { id: 'A',   len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_eva01motorbike' },    // ← antes gray
            { id: 'N10', len: 4, dir: 'h', x: 1, y: 5, asset: 'car_len4_gray' },
            { id: 'N16', len: 3, dir: 'h', x: 3, y: 0, asset: 'car_len3_mili' },
            { id: 'N2',  len: 2, dir: 'v', x: 5, y: 2, asset: 'car_len2_eva01motorbike' },  // ← antes blue
            { id: 'N22', len: 2, dir: 'v', x: 0, y: 4, asset: 'car_len2_eva01motorbike' },  // ← antes gray
            { id: 'N25', len: 3, dir: 'v', x: 1, y: 0, asset: 'car_len3_mili' },
            { id: 'N4',  len: 3, dir: 'h', x: 0, y: 3, asset: 'car_len3_mili' },
            { id: 'N48', len: 2, dir: 'h', x: 3, y: 1, asset: 'car_len2_eva01motorbike' },    // ← antes gray
            { id: 'N7',  len: 2, dir: 'v', x: 2, y: 0, asset: 'car_len2_eva01motorbike' },    // ← antes gray
            { id: 'N74', len: 2, dir: 'h', x: 4, y: 4, asset: 'car_len2_eva01motorbike' },  // ← antes gray
        ],
    },

];

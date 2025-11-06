import type { LevelDef } from '../types';

export const NORMAL_LEVELS: LevelDef[] = [
    {
        id: 'n01',
        size: 7,
        difficulty: 'normal',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 5, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 3, y: 4, asset: 'car_len3_purple' },
            { id: 'N1', len: 3, dir: 'v', x: 6, y: 0, asset: 'car_len3_purple' },
            { id: 'N15', len: 2, dir: 'v', x: 0, y: 3, asset: 'car_len2_gray' },
            { id: 'N2', len: 2, dir: 'v', x: 5, y: 0, asset: 'car_len2_orange' },
            { id: 'N252', len: 3, dir: 'h', x: 2, y: 0, asset: 'car_len3_mili' },
            { id: 'N263', len: 3, dir: 'h', x: 2, y: 1, asset: 'car_len3_mili' },
            { id: 'N3', len: 2, dir: 'h', x: 4, y: 3, asset: 'car_len2_orange' },
            { id: 'N31', len: 2, dir: 'v', x: 0, y: 1, asset: 'car_len2_gray' },
            { id: 'N5', len: 3, dir: 'v', x: 1, y: 1, asset: 'car_len3_mili' },
            { id: 'N9', len: 2, dir: 'h', x: 5, y: 5, asset: 'car_len2_gray' }
        ],
    },

    {
        id: 'n02',
        size: 7,
        difficulty: 'normal',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 5, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 3, y: 4, asset: 'car_len3_purple' },
            { id: 'N1', len: 3, dir: 'h', x: 4, y: 2, asset: 'car_len3_mili' },
            { id: 'N14', len: 2, dir: 'h', x: 3, y: 0, asset: 'car_len2_gray' },
            { id: 'N2', len: 3, dir: 'h', x: 4, y: 6, asset: 'car_len3_mili' },
            { id: 'N24', len: 3, dir: 'h', x: 3, y: 1, asset: 'car_len3_purple' },
            { id: 'N3', len: 3, dir: 'v', x: 2, y: 3, asset: 'car_len3_mili' },
            { id: 'N30', len: 3, dir: 'h', x: 0, y: 6, asset: 'car_len3_red' },
            { id: 'N32', len: 4, dir: 'v', x: 0, y: 1, asset: 'car_len4_gray' },
            { id: 'N347', len: 3, dir: 'h', x: 1, y: 2, asset: 'car_len3_purple' },
            { id: 'N4', len: 3, dir: 'v', x: 1, y: 3, asset: 'car_len3_mili' },
            { id: 'N9', len: 3, dir: 'h', x: 4, y: 3, asset: 'car_len3_red' }
        ],
    },

    {
        id: 'n03',
        size: 7,
        difficulty: 'normal',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 5, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 3, y: 4, asset: 'car_len3_mili' },
            { id: 'N1', len: 4, dir: 'v', x: 5, y: 0, asset: 'car_len4_gray' },
            { id: 'N11', len: 4, dir: 'v', x: 6, y: 3, asset: 'car_len4_gray' },
            { id: 'N127', len: 2, dir: 'h', x: 0, y: 0, asset: 'car_len2_blue' },
            { id: 'N2', len: 4, dir: 'v', x: 2, y: 0, asset: 'car_len4_yellow' },
            { id: 'N218', len: 2, dir: 'h', x: 4, y: 6, asset: 'car_len2_blue' },
            { id: 'N3', len: 3, dir: 'v', x: 0, y: 2, asset: 'car_len3_purple' },
            { id: 'N43', len: 3, dir: 'h', x: 0, y: 6, asset: 'car_len3_mili' },
            { id: 'N52', len: 3, dir: 'h', x: 0, y: 5, asset: 'car_len3_purple' },
            { id: 'N7', len: 2, dir: 'h', x: 3, y: 2, asset: 'car_len2_gray' },
            { id: 'N75', len: 3, dir: 'v', x: 6, y: 0, asset: 'car_len3_red' },
            { id: 'N9', len: 4, dir: 'v', x: 1, y: 1, asset: 'car_len4_red' }
        ],
    }
];

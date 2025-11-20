import type { LevelDef } from '../types';

export const NORMAL_LEVELS: LevelDef[] = [
    {
        id: 'n01',
        size: 7,
        difficulty: 'normal',
        exit: { side: 'top', index: 3 },
        pieces: [
            { id: 'P', len: 2, dir: 'v', x: 3, y: 5, asset: 'player_len2_red' },
            { id: 'A', len: 3, dir: 'h', x: 3, y: 4, asset: 'car_len3_mili' },
            { id: 'N1', len: 3, dir: 'v', x: 6, y: 0, asset: 'car_len3_mili' },
            { id: 'N15', len: 2, dir: 'v', x: 0, y: 3, asset: 'car_len2_eva01motorbike' },
            { id: 'N2', len: 2, dir: 'v', x: 5, y: 0, asset: 'car_len2_eva01motorbike' },
            { id: 'N252', len: 3, dir: 'h', x: 2, y: 0, asset: 'car_len3_mili' },
            { id: 'N263', len: 3, dir: 'h', x: 2, y: 1, asset: 'car_len3_mili' },
            { id: 'N3', len: 2, dir: 'h', x: 4, y: 3, asset: 'car_len2_eva01motorbike' },
            { id: 'N31', len: 2, dir: 'v', x: 0, y: 1, asset: 'car_len2_eva01motorbike' },
            { id: 'N5', len: 3, dir: 'v', x: 1, y: 1, asset: 'car_len3_mili' },
            { id: 'N9', len: 2, dir: 'h', x: 5, y: 5, asset: 'car_len2_eva01motorbike' }
        ],
    },
];

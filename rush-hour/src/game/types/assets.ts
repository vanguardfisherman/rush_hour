import type { AssetId } from './index';

export const CAR_ASSET_PATHS: Record<AssetId, string> = {
    player_len2_red: 'models/cars/car_red_player_len2.glb',

    // len2
    car_len2_blue:   'models/cars/car_blue_len2.glb',
    car_len2_gray:   'models/cars/car_gray_len_2.glb',

    // len3
    car_len3_red:    'models/cars/car_red_len_3.glb',
    car_len3_purple: 'models/cars/car_purple_len_3.glb',
    car_len3_mili:   'models/cars/car_mili_len_3.glb',

    // len4
    car_len4_red:    'models/cars/car_red_len_4.glb',
    car_len4_yellow: 'models/cars/car_yellow_len_4.glb',
    car_len4_gray:   'models/cars/car_gray_len_4.glb',
};

export const SCENE_PATHS: Record<6 | 7, string> = {
    6: 'models/scenes/scen_6x6.glb',
    7: 'models/scenes/scen_7x7.glb',
};

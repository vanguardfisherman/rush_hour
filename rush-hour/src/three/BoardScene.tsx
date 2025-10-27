import { useGLTF, Center } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { useMemo } from 'react';
import { useGame } from '../game/store';
import { SCENE_PATHS } from '../game/types/assets';

export default function BoardScene() {
    const size = useGame(s => s.size);                 // 6 o 7
    const path = SCENE_PATHS[size];                    // => models/scenes/scen_6x6.glb | scen_7x7.glb
    const { scene } = useGLTF(path);

    // Escalamos el GLB para que su ancho/profundo máximo = size (6 o 7),
    // y lo centramos en XZ (Center).
    const scale = useMemo(() => {
        const box = new Box3().setFromObject(scene);
        const v = new Vector3();
        box.getSize(v);
        const width = Math.max(v.x, v.z) || 1;
        return size / width;
    }, [scene, size]);

    return (
        <Center disableY>
            <primitive object={scene} scale={scale} />
        </Center>
    );
}

// ¡OJO!: nombres con guion bajo como en tu carpeta:
useGLTF.preload('models/scenes/scen_6x6.glb');
useGLTF.preload('models/scenes/scen_7x7.glb');

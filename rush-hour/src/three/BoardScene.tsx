import { useGLTF, Center } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { useEffect, useMemo } from 'react';
import { useGame } from '../game/store';
import { SCENE_PATHS } from '../game/types/assets';

export default function BoardScene() {
    const size = useGame(s => s.size);                 // 6 o 7
    const path = SCENE_PATHS[size];                    // => models/scenes/scen_6x6.glb | scen_7x7.glb
    const { scene } = useGLTF(path);
    const setBoardMetrics = useGame(s => s.setBoardMetrics);

    // Escalamos el GLB para que su ancho/profundo máximo = size (6 o 7),
    // y lo centramos en XZ (Center).
    const scale = useMemo(() => {
        const box = new Box3().setFromObject(scene);
        const v = new Vector3();
        box.getSize(v);
        const width = Math.max(v.x, v.z) || 1;
        return size / width;
    }, [scene, size]);

    useEffect(() => {
        const fallbackHalf = (size - 1) / 2;
        const fallbackOrigin: [number, number, number] = [-fallbackHalf, 0, fallbackHalf];
        const pushFallback = () =>
            setBoardMetrics({ cellSize: 1, originOffset: fallbackOrigin, ready: false });

        const originMarker = scene.getObjectByName('grid_origin');
        const xMarker = scene.getObjectByName('grid_x7');

        if (!originMarker || !xMarker) {
            console.warn(
                'BoardScene: no se encontraron los marcadores requeridos (grid_origin, grid_x7) en el GLB',
                { hasOrigin: Boolean(originMarker), hasXMarker: Boolean(xMarker) }
            );
            pushFallback();
            return () => {
                setBoardMetrics({ cellSize: null, originOffset: null, ready: false });
            };
        }

        scene.updateMatrixWorld(true);

        const originLocal = originMarker.getWorldPosition(new Vector3());
        scene.worldToLocal(originLocal);

        const xLocal = xMarker.getWorldPosition(new Vector3());
        scene.worldToLocal(xLocal);

        const diff = new Vector3().subVectors(xLocal, originLocal);
        const steps = Math.max(1, size - 1);
        const computedCell = diff.length() * scale / steps;
        const cellSize = Number.isFinite(computedCell) && computedCell > 0 ? computedCell : null;

        const box = new Box3().setFromObject(scene);
        const center = box.getCenter(new Vector3());
        const centerOffset = new Vector3(center.x * scale, 0, center.z * scale);

        const originOffsetVector = originLocal
            .clone()
            .multiplyScalar(scale)
            .sub(centerOffset);
        const originOffsetArray = originOffsetVector.toArray() as [number, number, number];
        const originOffsetValid = originOffsetArray.every((value) => Number.isFinite(value));

        if (!cellSize || !originOffsetValid) {
            if (!cellSize) {
                console.warn('BoardScene: cellSize inválido calculado a partir del GLB', {
                    computedCell,
                    steps,
                });
            }
            if (!originOffsetValid) {
                console.warn('BoardScene: originOffset inválido calculado a partir del GLB', {
                    originOffsetArray,
                });
            }
            pushFallback();
        } else {
            setBoardMetrics({
                cellSize,
                originOffset: originOffsetArray,
                ready: true,
            });
        }

        return () => {
            setBoardMetrics({ cellSize: null, originOffset: null, ready: false });
        };
    }, [scene, scale, size, setBoardMetrics]);

    return (
        <Center disableY>
            <primitive object={scene} scale={scale} />
        </Center>
    );
}

// ¡OJO!: nombres con guion bajo como en tu carpeta:
useGLTF.preload('models/scenes/scen_6x6.glb');
useGLTF.preload('models/scenes/scen_7x7.glb');

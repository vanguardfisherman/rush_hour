// src/components/GameCanvas.tsx
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Bounds, useBounds } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { selectBoardMetrics, useGame } from '../game/store';
import BoardScene from '../three/BoardScene';
import Vehicles from '../three/Vehicles';

const BoundsRefitter = () => {
    const bounds = useBounds();
    const levelSerial = useGame(s => s.levelSerial);
    const { cellSize, originOffset } = useGame(selectBoardMetrics);
    const lastSerialRef = useRef<number | null>(null);

    useEffect(() => {
        if (!cellSize || !originOffset) return;
        if (lastSerialRef.current === levelSerial) return;
        lastSerialRef.current = levelSerial;

        const raf = requestAnimationFrame(() => {
            bounds.refresh().fit();
        });

        return () => cancelAnimationFrame(raf);
    }, [bounds, levelSerial, cellSize, originOffset]);

    return null;
};

export default function GameCanvas() {
    const size = useGame(s => s.size) as 6 | 7;

    // Cámara isométrica + zoom por tamaño
    const { camPos, zoom } = useMemo(() => {
        const camPos: [number, number, number] = [
            size * -1.45,  // x
            size *  2.00,  // y (altura)
            size * -1.45,  // z
        ];
        const zoom = size === 6 ? 120 : 110;
        return { camPos, zoom };
    }, [size]);

    return (
        <div className="stage">
            <Canvas dpr={[1, 2]}>
                <color attach="background" args={['#2a2a2a']} />
                <ambientLight intensity={0.9} />
                <directionalLight position={[6, 12, 6]} intensity={1.2} />

                <OrthographicCamera
                    makeDefault
                    position={camPos}
                    zoom={zoom}
                    near={0.01}
                    far={200}
                    // Asegura que la cámara apunte al centro del tablero
                    onUpdate={(c) => c.lookAt(0, 0, 0)}
                />

                <Suspense fallback={null}>
                    <Bounds key={size} fit clip margin={1.08}>
                        <BoundsRefitter />
                        <group>
                            <BoardScene />
                            <Vehicles />
                        </group>
                    </Bounds>
                </Suspense>
            </Canvas>
        </div>
    );
}

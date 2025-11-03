import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Center } from '@react-three/drei';
import { Box3, Vector3, Group, Plane } from 'three';
import { useGame } from '../game/store';
import { CAR_ASSET_PATHS } from '../game/types/assets';
import type { PieceSpec, AssetId } from '../game/types';  // Asegúrate de que 'AssetId' esté importado
import { canPlace, clampRangeWithBlocks } from '../game/logic';

const SCALE_PAD = 0.82;
const SMOOTH = 12;
const PIXEL_DEADZONE = 5;

// sensibilidad / equilibrio
const DRAG_GAIN = 0.92;       // <1 calma el gesto hacia adelante
const SNAP_THRESHOLD = 0.5;   // snap simétrico (half-up)
function roundHalfUp(n: number, t = SNAP_THRESHOLD) {
    return n >= 0 ? Math.floor(n + t) : Math.ceil(n - t);
}

// salida / victoria
const EXIT_EXTRA = 1.2; // celdas “más allá” para la animación de salida
const WIN_EPS = 0.02;   // tolerancia para considerar que ya llegó al destino de salida

function cellToWorld(size: 6 | 7, cx: number, cy: number) {
    const half = (size - 1) / 2;
    return { x: cx - half, z: half - cy };
}

// clonar materiales para NO compartir entre real y fantasma
function cloneMaterialsFor(o: any, tweak?: (m: any) => void) {
    o.traverse((n: any) => {
        if (!n.isMesh || !n.material) return;
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        const newMats = mats.map((m: any) => {
            const nm = m?.clone ? m.clone() : m;
            if (tweak) tweak(nm);
            return nm;
        });
        n.material = Array.isArray(n.material) ? newMats : newMats[0];
    });
}

// Helper para validar que 'asset' es un AssetId
function isValidAssetId(asset: string): asset is AssetId {
    return [
        'player_len2_red',
        'car_len2_blue',
        'car_len2_pink',
        'car_len2_yellow',
        'car_len2_orange',
        'car_len2_gray',
        'car_len3_red',
        'car_len3_purple',
        'car_len3_mili',
        'car_len4_red',
        'car_len4_yellow',
        'car_len4_gray',
    ].includes(asset);
}

function Vehicle({ piece }: { piece: PieceSpec }) {
    const size   = useGame(s => s.size);
    const pieces = useGame(s => s.pieces);
    const moveTo = useGame(s => s.moveTo);
    const setWon = useGame(s => s.setWon);
    const exit   = useGame(s => s.exit); // puede ser null al cargar

    // Validamos si el 'asset' es válido antes de cargar el GLTF
    if (!isValidAssetId(piece.asset)) {
        console.error(`Invalid asset: ${piece.asset}`);
        return null; // No renderizamos el vehículo si el asset es inválido
    }

    // cargar GLB
    const { scene } = useGLTF(CAR_ASSET_PATHS[piece.asset]);

    // modelo REAL (opaco)
    const realModel = useMemo(() => {
        const m = scene.clone(true) as Group;
        cloneMaterialsFor(m, (mat) => {
            mat.transparent = false;
            mat.opacity = 1;
            mat.depthWrite = true;
            mat.depthTest = true;
        });
        return m;
    }, [scene]);

    // modelo FANTASMA (semi-transparente)
    const ghostModel = useMemo(() => {
        const g = scene.clone(true) as Group;
        cloneMaterialsFor(g, (mat) => {
            mat.transparent = true;
            mat.opacity = 0.35;
            mat.depthWrite = false;
            mat.depthTest = true;
        });
        return g;
    }, [scene]);

    // escala + lift según longitud del coche
    const { scale, lift } = useMemo(() => {
        const box = new Box3().setFromObject(realModel);
        const v = new Vector3();
        box.getSize(v);
        const modelLen = Math.max(v.x, v.z) || 1;
        const scale = (piece.len / modelLen) * SCALE_PAD;
        const minY = box.min.y;
        const lift = (-minY * scale) + 0.02;
        return { scale, lift };
    }, [realModel, piece.len]);

    // centro base (en celdas)
    const baseCx = piece.dir === 'h' ? piece.x + (piece.len - 1) / 2 : piece.x;
    const baseCy = piece.dir === 'v' ? piece.y + (piece.len - 1) / 2 : piece.y;

    // límites con colisiones (ancla → centros continuos)
    const limits = useMemo(
        () => clampRangeWithBlocks(piece, size, pieces),
        [size, pieces, piece.id, piece.dir, piece.len, piece.x, piece.y]
    );
    const { minX, maxX, minY, maxY } = limits;
    const minCenter = piece.dir === 'h' ? minX + (piece.len - 1) / 2 : minY + (piece.len - 1) / 2;
    const maxCenter = piece.dir === 'h' ? maxX + (piece.len - 1) / 2 : maxY + (piece.len - 1) / 2;

    // drag / plano
    const PLANE = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
    const downWorld = useRef(new Vector3());
    const [drag, setDrag] = useState<{
        active: boolean;
        startClientX: number;
        startClientY: number;
        cx0: number; cy0: number;
        cx?: number; cy?: number;
    } | null>(null);

    // animación + salida
    const groupRef = useRef<Group>(null!);
    const target = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
    const exitTarget = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
    const exiting = useRef(false);
    const initialized = useRef(false);

    // posición inicial del REAL (una vez)
    useEffect(() => {
        if (initialized.current) return;
        const start = cellToWorld(size, baseCx, baseCy);
        groupRef.current?.position.set(start.x, lift, start.z);
        target.current = start;
        initialized.current = true;
    }, [size, lift]);

    // si hay undo/redo/reset, reorienta el target al nuevo x/y del store
    useEffect(() => {
        if (drag || exiting.current) return;
        const curCx = piece.dir === 'h' ? piece.x + (piece.len - 1) / 2 : piece.x;
        const curCy = piece.dir === 'v' ? piece.y + (piece.len - 1) / 2 : piece.y;
        target.current = cellToWorld(size, curCx, curCy);
    }, [piece.x, piece.y, piece.dir, piece.len, size, drag]);

    // cursores
    const onPointerEnter = () => (document.body.style.cursor = 'grab');
    const onPointerLeave = () => (document.body.style.cursor = 'auto');

    // DOWN — preparar drag (el REAL no se mueve aún)
    const onPointerDown = useCallback((e: any) => {
        e.stopPropagation();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        const hit = e.ray.intersectPlane(PLANE, new Vector3());
        if (!hit) return;
        downWorld.current.copy(hit);
        setDrag({
            active: false,
            startClientX: e.clientX,
            startClientY: e.clientY,
            cx0: baseCx,
            cy0: baseCy,
        });
    }, [PLANE, baseCx, baseCy]);

    // MOVE — actualiza SOLO el fantasma (REAL congelado durante drag)
    const onPointerMove = useCallback((e: any) => {
        if (!drag) return;
        if (!drag.active) {
            const dxp = e.clientX - drag.startClientX;
            const dyp = e.clientY - drag.startClientY;
            if (Math.hypot(dxp, dyp) < PIXEL_DEADZONE) return;
            drag.active = true;
        }
        const hit = e.ray.intersectPlane(PLANE, new Vector3());
        if (!hit) return;

        const dx = (hit.x - downWorld.current.x) * DRAG_GAIN;
        const dz = (hit.z - downWorld.current.z) * DRAG_GAIN;

        let nextCx = drag.cx0, nextCy = drag.cy0;
        if (piece.dir === 'h') nextCx = Math.min(maxCenter, Math.max(minCenter, drag.cx0 + dx));
        else                   nextCy = Math.min(maxCenter, Math.max(minCenter, drag.cy0 + (-dz)));

        setDrag({ ...drag, cx: nextCx, cy: nextCy });
    }, [drag, PLANE, piece.dir, minCenter, maxCenter]);

    // UP — animar REAL al destino (snap) o salida si procede (multi-side)
    const onPointerUp = useCallback((e: any) => {
        if (!drag) return;
        e.currentTarget.releasePointerCapture?.(e.pointerId);
        document.body.style.cursor = 'auto';

        const curCx = drag.cx ?? drag.cx0;
        const curCy = drag.cy ?? drag.cy0;

        // snap (half-up) sobre ancla
        const rawH = curCx - (piece.len - 1) / 2;
        const rawV = curCy - (piece.len - 1) / 2;

        let nx = piece.x, ny = piece.y;
        if (piece.dir === 'h') nx = Math.min(maxX, Math.max(minX, roundHalfUp(rawH)));
        else                   ny = Math.min(maxY, Math.max(minY, roundHalfUp(rawV)));

        const destCx = piece.dir === 'h' ? nx + (piece.len - 1) / 2 : baseCx;
        const destCy = piece.dir === 'v' ? ny + (piece.len - 1) / 2 : baseCy;

        // gesto: hacia dónde arrastraste (en coordenadas de centro)
        const movedRight = (drag?.cx ?? drag?.cx0 ?? baseCx) > (drag?.cx0 ?? baseCx);
        const movedLeft  = (drag?.cx ?? drag?.cx0 ?? baseCx) < (drag?.cx0 ?? baseCx);
        const movedDown  = (drag?.cy ?? drag?.cy0 ?? baseCy) > (drag?.cy0 ?? baseCy);
        const movedUp    = (drag?.cy ?? drag?.cy0 ?? baseCy) < (drag?.cy0 ?? baseCy);

        // si aún no hay exit, mover normal y salir
        if (!exit) {
            target.current = cellToWorld(size, destCx, destCy);
            if (canPlace(piece, nx, ny, pieces, size)) moveTo(piece.id, nx, ny);
            setDrag(null);
            return;
        }

        // ¿alineado con la salida?
        const aligned =
            exit.side === 'right' || exit.side === 'left'
                ? piece.dir === 'h' && piece.y === exit.index
                : piece.dir === 'v' && piece.x === exit.index;

        let didExit = false;

        if (piece.id === 'P' && aligned) {
            if (exit.side === 'right'  && nx === (size - piece.len) && movedRight) {
                const outCx = destCx + EXIT_EXTRA;
                exitTarget.current = cellToWorld(size, outCx, destCy);
                didExit = true;
            }
            if (exit.side === 'left'   && nx === 0 && movedLeft) {
                const outCx = destCx - EXIT_EXTRA;
                exitTarget.current = cellToWorld(size, outCx, destCy);
                didExit = true;
            }
            if (exit.side === 'bottom' && ny === (size - piece.len) && movedDown) {
                const outCy = destCy + EXIT_EXTRA;
                exitTarget.current = cellToWorld(size, destCx, outCy);
                didExit = true;
            }
            if (exit.side === 'top'    && ny === 0 && movedUp) {
                const outCy = destCy - EXIT_EXTRA;
                exitTarget.current = cellToWorld(size, destCx, outCy);
                didExit = true;
            }
        }

        if (didExit) {
            target.current = exitTarget.current; // anima fuera del tablero
            exiting.current = true;
        } else {
            target.current = cellToWorld(size, destCx, destCy); // movimiento normal
        }

        // persistir posición dentro del tablero
        if (canPlace(piece, nx, ny, pieces, size)) moveTo(piece.id, nx, ny);
        setDrag(null);
    }, [drag, piece, pieces, size, moveTo, minX, maxX, minY, maxY, baseCx, baseCy, exit]);

    // easing del REAL + check de victoria si está saliendo
    useFrame((_, dt) => {
        const g = groupRef.current;
        if (!g) return;

        g.position.x += (target.current.x - g.position.x) * SMOOTH * dt;
        g.position.z += (target.current.z - g.position.z) * SMOOTH * dt;

        if (exiting.current) {
            const dx = g.position.x - exitTarget.current.x;
            const dz = g.position.z - exitTarget.current.z;
            if ((dx * dx + dz * dz) < (WIN_EPS * WIN_EPS)) {
                exiting.current = false;
                setWon(true);
            }
        }
    });

    const rotY = piece.dir === 'h' ? 0 : Math.PI / 2;

    // ===== Fantasma (preview con SNAP) =====
    const ghostVisible = !!drag?.active;
    let ghostCx = baseCx, ghostCy = baseCy;
    if (ghostVisible) {
        const curCx = drag!.cx ?? drag!.cx0;
        const curCy = drag!.cy ?? drag!.cy0;

        const rawH = curCx - (piece.len - 1) / 2;
        const rawV = curCy - (piece.len - 1) / 2;

        let nx = piece.x, ny = piece.y;
        if (piece.dir === 'h') nx = Math.min(maxX, Math.max(minX, roundHalfUp(rawH)));
        else                   ny = Math.min(maxY, Math.max(minY, roundHalfUp(rawV)));

        ghostCx = piece.dir === 'h' ? nx + (piece.len - 1) / 2 : baseCx;
        ghostCy = piece.dir === 'v' ? ny + (piece.len - 1) / 2 : baseCy;
    }
    const ghostWorld = cellToWorld(size, ghostCx, ghostCy);

    return (
        <>
            {/* Carro REAL */}
            <group
                ref={groupRef}
                rotation={[0, rotY, 0]}
                scale={scale}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <Center disableY>
                    <primitive object={realModel} />
                </Center>
            </group>

            {/* Fantasma (no interactivo) */}
            {ghostVisible && (
                <group
                    position={[ghostWorld.x, lift + 0.02, ghostWorld.z]}
                    rotation={[0, rotY, 0]}
                    scale={scale}
                    raycast={() => null}
                    renderOrder={999}
                >
                    <Center disableY>
                        <primitive object={ghostModel} />
                    </Center>
                </group>
            )}
        </>
    );
}

export default function Vehicles() {
    const pieces = useGame(s => s.pieces);
    return <>{pieces.map(p => <Vehicle key={p.id} piece={p} />)}</>;
}

// precarga
Object.values(CAR_ASSET_PATHS).forEach((p) => useGLTF.preload(p));

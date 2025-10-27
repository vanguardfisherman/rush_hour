import { useGame } from '../game/store';

export default function SolverControls() {
    const isSolving      = useGame(s => s.isSolving);
    const speed          = useGame(s => s.solverSpeedMs);
    const setSpeed       = useGame(s => s.setSolverSpeed);
    const solveAndAnim   = useGame(s => s.solveAndAnimate);
    const cancelSolve    = useGame(s => s.cancelSolve);

    return (
        <div
            style={{
                position: 'absolute',
                top: 12,
                right: 12,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                padding: '10px 12px',
                background: 'rgba(20,20,24,0.75)',
                color: '#fff',
                borderRadius: 12,
                backdropFilter: 'blur(6px)',
            }}
        >
            <button
                onClick={() => solveAndAnim()}
                disabled={isSolving}
                style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #6ee7b7',
                    background: isSolving ? '#274b3f' : '#10b981',
                    color: '#0b0f0e',
                    fontWeight: 600,
                    cursor: isSolving ? 'not-allowed' : 'pointer',
                }}
                title="Calcula y reproduce paso a paso"
            >
                {isSolving ? 'Resolviendo…' : 'Resolver (animado)'}
            </button>

            <button
                onClick={cancelSolve}
                disabled={!isSolving}
                style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px solid #fca5a5',
                    background: !isSolving ? '#4b2626' : '#ef4444',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: !isSolving ? 'not-allowed' : 'pointer',
                }}
                title="Cancelar reproducción"
            >
                Cancelar
            </button>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, opacity: 0.9 }}>Velocidad</span>
                <input
                    type="range"
                    min={120}
                    max={800}
                    step={10}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    title="Delay entre pasos (ms)"
                />
                <span style={{ fontSize: 12, opacity: 0.9 }}>{speed} ms</span>
            </label>
        </div>
    );
}

import { useGame } from '../game/store';
import './SolverControls.css';

export default function SolverControls() {
    const isSolving      = useGame(s => s.isSolving);
    const speed          = useGame(s => s.solverSpeedMs);
    const setSpeed       = useGame(s => s.setSolverSpeed);
    const solveAndAnim   = useGame(s => s.solveAndAnimate);
    const cancelSolve    = useGame(s => s.cancelSolve);

    return (
        <div className="solver-controls">
            <button
                type="button"
                onClick={() => solveAndAnim()}
                disabled={isSolving}
                className="solver-button solver-button--primary"
                title="Calcula y reproduce paso a paso"
            >
                {isSolving ? 'Resolviendo…' : 'Resolver (animado)'}
            </button>

            <button
                type="button"
                onClick={cancelSolve}
                disabled={!isSolving}
                className="solver-button solver-button--danger"
                title="Cancelar reproducción"
            >
                Cancelar
            </button>

            <label className="solver-speed" htmlFor="solver-speed-range">
                <span className="solver-speed__label">Velocidad</span>
                <input
                    id="solver-speed-range"
                    className="solver-speed__slider"
                    type="range"
                    min={120}
                    max={800}
                    step={10}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    title="Delay entre pasos (ms)"
                />
                <span className="solver-speed__value">{speed} ms</span>
            </label>
        </div>
    );
}

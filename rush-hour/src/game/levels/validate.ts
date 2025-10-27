import type { LevelDef, PieceSpec } from '.';

function isInsideBoard(size: number, p: PieceSpec) {
    if (p.dir === 'h') return p.x >= 0 && p.y >= 0 && p.y < size && (p.x + p.len - 1) < size;
    return p.x >= 0 && p.y >= 0 && p.x < size && (p.y + p.len - 1) < size;
}

function overlaps(a: PieceSpec, b: PieceSpec) {
    const cells = (p: PieceSpec) => {
        const out: string[] = [];
        for (let i = 0; i < p.len; i++) {
            const cx = p.dir === 'h' ? p.x + i : p.x;
            const cy = p.dir === 'v' ? p.y + i : p.y;
            out.push(`${cx},${cy}`);
        }
        return new Set(out);
    };
    const A = cells(a), B = cells(b);
    for (const c of A) if (B.has(c)) return true;
    return false;
}

export function validateLevel(level: LevelDef): string[] {
    const errs: string[] = [];
    const { size, exit, pieces } = level;

    const player = pieces.find(p => p.id === 'P');
    if (!player) errs.push('Falta pieza Player con id="P".');

    // Regla: orientación del player debe coincidir con lado del exit
    if (player) {
        if ((exit.side === 'left' || exit.side === 'right') && player.dir !== 'h')
            errs.push('Player debe ser horizontal si el exit es left/right.');
        if ((exit.side === 'top' || exit.side === 'bottom') && player.dir !== 'v')
            errs.push('Player debe ser vertical si el exit es top/bottom.');

        if (player.dir === 'h' && player.y !== exit.index)
            errs.push(`Player horizontal debe estar en fila y=${exit.index}.`);
        if (player.dir === 'v' && player.x !== exit.index)
            errs.push(`Player vertical debe estar en columna x=${exit.index}.`);
    }

    // Dentro del tablero
    for (const p of pieces) {
        if (!isInsideBoard(size, p)) errs.push(`La pieza ${p.id} se sale del tablero.`);
    }

    // Sin solapes
    for (let i = 0; i < pieces.length; i++) {
        for (let j = i + 1; j < pieces.length; j++) {
            if (overlaps(pieces[i], pieces[j])) errs.push(`Solape entre ${pieces[i].id} y ${pieces[j].id}.`);
        }
    }

    return errs;
}

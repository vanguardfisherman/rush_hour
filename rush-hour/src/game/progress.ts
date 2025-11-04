export type Difficulty = 'easy' | 'normal';

export type BestMovesMap = Record<string, number>;

export type Progress = {
    unlocked: Record<Difficulty, number>;
    bestMoves: Record<Difficulty, BestMovesMap>;
};

const STORAGE_KEY = 'rush-hour-progress';

export const DEFAULT_PROGRESS: Progress = {
    unlocked: {
        easy: 0,
        normal: 0,
    },
    bestMoves: {
        easy: {},
        normal: {},
    },
};

export const createDefaultProgress = (): Progress => ({
    unlocked: {
        easy: DEFAULT_PROGRESS.unlocked.easy,
        normal: DEFAULT_PROGRESS.unlocked.normal,
    },
    bestMoves: {
        easy: { ...DEFAULT_PROGRESS.bestMoves.easy },
        normal: { ...DEFAULT_PROGRESS.bestMoves.normal },
    },
});

const isStorageAvailable = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    try {
        const { localStorage } = window;
        const testKey = '__rush_hour_progress__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

const sanitizeProgressValue = (value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.floor(value));
};

const sanitizeBestMovesValue = (value: unknown) => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return undefined;
    }

    const normalized = Math.max(0, Math.floor(value));
    return normalized;
};

const sanitizeBestMovesMap = (value: unknown): BestMovesMap => {
    if (!value || typeof value !== 'object') {
        return {};
    }

    const result: BestMovesMap = {};
    const entries = Object.entries(value as Record<string, unknown>);

    for (const [levelId, maybeMoves] of entries) {
        const sanitized = sanitizeBestMovesValue(maybeMoves);
        if (sanitized !== undefined) {
            result[levelId] = sanitized;
        }
    }

    return result;
};

const sanitizeProgress = (raw: unknown): Progress => {
    if (!raw || typeof raw !== 'object') {
        return createDefaultProgress();
    }

    type MaybeProgress = Partial<{
        unlocked: Partial<Record<Difficulty, unknown>>;
        bestMoves: Partial<Record<Difficulty, unknown>>;
    }> & Partial<Record<Difficulty, unknown>>;

    const maybeProgress = raw as MaybeProgress;

    const unlockedSource =
        maybeProgress.unlocked && typeof maybeProgress.unlocked === 'object'
            ? (maybeProgress.unlocked as Partial<Record<Difficulty, unknown>>)
            : maybeProgress;

    const bestMovesSource =
        maybeProgress.bestMoves && typeof maybeProgress.bestMoves === 'object'
            ? (maybeProgress.bestMoves as Partial<Record<Difficulty, unknown>>)
            : undefined;

    const unlocked: Progress['unlocked'] = {
        easy: sanitizeProgressValue(unlockedSource?.easy),
        normal: sanitizeProgressValue(unlockedSource?.normal),
    };

    const bestMoves: Progress['bestMoves'] = {
        easy: sanitizeBestMovesMap(bestMovesSource?.easy),
        normal: sanitizeBestMovesMap(bestMovesSource?.normal),
    };

    return {
        unlocked,
        bestMoves,
    } satisfies Progress;
};

export const loadProgress = (): Progress => {
    if (!isStorageAvailable()) {
        return createDefaultProgress();
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return createDefaultProgress();
        }

        const parsed = JSON.parse(stored);
        return sanitizeProgress(parsed);
    } catch (error) {
        console.warn('No se pudo leer el progreso almacenado.', error);
        return createDefaultProgress();
    }
};

export const saveProgress = (progress: Progress) => {
    if (!isStorageAvailable()) {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
        console.warn('No se pudo guardar el progreso.', error);
    }
};

export const updateProgress = (
    current: Progress,
    diff: Difficulty,
    nextUnlockedIndex: number,
): Progress => {
    const normalized = sanitizeProgress(current);
    const nextValue = Math.max(
        normalized.unlocked[diff],
        sanitizeProgressValue(nextUnlockedIndex),
    );

    if (nextValue === normalized.unlocked[diff]) {
        return normalized;
    }

    return {
        ...normalized,
        unlocked: {
            ...normalized.unlocked,
            [diff]: nextValue,
        },
    } satisfies Progress;
};

export const getBestMoves = (
    progress: Progress,
    diff: Difficulty,
    levelId: string,
): number | undefined => {
    if (!levelId) {
        return undefined;
    }

    const normalized = sanitizeProgress(progress);
    return normalized.bestMoves[diff]?.[levelId];
};

export const setBestMoves = (
    progress: Progress,
    diff: Difficulty,
    levelId: string,
    moves: number,
): Progress => {
    if (!levelId) {
        return sanitizeProgress(progress);
    }

    const normalized = sanitizeProgress(progress);
    const sanitizedMoves = sanitizeBestMovesValue(moves);

    if (sanitizedMoves === undefined) {
        return normalized;
    }

    const currentBest = normalized.bestMoves[diff]?.[levelId];

    if (currentBest === sanitizedMoves) {
        return normalized;
    }

    return {
        ...normalized,
        bestMoves: {
            ...normalized.bestMoves,
            [diff]: {
                ...normalized.bestMoves[diff],
                [levelId]: sanitizedMoves,
            },
        },
    } satisfies Progress;
};

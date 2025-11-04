export type Difficulty = 'easy' | 'normal';

export type Progress = Record<Difficulty, number>;

const STORAGE_KEY = 'rush-hour-progress';

export const DEFAULT_PROGRESS: Progress = {
    easy: 0,
    normal: 0,
};

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

const sanitizeProgress = (raw: unknown): Progress => {
    if (!raw || typeof raw !== 'object') {
        return { ...DEFAULT_PROGRESS };
    }

    const maybeProgress = raw as Partial<Record<Difficulty, unknown>>;

    return {
        easy: sanitizeProgressValue(maybeProgress.easy),
        normal: sanitizeProgressValue(maybeProgress.normal),
    } satisfies Progress;
};

export const loadProgress = (): Progress => {
    if (!isStorageAvailable()) {
        return { ...DEFAULT_PROGRESS };
    }

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return { ...DEFAULT_PROGRESS };
        }

        const parsed = JSON.parse(stored);
        return sanitizeProgress(parsed);
    } catch (error) {
        console.warn('No se pudo leer el progreso almacenado.', error);
        return { ...DEFAULT_PROGRESS };
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
    const nextValue = Math.max(normalized[diff], sanitizeProgressValue(nextUnlockedIndex));

    if (nextValue === normalized[diff]) {
        return normalized;
    }

    return {
        ...normalized,
        [diff]: nextValue,
    } satisfies Progress;
};

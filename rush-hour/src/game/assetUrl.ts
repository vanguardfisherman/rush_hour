export function assetUrl(p: string) {
    const base = import.meta.env.BASE_URL || '/';
    return base + (p.startsWith('/') ? p.slice(1) : p);
}

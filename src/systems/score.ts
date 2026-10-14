export const BEST_KEY = 'gamezombie_best';

export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadBest(store: Pick<Store, 'getItem'>): number {
  try {
    const raw = store.getItem(BEST_KEY);
    const n = raw == null ? 0 : parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveBest(store: Pick<Store, 'setItem'>, value: number): void {
  try {
    store.setItem(BEST_KEY, String(Math.max(0, Math.floor(value))));
  } catch {
    /* localStorage อาจใช้ไม่ได้ — เงียบไว้ */
  }
}

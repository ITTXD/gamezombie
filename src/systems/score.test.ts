import { describe, expect, it } from 'vitest';
import { loadBest, saveBest } from './score';

function memStore(data: Record<string, string> = {}) {
  return {
    getItem: (k: string) => (k in data ? data[k] : null),
    setItem: (k: string, v: string) => { data[k] = v; },
    data,
  };
}

describe('score best', () => {
  it('ไม่มีค่ามาก่อนคืน 0', () => {
    expect(loadBest(memStore())).toBe(0);
  });

  it('เซฟแล้วโหลดกลับได้', () => {
    const s = memStore();
    saveBest(s, 1234);
    expect(loadBest(s)).toBe(1234);
  });

  it('ค่าพังๆ คืน 0 ไม่โยน error', () => {
    expect(loadBest(memStore({ gamezombie_best: 'abc' }))).toBe(0);
  });
});

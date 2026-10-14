import { describe, expect, it } from 'vitest';
import { addReserve, createWeapon, fireWeapon, startReload } from './WeaponController';

describe('WeaponController', () => {
  it('ยิงลด mag และกัน fire rate', () => {
    const w = createWeapon('pistol');
    const r1 = fireWeapon(w, 1000, 1);
    expect(r1.ok).toBe(true);
    expect(w.mag).toBe(11);
    expect(fireWeapon(w, 1100, 1).ok).toBe(false); // ยังไม่ครบ 333ms
    expect(fireWeapon(w, 1400, 1).ok).toBe(true);
  });

  it('mag หมดคืน empty แล้วรีโหลดกลับมาเต็ม', () => {
    const w = createWeapon('shotgun'); // mag 6
    for (let i = 0; i < 6; i++) fireWeapon(w, 1000 + i * 1100, 1);
    expect(fireWeapon(w, 8000, 1)).toEqual({ ok: false, reason: 'empty' });
    expect(startReload(w, 8000, 1)).toBe(true);
    expect(fireWeapon(w, 8500, 1)).toEqual({ ok: false, reason: 'reloading' });
    const r = fireWeapon(w, 8000 + 1800 + 1, 1); // reload 1.8s ครบ
    expect(r.ok).toBe(true);
    expect(w.mag).toBe(5);
    expect(w.reserve).toBe(12 - 6);
  });

  it('pistol กระสุนสำรองไม่จำกัด', () => {
    const w = createWeapon('pistol');
    for (let i = 0; i < 12; i++) fireWeapon(w, i * 400, 1);
    expect(startReload(w, 5000, 1)).toBe(true);
    expect(fireWeapon(w, 5000 + 1000 + 1, 1).ok).toBe(true);
    expect(w.mag).toBe(11);
    expect(w.reserve).toBe(Infinity);
  });

  it('addReserve เติมเฉพาะปืนจำกัดกระสุน', () => {
    const s = createWeapon('shotgun');
    addReserve(s, 12);
    expect(s.reserve).toBe(24);
    const p = createWeapon('pistol');
    addReserve(p, 99);
    expect(p.reserve).toBe(Infinity);
  });
});

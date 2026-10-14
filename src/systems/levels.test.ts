import { describe, expect, it } from 'vitest';
import { BASE_STATS, applyUpgrade, rollUpgrades, xpForKill, xpNeeded } from './levels';

describe('levels', () => {
  it('xp ตามชนิดซอมบี้', () => {
    expect(xpForKill('walker')).toBe(10);
    expect(xpForKill('brute')).toBe(30);
  });

  it('xp ที่ต้องการเพิ่มตามเลเวล', () => {
    expect(xpNeeded(1)).toBe(40);
    expect(xpNeeded(2)).toBe(75);
  });

  it('สุ่มอัปเกรดได้ 3 ใบไม่ซ้ำ', () => {
    const ups = rollUpgrades(() => 0);
    expect(ups).toHaveLength(3);
    expect(new Set(ups.map((u) => u.id)).size).toBe(3);
  });

  it('อัป damage/hp/reload เปลี่ยน stats ถูกต้อง', () => {
    const d = applyUpgrade(BASE_STATS, 'damage');
    expect(d.stats.damageMul).toBeCloseTo(1.15);
    const h = applyUpgrade(BASE_STATS, 'hp');
    expect(h.stats.maxHp).toBe(120);
    expect(h.heal).toBe(20);
    const r = applyUpgrade(BASE_STATS, 'reload');
    expect(r.stats.reloadMul).toBeCloseTo(0.85);
  });
});

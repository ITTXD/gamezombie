import { describe, expect, it } from 'vitest';
import { WEAPONS, canFire, pelletAngles } from './weaponDefs';

describe('weaponDefs', () => {
  it('pistol ยิงได้ทุก ~333ms', () => {
    expect(canFire(1000, 600, WEAPONS.pistol)).toBe(true);
    expect(canFire(1000, 900, WEAPONS.pistol)).toBe(false);
  });

  it('shotgun มี 5 เม็ด กระจายรอบมุมฐาน', () => {
    const angles = pelletAngles(0, 5, 0.09);
    expect(angles).toHaveLength(5);
    expect(angles[2]).toBeCloseTo(0);
    expect(angles[0]).toBeLessThan(0);
    expect(angles[4]).toBeGreaterThan(0);
  });

  it('กระสุนนัดเดียวคืนมุมเดิม', () => {
    expect(pelletAngles(1.2, 1, 0.1)).toEqual([1.2]);
  });
});

import { describe, expect, it } from 'vitest';
import { composition, hpScale, waveBonus, zombieCount } from './waveConfig';

describe('waveConfig', () => {
  it('จำนวนซอมบี้เพิ่มตามเวฟและไม่เกิน 60', () => {
    expect(zombieCount(1)).toBe(8);
    expect(zombieCount(5)).toBe(20);
    expect(zombieCount(99)).toBe(60);
  });

  it('เลือดสเกล +10% ต่อเวฟ', () => {
    expect(hpScale(1)).toBeCloseTo(1);
    expect(hpScale(2)).toBeCloseTo(1.1);
    expect(hpScale(11)).toBeCloseTo(2);
  });

  it('เวฟ 1 มีแต่ walker, เวฟหลังมี runner/brute', () => {
    expect(composition(1)).toEqual({ walker: 8, runner: 0, brute: 0 });
    const c4 = composition(4);
    expect(c4.runner).toBeGreaterThan(0);
    expect(c4.brute).toBeGreaterThan(0);
    expect(c4.walker + c4.runner + c4.brute).toBe(zombieCount(4));
  });

  it('โบนัสจบเวฟ = เวฟ*50', () => {
    expect(waveBonus(3)).toBe(150);
  });
});

import { describe, expect, it } from 'vitest';
import { computeVelocity, updateStamina } from './movement';

describe('movement', () => {
  it('หยุดนิ่งเมื่อไม่มี input', () => {
    expect(computeVelocity({ x: 0, y: 0, sprint: false }, 220, 100))
      .toEqual({ vx: 0, vy: 0, sprinting: false });
  });

  it('เดินตรงได้ความเร็วเต็ม', () => {
    const v = computeVelocity({ x: 1, y: 0, sprint: false }, 220, 100);
    expect(v.vx).toBeCloseTo(220);
    expect(v.vy).toBeCloseTo(0);
  });

  it('เดินทแยงถูก normalize (ขนาดรวม = speed)', () => {
    const v = computeVelocity({ x: 1, y: 1, sprint: false }, 220, 100);
    expect(Math.hypot(v.vx, v.vy)).toBeCloseTo(220);
  });

  it('วิ่งได้ ×1.5 เมื่อมี stamina', () => {
    const v = computeVelocity({ x: 0, y: -1, sprint: true }, 220, 50);
    expect(v.sprinting).toBe(true);
    expect(Math.hypot(v.vx, v.vy)).toBeCloseTo(330);
  });

  it('stamina หมดแล้ววิ่งไม่ออก', () => {
    const v = computeVelocity({ x: 1, y: 0, sprint: true }, 220, 0);
    expect(v.sprinting).toBe(false);
    expect(v.vx).toBeCloseTo(220);
  });

  it('stamina ลดตอนวิ่ง / รีเจนตอนพัก / ไม่เกิน 0–100', () => {
    expect(updateStamina(100, true, 1)).toBeCloseTo(75);
    expect(updateStamina(50, false, 1)).toBeCloseTo(65);
    expect(updateStamina(5, true, 10)).toBe(0);
    expect(updateStamina(95, false, 10)).toBe(100);
  });
});

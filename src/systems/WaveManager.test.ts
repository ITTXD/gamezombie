import { describe, expect, it } from 'vitest';
import { WaveManager } from './WaveManager';
import { zombieCount } from './waveConfig';

describe('WaveManager', () => {
  it('เริ่มเวฟ 1 หลัง intermission แรก', () => {
    const m = new WaveManager();
    expect(m.update(1200, 0)).toEqual([{ kind: 'waveStart', wave: 1 }]);
  });

  it('spawn ครบตามจำนวนเวฟ แล้ว waveClear เมื่อฆ่าหมด', () => {
    const m = new WaveManager();
    m.update(1200, 0);
    let spawns = 0;
    for (let i = 0; i < 200; i++) {
      for (const e of m.update(500, 99)) if (e.kind === 'spawn') spawns++;
    }
    expect(spawns).toBe(zombieCount(1));
    expect(m.remainingToSpawn()).toBe(0);
    const clear = m.update(100, 0);
    expect(clear).toEqual([{ kind: 'waveClear', wave: 1, bonus: 50 }]);
  });

  it('พัก 3 วิแล้วขึ้นเวฟ 2', () => {
    const m = new WaveManager();
    m.update(1200, 0);
    for (let i = 0; i < 200; i++) m.update(500, 99);
    m.update(100, 0);
    expect(m.update(2999, 0)).toEqual([]);
    expect(m.update(1, 0)).toEqual([{ kind: 'waveStart', wave: 2 }]);
  });
});

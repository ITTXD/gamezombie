import { composition, hpScale, waveBonus, zombieCount, type ZombieType } from './waveConfig';

export type WaveEvent =
  | { kind: 'spawn'; zombie: ZombieType }
  | { kind: 'waveStart'; wave: number }
  | { kind: 'waveClear'; wave: number; bonus: number };

/** pure logic คุมเวฟ — scene เป็นคน spawn/นับ alive จริง */
export class WaveManager {
  wave = 0;
  private queue: ZombieType[] = [];
  private spawnAccMs = 0;
  private intermissionMs = 1200;
  private clearNotified = true;

  spawnIntervalMs(): number {
    return Math.max(250, 900 - this.wave * 50);
  }

  remainingToSpawn(): number {
    return this.queue.length;
  }

  hpScaleNow(): number {
    return hpScale(Math.max(1, this.wave));
  }

  update(dtMs: number, aliveCount: number): WaveEvent[] {
    const events: WaveEvent[] = [];
    if (this.queue.length === 0) {
      if (this.wave > 0 && aliveCount === 0 && !this.clearNotified) {
        this.clearNotified = true;
        events.push({ kind: 'waveClear', wave: this.wave, bonus: waveBonus(this.wave) });
        this.intermissionMs = 3000;
      } else if (this.clearNotified) {
        this.intermissionMs -= dtMs;
        if (this.intermissionMs <= 0) this.beginNextWave(events);
      }
      return events;
    }
    this.spawnAccMs += dtMs;
    const interval = this.spawnIntervalMs();
    while (this.queue.length > 0 && this.spawnAccMs >= interval) {
      this.spawnAccMs -= interval;
      const z = this.queue.shift();
      if (z) events.push({ kind: 'spawn', zombie: z });
    }
    return events;
  }

  private beginNextWave(events: WaveEvent[]): void {
    this.wave += 1;
    const comp = composition(this.wave);
    const rest: ZombieType[] = [];
    (Object.keys(comp) as ZombieType[]).forEach((t) => {
      for (let i = 0; i < comp[t]; i++) {
        if (t === 'brute') continue;
        rest.push(t);
      }
    });
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    const brutes: ZombieType[] = [];
    for (let i = 0; i < comp.brute; i++) brutes.push('brute');
    this.queue = [...rest, ...brutes];
    this.spawnAccMs = 0;
    this.clearNotified = false;
    events.push({ kind: 'waveStart', wave: this.wave });
  }
}

export { zombieCount };

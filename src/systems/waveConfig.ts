export type ZombieType = 'walker' | 'runner' | 'brute';

export interface ZombieBase {
  hp: number;
  speed: number;
  damage: number;
  xp: number;
  score: number;
}

export const ZOMBIE_BASE: Record<ZombieType, ZombieBase> = {
  walker: { hp: 30, speed: 60, damage: 10, xp: 10, score: 10 },
  runner: { hp: 20, speed: 140, damage: 8, xp: 12, score: 15 },
  brute: { hp: 120, speed: 45, damage: 25, xp: 30, score: 30 },
};

export const MAX_CONCURRENT = 60;

export function zombieCount(wave: number): number {
  return Math.min(5 + wave * 3, MAX_CONCURRENT);
}

export function hpScale(wave: number): number {
  return 1 + (wave - 1) * 0.1;
}

export function composition(wave: number): Record<ZombieType, number> {
  const total = zombieCount(wave);
  let runner = 0;
  let brute = 0;
  if (wave >= 2) runner = Math.floor(total * 0.3);
  if (wave >= 4) brute = Math.min(Math.floor(total * 0.15), 2 + Math.floor(wave / 2));
  const walker = Math.max(total - runner - brute, 0);
  return { walker, runner, brute };
}

export function waveBonus(wave: number): number {
  return wave * 50;
}

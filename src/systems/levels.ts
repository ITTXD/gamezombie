import type { ZombieType } from './waveConfig';
import { ZOMBIE_BASE } from './waveConfig';

export interface PlayerStats {
  damageMul: number;
  maxHp: number;
  speed: number;
  lifesteal: number;
  reloadMul: number;
}

export const BASE_STATS: PlayerStats = {
  damageMul: 1,
  maxHp: 100,
  speed: 220,
  lifesteal: 0,
  reloadMul: 1,
};

export function xpForKill(type: ZombieType): number {
  return ZOMBIE_BASE[type].xp;
}

export function xpNeeded(level: number): number {
  return 40 + (level - 1) * 35;
}

export interface Upgrade {
  id: 'damage' | 'hp' | 'speed' | 'lifesteal' | 'reload' | 'heal';
  label: string;
  desc: string;
}

export const UPGRADE_POOL: Upgrade[] = [
  { id: 'damage', label: 'ดาเมจ +15%', desc: 'กระสุนแรงขึ้น' },
  { id: 'hp', label: 'เลือดสูงสุด +20', desc: 'พร้อมฮีลเต็มจำนวนที่เพิ่ม' },
  { id: 'speed', label: 'วิ่งเร็ว +10%', desc: 'หนีซอมบี้ทัน' },
  { id: 'lifesteal', label: 'ดูดเลือด +1', desc: 'ฆ่าได้เลือดคืนต่อตัว' },
  { id: 'reload', label: 'รีโหลดเร็ว +15%', desc: 'กลับมายิงไวขึ้น' },
  { id: 'heal', label: 'ฮีล +40', desc: 'ฟื้นเลือดทันที' },
];

export function rollUpgrades(random: () => number = Math.random): Upgrade[] {
  const pool = [...UPGRADE_POOL];
  const out: Upgrade[] = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) {
    const idx = Math.floor(random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

/** คืน stats ใหม่ + ปริมาณฮีลทันที (hp/heal) */
export function applyUpgrade(stats: PlayerStats, id: Upgrade['id']): { stats: PlayerStats; heal: number } {
  const next = { ...stats };
  let heal = 0;
  switch (id) {
    case 'damage': next.damageMul = +(next.damageMul * 1.15).toFixed(3); break;
    case 'hp': next.maxHp += 20; heal = 20; break;
    case 'speed': next.speed = Math.round(next.speed * 1.1); break;
    case 'lifesteal': next.lifesteal += 1; break;
    case 'reload': next.reloadMul = +(next.reloadMul * 0.85).toFixed(3); break;
    case 'heal': heal = 40; break;
  }
  return { stats: next, heal };
}

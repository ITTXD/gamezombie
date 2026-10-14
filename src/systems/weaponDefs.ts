export type WeaponKey = 'pistol' | 'shotgun' | 'rifle';

export interface WeaponDef {
  key: WeaponKey;
  name: string;
  damage: number;
  pellets: number;
  fireIntervalMs: number;
  magSize: number;
  reloadMs: number;
  bulletSpeed: number;
  spreadRad: number;
}

export const WEAPONS: Record<WeaponKey, WeaponDef> = {
  pistol: {
    key: 'pistol', name: 'Pistol', damage: 15, pellets: 1,
    fireIntervalMs: 333, magSize: 12, reloadMs: 1000,
    bulletSpeed: 520, spreadRad: 0.03,
  },
  shotgun: {
    key: 'shotgun', name: 'Shotgun', damage: 10, pellets: 5,
    fireIntervalMs: 1000, magSize: 6, reloadMs: 1800,
    bulletSpeed: 460, spreadRad: 0.09,
  },
  rifle: {
    key: 'rifle', name: 'Rifle', damage: 22, pellets: 1,
    fireIntervalMs: 143, magSize: 30, reloadMs: 1500,
    bulletSpeed: 620, spreadRad: 0.05,
  },
};

export function canFire(nowMs: number, lastFiredMs: number, def: WeaponDef): boolean {
  return nowMs - lastFiredMs >= def.fireIntervalMs;
}

/** มุมกระสุนแต่ละเม็ดของ shotgun: กระจายรอบมุมฐาน */
export function pelletAngles(baseRad: number, pellets: number, spreadRad: number): number[] {
  if (pellets <= 1) return [baseRad];
  const angles: number[] = [];
  const start = baseRad - spreadRad * ((pellets - 1) / 2);
  for (let i = 0; i < pellets; i++) angles.push(start + i * spreadRad);
  return angles;
}

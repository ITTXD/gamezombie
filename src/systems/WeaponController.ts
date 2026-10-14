import { WEAPONS, canFire, type WeaponKey } from './weaponDefs';

export interface WeaponState {
  key: WeaponKey;
  mag: number;
  /** pistol = Infinity */
  reserve: number;
  reloading: boolean;
  reloadUntilMs: number;
  lastFiredMs: number;
}

const START_RESERVE: Record<WeaponKey, number> = {
  pistol: Infinity,
  shotgun: 12,
  rifle: 60,
};

export function createWeapon(key: WeaponKey): WeaponState {
  return {
    key,
    mag: WEAPONS[key].magSize,
    reserve: START_RESERVE[key],
    reloading: false,
    reloadUntilMs: 0,
    lastFiredMs: -1e12,
  };
}

/** เติมกระสุนเมื่อครบเวลา (เรียกทุกครั้งก่อนอ่านสถานะ) */
export function updateWeapon(s: WeaponState, nowMs: number): void {
  if (s.reloading && nowMs >= s.reloadUntilMs) {
    const need = WEAPONS[s.key].magSize - s.mag;
    const take = Math.min(need, s.reserve);
    s.mag += take;
    s.reserve -= take;
    s.reloading = false;
  }
}

export type FireResult =
  | { ok: true; damage: number; pellets: number }
  | { ok: false; reason: 'cooldown' | 'reloading' | 'empty' };

export function fireWeapon(s: WeaponState, nowMs: number, damageMul: number): FireResult {
  updateWeapon(s, nowMs);
  const def = WEAPONS[s.key];
  if (s.reloading) return { ok: false, reason: 'reloading' };
  if (s.mag <= 0) return { ok: false, reason: 'empty' };
  if (!canFire(nowMs, s.lastFiredMs, def)) return { ok: false, reason: 'cooldown' };
  s.mag -= 1;
  s.lastFiredMs = nowMs;
  return { ok: true, damage: def.damage * damageMul, pellets: def.pellets };
}

export function startReload(s: WeaponState, nowMs: number, reloadMul: number): boolean {
  updateWeapon(s, nowMs);
  if (s.reloading || s.mag >= WEAPONS[s.key].magSize || s.reserve <= 0) return false;
  s.reloading = true;
  s.reloadUntilMs = nowMs + WEAPONS[s.key].reloadMs * reloadMul;
  return true;
}

export function addReserve(s: WeaponState, n: number): void {
  if (!Number.isFinite(s.reserve)) return;
  s.reserve = Math.min(s.reserve + n, 999);
}

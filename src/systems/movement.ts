export interface MoveInput {
  x: number;
  y: number;
  sprint: boolean;
}

export const SPRINT_MUL = 1.5;
export const STAMINA_MAX = 100;
export const STAMINA_DRAIN = 25; // ต่อวินาทีตอนวิ่ง
export const STAMINA_REGEN = 15; // ต่อวินาทีตอนพัก

/** แปลง input ดิบเป็น velocity — ทแยงถูก normalize ให้เร็วเท่าทางตรง */
export function computeVelocity(
  input: MoveInput,
  speed: number,
  stamina: number,
): { vx: number; vy: number; sprinting: boolean } {
  const len = Math.hypot(input.x, input.y);
  if (len === 0) return { vx: 0, vy: 0, sprinting: false };
  const nx = input.x / len;
  const ny = input.y / len;
  const sprinting = input.sprint && stamina > 0;
  const sp = sprinting ? speed * SPRINT_MUL : speed;
  return { vx: nx * sp, vy: ny * sp, sprinting };
}

export function updateStamina(stamina: number, sprinting: boolean, dtSec: number): number {
  const dt = Math.max(0, dtSec);
  const next = stamina + (sprinting ? -STAMINA_DRAIN * dt : STAMINA_REGEN * dt);
  return Math.min(STAMINA_MAX, Math.max(0, Math.round(next * 1000) / 1000));
}

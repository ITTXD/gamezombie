# แบ่งงาน 3 คน — gamezombie 🧟

> ไฟล์นี้คือใบงานหลัก เพื่อนเปิดจาก GitHub ได้เลย
> แผนเกมเต็ม: [docs/PLAN.md](PLAN.md)

## Stack ที่ใช้

| อย่าง | ตัวที่ล็อก |
|---|---|
| Engine | Phaser 3.80+ |
| ภาษา | TypeScript |
| Bundler | Vite |
| Version control | Git + GitHub (branch ละคน ห้าม push ตรง `main`) |
| เก็บคะแนน | `localStorage` (ยังไม่มี backend) |
| แอสเซท | วาดด้วยโค้ดก่อน (Phaser Graphics) + ของฟรี Kenney.nl |

## ตารางแบ่งงาน (ไฟล์ห้ามทับกัน)

| คน | หน้าที่ | ไฟล์ที่รับผิดชอบ (คนอื่นห้ามแตะ) | เกณฑ์เสร็จ |
|---|---|---|---|
| **A: Player + Combat** | เดิน WASD, เมาส์เล็ง, คลิกยิง, กระสุน pool, ปืน 3 แบบ + รีโหลด, รวมเกมใน GameScene | `src/entities/Player.ts`, `src/entities/Bullet.ts`, `src/systems/WeaponSystem.ts` (+ `weaponDefs.ts`), `src/scenes/GameScene.ts` | เดินยิงได้ 60fps, เปลี่ยนปืน/รีโหลดไม่บั๊ก |
| **B: Enemy + Wave** | ซอมบี้ 3 แบบ + AI เดินเข้าหา, เกิดรอบขอบจอ, สเกลยากตามเวฟ, XP/Level-up, Pickup/ระเบิด (ทำเป็น API ให้ A เรียก) | `src/entities/Zombie.ts`, `src/entities/Pickup.ts`, `src/systems/WaveManager.ts` (+ `waveConfig.ts`), `src/systems/LevelSystem.ts` (+ `levels.ts`) | รอด 3 เวฟได้โดยไม่บั๊ก, เวฟหลังยากขึ้นจริง, ดรอปของได้ |
| **C: UI + Audio + Deploy** | เมนู, HUD, Pause, GameOver, High Score, เสียง + เอฟเฟกต์, assets, build ขึ้นเว็บ | `src/scenes/BootScene.ts`, `src/scenes/MenuScene.ts`, `src/scenes/GameOverScene.ts`, `src/ui/HUD.ts`, `src/systems/AudioManager.ts`, `src/systems/ScoreManager.ts` (+ `score.ts`), `public/assets/*`, `index.html`, `vite.config.ts` | มีเมนูครบ, มีเสียง, `npm run build` ผ่าน + เปิดลิงก์เล่นได้ |

## กฎกันงานชน

1. **ห้ามแก้ไฟล์ข้ามคน** — อยากได้อะไรจากอีกคน ให้เรียกผ่านฟังก์ชันกลางที่ตกลงกันไว้:
   - `WaveManager.spawnWave(n)` — B ทำให้ A เรียก
   - `WeaponSystem.fire(x, y, angle)` — A ทำให้ GameScene เรียก
   - `HUD.update(hp, ammo, wave, score)` — C ทำให้ A เรียก
2. **Branch ละคน:** `feat/player-combat` / `feat/enemy-wave` / `feat/ui-audio` — รวมผ่าน PR ทีละคน (A → B → C) ห้าม push ตรง `main`
3. **ลำดับทำ:** A ขึ้น M1 ก่อน (Player เดินยิง) → B ต่อ M2–M3 (ซอมบี้ + เวฟ) → C ปิด M4–M5 (UI + เสียง + deploy) — ระหว่างรอ C เตรียม asset/เสียงรอไว้ก่อน

## Milestone (ดูรายละเอียดใน PLAN.md)

- [ ] M1 Setup + Player เดิน/ยิง (A)
- [ ] M2 Combat + Wave 1–∞ (A + B)
- [ ] M3 อาวุธ 3 แบบ + HUD (A + B + C)
- [ ] M4 XP/Item/Bomb/GameOver + High Score (B + C)
- [ ] M5 Polish + Deploy ลิงก์ public (C)

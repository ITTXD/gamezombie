# gamezombie 🧟 2D Top-down Wave Survival (Phaser 3)

> สถานะตอนนี้: **เล่นได้ทั้งเกม (M1–M5)**

เกมซอมบี้ 2D เล่นบนเว็บ แนว top-down shooter เอาตัวรอดเป็นเวฟ
- Engine: Phaser 3 + TypeScript + Vite
- ดูแผนเต็ม: [docs/PLAN.md](docs/PLAN.md)
- ใบแบ่งงาน 3 คน: [docs/TASKS.md](docs/TASKS.md)
- sprite: ดู [public/assets/CREDITS.md](public/assets/CREDITS.md) (Kenney CC0 + Riley Gombart CC-BY 3.0)

## แผนย่อ
- เดิน (WASD) + เมาส์เล็ง + คลิกยิง เอาตัวรอดเป็นเวฟ
- ซอมบี้ 3 แบบ: Walker / Runner / Brute
- ปืน 3 แบบ: Pistol / Shotgun / Rifle
- ระบบเสริม: XP+Level-up, Pickup, ระเบิด, High Score (localStorage), เสียง+เอฟเฟกต์

## วิธีเล่น
- WASD/ลูกศรเดิน, เมาส์เล็ง, คลิกค้างยิง
- 1/2/3 เปลี่ยนปืน (shotgun เวฟ 2, rifle เวฟ 3), R รีโหลด
- Space/คลิกขวา ระเบิด, Shift วิ่ง, P หยุด, M ปิดเสียง

## จะรันยังไง
```bash
npm install
npm run dev   # เปิด http://localhost:5173
```

## Milestone
- M1 Setup + Player เดิน/ยิง
- M2 Combat + Wave
- M3 อาวุธ + HUD
- M4 XP/Item/Bomb/GameOver
- M5 Polish + Deploy

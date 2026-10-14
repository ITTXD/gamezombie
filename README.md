# gamezombie 🧟 2D Top-down Wave Survival (Phaser 3)

> สถานะตอนนี้: **มีแค่แผน ยังไม่มีโค้ดเกม**

เกมซอมบี้ 2D เล่นบนเว็บ แนว top-down shooter เอาตัวรอดเป็นเวฟ
- Engine: Phaser 3 + TypeScript + Vite (จะเริ่ม M1 ต่อไป)
- ดูแผนเต็ม: [docs/PLAN.md](docs/PLAN.md)
- ใบแบ่งงาน 3 คน: [docs/TASKS.md](docs/TASKS.md)

## แผนย่อ
- เดิน (WASD) + เมาส์เล็ง + คลิกยิง เอาตัวรอดเป็นเวฟ
- ซอมบี้ 3 แบบ: Walker / Runner / Brute
- ปืน 3 แบบ: Pistol / Shotgun / Rifle
- ระบบเสริม: XP+Level-up, Pickup, ระเบิด, High Score (localStorage), เสียง+เอฟเฟกต์

## จะรันยังไง (หลังเริ่ม M1)
```bash
npm install
npm run dev
```

## Milestone
- M1 Setup + Player เดิน/ยิง
- M2 Combat + Wave
- M3 อาวุธ + HUD
- M4 XP/Item/Bomb/GameOver
- M5 Polish + Deploy

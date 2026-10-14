# แผนเกม Zombie 2D บนเว็บ (Top-down Wave Survival + Phaser 3)

> สถานะ: แผนอย่างเดียว ยังไม่เริ่มโค้ดเกม
> โปรเจกต์: `/Users/ittxd/Documents/My_project/gamezombie`
> GitHub เป้าหมาย: `ITTXD/gamezombie` (public)

## 1. เป้าหมาย
- เกม 2D เล่นบนเบราว์เซอร์ได้เลย ไม่ต้องติดตั้ง
- แนว top-down shooter เอาตัวรอดเป็นเวฟ
- เวอร์ชันแรก (MVP+) ต้องเล่นจบ loop ได้: เดิน/ยิง/ซอมบี้มาเป็นเวฟ/อัปเกรด/ตาย/เริ่มใหม่ + High Score

## 2. Tech Stack (ล็อกแล้ว)
- **Engine:** Phaser 3.80+
- **ภาษา:** TypeScript (แนะนำ) — ถ้าไม่ถนัดค่อยลดเป็น JavaScript
- **Bundler:** Vite (dev เร็ว + build ขึ้น Vercel/GitHub Pages ง่าย)
- **Backend:** ยังไม่มี ใช้ `localStorage` เก็บ High Score
- **Asset เฟสแรก:** วาดด้วย Phaser Graphics (สี่เหลี่ยม/วงกลม) + เสียงฟรีจาก Kenney.nl
- **Asset เฟสหลัง:** แทนด้วย pixel-art sprite ฟรี

## 3. Game Design

### 3.1 Core Loop
`Menu → Wave N เริ่ม → ซอมบี้เกิดรอบขอบจอ → ยิงเอาตัวรอด → เก็บ XP/ไอเทม → จบเวฟ → เลือกอัปเกรด 1 ใน 3 → Wave N+1 ยากขึ้น → เลือดหมด → GameOver → ดูคะแนน → Restart`

### 3.2 Player
- เคลื่อนที่: WASD / ลูกศร
- เล็ง: เมาส์, ยิง: คลิกซ้าย, รีโหลด: R, วิ่ง: Shift (ใช้ stamina), ระเบิด: Space/คลิกขวา
- ค่าพื้นฐาน: HP 100, speed 220, stamina 100

### 3.3 Zombie (3 แบบ)
| แบบ | HP | Speed | Damage | เกิดเวฟ |
|---|---|---|---|---|
| Walker | 30 | 60 | 10 | 1+ |
| Runner | 20 | 140 | 8 | 2+ |
| Brute | 120 | 45 | 25 | 4+ |

- AI: เดินเข้าหา player ตรงๆ + แยกตัวกันเล็กน้อย (separation) กันซ้อนทับ
- Spawn: รอบขอบจอนอกกล้อง, จำนวน = `5 + wave * 3`, เลือดสเกล `+10%/wave`

### 3.4 อาวุธ (3 แบบ)
| ปืน | Damage | Fire rate | Mag | Reload |
|---|---|---|---|---|
| Pistol | 15 | 3/s | 12 | 1.0s |
| Shotgun | 10x5 เม็ด | 1/s | 6 | 1.8s |
| Rifle | 22 | 7/s | 30 | 1.5s |

- เริ่มด้วย Pistol, ปลด Shotgun เวฟ 2, Rifle เวฟ 3 (หรือดรอปจากบอส)
- กระสุนมีแบบแม็ก + กระสุนสำรอง, หมดต้องเก็บ pickup

### 3.5 ระบบเสริม (ตามที่ขอ "เอายากๆ ให้น่าสนใจ")
1. **XP + Level-up:** ฆ่าซอมบี้ได้ XP → เลเวลอัป → หยุดเกมชั่วคราวให้เลือกอัป 1 ใน 3 (ดาเมจ+15% / เลือด max+20 / ความเร็ว+10% / ดูดเลือด / รีโหลดเร็ว)
2. **Pickup ดรอป:** กล่องพยาบาล (+30 HP), กล่องกระสุน, ระเบิด+1
3. **ระเบิด:** ดาเมจวงกว้าง 100, มีจำนวนจำกัด
4. **Wave + Score:** คะแนน = ฆ่า*10 + เวฟโบนัส, เก็บ best ใน localStorage
5. **UI:** HUD (HP bar / กระสุน / เวฟ / คะแนน / ระเบิด), Menu, Pause (Esc/P), GameOver + Restart
6. **เสียง + เอฟเฟกต์:** ยิง/รีโหลด/โดนกัด/ระเบิด/เลเวลอัป + จอสั่น + เลือดกระเด็น (particle)

### 3.6 สิ่งที่ตัดออกเฟสแรก (กันบานปลาย)
- Multiplayer, แผนที่ใหญ่/scroll, บอส, ด่านหลายด่าน, ระบบเซฟเซิร์ฟเวอร์, มือถือ touch (เอาเฟส 2)

## 4. สถาปัตยกรรมไฟล์ (ที่จะสร้างเฟสต่อไป)
```
gamezombie/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  src/
    main.ts               # Phaser config + ลงทะเบียน Scene
    scenes/
      BootScene.ts        # โหลด asset
      MenuScene.ts        # เมนูเริ่ม
      GameScene.ts        # เกมหลัก
      GameOverScene.ts    # จบเกม
    entities/
      Player.ts
      Zombie.ts
      Bullet.ts
      Pickup.ts
      Particle.ts
    systems/
      WaveManager.ts      # ควบคุม spawn/ความยาก
      WeaponSystem.ts     # ปืน/กระสุน/รีโหลด
      LevelSystem.ts      # XP/level/upgrade
      AudioManager.ts
      ScoreManager.ts     # localStorage
  public/assets/          # sprite + เสียง
  docs/PLAN.md            # สำเนาแผนนี้ใน repo
```

## 5. Milestone (5 ขั้น ไม่ข้าม)
- **M1 Setup:** Vite+TS+Phaser รัน `npm run dev` ได้ + Player เดิน/เล็ง/ยิง + ขอบจอ
  - เกณฑ์ผ่าน: เปิดเบราว์เซอร์เดินยิงได้ 60fps
- **M2 Combat core:** Zombie เกิด/เดิน/กัด + HP/ตาย + กระสุนชน + Wave 1-∞
  - เกณฑ์ผ่าน: อยู่รอด 3 เวฟได้โดยไม่บั๊กทะลุกำแพง
- **M3 อาวุธ+เวฟ:** 3 ปืน + รีโหลด + WaveManager สเกลยาก + HUD
  - เกณฑ์ผ่าน: เปลี่ยนปืน/รีโหลด/เวฟยากขึ้นจริง
- **M4 ระบบเสริม:** XP/Level-up UI + Pickup + ระเบิด + Pause/GameOver + High Score
  - เกณฑ์ผ่าน: เล่น 10 นาที วนลูปครบโดยไม่ค้าง
- **M5 Polish + Deploy:** เสียง + particle + จอสั่น + เมนูสวย + `npm run build` + ขึ้น Vercel/GitHub Pages
  - เกณฑ์ผ่าน: เปิดลิงก์ public เล่นได้

## 6. ความเสี่ยง + วิธีกัน
- **บานปลาย:** ล็อก M1-M5 ห้ามเพิ่มฟีเจอร์กลางทาง อยากได้จดไว้เฟส 2
- **Performance:** ใช้ object pool กระสุน/ซอมบี้, จำกัดซอมบี้พร้อมกัน ≤ 60 ตัว
- **Asset หนัก:** เฟสแรกไม่ใช้รูปใหญ่ ใช้กราฟิกโค้ดก่อน

## 7. ขั้น GitHub (ทำรอบนี้)
1. `git init` ใน `gamezombie/`
2. เพิ่ม `README.md` + `.gitignore` + `docs/PLAN.md`
3. commit แรก: `chore: init project with plan`
4. `gh repo create ITTXD/gamezombie --public --source=. --push`
5. ตรวจ `gh repo view ITTXD/gamezombie --web` ว่าเป็น public จริง

## 8. คำถามค้าง (ตอบก่อนเริ่ม M1)
- [ ] เอา TypeScript แน่นอนไหม? (แนะนำ TS)
- [ ] อาร์ต pixel หรือเรียบๆ ก่อน?
- [ ] Deploy หลัก Vercel หรือ GitHub Pages?

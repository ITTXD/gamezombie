import Phaser from 'phaser';
import { loadBest } from '../systems/score';
import { audio } from '../systems/AudioManager';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    audio.ensure();
    const { width, height } = this.scale;
    this.add.image(120, height / 2, 'z-walker').setScale(2.5).setAngle(-15);
    this.add.image(width - 120, height / 2, 'z-brute').setScale(3).setAngle(15);
    this.add
      .text(width / 2, height / 2 - 110, 'GAMEZOMBIE', { fontSize: '56px', color: '#e74c3c' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 - 60, '2D Top-down Wave Survival', { fontSize: '20px', color: '#abb2bf' })
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height / 2 + 20,
        'WASD/ลูกศร เดิน  •  เมาส์เล็ง  •  คลิกค้าง ยิง\n1/2/3 เปลี่ยนปืน (shotgun W2, rifle W3)  •  R รีโหลด\nSpace/คลิกขวา ระเบิด  •  Shift วิ่ง  •  P หยุด  •  M ปิดเสียง',
        { fontSize: '17px', color: '#dcdcdc', align: 'center', lineSpacing: 6 },
      )
      .setOrigin(0.5);
    const best = loadBest(localStorage);
    this.add
      .text(width / 2, height / 2 + 120, `Best score: ${best}`, { fontSize: '18px', color: '#f1c40f' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 + 150, 'Enter / คลิก เพื่อเริ่ม', { fontSize: '18px', color: '#2ecc71' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height - 20, 'Sprites: Kenney (CC0) + Riley Gombart (CC-BY 3.0)', { fontSize: '12px', color: '#5d6d7e' })
      .setOrigin(0.5);

    const start = () => {
      audio.ensure();
      this.scene.start('Game');
    };
    this.input.once('pointerdown', start);
    this.input.keyboard?.once('keydown-ENTER', start);
    this.input.keyboard?.once('keydown-SPACE', start);
  }
}

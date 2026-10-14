import Phaser from 'phaser';
import { loadBest } from '../systems/score';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2 - 80, 'GAMEZOMBIE', { fontSize: '56px', color: '#e74c3c' })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2 - 30, '2D Top-down Wave Survival', { fontSize: '20px', color: '#abb2bf' })
      .setOrigin(0.5);
    this.add
      .text(
        width / 2,
        height / 2 + 30,
        'WASD/ลูกศร เดิน  •  เมาส์เล็ง  •  Shift วิ่ง\nEnter / คลิก เพื่อเริ่ม',
        { fontSize: '18px', color: '#dcdcdc', align: 'center' },
      )
      .setOrigin(0.5);
    const best = loadBest(localStorage);
    this.add
      .text(width / 2, height / 2 + 100, `Best score: ${best}`, { fontSize: '18px', color: '#f1c40f' })
      .setOrigin(0.5);

    this.input.once('pointerdown', () => this.scene.start('Game'));
    this.input.keyboard?.once('keydown-ENTER', () => this.scene.start('Game'));
    this.input.keyboard?.once('keydown-SPACE', () => this.scene.start('Game'));
  }
}

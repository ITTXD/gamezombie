import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const g = this.add.graphics();

    // player 32x32: ตัวเขียว + ลำกล้องชี้ขวา
    g.fillStyle(0x2ecc71, 1);
    g.fillCircle(14, 16, 11);
    g.fillStyle(0x145a32, 1);
    g.fillRect(14, 14, 16, 4);
    g.generateTexture('player', 32, 32);
    g.clear();

    g.destroy();
    this.scene.start('Menu');
  }
}

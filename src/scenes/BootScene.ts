import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload(): void {
    this.load.image('p-stand', 'assets/kenney/survivor1_stand.png');
    this.load.image('p-gun', 'assets/kenney/survivor1_gun.png');
    this.load.image('p-machine', 'assets/kenney/survivor1_machine.png');
    this.load.image('p-reload', 'assets/kenney/survivor1_reload.png');
    this.load.image('z-walker', 'assets/kenney/zoimbie1_stand.png');
    this.load.image('z-runner', 'assets/kenney/zoimbie1_hold.png');
    this.load.image('z-brute', 'assets/kenney/robot1_stand.png');
  }

  create(): void {
    const g = this.add.graphics();
    // กระสุน
    g.fillStyle(0xf1c40f, 1);
    g.fillRoundedRect(0, 0, 12, 5, 2);
    g.generateTexture('bullet', 12, 5);
    g.clear();
    // xp gem
    g.fillStyle(0x2ecc71, 1);
    g.fillCircle(5, 5, 5);
    g.generateTexture('gem', 10, 10);
    g.clear();
    // เลือด
    g.fillStyle(0xc0392b, 1);
    g.fillCircle(3, 3, 3);
    g.generateTexture('blood', 6, 6);
    g.clear();
    // muzzle flash
    g.fillStyle(0xfff3a0, 1);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.generateTexture('flash', 16, 16);
    g.clear();
    // กล่องพยาบาล
    g.fillStyle(0xecf0f1, 1);
    g.fillRoundedRect(0, 0, 18, 18, 3);
    g.fillStyle(0xe74c3c, 1);
    g.fillRect(7, 3, 4, 12);
    g.fillRect(3, 7, 12, 4);
    g.generateTexture('pk-health', 18, 18);
    g.clear();
    // กล่องกระสุน
    g.fillStyle(0xf39c12, 1);
    g.fillRoundedRect(0, 0, 18, 14, 2);
    g.fillStyle(0x7e5109, 1);
    g.fillRect(3, 5, 12, 4);
    g.generateTexture('pk-ammo', 18, 14);
    g.clear();
    // ระเบิด
    g.fillStyle(0x2c3e50, 1);
    g.fillCircle(8, 9, 7);
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(8, 3, 2);
    g.generateTexture('pk-bomb', 16, 16);
    g.clear();
    g.destroy();

    this.scene.start('Menu');
  }
}

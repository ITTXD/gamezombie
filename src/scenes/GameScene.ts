import Phaser from 'phaser';
import { Player } from '../entities/Player';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private staminaBar!: Phaser.GameObjects.Graphics;
  private infoText!: Phaser.GameObjects.Text;

  constructor() {
    super('Game');
  }

  create(): void {
    const { width, height } = this.scale;
    this.physics.world.setBounds(0, 0, width, height);

    this.player = new Player(this, width / 2, height / 2);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,SHIFT,ESC') as Record<
      string,
      Phaser.Input.Keyboard.Key
    >;

    this.infoText = this.add.text(12, 10, '', { fontSize: '15px', color: '#abb2bf' });
    this.staminaBar = this.add.graphics();

    this.input.keyboard!.on('keydown-ESC', () => this.scene.start('Menu'));
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    const sprintKey = this.cursors.shift.isDown || this.keys.SHIFT.isDown;

    const sprinting = this.player.move(
      {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: (down ? 1 : 0) - (up ? 1 : 0),
        sprint: sprintKey,
      },
      dt,
    );

    const pointer = this.input.activePointer;
    this.player.aimAt(pointer.worldX, pointer.worldY);

    // stamina bar + help (HUD เต็มของคน C จะมาแทนทีหลัง)
    this.staminaBar.clear();
    this.staminaBar.fillStyle(0x222222, 1);
    this.staminaBar.fillRect(12, 34, 160, 10);
    this.staminaBar.fillStyle(sprinting ? 0xf1c40f : 0x2ecc71, 1);
    this.staminaBar.fillRect(12, 34, 160 * (this.player.stamina / 100), 10);
    this.infoText.setText(
      `M1 movement — WASD/ลูกศรเดิน Shiftวิ่ง Escเมนู\nstamina ${Math.round(this.player.stamina)}`,
    );
  }
}

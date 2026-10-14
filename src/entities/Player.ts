import Phaser from 'phaser';
import { computeVelocity, updateStamina, type MoveInput } from '../systems/movement';

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  maxHp = 100;
  hp = 100;
  speed = 220;
  stamina = 100;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
  }

  move(input: MoveInput, dtSec: number): boolean {
    const { vx, vy, sprinting } = computeVelocity(input, this.speed, this.stamina);
    this.sprite.setVelocity(vx, vy);
    this.stamina = updateStamina(this.stamina, sprinting, dtSec);
    return sprinting;
  }

  aimAt(worldX: number, worldY: number): void {
    this.sprite.setRotation(
      Math.atan2(worldY - this.sprite.y, worldX - this.sprite.x),
    );
  }
}

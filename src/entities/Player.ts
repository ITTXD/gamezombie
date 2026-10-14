import Phaser from 'phaser';
import { computeVelocity, updateStamina, type MoveInput } from '../systems/movement';
import { FACE_UP_OFFSET } from '../entities/Zombie';
import type { WeaponKey } from '../systems/weaponDefs';

const POSES: Record<string, string> = {
  stand: 'p-stand',
  pistol: 'p-gun',
  shotgun: 'p-machine',
  rifle: 'p-machine',
  reload: 'p-reload',
};

export class Player {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  speed = 220;
  stamina = 100;
  private pose = '';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, POSES.stand);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.fitBody();
  }

  private fitBody(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;
    body.setSize(this.sprite.width * 0.7, this.sprite.height * 0.7);
    body.setOffset(this.sprite.width * 0.15, this.sprite.height * 0.15);
  }

  move(input: MoveInput, dtSec: number): boolean {
    const { vx, vy, sprinting } = computeVelocity(input, this.speed, this.stamina);
    this.sprite.setVelocity(vx, vy);
    this.stamina = updateStamina(this.stamina, sprinting, dtSec);
    return sprinting;
  }

  aimAt(worldX: number, worldY: number): number {
    const angle = Math.atan2(worldY - this.sprite.y, worldX - this.sprite.x);
    this.sprite.setRotation(angle + FACE_UP_OFFSET);
    return angle;
  }

  updatePose(weapon: WeaponKey, reloading: boolean): void {
    const next = reloading ? POSES.reload : POSES[weapon];
    if (next !== this.pose) {
      this.pose = next;
      this.sprite.setTexture(next);
      this.fitBody();
    }
  }
}

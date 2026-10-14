import Phaser from 'phaser';
import { ZOMBIE_BASE, type ZombieType } from '../systems/waveConfig';

/** sprite Kenney หันขึ้นบน ต้องบวก offset นี้ตอนเล็ง */
export const FACE_UP_OFFSET = Math.PI / 2;

const TEXTURES: Record<ZombieType, string> = {
  walker: 'z-walker',
  runner: 'z-runner',
  brute: 'z-brute',
};

export class Zombie {
  readonly type: ZombieType;
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  hp: number;
  readonly maxHp: number;
  readonly speed: number;
  readonly damage: number;
  readonly score: number;
  readonly xp: number;
  biteReadyMs = 0;

  constructor(scene: Phaser.Scene, type: ZombieType, x: number, y: number, hpScale: number) {
    const base = ZOMBIE_BASE[type];
    this.type = type;
    this.maxHp = Math.max(1, Math.round(base.hp * hpScale));
    this.hp = this.maxHp;
    this.speed = base.speed * (0.9 + Math.random() * 0.2);
    this.damage = base.damage;
    this.score = base.score;
    this.xp = base.xp;

    this.sprite = scene.physics.add.sprite(x, y, TEXTURES[type]);
    if (type === 'brute') this.sprite.setScale(1.35);
    this.sprite.setDepth(5);
    this.sprite.setData('z', this);
    this.fitBody();
  }

  private fitBody(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body | null;
    if (!body) return;
    body.setSize(this.sprite.width * 0.7, this.sprite.height * 0.7);
    body.setOffset(this.sprite.width * 0.15, this.sprite.height * 0.15);
  }

  chase(px: number, py: number): void {
    const angle = Math.atan2(py - this.sprite.y, px - this.sprite.x);
    this.sprite.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.sprite.setRotation(angle + FACE_UP_OFFSET);
  }

  /** คืน true ถ้าตาย */
  takeDamage(scene: Phaser.Scene, amount: number): boolean {
    this.hp -= amount;
    if (this.hp <= 0) return true;
    this.sprite.setTintFill(0xffffff);
    scene.time.delayedCall(60, () => {
      if (this.sprite.active) this.sprite.clearTint();
    });
    return false;
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

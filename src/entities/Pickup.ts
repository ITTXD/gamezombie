import Phaser from 'phaser';

export type PickupKind = 'health' | 'ammo' | 'bomb' | 'xp';

const TEXTURES: Record<PickupKind, string> = {
  health: 'pk-health',
  ammo: 'pk-ammo',
  bomb: 'pk-bomb',
  xp: 'gem',
};

export class Pickup {
  readonly sprite: Phaser.Physics.Arcade.Sprite;
  readonly kind: PickupKind;
  readonly value: number;

  constructor(
    scene: Phaser.Scene,
    group: Phaser.Physics.Arcade.Group,
    kind: PickupKind,
    x: number,
    y: number,
    value = 0,
  ) {
    this.kind = kind;
    this.value = value;
    this.sprite = group.create(x, y, TEXTURES[kind]) as Phaser.Physics.Arcade.Sprite;
    this.sprite.setDepth(4);
    this.sprite.setData('pickup', this);
    if (kind === 'xp') {
      const a = Math.random() * Math.PI * 2;
      this.sprite.setVelocity(Math.cos(a) * 120, Math.sin(a) * 120);
      this.sprite.setDrag(400, 400);
    }
  }
}

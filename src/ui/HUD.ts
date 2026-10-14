import Phaser from 'phaser';
import type { Upgrade } from '../systems/levels';

export interface HudState {
  hp: number;
  maxHp: number;
  stamina: number;
  mag: number;
  reserve: number;
  reloading: boolean;
  weaponName: string;
  shotgunLocked: boolean;
  rifleLocked: boolean;
  wave: number;
  score: number;
  kills: number;
  bombs: number;
  level: number;
  xp: number;
  xpNeed: number;
  muted: boolean;
}

export class HUD {
  private hpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private topRight!: Phaser.GameObjects.Text;
  private msgText!: Phaser.GameObjects.Text;
  private overlay: Phaser.GameObjects.Container | null = null;

  create(scene: Phaser.Scene): void {
    this.hpBar = scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.xpBar = scene.add.graphics().setScrollFactor(0).setDepth(100);
    this.hpText = scene.add.text(12, 8, '', { fontSize: '15px', color: '#ff6b6b' }).setScrollFactor(0).setDepth(100);
    this.ammoText = scene.add.text(12, 52, '', { fontSize: '17px', color: '#f5f5f5' }).setScrollFactor(0).setDepth(100);
    this.topRight = scene.add.text(scene.scale.width - 12, 8, '', { fontSize: '15px', color: '#f5f5f5', align: 'right' }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    this.msgText = scene.add.text(scene.scale.width / 2, 120, '', { fontSize: '28px', color: '#f1c40f', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(100).setAlpha(0);
  }

  update(s: HudState): void {
    this.hpBar.clear();
    this.hpBar.fillStyle(0x222222, 1);
    this.hpBar.fillRect(12, 28, 200, 12);
    this.hpBar.fillStyle(0xe74c3c, 1);
    this.hpBar.fillRect(12, 28, 200 * Math.max(0, s.hp / s.maxHp), 12);
    this.hpText.setText(`HP ${Math.ceil(Math.max(0, s.hp))}/${s.maxHp}`);
    const reserve = Number.isFinite(s.reserve) ? `${s.reserve}` : 'inf';
    this.ammoText.setText(
      `${s.weaponName}: ${s.reloading ? 'RELOADING...' : `${s.mag}/${reserve}`}   [1 pistol${s.shotgunLocked ? '(W2)' : ''} 2 shotgun${s.rifleLocked ? '(W3)' : ''} 3 rifle]`,
    );
    this.topRight.setText(
      `Wave ${Math.max(1, s.wave)}   Score ${s.score}   Kills ${s.kills}\nBombs ${s.bombs} (Space)   Lv ${s.level}${s.muted ? '   MUTED(M)' : ''}`,
    );
    this.xpBar.clear();
    this.xpBar.fillStyle(0x222222, 1);
    this.xpBar.fillRect(12, 76, 200, 6);
    this.xpBar.fillStyle(0x9b59b6, 1);
    this.xpBar.fillRect(12, 76, 200 * Math.min(1, s.xp / s.xpNeed), 6);
  }

  message(scene: Phaser.Scene, text: string, color = '#f1c40f'): void {
    this.msgText.setText(text).setColor(color);
    scene.tweens.killTweensOf(this.msgText);
    this.msgText.setAlpha(1);
    scene.tweens.add({ targets: this.msgText, alpha: 0, duration: 1600, delay: 400 });
  }

  private dimBg(scene: Phaser.Scene): Phaser.GameObjects.Rectangle {
    return scene.add.rectangle(
      scene.scale.width / 2, scene.scale.height / 2,
      scene.scale.width, scene.scale.height, 0x000000, 0.7,
    ).setScrollFactor(0).setDepth(200);
  }

  private button(scene: Phaser.Scene, x: number, y: number, label: string, cb: () => void): Phaser.GameObjects.Container {
    const bg = scene.add.rectangle(0, 0, 420, 52, 0x1e2a38).setStrokeStyle(2, 0xf1c40f);
    const t = scene.add.text(0, 0, label, { fontSize: '17px', color: '#f5f5f5', align: 'center' }).setOrigin(0.5);
    const c = scene.add.container(x, y, [bg, t]).setScrollFactor(0).setDepth(201);
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x2e4057));
    bg.on('pointerout', () => bg.setFillStyle(0x1e2a38));
    bg.on('pointerdown', cb);
    return c;
  }

  showUpgrades(scene: Phaser.Scene, upgrades: Upgrade[], onPick: (id: Upgrade['id']) => void): void {
    this.hideOverlay();
    const items: Phaser.GameObjects.GameObject[] = [this.dimBg(scene)];
    const cx = scene.scale.width / 2;
    items.push(scene.add.text(cx, 140, 'LEVEL UP! เลือก 1 อย่าง (กด 1/2/3)', { fontSize: '26px', color: '#f1c40f' }).setOrigin(0.5).setScrollFactor(0).setDepth(201));
    upgrades.forEach((u, i) => {
      items.push(this.button(scene, cx, 220 + i * 70, `${i + 1}. ${u.label} — ${u.desc}`, () => onPick(u.id)));
    });
    this.overlay = scene.add.container(0, 0, items);
  }

  showPause(scene: Phaser.Scene, onResume: () => void, onMenu: () => void): void {
    this.hideOverlay();
    const cx = scene.scale.width / 2;
    this.overlay = scene.add.container(0, 0, [
      this.dimBg(scene),
      scene.add.text(cx, 200, 'PAUSED (P/Esc ต่อ)', { fontSize: '30px', color: '#f5f5f5' }).setOrigin(0.5).setScrollFactor(0).setDepth(201),
      this.button(scene, cx, 290, 'เล่นต่อ', onResume),
      this.button(scene, cx, 360, 'กลับเมนู', onMenu),
    ]);
  }

  hideOverlay(): void {
    this.overlay?.destroy(true);
    this.overlay = null;
  }
}

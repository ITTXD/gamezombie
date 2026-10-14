import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Zombie } from '../entities/Zombie';
import { Pickup, type PickupKind } from '../entities/Pickup';
import { WEAPONS, pelletAngles, type WeaponKey } from '../systems/weaponDefs';
import {
  addReserve, createWeapon, fireWeapon, startReload, updateWeapon, type WeaponState,
} from '../systems/WeaponController';
import { WaveManager } from '../systems/WaveManager';
import { ZOMBIE_BASE, type ZombieType } from '../systems/waveConfig';
import {
  BASE_STATS, applyUpgrade, rollUpgrades, xpForKill, xpNeeded, type PlayerStats, type Upgrade,
} from '../systems/levels';
import { loadBest, saveBest } from '../systems/score';
import { HUD } from '../ui/HUD';
import { audio } from '../systems/AudioManager';

const BOMB_DAMAGE = 100;
const BOMB_RADIUS = 190;
const MAX_BOMBS = 3;
const BITE_COOLDOWN_MS = 850;

interface Particle {
  img: Phaser.GameObjects.Image;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private weapons!: Record<WeaponKey, WeaponState>;
  private current: WeaponKey = 'pistol';
  private stats: PlayerStats = { ...BASE_STATS };
  private hp = BASE_STATS.maxHp;
  private wave!: WaveManager;
  private zombies: Zombie[] = [];
  private zombieGroup!: Phaser.Physics.Arcade.Group;
  private bulletGroup!: Phaser.Physics.Arcade.Group;
  private pickupGroup!: Phaser.Physics.Arcade.Group;
  private gemGroup!: Phaser.Physics.Arcade.Group;
  private particles: Particle[] = [];
  private hud!: HUD;
  private flash!: Phaser.GameObjects.Image;

  private xp = 0;
  private level = 1;
  private kills = 0;
  private score = 0;
  private bombs = 1;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private aimAngle = 0;
  private over = false;
  private paused = false;
  private choosing = false;
  private pendingLevels = 0;
  private upgradePick: ((i: number) => void) | null = null;
  private rightWasDown = false;

  constructor() {
    super('Game');
  }

  create(): void {
    this.physics.world.resume();
    const { width, height } = this.scale;
    this.physics.world.setBounds(0, 0, width, height);

    this.player = new Player(this, width / 2, height / 2);
    this.weapons = { pistol: createWeapon('pistol'), shotgun: createWeapon('shotgun'), rifle: createWeapon('rifle') };
    this.current = 'pistol';
    this.stats = { ...BASE_STATS };
    this.hp = this.stats.maxHp;
    this.wave = new WaveManager();
    this.zombies = [];
    this.particles = [];
    this.xp = 0; this.level = 1; this.kills = 0; this.score = 0; this.bombs = 1;
    this.over = false; this.paused = false; this.choosing = false; this.pendingLevels = 0;
    this.upgradePick = null; this.rightWasDown = false;

    this.zombieGroup = this.physics.add.group();
    this.bulletGroup = this.physics.add.group({ defaultKey: 'bullet', maxSize: 150 });
    this.pickupGroup = this.physics.add.group();
    this.gemGroup = this.physics.add.group();

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,SPACE,P,R,M,ONE,TWO,THREE,ESC') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.mouse?.disableContextMenu();

    this.hud = new HUD();
    this.hud.create(this);
    this.flash = this.add.image(-50, -50, 'flash').setDepth(9).setAlpha(0);

    this.physics.add.overlap(this.bulletGroup, this.zombieGroup, (a, b) => this.onBulletHit(a, b));
    this.physics.add.overlap(this.player.sprite, this.zombieGroup, (_p, z) => this.onBite(z));
    this.physics.add.overlap(this.player.sprite, this.pickupGroup, (_p, pk) => this.onPickup(pk));
    this.physics.add.overlap(this.player.sprite, this.gemGroup, (_p, g) => this.onGem(g));

    const kb = this.input.keyboard!;
    kb.on('keydown-P', () => this.togglePause());
    kb.on('keydown-ESC', () => this.togglePause());
    kb.on('keydown-M', () => { audio.ensure(); audio.toggle(); });
    kb.on('keydown-R', () => {
      if (this.over || this.paused || this.choosing) return;
      if (startReload(this.weapons[this.current], this.time.now, this.stats.reloadMul)) audio.reload();
    });
    kb.on('keydown-SPACE', () => this.tryBomb());
    kb.on('keydown-ONE', () => { if (this.choosing) this.upgradePick?.(0); else this.switchWeapon('pistol'); });
    kb.on('keydown-TWO', () => { if (this.choosing) this.upgradePick?.(1); else this.switchWeapon('shotgun'); });
    kb.on('keydown-THREE', () => { if (this.choosing) this.upgradePick?.(2); else this.switchWeapon('rifle'); });
    this.input.on('pointerdown', () => audio.ensure());

    this.hud.message(this, 'WAVE 1 INCOMING', '#e74c3c');
  }

  // ---------- combat ----------

  private onBulletHit(a: unknown, b: unknown): void {
    const bullet = a as Phaser.Physics.Arcade.Sprite;
    const z = (b as Phaser.Physics.Arcade.Sprite).getData('z') as Zombie | undefined;
    if (!bullet.active || !z || !z.sprite.active || this.over) return;
    const dmg = (bullet.getData('damage') as number) ?? 0;
    bullet.disableBody(true, true);
    audio.hit();
    if (z.takeDamage(this, dmg)) this.killZombie(z);
  }

  private onBite(zObj: unknown): void {
    const z = (zObj as Phaser.Physics.Arcade.Sprite).getData('z') as Zombie | undefined;
    if (!z || !z.sprite.active || this.over || this.paused || this.choosing) return;
    const now = this.time.now;
    if (now < z.biteReadyMs) return;
    z.biteReadyMs = now + BITE_COOLDOWN_MS;
    this.hp -= z.damage;
    audio.hurt();
    this.cameras.main.shake(120, 0.004);
    if (this.hp <= 0) this.die();
  }

  private killZombie(z: Zombie): void {
    this.zombies = this.zombies.filter((o) => o !== z);
    const base = ZOMBIE_BASE[z.type];
    this.score += base.score;
    this.kills += 1;
    this.xp += xpForKill(z.type);
    if (this.stats.lifesteal > 0) this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.lifesteal);
    this.burst(z.sprite.x, z.sprite.y, 0xc0392b, 6);
    z.destroy();
    // drop: xp เสมอ + ไอเทม 10%
    new Pickup(this, this.gemGroup, 'xp', z.sprite.x, z.sprite.y, z.xp);
    if (Math.random() < 0.1) {
      const r = Math.random();
      const kind: PickupKind = r < 0.35 ? 'health' : r < 0.75 ? 'ammo' : 'bomb';
      new Pickup(this, this.pickupGroup, kind, z.sprite.x, z.sprite.y);
    }
    while (this.xp >= xpNeeded(this.level)) {
      this.xp -= xpNeeded(this.level);
      this.level += 1;
      this.pendingLevels += 1;
    }
    if (this.pendingLevels > 0 && !this.choosing) this.openUpgrade();
  }

  private onPickup(pkObj: unknown): void {
    const pk = (pkObj as Phaser.Physics.Arcade.Sprite).getData('pickup') as Pickup | undefined;
    if (!pk || !pk.sprite.active || this.over) return;
    pk.sprite.disableBody(true, true);
    audio.pickup();
    if (pk.kind === 'health') {
      this.hp = Math.min(this.stats.maxHp, this.hp + 30);
      this.hud.message(this, '+30 HP', '#2ecc71');
    } else if (pk.kind === 'ammo') {
      addReserve(this.weapons.shotgun, 12);
      addReserve(this.weapons.rifle, 30);
      this.hud.message(this, '+AMMO', '#f39c12');
    } else {
      this.bombs = Math.min(MAX_BOMBS, this.bombs + 1);
      this.hud.message(this, '+BOMB', '#e74c3c');
    }
  }

  private onGem(gObj: unknown): void {
    const pk = (gObj as Phaser.Physics.Arcade.Sprite).getData('pickup') as Pickup | undefined;
    if (!pk || !pk.sprite.active || this.over) return;
    pk.sprite.disableBody(true, true);
    this.score += 2;
  }

  private hurtCheck(): void {
    if (this.hp <= 0 && !this.over) this.die();
  }

  private die(): void {
    this.over = true;
    this.physics.world.pause();
    audio.gameover();
    this.cameras.main.shake(300, 0.01);
    const best = loadBest(localStorage);
    if (this.score > best) saveBest(localStorage, this.score);
    this.time.delayedCall(900, () => {
      this.scene.start('GameOver', { score: this.score, wave: this.wave.wave, kills: this.kills });
    });
  }

  // ---------- weapons ----------

  private switchWeapon(key: WeaponKey): void {
    if (this.over || this.paused || this.choosing) return;
    if (key === 'shotgun' && this.wave.wave < 2) { this.hud.message(this, 'SHOTGUN ปลดล็อกเวฟ 2', '#abb2bf'); return; }
    if (key === 'rifle' && this.wave.wave < 3) { this.hud.message(this, 'RIFLE ปลดล็อกเวฟ 3', '#abb2bf'); return; }
    this.current = key;
  }

  private tryFire(now: number): void {
    const state = this.weapons[this.current];
    const res = fireWeapon(state, now, this.stats.damageMul);
    if (!res.ok) {
      if (res.reason === 'empty') {
        audio.empty();
        if (startReload(state, now, this.stats.reloadMul)) audio.reload();
      }
      return;
    }
    const def = WEAPONS[this.current];
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const tipX = px + Math.cos(this.aimAngle) * 28;
    const tipY = py + Math.sin(this.aimAngle) * 28;
    for (const angle of pelletAngles(this.aimAngle, res.pellets, def.spreadRad)) {
      const b = this.bulletGroup.get(tipX, tipY, 'bullet') as Phaser.Physics.Arcade.Sprite | null;
      if (!b) break;
      b.enableBody(true, tipX, tipY, true, true);
      b.setVelocity(Math.cos(angle) * def.bulletSpeed, Math.sin(angle) * def.bulletSpeed);
      b.setRotation(angle);
      b.setData('damage', res.damage);
      b.setData('life', 1200);
      b.setDepth(8);
    }
    this.flash.setPosition(tipX, tipY).setScale(0.7 + Math.random() * 0.5).setAlpha(1).setRotation(this.aimAngle);
    this.tweens.killTweensOf(this.flash);
    this.tweens.add({ targets: this.flash, alpha: 0, duration: 60 });
    audio.shoot(this.current);
  }

  private tryBomb(): void {
    if (this.over || this.paused || this.choosing) return;
    if (this.bombs <= 0) { audio.empty(); this.hud.message(this, 'ไม่มีระเบิด!', '#abb2bf'); return; }
    this.bombs -= 1;
    audio.explode();
    this.cameras.main.shake(250, 0.012);
    this.cameras.main.flash(150, 255, 220, 150);
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    this.burst(px, py, 0xf39c12, 16, BOMB_RADIUS);
    const dead: Zombie[] = [];
    for (const z of this.zombies) {
      if (!z.sprite.active) continue;
      if (Phaser.Math.Distance.Between(px, py, z.sprite.x, z.sprite.y) <= BOMB_RADIUS) {
        if (z.takeDamage(this, BOMB_DAMAGE * this.stats.damageMul)) dead.push(z);
      }
    }
    dead.forEach((z) => this.killZombie(z));
  }

  // ---------- waves / spawn ----------

  private spawnZombie(type: ZombieType): void {
    const { width, height } = this.scale;
    const side = Math.floor(Math.random() * 4);
    const m = 24;
    let x = m;
    let y = m;
    if (side === 0) { x = m + Math.random() * (width - 2 * m); y = m; }
    else if (side === 1) { x = m + Math.random() * (width - 2 * m); y = height - m; }
    else if (side === 2) { x = m; y = m + Math.random() * (height - 2 * m); }
    else { x = width - m; y = m + Math.random() * (height - 2 * m); }
    const z = new Zombie(this, type, x, y, this.wave.hpScaleNow());
    this.zombieGroup.add(z.sprite);
    this.zombies.push(z);
  }

  // ---------- upgrade / pause ----------

  private openUpgrade(): void {
    this.choosing = true;
    this.physics.world.pause();
    audio.levelup();
    const upgrades = rollUpgrades();
    this.upgradePick = (i: number) => {
      const u: Upgrade | undefined = upgrades[i];
      if (!u) return;
      const { stats, heal } = applyUpgrade(this.stats, u.id);
      this.stats = stats;
      this.player.speed = stats.speed;
      this.hp = Math.min(this.stats.maxHp, this.hp + heal);
      this.pendingLevels -= 1;
      audio.pickup();
      if (this.pendingLevels > 0) {
        this.openUpgrade();
      } else {
        this.choosing = false;
        this.upgradePick = null;
        this.hud.hideOverlay();
        this.physics.world.resume();
      }
    };
    this.hud.showUpgrades(this, upgrades, (id) => {
      const i = upgrades.findIndex((u) => u.id === id);
      this.upgradePick?.(Math.max(0, i));
    });
  }

  private togglePause(): void {
    if (this.over || this.choosing) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.world.pause();
      this.hud.showPause(
        this,
        () => this.togglePause(),
        () => this.scene.start('Menu'),
      );
    } else {
      this.hud.hideOverlay();
      this.physics.world.resume();
    }
  }

  // ---------- particles ----------

  private burst(x: number, y: number, tint: number, n: number, spread = 60): void {
    for (let i = 0; i < n; i++) {
      if (this.particles.length > 140) break;
      const img = this.add.image(x, y, 'blood').setTint(tint).setDepth(7);
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * spread * 2;
      this.particles.push({ img, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 350, maxLife: 350 });
    }
  }

  // ---------- main loop ----------

  update(_time: number, delta: number): void {
    if (this.over || this.paused || this.choosing) return;
    const now = this.time.now;
    const dt = delta / 1000;

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;
    this.player.move(
      {
        x: (right ? 1 : 0) - (left ? 1 : 0),
        y: (down ? 1 : 0) - (up ? 1 : 0),
        sprint: this.cursors.shift.isDown,
      },
      dt,
    );

    const pointer = this.input.activePointer;
    this.aimAngle = this.player.aimAt(pointer.worldX, pointer.worldY);
    if (pointer.leftButtonDown()) this.tryFire(now);
    const rightDown = pointer.rightButtonDown();
    if (rightDown && !this.rightWasDown) this.tryBomb();
    this.rightWasDown = rightDown;

    updateWeapon(this.weapons[this.current], now);
    this.player.updatePose(this.current, this.weapons[this.current].reloading);
    this.hurtCheck();

    for (const e of this.wave.update(delta, this.zombies.length)) {
      if (e.kind === 'spawn') this.spawnZombie(e.zombie);
      else if (e.kind === 'waveStart') {
        audio.wave();
        let msg = `WAVE ${e.wave}`;
        if (e.wave === 2) msg += ' — SHOTGUN UNLOCKED (กด 2)';
        if (e.wave === 3) msg += ' — RIFLE UNLOCKED (กด 3)';
        this.hud.message(this, msg, '#e74c3c');
      } else {
        this.score += e.bonus;
        this.hud.message(this, `WAVE ${e.wave} CLEAR! +${e.bonus}`, '#2ecc71');
        audio.levelup();
      }
    }

    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    for (const z of this.zombies) {
      if (z.sprite.active) z.chase(px, py);
    }
    this.separate(dt);

    // กระสุนหมดอายุ/ออกจอ
    for (const child of [...this.bulletGroup.getChildren()]) {
      const b = child as Phaser.Physics.Arcade.Sprite;
      if (!b.active) continue;
      const life = ((b.getData('life') as number) ?? 0) - delta;
      b.setData('life', life);
      if (life <= 0 || b.x < -20 || b.x > this.scale.width + 20 || b.y < -20 || b.y > this.scale.height + 20) {
        b.disableBody(true, true);
      }
    }

    // ดูด xp
    for (const child of this.gemGroup.getChildren()) {
      const g = child as Phaser.Physics.Arcade.Sprite;
      if (!g.active) continue;
      const d = Phaser.Math.Distance.Between(px, py, g.x, g.y);
      if (d < 120) {
        const a = Math.atan2(py - g.y, px - g.x);
        g.setVelocity(Math.cos(a) * 300, Math.sin(a) * 300);
      }
    }

    // particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      if (p.life <= 0) { p.img.destroy(); this.particles.splice(i, 1); continue; }
      p.img.x += p.vx * dt;
      p.img.y += p.vy * dt;
      p.img.setAlpha(p.life / p.maxLife);
    }

    const w = this.weapons[this.current];
    this.hud.update({
      hp: this.hp, maxHp: this.stats.maxHp, stamina: this.player.stamina,
      mag: w.mag, reserve: w.reserve, reloading: w.reloading,
      weaponName: WEAPONS[this.current].name,
      shotgunLocked: this.wave.wave < 2, rifleLocked: this.wave.wave < 3,
      wave: this.wave.wave, score: this.score, kills: this.kills, bombs: this.bombs,
      level: this.level, xp: this.xp, xpNeed: xpNeeded(this.level), muted: audio.muted,
    });
  }

  private separate(dt: number): void {
    const list = this.zombies;
    const min = 24;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (!a.sprite.active) continue;
      for (let j = i + 1; j < list.length; j++) {
        const b = list[j];
        if (!b.sprite.active) continue;
        const dx = b.sprite.x - a.sprite.x;
        const dy = b.sprite.y - a.sprite.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.01 && d2 < min * min) {
          const d = Math.sqrt(d2);
          const push = ((min - d) / d) * 40 * dt;
          const nx = dx / d;
          const ny = dy / d;
          a.sprite.x -= nx * push;
          a.sprite.y -= ny * push;
          b.sprite.x += nx * push;
          b.sprite.y += ny * push;
        }
      }
    }
  }
}

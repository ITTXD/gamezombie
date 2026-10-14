import Phaser from 'phaser';
import { loadBest, saveBest } from '../systems/score';

interface GameOverData {
  score: number;
  wave: number;
  kills: number;
}

export class GameOverScene extends Phaser.Scene {
  private data_: GameOverData = { score: 0, wave: 1, kills: 0 };

  constructor() {
    super('GameOver');
  }

  init(data: GameOverData): void {
    this.data_ = data;
  }

  create(): void {
    const { width, height } = this.scale;
    const prevBest = loadBest(localStorage);
    const isBest = this.data_.score > prevBest;
    if (isBest) saveBest(localStorage, this.data_.score);
    const best = loadBest(localStorage);

    this.add.image(width / 2, 110, 'z-walker').setScale(3);
    this.add
      .text(width / 2, 200, 'YOU DIED', { fontSize: '54px', color: '#e74c3c' })
      .setOrigin(0.5);
    this.add
      .text(
        width / 2, 270,
        `Score ${this.data_.score}   •   Wave ${this.data_.wave}   •   Kills ${this.data_.kills}\nBest ${best}${isBest ? '  <- NEW!' : ''}`,
        { fontSize: '20px', color: '#f5f5f5', align: 'center', lineSpacing: 8 },
      )
      .setOrigin(0.5);
    this.add
      .text(width / 2, 360, 'R / คลิก เริ่มใหม่   •   Esc เมนู', { fontSize: '18px', color: '#2ecc71' })
      .setOrigin(0.5);

    const restart = () => this.scene.start('Game');
    const menu = () => this.scene.start('Menu');
    this.input.once('pointerdown', restart);
    this.input.keyboard?.once('keydown-R', restart);
    this.input.keyboard?.once('keydown-ENTER', restart);
    this.input.keyboard?.once('keydown-ESC', menu);
  }
}

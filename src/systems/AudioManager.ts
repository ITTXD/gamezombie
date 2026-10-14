/** เสียงสังเคราะห์ด้วย WebAudio — ไม่ต้องใช้ไฟล์เสียง */
class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  muted = false;

  ensure(): void {
    try {
      if (!this.ctx) {
        const AC = window.AudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.15;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
    } catch {
      /* ไม่มี audio ก็เล่นต่อได้ */
    }
  }

  toggle(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  private tone(freq: number, durMs: number, type: OscillatorType, vol: number, slideTo = 0, delayMs = 0): void {
    if (this.muted) return;
    this.ensure();
    if (!this.ctx || !this.master) return;
    try {
      const t0 = this.ctx.currentTime + delayMs / 1000;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo > 0) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + durMs / 1000);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + durMs / 1000);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t0);
      osc.stop(t0 + durMs / 1000 + 0.02);
    } catch {
      /* เงียบไว้ */
    }
  }

  shoot(weapon: string): void {
    if (weapon === 'shotgun') this.tone(150, 150, 'sawtooth', 0.5, 60);
    else if (weapon === 'rifle') this.tone(900, 60, 'square', 0.25, 300);
    else this.tone(700, 80, 'square', 0.3, 200);
  }
  empty(): void { this.tone(1200, 30, 'square', 0.12); }
  reload(): void { this.tone(1200, 40, 'square', 0.2); this.tone(800, 40, 'square', 0.2, 0, 90); }
  hit(): void { this.tone(220, 50, 'triangle', 0.3, 120); }
  hurt(): void { this.tone(160, 200, 'sawtooth', 0.4, 80); }
  explode(): void { this.tone(90, 500, 'sine', 0.7, 35); this.tone(60, 400, 'sawtooth', 0.3, 30, 30); }
  pickup(): void { this.tone(880, 90, 'sine', 0.35, 1320); }
  levelup(): void {
    this.tone(523, 90, 'square', 0.25);
    this.tone(659, 90, 'square', 0.25, 0, 90);
    this.tone(784, 140, 'square', 0.25, 0, 180);
  }
  wave(): void { this.tone(330, 300, 'square', 0.25, 660); }
  gameover(): void { this.tone(400, 800, 'sawtooth', 0.35, 90); }
}

export const audio = new AudioManager();

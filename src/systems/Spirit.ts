import Phaser from 'phaser';

export class Spirit {
  readonly container: Phaser.GameObjects.Container;
  private glow: Phaser.GameObjects.Graphics;
  private core: Phaser.GameObjects.Graphics;
  private tail: Phaser.GameObjects.Graphics;
  private trail: Phaser.GameObjects.Particles.ParticleEmitter;
  private _vx = 0;
  private _vy = 0;
  private wavePhase = 0;
  private smoothVx = 0;
  private smoothVy = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.container = scene.add.container(x, y).setDepth(10);

    // Outer glow halo
    this.glow = scene.add.graphics();
    this.glow.fillStyle(0x90c0ff, 0.06);
    this.glow.fillCircle(0, 0, 46);
    this.glow.fillStyle(0xb0d8ff, 0.10);
    this.glow.fillCircle(0, 0, 28);

    // Tail (drawn before core so core appears on top)
    this.tail = scene.add.graphics();
    this.drawTail(0, 0, 0);

    // Core orb
    this.core = scene.add.graphics();
    this.drawCore(false);

    this.container.add([this.glow, this.tail, this.core]);

    // Ghostly particle trail
    this.trail = scene.add.particles(x, y, '__DEFAULT', {
      speed: { min: 2, max: 12 },
      scale: { start: 0.18, end: 0 },
      alpha: { start: 0.45, end: 0 },
      lifespan: 600,
      quantity: 1,
      tint: [0x90c8f8, 0xb8d8ff, 0xe0f0ff],
      blendMode: Phaser.BlendModes.ADD,
    }).setDepth(9);

    // Ambient pulse on glow
    scene.tweens.add({
      targets: this.glow,
      scaleX: { from: 1, to: 1.22 },
      scaleY: { from: 1, to: 1.22 },
      alpha: { from: 1, to: 0.6 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawCore(liftActive: boolean): void {
    this.core.clear();
    this.core.fillStyle(0xffffff, 0.95);
    this.core.fillCircle(0, 0, 5);
    this.core.fillStyle(0xc8e8ff, 0.55);
    this.core.fillCircle(0, 0, 9);
    if (liftActive) {
      this.core.fillStyle(0xffffff, 0.25);
      this.core.fillCircle(0, 0, 14);
    }
  }

  /**
   * Draw a flowing ghost tail extending opposite to (vx, vy).
   * wavePhase drives the perpendicular undulation.
   */
  private drawTail(vx: number, vy: number, wavePhase: number): void {
    this.tail.clear();

    const speed = Math.sqrt(vx * vx + vy * vy);
    const tailLen = Math.max(10, 14 + speed * 3.2);

    // Direction the tail extends (opposite velocity)
    let tdx: number, tdy: number;
    if (speed < 0.2) {
      // Idle: gentle downward sway
      tdx = Math.sin(wavePhase * 0.6) * 6;
      tdy = tailLen * 0.7;
    } else {
      const inv = 1 / speed;
      tdx = -vx * inv * tailLen;
      tdy = -vy * inv * tailLen;
    }

    // Perpendicular unit vector for wave
    const pLen = Math.sqrt(tdx * tdx + tdy * tdy);
    const pUx = pLen > 0 ? -tdy / pLen : 1;
    const pUy = pLen > 0 ?  tdx / pLen : 0;
    const wave = Math.sin(wavePhase) * (2.5 + speed * 0.4);

    // Midpoint with wave offset
    const mx = tdx * 0.5 + pUx * wave;
    const my = tdy * 0.5 + pUy * wave;

    // Tip with reduced wave
    const tx = tdx + pUx * wave * 0.35;
    const ty = tdy + pUy * wave * 0.35;

    const halfW = 5.5;

    // ── Outer tail body ─────────────────────────────────
    this.tail.fillStyle(0x90c0f8, 0.20);
    this.tail.fillPoints([
      { x: -halfW,            y: 0 },
      { x: mx + pUx * halfW,  y: my + pUy * halfW },
      { x: tx,                y: ty },
      { x: mx - pUx * halfW,  y: my - pUy * halfW },
      { x:  halfW,            y: 0 },
    ], true);

    // ── Inner brighter core of tail ──────────────────────
    const innerW = 2.8;
    this.tail.fillStyle(0xc8e4ff, 0.16);
    this.tail.fillPoints([
      { x: -innerW,           y: 0 },
      { x: mx + pUx * innerW, y: my + pUy * innerW },
      { x: tx * 0.82,         y: ty * 0.82 },
      { x: mx - pUx * innerW, y: my - pUy * innerW },
      { x:  innerW,           y: 0 },
    ], true);

    // ── Wispy tip wisps ──────────────────────────────────
    this.tail.fillStyle(0xa8d0ff, 0.12);
    this.tail.fillCircle(tx,                    ty,                    4.5);
    this.tail.fillStyle(0xb8d8ff, 0.09);
    this.tail.fillCircle(tx + pUx * 5,          ty + pUy * 5,          2.8);
    this.tail.fillCircle(tx - pUx * 5,          ty - pUy * 5,          2.8);
  }

  get x(): number  { return this.container.x; }
  get y(): number  { return this.container.y; }
  set x(v: number) { this.container.x = v; }
  set y(v: number) { this.container.y = v; }

  get vx(): number  { return this._vx; }
  get vy(): number  { return this._vy; }
  set vx(v: number) { this._vx = v; }
  set vy(v: number) { this._vy = v; }

  update(liftActive: boolean): void {
    // Smooth velocity for tail drawing (avoids jitter)
    this.smoothVx += (this._vx - this.smoothVx) * 0.14;
    this.smoothVy += (this._vy - this.smoothVy) * 0.14;

    // Advance wave (slower = more ethereal)
    this.wavePhase += 0.045;

    this.drawTail(this.smoothVx, this.smoothVy, this.wavePhase);
    this.drawCore(liftActive);

    // Subtle lean in direction of travel
    this.container.rotation = Phaser.Math.Clamp(this._vx * 0.025, -0.22, 0.22);

    // Trail follows container position
    this.trail.setPosition(this.container.x, this.container.y);
  }

  destroy(): void {
    this.container.destroy();
    this.trail.destroy();
  }
}

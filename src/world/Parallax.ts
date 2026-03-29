import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from './WorldConfig';

export class Parallax {
  private scene: Phaser.Scene;
  private dayNightProgress = 0;
  private sky!: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createSky();
    this.createDistantMountains();
    this.createCloudLayers();
  }

  private createSky(): void {
    this.sky = this.scene.add.graphics()
      .setDepth(-20)
      .setScrollFactor(0); // fixed to camera
    this.drawSky(0.05);
  }

  private drawSky(t: number): void {
    const { width, height } = this.scene.scale;
    this.sky.clear();

    // Sky color keyframes: [progress, r, g, b]
    // Full cycle: night → pre-dawn → sunrise → day → sunset → dusk → night
    const skyPhases: Array<[number, number, number, number]> = [
      [0.00,   8,  10,  22], // night
      [0.22,   8,  10,  22], // night hold
      [0.30,  40,  18,  55], // pre-dawn (deep violet)
      [0.40, 210,  95,  55], // sunrise (warm orange-pink)
      [0.50, 140, 180, 240], // day (sky blue)
      [0.62, 140, 180, 240], // day hold
      [0.72, 215,  88,  38], // sunset (orange-red)
      [0.82,  28,  14,  30], // dusk (deep violet)
      [1.00,   8,  10,  22], // night again
    ];

    // Horizon glow keyframes: [progress, r, g, b, alpha]
    const glowPhases: Array<[number, number, number, number, number]> = [
      [0.00, 255, 100,  60, 0.00],
      [0.25, 255, 100,  60, 0.00],
      [0.33, 255,  80,  30, 0.22],
      [0.42, 255, 140,  80, 0.42],
      [0.50, 255, 160, 100, 0.10],
      [0.62, 255, 160, 100, 0.08],
      [0.72, 255,  75,  25, 0.42],
      [0.82, 200,  40,  20, 0.18],
      [1.00, 255, 100,  60, 0.00],
    ];

    const sky = this.lerpPhases(skyPhases, t);
    this.sky.fillStyle(Phaser.Display.Color.GetColor(sky.r, sky.g, sky.b), 1);
    this.sky.fillRect(0, 0, width, height);

    const glow = this.lerpGlowPhases(glowPhases, t);
    if (glow.a > 0.01) {
      this.sky.fillStyle(Phaser.Display.Color.GetColor(glow.r, glow.g, glow.b), glow.a);
      this.sky.fillEllipse(width / 2, height * 0.62, width * 1.2, height * 0.55);
    }
  }

  // Smoothstep interpolation through color keyframes [t, r, g, b]
  private lerpPhases(
    phases: Array<[number, number, number, number]>,
    t: number,
  ): { r: number; g: number; b: number } {
    for (let i = 0; i < phases.length - 1; i++) {
      const [t0, r0, g0, b0] = phases[i];
      const [t1, r1, g1, b1] = phases[i + 1];
      if (t >= t0 && t <= t1) {
        const f = (t - t0) / (t1 - t0);
        const s = f * f * (3 - 2 * f); // smoothstep
        return {
          r: Math.round(r0 + (r1 - r0) * s),
          g: Math.round(g0 + (g1 - g0) * s),
          b: Math.round(b0 + (b1 - b0) * s),
        };
      }
    }
    const last = phases[phases.length - 1];
    return { r: last[1], g: last[2], b: last[3] };
  }

  // Smoothstep interpolation through glow keyframes [t, r, g, b, alpha]
  private lerpGlowPhases(
    phases: Array<[number, number, number, number, number]>,
    t: number,
  ): { r: number; g: number; b: number; a: number } {
    for (let i = 0; i < phases.length - 1; i++) {
      const [t0, r0, g0, b0, a0] = phases[i];
      const [t1, r1, g1, b1, a1] = phases[i + 1];
      if (t >= t0 && t <= t1) {
        const f = (t - t0) / (t1 - t0);
        const s = f * f * (3 - 2 * f);
        return {
          r: Math.round(r0 + (r1 - r0) * s),
          g: Math.round(g0 + (g1 - g0) * s),
          b: Math.round(b0 + (b1 - b0) * s),
          a: a0 + (a1 - a0) * s,
        };
      }
    }
    const last = phases[phases.length - 1];
    return { r: last[1], g: last[2], b: last[3], a: last[4] };
  }

  private createDistantMountains(): void {
    const W = WORLD_WIDTH;
    const H = WORLD_HEIGHT;
    // Two mountain layers at different scroll factors
    this.drawMountainLayer(W, H, 0.05, 0x0e1520, 0.7, -15);
    this.drawMountainLayer(W, H, 0.12, 0x151f2a, 0.6, -12);
  }

  private drawMountainLayer(W: number, H: number, scrollFactor: number, color: number, alpha: number, depth: number): void {
    const gfx = this.scene.add.graphics().setDepth(depth).setScrollFactor(scrollFactor);
    gfx.fillStyle(color, alpha);
    // Draw peaks across entire world width
    const segW = 300;
    const peaks: { x: number; y: number }[] = [{ x: 0, y: H * 0.75 }];
    for (let x = 0; x <= W + segW; x += segW) {
      peaks.push({ x, y: H * (0.35 + Math.random() * 0.25) });
      peaks.push({ x: x + segW / 2, y: H * (0.5 + Math.random() * 0.2) });
    }
    peaks.push({ x: W + 100, y: H * 0.75 }, { x: W + 100, y: H + 100 }, { x: 0, y: H + 100 });
    gfx.fillPoints(peaks, true);
  }

  private createCloudLayers(): void {
    const cloudDefs = [
      { scrollFactor: 0.08, count: 12, depth: -10, alpha: 0.1, sizeScale: 1.4 },
      { scrollFactor: 0.2,  count: 10, depth: -8,  alpha: 0.12, sizeScale: 1.0 },
      { scrollFactor: 0.4,  count: 8,  depth: -5,  alpha: 0.14, sizeScale: 0.7 },
    ];

    for (const def of cloudDefs) {
      for (let i = 0; i < def.count; i++) {
        const gfx = this.scene.add.graphics()
          .setDepth(def.depth)
          .setScrollFactor(def.scrollFactor);
        const x = Math.random() * WORLD_WIDTH * def.scrollFactor;
        const y = WORLD_HEIGHT * 0.05 + Math.random() * WORLD_HEIGHT * 0.45 * def.scrollFactor;
        const size = (60 + Math.random() * 80) * def.sizeScale;
        gfx.fillStyle(0xffffff, def.alpha + Math.random() * 0.05);
        gfx.fillEllipse(x, y, size * 2.2, size * 0.55);
        gfx.fillEllipse(x - size * 0.3, y - size * 0.18, size * 1.3, size * 0.48);
        gfx.fillEllipse(x + size * 0.32, y - size * 0.14, size * 1.1, size * 0.42);

        // Slow drift tween
        this.scene.tweens.add({
          targets: gfx,
          x: `+=${30 + Math.random() * 60}`,
          duration: 20000 + Math.random() * 20000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    }
  }

  update(_px: number, _py: number): void {
    // Day/night
    this.dayNightProgress = (this.dayNightProgress + 0.00005) % 1;
    this.drawSky(this.dayNightProgress);
  }
}

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
    // Night to dawn to day gradient
    const r = Math.floor(Phaser.Math.Linear(8, 140, t));
    const g = Math.floor(Phaser.Math.Linear(8, 180, t));
    const b = Math.floor(Phaser.Math.Linear(22, 240, t));
    this.sky.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
    this.sky.fillRect(0, 0, width, height);

    // Soft horizon glow
    this.sky.fillStyle(0xffa060, Math.sin(t * Math.PI) * 0.18);
    this.sky.fillEllipse(width / 2, height * 0.55, width * 1.2, height * 0.5);
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

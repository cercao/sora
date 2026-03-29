import Phaser from 'phaser';
import { BiomeDefinition } from './WorldConfig';

export class Island {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene, biomes: BiomeDefinition[]) {
    this.scene = scene;
    for (const biome of biomes) {
      this.drawBiome(biome);
    }
  }

  private drawBiome(biome: BiomeDefinition): void {
    switch (biome.theme) {
      case 'origin': this.drawOrigin(biome); break;
      case 'canopy': this.drawCanopy(biome); break;
      case 'ruins':  this.drawRuins(biome);  break;
      case 'cloud':  this.drawCloud(biome);  break;
      case 'ember':  this.drawEmber(biome);  break;
    }
  }

  // ── Origin ─────────────────────────────────────────────
  private drawOrigin(b: BiomeDefinition): void {
    const gfx = this.scene.add.graphics();

    // Underside rocky mass
    gfx.fillStyle(0x2a3020, 1);
    gfx.fillEllipse(b.wx, b.wy + b.islandHeight * 0.4, b.islandWidth * 0.85, b.islandHeight * 0.6);

    // Main body
    gfx.fillStyle(0x3d5a2e, 1);
    gfx.fillEllipse(b.wx, b.wy, b.islandWidth, b.islandHeight);

    // Top grass
    gfx.fillStyle(0x78b84a, 1);
    gfx.fillEllipse(b.wx, b.wy - b.islandHeight * 0.18, b.islandWidth * 0.88, b.islandHeight * 0.45);

    // Highlight
    gfx.fillStyle(0xa0d060, 0.4);
    gfx.fillEllipse(b.wx - b.islandWidth * 0.1, b.wy - b.islandHeight * 0.28, b.islandWidth * 0.4, b.islandHeight * 0.25);

    this.addTrees(b.wx, b.wy - b.islandHeight * 0.3, b.islandWidth * 0.7, 7, 0x2d5a20, 0x4a8030);
    this.addFlowers(b.wx, b.wy - b.islandHeight * 0.25, b.islandWidth * 0.75);
    this.addIslandGlow(b.wx, b.wy, b.islandWidth, 0x78b84a);
  }

  // ── Canopy ─────────────────────────────────────────────
  private drawCanopy(b: BiomeDefinition): void {
    const gfx = this.scene.add.graphics();

    gfx.fillStyle(0x1a2a18, 1);
    gfx.fillEllipse(b.wx, b.wy + b.islandHeight * 0.4, b.islandWidth * 0.85, b.islandHeight * 0.6);

    gfx.fillStyle(0x1e3822, 1);
    gfx.fillEllipse(b.wx, b.wy, b.islandWidth, b.islandHeight);

    gfx.fillStyle(0x2d6e4e, 1);
    gfx.fillEllipse(b.wx, b.wy - b.islandHeight * 0.2, b.islandWidth * 0.9, b.islandHeight * 0.5);

    // Dense tall trees
    this.addTrees(b.wx, b.wy - b.islandHeight * 0.3, b.islandWidth * 0.8, 9, 0x1a4020, 0x2d6e4e, true);

    // Firefly particles
    this.addFireflies(b.wx, b.wy, b.islandWidth, b.islandHeight);
    this.addIslandGlow(b.wx, b.wy, b.islandWidth, 0x2d6e4e);
  }

  // ── Ruins ──────────────────────────────────────────────
  private drawRuins(b: BiomeDefinition): void {
    const gfx = this.scene.add.graphics();

    gfx.fillStyle(0x2a2020, 1);
    gfx.fillEllipse(b.wx, b.wy + b.islandHeight * 0.4, b.islandWidth * 0.85, b.islandHeight * 0.6);

    gfx.fillStyle(0x4a3c30, 1);
    gfx.fillEllipse(b.wx, b.wy, b.islandWidth, b.islandHeight);

    gfx.fillStyle(0x6a5a48, 1);
    gfx.fillEllipse(b.wx, b.wy - b.islandHeight * 0.15, b.islandWidth * 0.88, b.islandHeight * 0.4);

    // Stone blocks
    this.addStoneBlocks(b.wx, b.wy - b.islandHeight * 0.25, b.islandWidth * 0.7);
    // Moss patches
    this.addMoss(b.wx, b.wy - b.islandHeight * 0.2, b.islandWidth * 0.6);
    // Floating dust particles
    this.addDust(b.wx, b.wy, b.islandWidth, b.islandHeight);
    this.addIslandGlow(b.wx, b.wy, b.islandWidth, 0x8a7060);
  }

  // ── Cloud ──────────────────────────────────────────────
  private drawCloud(b: BiomeDefinition): void {
    const gfx = this.scene.add.graphics();

    // Wispy cloud-island — barely any solid ground
    gfx.fillStyle(0xd0e8f8, 0.15);
    gfx.fillEllipse(b.wx, b.wy + b.islandHeight * 0.3, b.islandWidth * 0.9, b.islandHeight * 0.5);

    gfx.fillStyle(0xe8f4ff, 0.5);
    gfx.fillEllipse(b.wx, b.wy, b.islandWidth, b.islandHeight);

    gfx.fillStyle(0xffffff, 0.7);
    gfx.fillEllipse(b.wx, b.wy - b.islandHeight * 0.2, b.islandWidth * 0.85, b.islandHeight * 0.4);

    // Cloud wisps
    for (let i = 0; i < 5; i++) {
      const wx = b.wx + (-b.islandWidth * 0.4 + Math.random() * b.islandWidth * 0.8);
      const wy = b.wy - b.islandHeight * 0.1 + Math.random() * b.islandHeight * 0.2;
      gfx.fillStyle(0xffffff, 0.3 + Math.random() * 0.3);
      gfx.fillEllipse(wx, wy, 60 + Math.random() * 80, 20 + Math.random() * 20);
    }

    this.addIslandGlow(b.wx, b.wy, b.islandWidth, 0xb0d8f0);
  }

  // ── Ember ──────────────────────────────────────────────
  private drawEmber(b: BiomeDefinition): void {
    const gfx = this.scene.add.graphics();

    gfx.fillStyle(0x1a0a08, 1);
    gfx.fillEllipse(b.wx, b.wy + b.islandHeight * 0.4, b.islandWidth * 0.85, b.islandHeight * 0.6);

    gfx.fillStyle(0x3a1808, 1);
    gfx.fillEllipse(b.wx, b.wy, b.islandWidth, b.islandHeight);

    gfx.fillStyle(0x602010, 1);
    gfx.fillEllipse(b.wx, b.wy - b.islandHeight * 0.15, b.islandWidth * 0.88, b.islandHeight * 0.4);

    // Lava cracks
    this.addLavaCracks(b.wx, b.wy - b.islandHeight * 0.1, b.islandWidth * 0.6, b);
    // Ember particles
    this.addEmbers(b.wx, b.wy, b.islandWidth, b.islandHeight);
    this.addIslandGlow(b.wx, b.wy, b.islandWidth, 0xc05020);
  }

  // ── Helpers ────────────────────────────────────────────

  private addTrees(cx: number, cy: number, spread: number, count: number, trunkColor: number, leafColor: number, tall = false): void {
    for (let i = 0; i < count; i++) {
      const tx = cx - spread / 2 + (i / Math.max(count - 1, 1)) * spread;
      const th = (tall ? 28 : 18) + Math.random() * 14;
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0x5a3a20, 1);
      gfx.fillRect(tx - 2, cy, 4, th * 0.55);
      gfx.fillStyle(trunkColor, 1);
      gfx.fillCircle(tx, cy, th * 0.55);
      gfx.fillStyle(leafColor, 0.8);
      gfx.fillCircle(tx - 4, cy - 4, th * 0.38);
    }
  }

  private addFlowers(cx: number, cy: number, spread: number): void {
    const colors = [0xffb0c0, 0xffd080, 0xffffff, 0xa0e0ff];
    for (let i = 0; i < 12; i++) {
      const fx = cx + (-spread / 2 + Math.random() * spread);
      const fy = cy + Math.random() * 10;
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(colors[Math.floor(Math.random() * colors.length)], 0.8);
      gfx.fillCircle(fx, fy, 3);
    }
  }

  private addFireflies(cx: number, cy: number, spread: number, h: number): void {
    for (let i = 0; i < 8; i++) {
      const fx = cx + (-spread / 2 + Math.random() * spread);
      const fy = cy - h * 0.1 + Math.random() * h * (-0.5);
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0x80ff80, 1);
      gfx.fillCircle(fx, fy, 2);
      this.scene.tweens.add({
        targets: gfx,
        alpha: { from: 0, to: 0.9 },
        duration: 800 + Math.random() * 1200,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
      });
    }
  }

  private addStoneBlocks(cx: number, cy: number, spread: number): void {
    const blockDefs = [
      { ox: -spread * 0.35, w: 40, h: 22 },
      { ox: -spread * 0.1,  w: 28, h: 35 },
      { ox:  spread * 0.2,  w: 50, h: 18 },
      { ox:  spread * 0.4,  w: 22, h: 28 },
    ];
    for (const bd of blockDefs) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0x7a6a58, 1);
      gfx.fillRect(cx + bd.ox - bd.w / 2, cy - bd.h, bd.w, bd.h);
      // Crack lines
      gfx.lineStyle(1, 0x4a3a28, 0.5);
      gfx.beginPath();
      gfx.moveTo(cx + bd.ox, cy - bd.h);
      gfx.lineTo(cx + bd.ox + 5, cy - bd.h * 0.5);
      gfx.strokePath();
    }
  }

  private addMoss(cx: number, cy: number, spread: number): void {
    for (let i = 0; i < 6; i++) {
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0x3a6a30, 0.5);
      gfx.fillEllipse(cx + (-spread / 2 + Math.random() * spread), cy + Math.random() * 5, 20 + Math.random() * 30, 8);
    }
  }

  private addDust(cx: number, cy: number, spread: number, h: number): void {
    for (let i = 0; i < 6; i++) {
      const dx = cx + (-spread / 2 + Math.random() * spread);
      const dy = cy - h * 0.3 - Math.random() * h * 0.4;
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xd0b080, 0.4);
      gfx.fillCircle(dx, dy, 2 + Math.random() * 3);
      this.scene.tweens.add({
        targets: gfx,
        y: `-=${10 + Math.random() * 20}`,
        alpha: 0,
        duration: 2000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 3000,
        onRepeat: () => { gfx.setPosition(cx + (-spread / 2 + Math.random() * spread), cy - h * 0.1); gfx.setAlpha(0.4); },
      });
    }
  }

  private addLavaCracks(cx: number, cy: number, spread: number, b: BiomeDefinition): void {
    const gfx = this.scene.add.graphics();
    for (let i = 0; i < 5; i++) {
      const sx = cx + (-spread / 2 + Math.random() * spread);
      gfx.lineStyle(2, 0xff4000, 0.8);
      gfx.beginPath();
      gfx.moveTo(sx, cy);
      gfx.lineTo(sx + (-10 + Math.random() * 20), cy - 10 - Math.random() * 15);
      gfx.strokePath();
    }
    // Pulsing glow on cracks
    this.scene.tweens.add({
      targets: gfx,
      alpha: { from: 0.5, to: 1 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  private addEmbers(cx: number, cy: number, spread: number, h: number): void {
    for (let i = 0; i < 10; i++) {
      const ex = cx + (-spread / 2 + Math.random() * spread);
      const ey = cy - h * 0.2;
      const gfx = this.scene.add.graphics();
      gfx.fillStyle(0xff6020, 1);
      gfx.fillCircle(0, 0, 1.5 + Math.random() * 1.5);
      gfx.setPosition(ex, ey);
      this.scene.tweens.add({
        targets: gfx,
        y: `-=${20 + Math.random() * 40}`,
        x: `+=${-8 + Math.random() * 16}`,
        alpha: 0,
        duration: 1000 + Math.random() * 1500,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => { gfx.setPosition(ex, ey); gfx.setAlpha(1); },
      });
    }
  }

  private addIslandGlow(cx: number, cy: number, w: number, color: number): void {
    const gfx = this.scene.add.graphics().setDepth(-1);
    gfx.fillStyle(color, 0.06);
    gfx.fillEllipse(cx, cy + 10, w * 1.3, 80);
    this.scene.tweens.add({
      targets: gfx,
      alpha: { from: 0.4, to: 0.8 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
    });
  }
}

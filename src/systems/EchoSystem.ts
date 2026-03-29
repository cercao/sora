import Phaser from 'phaser';
import { Spirit } from './Spirit';
import { AmbientSound } from './AmbientSound';
import { BiomeDefinition } from '../world/WorldConfig';

// List of echo files to load. Used by GameScene to pre-compute world size.
export const ECHO_FILES = [
  'example-wind',
  'example-memory',
  'example-color',
  'example-ruins',
  'example-ember',
];

export interface EchoData {
  id: string;
  author: string;
  type: 'sound' | 'visual' | 'message';
  content: Record<string, unknown>;
  island: string;
  // Position is assigned at runtime — not stored in JSON.
  position?: { x: number; y: number };
}

const ACTIVATION_RADIUS = 140;
// Minimum pixel distance between any two echo markers.
const MIN_ECHO_DISTANCE = 220;
// Initial scatter radius around a biome center when placing an echo.
const ECHO_SCATTER = 320;

export class EchoSystem {
  private scene: Phaser.Scene;
  private spirit: Spirit;
  private sound: AmbientSound;
  private echos: EchoData[] = [];
  private discovered = new Set<string>();
  private activePanel: Phaser.GameObjects.Container | null = null;
  private echoMarkers = new Map<string, Phaser.GameObjects.Container>();
  private biomes: BiomeDefinition[];
  private worldWidth: number;
  private worldHeight: number;

  // HUD elements (fixed to screen)
  private hudContainer!: Phaser.GameObjects.Container;
  private biomeCounters = new Map<string, Phaser.GameObjects.Text>();
  private biomeTotals = new Map<string, number>();

  public onGameComplete: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    spirit: Spirit,
    sound: AmbientSound,
    worldWidth: number,
    worldHeight: number,
    biomes: BiomeDefinition[],
  ) {
    this.scene = scene;
    this.spirit = spirit;
    this.sound = sound;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.biomes = biomes;
    this.createHUD();
    this.loadEchos();
  }

  // ── HUD ────────────────────────────────────────────────

  private createHUD(): void {
    const { width } = this.scene.scale;
    this.hudContainer = this.scene.add.container(width - 20, 20)
      .setDepth(100)
      .setScrollFactor(0);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRoundedRect(-240, 0, 230, 28 + this.biomes.length * 30, 8);
    this.hudContainer.add(bg);

    const title = this.scene.add.text(-115, 9, 'Echoes', {
      fontSize: '14px',
      color: '#a0b8d0',
      fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5, 0);
    this.hudContainer.add(title);

    this.biomes.forEach((biome, i) => {
      const dot = this.scene.add.graphics();
      dot.fillStyle(biome.accentColor, 1);
      dot.fillCircle(-224, 31 + i * 30, 5);

      const label = this.scene.add.text(-214, 22 + i * 30, biome.name, {
        fontSize: '13px',
        color: '#8898a8',
        fontFamily: 'Cinzel, serif',
      });

      const counter = this.scene.add.text(-18, 22 + i * 30, '0 / ?', {
        fontSize: '13px',
        color: '#c0d8e8',
        fontFamily: 'Cinzel, serif',
      }).setOrigin(1, 0);

      this.hudContainer.add([dot, label, counter]);
      this.biomeCounters.set(biome.id, counter);
    });
  }

  private updateHUD(): void {
    this.biomes.forEach((biome) => {
      const discovered = [...this.discovered].filter(id => {
        const echo = this.echos.find(e => e.id === id);
        return echo?.island === biome.id;
      }).length;
      const total = this.biomeTotals.get(biome.id) ?? 0;
      const counter = this.biomeCounters.get(biome.id);
      if (counter) {
        counter.setText(`${discovered} / ${total}`);
        if (total > 0 && discovered === total) {
          counter.setColor('#78e878'); // green when complete
        }
      }
    });

    // Check overall completion
    const totalAll = [...this.biomeTotals.values()].reduce((a, b) => a + b, 0);
    if (totalAll > 0 && this.discovered.size === totalAll && this.onGameComplete) {
      // Delay slightly so the last echo panel can show first
      this.scene.time.delayedCall(3000, () => {
        this.onGameComplete?.();
        this.onGameComplete = null; // fire once
      });
    }
  }

  // ── Loading ────────────────────────────────────────────

  private async loadEchos(): Promise<void> {
    for (const name of ECHO_FILES) {
      try {
        const res = await fetch(`./community/echos/${name}.json`);
        if (res.ok) {
          const data: EchoData = await res.json();
          this.echos.push(data);
          this.biomeTotals.set(data.island, (this.biomeTotals.get(data.island) ?? 0) + 1);
        }
      } catch { /* skip silently */ }
    }
    // Assign random positions after all echoes are collected.
    this.assignPositions();
    // Create markers now that every echo has a position.
    for (const echo of this.echos) {
      this.createMarker(echo);
    }
    this.updateHUD();
  }

  // ── Position assignment ────────────────────────────────

  /**
   * Randomly places each echo near its biome center, ensuring a minimum
   * distance of MIN_ECHO_DISTANCE pixels between any two markers.
   * The scatter radius grows automatically if the algorithm struggles to find
   * a free slot (e.g. when many echoes share the same biome).
   */
  private assignPositions(): void {
    const placed: Array<{ x: number; y: number }> = [];
    const margin = 150; // keep markers away from world edges

    for (const echo of this.echos) {
      const biome = this.biomes.find(b => b.id === echo.island);
      const cx = biome?.wx ?? this.worldWidth / 2;
      const cy = biome?.wy ?? this.worldHeight / 2;

      let scatter = ECHO_SCATTER;
      let pos: { x: number; y: number } | null = null;

      for (let attempt = 0; attempt < 120 && pos === null; attempt++) {
        // Expand search radius every 30 failed attempts.
        if (attempt > 0 && attempt % 30 === 0) scatter *= 1.6;

        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * scatter;
        const x = Phaser.Math.Clamp(cx + Math.cos(angle) * r, margin, this.worldWidth - margin);
        const y = Phaser.Math.Clamp(cy + Math.sin(angle) * r, margin, this.worldHeight - margin);

        const clearOfOthers = placed.every(
          p => Math.hypot(p.x - x, p.y - y) >= MIN_ECHO_DISTANCE,
        );
        if (clearOfOthers) pos = { x, y };
      }

      // Fallback: place near biome center accepting possible overlap rather
      // than blocking startup indefinitely.
      if (pos === null) {
        pos = {
          x: Phaser.Math.Clamp(cx + (Math.random() - 0.5) * 60, margin, this.worldWidth - margin),
          y: Phaser.Math.Clamp(cy + (Math.random() - 0.5) * 60, margin, this.worldHeight - margin),
        };
      }

      echo.position = pos;
      placed.push(pos);
    }
  }

  // ── Markers ────────────────────────────────────────────

  private createMarker(echo: EchoData): void {
    if (!echo.position) return;
    const biome = this.biomes.find(b => b.id === echo.island);
    const color = biome?.accentColor ?? 0xffd080;

    const container = this.scene.add.container(echo.position.x, echo.position.y).setDepth(6);

    // Pulsing ring
    const ring = this.scene.add.graphics();
    ring.lineStyle(1.5, color, 0.6);
    ring.strokeCircle(0, 0, 10);
    ring.fillStyle(color, 0.15);
    ring.fillCircle(0, 0, 10);

    // Outer pulse
    const pulse = this.scene.add.graphics();
    pulse.lineStyle(1, color, 0.3);
    pulse.strokeCircle(0, 0, 16);

    container.add([ring, pulse]);

    // Beacon — vertical light shaft visible from a distance
    const beacon = this.scene.add.graphics().setDepth(5);
    beacon.fillStyle(color, 0.07);
    beacon.fillRect(echo.position.x - 1.5, echo.position.y - 280, 3, 280);
    beacon.fillStyle(color, 0.04);
    beacon.fillRect(echo.position.x - 4, echo.position.y - 280, 8, 280);
    this.scene.tweens.add({
      targets: beacon,
      alpha: { from: 0.4, to: 0.9 },
      duration: 1800 + Math.random() * 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    // Store beacon ref so we can destroy it on discovery
    (container as Phaser.GameObjects.Container & { beacon?: Phaser.GameObjects.Graphics }).beacon = beacon;

    this.echoMarkers.set(echo.id, container);

    // Pulse animation
    this.scene.tweens.add({
      targets: pulse,
      scaleX: 2.2,
      scaleY: 2.2,
      alpha: 0,
      duration: 2200,
      repeat: -1,
      ease: 'Sine.easeOut',
    });
  }

  // ── Update loop ────────────────────────────────────────

  update(): void {
    for (const echo of this.echos) {
      if (this.discovered.has(echo.id)) continue;
      if (!echo.position) continue;

      const dist = Phaser.Math.Distance.Between(
        this.spirit.x, this.spirit.y,
        echo.position.x, echo.position.y,
      );

      if (dist < ACTIVATION_RADIUS) {
        this.discoverEcho(echo);
      }
    }
  }

  // ── Discovery ──────────────────────────────────────────

  private discoverEcho(echo: EchoData): void {
    this.discovered.add(echo.id);

    // Play echo sound
    this.sound.playEchoNote();

    // Ripple at echo world position
    this.spawnRipple(echo);

    // Mark discovered — brighten and freeze marker
    const marker = this.echoMarkers.get(echo.id);
    if (marker) {
      this.scene.tweens.killTweensOf(marker);
      // Burst outward then fade away completely
      this.scene.tweens.add({
        targets: marker,
        scaleX: 2.2,
        scaleY: 2.2,
        alpha: 0,
        duration: 1000,
        ease: 'Sine.easeOut',
        onComplete: () => {
          const c = marker as Phaser.GameObjects.Container & { beacon?: Phaser.GameObjects.Graphics };
          c.beacon?.destroy();
          marker.destroy();
          this.echoMarkers.delete(echo.id);
        },
      });
    }

    // Show discovery panel (fixed to screen)
    this.showDiscoveryPanel(echo);

    // Update HUD counts
    this.updateHUD();

    // Check biome completion
    this.checkBiomeCompletion(echo.island);
  }

  private spawnRipple(echo: EchoData): void {
    if (!echo.position) return;
    const biome = this.biomes.find(b => b.id === echo.island);
    const color = biome?.accentColor ?? 0xffd080;
    for (let i = 0; i < 3; i++) {
      const ring = this.scene.add.graphics().setDepth(7);
      ring.lineStyle(1.5, color, 0.7 - i * 0.2);
      ring.strokeCircle(echo.position.x, echo.position.y, 12);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 4 + i * 2,
        scaleY: 4 + i * 2,
        alpha: 0,
        delay: i * 180,
        duration: 900,
        ease: 'Sine.easeOut',
        onComplete: () => ring.destroy(),
      });
    }
  }

  private showDiscoveryPanel(echo: EchoData): void {
    // Remove existing panel
    if (this.activePanel) {
      this.activePanel.destroy();
      this.activePanel = null;
    }

    const { width, height } = this.scene.scale;
    const biome = this.biomes.find(b => b.id === echo.island);
    const accentColor = biome?.accentColor ?? 0xffd080;
    const accentHex = '#' + accentColor.toString(16).padStart(6, '0');

    const panel = this.scene.add.container(width - 20, height - 20)
      .setDepth(100)
      .setScrollFactor(0)
      .setAlpha(0);

    const panelW = 310;
    const panelH = 138;

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x08101a, 0.88);
    bg.fillRoundedRect(-panelW, -panelH, panelW, panelH, 10);
    bg.lineStyle(1, accentColor, 0.5);
    bg.strokeRoundedRect(-panelW, -panelH, panelW, panelH, 10);

    // Accent bar on left
    const bar = this.scene.add.graphics();
    bar.fillStyle(accentColor, 0.8);
    bar.fillRect(-panelW, -panelH, 3, panelH);

    const typeLabel = this.scene.add.text(-panelW + 16, -panelH + 12, `echo · ${echo.type}`, {
      fontSize: '12px',
      color: accentHex,
      fontFamily: 'Cinzel, serif',
    });

    const authorText = this.scene.add.text(-panelW + 16, -panelH + 30, echo.author, {
      fontSize: '20px',
      color: '#e8e0d4',
      fontFamily: 'Cinzel, serif',
    });

    const contentStr = typeof echo.content.text === 'string'
      ? echo.content.text
      : typeof echo.content.note === 'string'
        ? echo.content.note
        : `${echo.type} fragment`;

    const contentText = this.scene.add.text(-panelW + 16, -panelH + 58, contentStr, {
      fontSize: '14px',
      color: '#a0b0c0',
      fontFamily: 'Philosopher, Georgia, serif',
      wordWrap: { width: panelW - 32 },
    });

    const biomeLabel = this.scene.add.text(-panelW + 16, -20, biome?.name ?? '', {
      fontSize: '12px',
      color: '#506070',
      fontFamily: 'Cinzel, serif',
    });

    panel.add([bg, bar, typeLabel, authorText, contentText, biomeLabel]);
    this.scene.add.existing(panel);
    this.activePanel = panel;

    // Slide in + fade in, then auto-dismiss
    this.scene.tweens.add({
      targets: panel,
      alpha: 1,
      x: width - 20,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(4500, () => {
          if (this.activePanel === panel) {
            this.scene.tweens.add({
              targets: panel,
              alpha: 0,
              duration: 600,
              onComplete: () => { panel.destroy(); if (this.activePanel === panel) this.activePanel = null; },
            });
          }
        });
      },
    });
  }

  private checkBiomeCompletion(biomeId: string): void {
    const total = this.biomeTotals.get(biomeId) ?? 0;
    if (total === 0) return;
    const found = [...this.discovered].filter(id => this.echos.find(e => e.id === id)?.island === biomeId).length;
    if (found === total) {
      this.celebrateBiome(biomeId);
    }
  }

  private celebrateBiome(biomeId: string): void {
    const biome = this.biomes.find(b => b.id === biomeId);
    if (!biome) return;
    const { width, height } = this.scene.scale;

    // Flash vignette in biome color
    const flash = this.scene.add.graphics()
      .setDepth(99)
      .setScrollFactor(0);
    flash.fillStyle(biome.accentColor, 0.2);
    flash.fillRect(0, 0, width, height);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 1200,
      onComplete: () => flash.destroy(),
    });

    // Completion message
    const msg = this.scene.add.text(width / 2, height / 2 - 30, `${biome.name} — fully explored`, {
      fontSize: '22px',
      color: '#' + biome.accentColor.toString(16).padStart(6, '0'),
      fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5).setDepth(100).setScrollFactor(0).setAlpha(0);

    this.scene.tweens.add({
      targets: msg,
      alpha: 1,
      duration: 800,
      yoyo: true,
      hold: 2000,
      onComplete: () => msg.destroy(),
    });
  }

  getDiscoveredCount(): number { return this.discovered.size; }
  getTotalCount(): number { return this.echos.length; }
}

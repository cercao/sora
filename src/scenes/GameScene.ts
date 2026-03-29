import Phaser from 'phaser';
import { Spirit } from '../systems/Spirit';
import { FlightPhysics } from '../systems/FlightPhysics';
import { EchoSystem } from '../systems/EchoSystem';
import { AmbientSound } from '../systems/AmbientSound';
import { Island } from '../world/Island';
import { Parallax } from '../world/Parallax';
import { WORLD_WIDTH, WORLD_HEIGHT, BIOMES } from '../world/WorldConfig';

export class GameScene extends Phaser.Scene {
  private spirit!: Spirit;
  private flight!: FlightPhysics;
  private echoSystem!: EchoSystem;
  private ambientSound!: AmbientSound;
  private parallax!: Parallax;

  // HUD elements (scrollFactor 0)
  private altitudeBar!: Phaser.GameObjects.Graphics;
  private altitudeFill!: Phaser.GameObjects.Graphics;
  private biomeLabel!: Phaser.GameObjects.Text;
  private biomeLabelTween: Phaser.Tweens.Tween | null = null;
  private lastBiomeName = '';

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // ── World bounds ────────────────────────────────────
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // ── Background layers (parallax via scroll factors) ──
    this.parallax = new Parallax(this);

    // ── Islands / biomes ─────────────────────────────────
    new Island(this, BIOMES);

    // ── Spirit (player) ──────────────────────────────────
    // Start at origin biome
    const origin = BIOMES.find(b => b.id === 'origin')!;
    this.spirit = new Spirit(this, origin.wx, origin.wy - 120);

    // ── Camera follows spirit with lookahead ─────────────
    this.cameras.main.startFollow(this.spirit.container, true, 0.08, 0.08);

    // ── Systems ──────────────────────────────────────────
    this.ambientSound = new AmbientSound(this);
    this.flight = new FlightPhysics(this, this.spirit);
    this.echoSystem = new EchoSystem(this, this.spirit, this.ambientSound);
    this.echoSystem.onGameComplete = () => this.showCompletionScreen();

    // ── HUD (fixed to screen) ────────────────────────────
    this.createHUD();

    // ── Pause on Escape ──────────────────────────────────
    this.input.keyboard!.on('keydown-ESC', () => this.togglePause());
  }

  private createHUD(): void {
    const { width, height } = this.scale;

    // Altitude bar — thin vertical line on left side
    const barBg = this.add.graphics().setScrollFactor(0).setDepth(90);
    barBg.fillStyle(0xffffff, 0.05);
    barBg.fillRect(12, height * 0.15, 3, height * 0.7);

    this.altitudeFill = this.add.graphics().setScrollFactor(0).setDepth(91);

    // Biome name — top center, fades in/out
    this.biomeLabel = this.add.text(width / 2, 28, '', {
      fontSize: '20px',
      color: '#c0d8e8',
      fontFamily: 'Cinzel, serif',
      alpha: 0,
    } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5)
      .setDepth(92)
      .setScrollFactor(0)
      .setAlpha(0);

    // Controls hint — bottom center, fades after 6s
    const hint = this.add.text(width / 2, height - 24, '↑ / space — rise     ← → — drift', {
      fontSize: '14px',
      color: '#404858',
      fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5).setDepth(90).setScrollFactor(0);

    this.time.delayedCall(6000, () => {
      this.tweens.add({ targets: hint, alpha: 0, duration: 1500 });
    });
  }

  update(_time: number, delta: number): void {
    this.flight.update(delta);
    this.echoSystem.update();
    this.parallax.update(this.spirit.x, this.spirit.y);

    this.updateAltitudeHUD();
    this.updateBiomeLabel();
    this.updateCameraLookahead();
  }

  private updateCameraLookahead(): void {
    // Shift camera slightly ahead in the direction of travel
    // so the player always sees more of where they're going
    const lookaheadX = Phaser.Math.Clamp(this.spirit.vx * 38, -120, 120);
    const lookaheadY = Phaser.Math.Clamp(this.spirit.vy * 24, -80, 80);
    this.cameras.main.setFollowOffset(-lookaheadX, -lookaheadY);
  }

  private updateAltitudeHUD(): void {
    const { height } = this.scale;
    const ratio = 1 - this.spirit.y / WORLD_HEIGHT;
    const barH = Math.max(4, ratio * height * 0.7);
    const barY = height * 0.15 + height * 0.7;

    this.altitudeFill.clear();
    // Color shifts from warm (low) to cool blue (high)
    const r = Math.floor(Phaser.Math.Linear(180, 80, ratio));
    const g = Math.floor(Phaser.Math.Linear(140, 180, ratio));
    const b = Math.floor(Phaser.Math.Linear(100, 240, ratio));
    this.altitudeFill.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 0.5);
    this.altitudeFill.fillRect(12, barY - barH, 3, barH);

    this.ambientSound.updateAltitude(ratio);
  }

  private updateBiomeLabel(): void {
    // Find the nearest biome
    let nearest = BIOMES[0];
    let minDist = Infinity;
    for (const b of BIOMES) {
      const d = Phaser.Math.Distance.Between(this.spirit.x, this.spirit.y, b.wx, b.wy);
      if (d < minDist) { minDist = d; nearest = b; }
    }

    const onIsland = minDist < nearest.islandWidth * 0.7;
    const name = onIsland ? nearest.name : '';

    if (name !== this.lastBiomeName) {
      this.lastBiomeName = name;
      if (this.biomeLabelTween) { this.biomeLabelTween.stop(); }
      if (name) {
        this.biomeLabel.setText(name);
        this.biomeLabelTween = this.tweens.add({ targets: this.biomeLabel, alpha: 0.75, duration: 800 });
      } else {
        this.biomeLabelTween = this.tweens.add({ targets: this.biomeLabel, alpha: 0, duration: 1000 });
      }
    }
  }

  private isPaused = false;
  private pauseOverlay: Phaser.GameObjects.Container | null = null;

  private togglePause(): void {
    if (this.isPaused) {
      this.pauseOverlay?.destroy();
      this.pauseOverlay = null;
      this.isPaused = false;
    } else {
      this.showPauseMenu();
    }
  }

  private showPauseMenu(): void {
    this.isPaused = true;
    const { width, height } = this.scale;
    const overlay = this.add.container(0, 0).setDepth(200).setScrollFactor(0);

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.75);
    bg.fillRect(0, 0, width, height);

    const title = this.add.text(width / 2, height / 2 - 80, 'Sōra', {
      fontSize: '44px', color: '#e8e0d0', fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5);

    const menuItems = [
      { label: 'Continue', action: () => this.togglePause() },
      { label: 'About', action: () => this.showAbout(overlay) },
      { label: 'How to contribute', action: () => this.showContribute(overlay) },
    ];

    const itemObjs: Phaser.GameObjects.Text[] = [];
    menuItems.forEach((item, i) => {
      const t = this.add.text(width / 2, height / 2 - 10 + i * 44, item.label, {
        fontSize: '22px', color: '#9090a8', fontFamily: 'Cinzel, serif',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      t.on('pointerover', () => t.setStyle({ color: '#e8e0d0' }));
      t.on('pointerout',  () => t.setStyle({ color: '#9090a8' }));
      t.on('pointerdown', item.action);
      itemObjs.push(t);
    });

    overlay.add([bg, title, ...itemObjs]);
    this.pauseOverlay = overlay;
  }

  private showAbout(overlay: Phaser.GameObjects.Container): void {
    overlay.removeAll(true);
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, width, height);

    const lines = [
      'Sōra is a contemplative gliding game.',
      '',
      'There is no game over. No timer. No score.',
      'There is only the wind, the silence,',
      'and fragments left by others — Echoes.',
      '',
      'The world is built collaboratively.',
      'Anyone can add an Echo via a Pull Request.',
    ];
    lines.forEach((line, i) => {
      this.add.text(width / 2, height / 2 - 130 + i * 30, line, {
        fontSize: '16px', color: '#a0b0c0', fontFamily: 'Philosopher, Georgia, serif',
      }).setOrigin(0.5);
    });

    const back = this.add.text(width / 2, height - 60, '← back', {
      fontSize: '14px', color: '#606878', fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setStyle({ color: '#e8e0d0' }));
    back.on('pointerdown', () => { overlay.removeAll(true); this.togglePause(); this.showPauseMenu(); });
    overlay.add([bg, back]);
  }

  private showContribute(overlay: Phaser.GameObjects.Container): void {
    overlay.removeAll(true);
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, width, height);

    const lines = [
      'How to add your Echo:',
      '',
      '1. Fork the repository on GitHub',
      '2. Create community/echos/echo-yourname-001.json',
      '3. Fill in: author, type, content, island, position',
      '4. Open a Pull Request',
      '',
      'No coding required. Just a JSON file.',
      'Any voice is welcome — the only rule is:',
      'do no harm.',
    ];
    lines.forEach((line, i) => {
      this.add.text(width / 2, height / 2 - 150 + i * 30, line, {
        fontSize: '15px', color: '#a0b0c0', fontFamily: 'Philosopher, Georgia, serif',
      }).setOrigin(0.5);
    });

    const back = this.add.text(width / 2, height - 60, '← back', {
      fontSize: '14px', color: '#606878', fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setStyle({ color: '#e8e0d0' }));
    back.on('pointerdown', () => { overlay.removeAll(true); this.togglePause(); this.showPauseMenu(); });
    overlay.add([bg, back]);
  }

  private showCompletionScreen(): void {
    const { width, height } = this.scale;

    // Freeze flight
    this.flight.freeze();

    // Slow fade to deep dark
    const veil = this.add.graphics().setDepth(300).setScrollFactor(0);
    veil.fillStyle(0x020408, 0);
    veil.fillRect(0, 0, width, height);
    this.tweens.add({
      targets: veil,
      fillAlpha: 0.92,
      duration: 2800,
      ease: 'Sine.easeIn',
      onComplete: () => this.buildCompletionUI(width, height),
    });
  }

  private buildCompletionUI(width: number, height: number): void {
    // Starfield — tiny particles drifting
    for (let i = 0; i < 40; i++) {
      const g = this.add.graphics().setDepth(301).setScrollFactor(0);
      g.fillStyle(0xc0d8f0, 0.6);
      g.fillCircle(Math.random() * width, Math.random() * height, Math.random() * 1.5);
      this.tweens.add({
        targets: g,
        alpha: { from: 0.1, to: 0.7 },
        duration: 1500 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 3000,
      });
    }

    // Title
    const title = this.add.text(width / 2, height / 2 - 120, 'The wind remembers.', {
      fontSize: '32px',
      color: '#c8dff0',
      fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5).setDepth(302).setScrollFactor(0).setAlpha(0);

    // Biome list
    const biomeTexts: Phaser.GameObjects.Text[] = BIOMES.map((b, i) =>
      this.add.text(width / 2, height / 2 - 50 + i * 30, `✦  ${b.name}`, {
        fontSize: '16px',
        color: '#' + b.accentColor.toString(16).padStart(6, '0'),
        fontFamily: 'Cinzel, serif',
      }).setOrigin(0.5).setDepth(302).setScrollFactor(0).setAlpha(0),
    );

    const sub = this.add.text(width / 2, height / 2 + 115, 'Every echo you found was left by a real person.', {
      fontSize: '14px',
      color: '#506070',
      fontFamily: 'Philosopher, Georgia, serif',
    }).setOrigin(0.5).setDepth(302).setScrollFactor(0).setAlpha(0);

    // Restart button
    const restart = this.add.text(width / 2, height / 2 + 160, 'fly again', {
      fontSize: '18px',
      color: '#607888',
      fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5).setDepth(302).setScrollFactor(0).setAlpha(0)
      .setInteractive({ useHandCursor: true });
    restart.on('pointerover', () => restart.setStyle({ color: '#c0d8e8' }));
    restart.on('pointerout',  () => restart.setStyle({ color: '#607888' }));
    restart.on('pointerdown', () => this.scene.restart());

    // Staggered fade-in
    this.tweens.add({ targets: title,   alpha: 1, duration: 1200, delay: 200,  ease: 'Sine.easeOut' });
    biomeTexts.forEach((t, i) => {
      this.tweens.add({ targets: t, alpha: 0.85, duration: 800, delay: 900 + i * 180, ease: 'Sine.easeOut' });
    });
    this.tweens.add({ targets: sub,     alpha: 1, duration: 1000, delay: 1800, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: restart, alpha: 1, duration: 800,  delay: 2400, ease: 'Sine.easeOut' });
  }
}

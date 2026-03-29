import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background gradient
    const bg = this.add.graphics();
    bg.fillStyle(0x060c18, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(0x0a1828, 1);
    bg.fillEllipse(width / 2, height * 0.6, width * 1.2, height * 0.8);

    // Floating particle hints
    for (let i = 0; i < 18; i++) {
      const dot = this.add.graphics();
      dot.fillStyle(0x8ab8e0, 0.5);
      dot.fillCircle(Math.random() * width, Math.random() * height, 1 + Math.random() * 1.5);
      this.tweens.add({
        targets: dot,
        y: `-=${20 + Math.random() * 40}`,
        alpha: { from: 0.4, to: 0 },
        duration: 3000 + Math.random() * 3000,
        repeat: -1,
        delay: Math.random() * 4000,
        onRepeat: () => dot.setPosition(Math.random() * width, height * 0.5 + Math.random() * height * 0.5),
      });
    }

    // Title
    this.add.text(width / 2, height / 2 - 80, 'Sōra', {
      fontSize: '88px',
      color: '#dce8f8',
      fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(width / 2, height / 2 + 18, 'a wind spirit in an archipelago of floating islands', {
      fontSize: '18px',
      color: '#6a7888',
      fontFamily: 'Philosopher, Georgia, serif',
    }).setOrigin(0.5);

    // Prompt
    const startText = this.add.text(width / 2, height / 2 + 86, 'press any key to begin', {
      fontSize: '16px',
      color: '#404858',
      fontFamily: 'Cinzel, serif',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Explore hint
    this.add.text(width / 2, height - 36, 'explore · discover echoes · contribute yours', {
      fontSize: '14px',
      color: '#2a3040',
      fontFamily: 'Philosopher, Georgia, serif',
    }).setOrigin(0.5);

    this.input.keyboard!.on('keydown', () => this.scene.start('GameScene'));
    this.input.on('pointerdown', () => this.scene.start('GameScene'));
  }
}

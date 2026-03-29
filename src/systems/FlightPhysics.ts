import Phaser from 'phaser';
import { Spirit } from './Spirit';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../world/WorldConfig';

const GRAVITY = 0.055;
const DRAG = 0.984;
const LIFT = 1.55;
const LATERAL_INERTIA = 0.9;
const MAX_VX = 8;
const MAX_VY = 10;

export class FlightPhysics {
  private scene: Phaser.Scene;
  private spirit: Spirit;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey: Phaser.Input.Keyboard.Key;
  private isPointerDown = false;
  liftActive = false;
  private frozen = false;

  constructor(scene: Phaser.Scene, spirit: Spirit) {
    this.scene = scene;
    this.spirit = spirit;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    scene.input.on('pointerdown', () => { this.isPointerDown = true; });
    scene.input.on('pointerup',   () => { this.isPointerDown = false; });
  }

  freeze(): void { this.frozen = true; }

  update(delta: number): void {
    if (this.frozen) return;
    const dt = Math.min(delta / 16.67, 3); // cap to avoid spiral on tab-unfocus

    this.liftActive = this.spaceKey.isDown || this.cursors.up.isDown || this.isPointerDown;

    // Gravity
    this.spirit.vy += GRAVITY * dt;

    // Lift
    if (this.liftActive) {
      this.spirit.vy -= LIFT * 0.11 * dt;
    }

    // Horizontal
    if (this.cursors.left.isDown) {
      this.spirit.vx -= 0.28 * dt;
    } else if (this.cursors.right.isDown) {
      this.spirit.vx += 0.28 * dt;
    }

    // Drag
    this.spirit.vy *= DRAG;
    this.spirit.vx *= LATERAL_INERTIA;

    // Clamp velocity
    this.spirit.vx = Phaser.Math.Clamp(this.spirit.vx, -MAX_VX, MAX_VX);
    this.spirit.vy = Phaser.Math.Clamp(this.spirit.vy, -MAX_VY, MAX_VY);

    // Move
    this.spirit.x += this.spirit.vx * dt;
    this.spirit.y += this.spirit.vy * dt;

    // Soft world floor — gentle bounce
    if (this.spirit.y > WORLD_HEIGHT - 60) {
      this.spirit.y = WORLD_HEIGHT - 60;
      this.spirit.vy = Math.min(this.spirit.vy, -0.4);
    }
    // Soft world ceiling
    if (this.spirit.y < 60) {
      this.spirit.y = 60;
      this.spirit.vy = Math.max(this.spirit.vy, 0.2);
    }
    // Horizontal world bounds — soft clamp
    this.spirit.x = Phaser.Math.Clamp(this.spirit.x, 60, WORLD_WIDTH - 60);

    this.spirit.update(this.liftActive);
  }
}

import * as Tone from 'tone';

export class AmbientSound {
  private isReady = false;

  // Audio graph nodes
  private masterGain!: Tone.Gain;
  private reverbLong!: Tone.Reverb;
  private reverbShort!: Tone.Reverb;
  private delayNode!: Tone.PingPongDelay;
  private filterHigh!: Tone.Filter;
  private filterLow!: Tone.Filter;

  // Layers
  private droneSynth!: Tone.Synth;
  private padSynth!: Tone.PolySynth;
  private melodySynth!: Tone.Synth;
  private echoSynth!: Tone.PolySynth;

  // Loops
  private droneLoop!: Tone.Loop;
  private padLoop!: Tone.Loop;
  private melodyLoop!: Tone.Loop;
  private melodyStep = 0;

  // Pentatonic scale in D — calm, open, no half-steps
  private readonly SCALE_D_PENTA = ['D3', 'F#3', 'A3', 'B3', 'D4', 'F#4', 'A4', 'B4', 'D5'];
  // Pad chords (D major family)
  private readonly PAD_CHORDS = [
    ['D3', 'F#3', 'A3'],
    ['B2', 'D3', 'F#3'],
    ['A2', 'C#3', 'E3'],
    ['G2', 'B2', 'D3'],
  ];
  private padChordIndex = 0;

  constructor(_scene: unknown) {
    // Defer audio init until first user gesture (browser autoplay policy)
    if (typeof window !== 'undefined') {
      const start = async () => {
        await this.initAudio();
        window.removeEventListener('keydown', start);
        window.removeEventListener('pointerdown', start);
      };
      window.addEventListener('keydown', start, { once: true });
      window.addEventListener('pointerdown', start, { once: true });
    }
  }

  private async initAudio(): Promise<void> {
    await Tone.start();

    // Master chain: lowpass filter (altitude-controlled) → reverb → output
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.reverbLong = new Tone.Reverb({ decay: 12, wet: 0.55 });
    this.reverbShort = new Tone.Reverb({ decay: 3, wet: 0.4 });
    this.delayNode = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.35, wet: 0.25 });
    this.filterHigh = new Tone.Filter({ frequency: 2400, type: 'lowpass', rolloff: -12 });
    this.filterLow = new Tone.Filter({ frequency: 200, type: 'highpass', rolloff: -12 });

    await Promise.all([
      this.reverbLong.ready,
      this.reverbShort.ready,
    ]);

    // Signal chain: instruments → delay → reverb → filter → master
    this.filterHigh.connect(this.masterGain);
    this.filterLow.connect(this.filterHigh);
    this.reverbLong.connect(this.filterLow);
    this.delayNode.connect(this.filterLow);
    this.reverbShort.connect(this.filterLow);

    // ── Drone ──────────────────────────────────────────
    this.droneSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 4, decay: 0, sustain: 1, release: 6 },
      volume: -18,
    }).connect(this.reverbLong);

    // ── Pad ────────────────────────────────────────────
    this.padSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 2.5, decay: 1, sustain: 0.7, release: 4 },
      volume: -24,
    }).connect(this.reverbLong);

    // ── Melody ─────────────────────────────────────────
    this.melodySynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.4, decay: 1.2, sustain: 0.2, release: 2.5 },
      volume: -32,
    }).connect(this.delayNode);
    this.melodySynth.connect(this.reverbShort);

    // ── Echo notification ──────────────────────────────
    this.echoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.5, decay: 2, sustain: 0, release: 3 },
      volume: -20,
    }).connect(this.reverbLong);

    // ── Transport & loops ──────────────────────────────
    Tone.Transport.bpm.value = 44;

    // Drone — slow chord changes every 4 bars
    this.droneLoop = new Tone.Loop((time) => {
      const root = ['D2', 'A2', 'B2', 'G2'][Math.floor(Tone.Transport.position.toString().split(':')[0] as unknown as number / 4) % 4];
      this.droneSynth.triggerAttackRelease(root || 'D2', '4m', time, 0.6);
    }, '4m');

    // Pad — chord progression, slow and dreamy
    this.padLoop = new Tone.Loop((time) => {
      const chord = this.PAD_CHORDS[this.padChordIndex % this.PAD_CHORDS.length];
      this.padSynth.triggerAttackRelease(chord, '2m', time, 0.4 + Math.random() * 0.15);
      this.padChordIndex++;
    }, '2m');

    // Melody — sparse, generative, never identical
    this.melodyLoop = new Tone.Loop((time) => {
      // Only play ~50% of steps
      if (Math.random() > 0.48) {
        const note = this.SCALE_D_PENTA[Math.floor(Math.random() * this.SCALE_D_PENTA.length)];
        const dur = ['4n', '4n.', '2n'][Math.floor(Math.random() * 3)];
        const vel = 0.12 + Math.random() * 0.18;
        this.melodySynth.triggerAttackRelease(note, dur, time, vel);
      }
    }, '4n.');

    // Start
    this.droneLoop.start(0);
    this.padLoop.start('+0.5');
    this.melodyLoop.start('+2');
    Tone.Transport.start();

    this.isReady = true;
  }

  /** Called every frame with altitude ratio 0 (ground) → 1 (sky ceiling) */
  updateAltitude(ratio: number): void {
    if (!this.isReady) return;
    // High altitude: brighter, more spacious (higher cutoff, more reverb wet)
    const cutoff = 600 + ratio * 4000;
    this.filterHigh.frequency.rampTo(cutoff, 2.5);

    // Melody volume: louder up high
    const melodyVol = -38 + ratio * 12;
    this.melodySynth.volume.rampTo(melodyVol, 1.5);

    // Drone pitch drift: slightly higher at altitude
    // (handled by chord selection, no direct pitch shift needed)
  }

  /** Called when player discovers an echo */
  playEchoNote(): void {
    if (!this.isReady) return;
    // Play a gentle ascending two-note chime
    const base = this.SCALE_D_PENTA[Math.floor(Math.random() * 5)]; // lower half
    const top = this.SCALE_D_PENTA[4 + Math.floor(Math.random() * 4)]; // upper half
    const now = Tone.now();
    this.echoSynth.triggerAttackRelease(base, '2n', now, 0.55);
    this.echoSynth.triggerAttackRelease(top, '2n', now + 0.35, 0.45);
  }
}

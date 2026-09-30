/**
 * Web Audio API synthesizer for TikTok Live Trivia.
 * 100% client-side, zero external assets, no copyright issues on TikTok.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmIntervalId: number | null = null;
  private isBgmPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const val = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : val, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Sound effect when user or chat picks an option
   */
  public playSelect() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {
      // AudioContext policy fallback
    }
  }

  /**
   * Short clock tick for seconds counting down
   */
  public playTick() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // AudioContext policy fallback
    }
  }

  /**
   * Urgent warning beep when under 3 seconds
   */
  public playWarningBeep() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1100, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Fallback
    }
  }

  /**
   * Victorious chord when correct answer is revealed
   */
  public playCorrect() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const chord = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        const startTime = this.ctx.currentTime + idx * 0.06;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Deep dramatic buzzer when user picks wrong or fails
   */
  public playWrong() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const freqs = [185, 175]; // low dissonant
      freqs.forEach((freq) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.8, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.42);
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Shimmering score pop / streak sound
   */
  public playScorePop() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.12); // E6

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // Fallback
    }
  }

  /**
   * Fanfare melody when round finishes or podium updates
   */
  public playFanfare() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const notes = [
        { f: 523.25, d: 0.1 },
        { f: 659.25, d: 0.1 },
        { f: 783.99, d: 0.1 },
        { f: 1046.5, d: 0.35 },
      ];

      let elapsed = 0;
      notes.forEach((note) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, this.ctx.currentTime + elapsed);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + elapsed);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + elapsed + note.d);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime + elapsed);
        osc.stop(this.ctx.currentTime + elapsed + note.d);

        elapsed += note.d * 0.9;
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Sound effect when 50/50 powerup is activated by a TikTok donation
   */
  public playPowerUp5050() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1280, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.32);
    } catch {}
  }

  /**
   * Sound effect when question is skipped by a donation
   */
  public playSkip() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  /**
   * Cheerful, Upbeat Quiz Show Background Music (BGM)
   * Synthesizes a lively, happy marimba melody, bouncy funky bass, and joyful rhythm.
   */
  public toggleBgm(forceState?: boolean): boolean {
    const nextState = forceState !== undefined ? forceState : !this.isBgmPlaying;
    if (nextState) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.isBgmPlaying;
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }

  public startBgm() {
    if (this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    let step = 0;

    // Melodía alegre y juguetona en Do Mayor (C Major) estilo concurso festivo
    // C5=523.25, D5=587.33, E5=659.25, G5=783.99, A5=880.0, B5=987.77, C6=1046.5
    const melodyNotes = [
      523.25, 0, 659.25, 0, 783.99, 880.0, 783.99, 0,
      659.25, 0, 523.25, 587.33, 659.25, 0, 587.33, 0,
      523.25, 0, 659.25, 783.99, 880.0, 0, 1046.5, 0,
      880.0, 783.99, 659.25, 587.33, 523.25, 0, 659.25, 0,
    ];

    // Bajo saltarín y alegre (Bouncy Bass)
    const bassNotes = [
      130.81, 0, 196.0, 0, 130.81, 0, 196.0, 0, // C3 - G3
      174.61, 0, 220.0, 0, 196.0, 0, 246.94, 0, // F3 - A3 - G3 - B3
      130.81, 0, 196.0, 0, 220.0, 0, 174.61, 0, // C3 - G3 - A3 - F3
      196.0, 0, 196.0, 196.0, 130.81, 0, 196.0, 0, // G3 - G3 - C3 - G3
    ];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

      const now = this.ctx.currentTime;
      const melodyFreq = melodyNotes[step % melodyNotes.length];
      const bassFreq = bassNotes[step % bassNotes.length];

      // 1. Sintetizador de Melodía Alegre (Marimba brillante / Campana suave)
      if (melodyFreq > 0) {
        const osc = this.ctx.createOscillator();
        const oscOvertone = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(melodyFreq, now);

        // Armónico suave para dar brillo festivo
        oscOvertone.type = 'sine';
        oscOvertone.frequency.setValueAtTime(melodyFreq * 2, now);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        osc.connect(gain);
        oscOvertone.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        oscOvertone.start(now);
        osc.stop(now + 0.18);
        oscOvertone.stop(now + 0.18);
      }

      // 2. Bajo Rebotante y Divertido (Bouncy Bass)
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFilter = this.ctx.createBiquadFilter();

        bassOsc.type = 'sine';
        // Ligero rebote de frecuencia para dar efecto elástico/alegre
        bassOsc.frequency.setValueAtTime(bassFreq * 1.15, now);
        bassOsc.frequency.exponentialRampToValueAtTime(bassFreq, now + 0.025);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(450, now);

        bassGain.gain.setValueAtTime(0.16, now);
        bassGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.16);
      }

      // 3. Shaker / Percusión ligera y alegre en contratiempo
      if (step % 2 === 1) {
        const clickOsc = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(1400 + Math.random() * 300, now);

        clickGain.gain.setValueAtTime(0.022, now);
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

        clickOsc.connect(clickGain);
        clickGain.connect(this.bgmGain);
        clickOsc.start(now);
        clickOsc.stop(now + 0.04);
      }

      step++;
    };

    // 138ms = ~130 BPM (Ritmo alegre, ágil y festivo)
    this.bgmIntervalId = window.setInterval(playStep, 138);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }
}

export const soundEffects = new SoundEngine();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Generador procedural de música ambiental relajante para Word Cross.
 * Diseñado con la Web Audio API: cero dependencias externas, cero latencia,
 * sin enlaces caídos de MP3 y con sonido cálido de bosque místico, marimba y arpa.
 */

export interface MusicTrack {
  id: string;
  name: string;
  description: string;
  bpm: number;
}

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'bosque-magico',
    name: '🌲 Bosque Mágico',
    description: 'Melodía suave de marimba, arpa y almohadillas mágicas de bosque.',
    bpm: 82
  },
  {
    id: 'brisa-madera',
    name: '🍃 Brisa de Madera',
    description: 'Tonos acústicos de kalimba y viento suave entre los árboles.',
    bpm: 74
  },
  {
    id: 'noche-estrellas',
    name: '✨ Noche Estrellada',
    description: 'Campanillas celestiales y acordes nocturnos relajantes.',
    bpm: 78
  }
];

// Frecuencias de notas musicales (Hz)
const NOTE_FREQS: Record<string, number> = {
  'C2': 65.41, 'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
  'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98, 'A6': 1760.00
};

interface ChordStep {
  root: string;
  padNotes: string[];
  melodyNotes: string[];
  bass: string;
}

// Progresión armónica del Bosque Mágico (8 compases suaves en C / Am / G)
const THEME_BOSQUE: ChordStep[] = [
  { root: 'C', bass: 'C2', padNotes: ['C3', 'G3', 'B3', 'E4'], melodyNotes: ['E5', 'G5', 'B5', 'G5', 'E5', 'D5', 'C5', 'D5'] },
  { root: 'G', bass: 'G2', padNotes: ['G2', 'D3', 'B3', 'D4'], melodyNotes: ['D5', 'G5', 'A5', 'B5', 'D6', 'B5', 'A5', 'G5'] },
  { root: 'Am', bass: 'A2', padNotes: ['A2', 'E3', 'C4', 'E4'], melodyNotes: ['C5', 'E5', 'A5', 'B5', 'C6', 'B5', 'A5', 'E5'] },
  { root: 'Em', bass: 'E2', padNotes: ['E2', 'B2', 'G3', 'B3'], melodyNotes: ['B4', 'E5', 'G5', 'B5', 'A5', 'G5', 'E5', 'D5'] },
  { root: 'F', bass: 'F2', padNotes: ['F2', 'C3', 'A3', 'C4'], melodyNotes: ['A4', 'C5', 'F5', 'A5', 'G5', 'F5', 'E5', 'F5'] },
  { root: 'C', bass: 'C2', padNotes: ['C3', 'E3', 'G3', 'C4'], melodyNotes: ['G4', 'C5', 'E5', 'G5', 'F5', 'E5', 'D5', 'C5'] },
  { root: 'Dm', bass: 'D2', padNotes: ['D2', 'A2', 'F3', 'A3'], melodyNotes: ['F4', 'A4', 'D5', 'F5', 'E5', 'D5', 'C5', 'D5'] },
  { root: 'G', bass: 'G2', padNotes: ['G2', 'D3', 'F3', 'B3'], melodyNotes: ['D5', 'F5', 'G5', 'B5', 'A5', 'G5', 'F5', 'D5'] }
];

const THEME_BRISA: ChordStep[] = [
  { root: 'G', bass: 'G2', padNotes: ['G2', 'D3', 'G3', 'B3'], melodyNotes: ['B4', 'D5', 'G5', 'A5', 'B5', 'G5', 'D5', 'B4'] },
  { root: 'C', bass: 'C2', padNotes: ['C2', 'G2', 'E3', 'G3'], melodyNotes: ['E5', 'G5', 'C6', 'B5', 'A5', 'G5', 'E5', 'D5'] },
  { root: 'Em', bass: 'E2', padNotes: ['E2', 'B2', 'G3', 'E4'], melodyNotes: ['G5', 'B5', 'E6', 'D6', 'B5', 'A5', 'G5', 'E5'] },
  { root: 'D', bass: 'D2', padNotes: ['D2', 'A2', 'F#3', 'A3'], melodyNotes: ['A4', 'D5', 'F#5', 'A5', 'G5', 'F#5', 'D5', 'A4'] },
  { root: 'C', bass: 'C2', padNotes: ['C2', 'E3', 'G3', 'C4'], melodyNotes: ['E5', 'G5', 'B5', 'C6', 'B5', 'G5', 'E5', 'D5'] },
  { root: 'G', bass: 'G2', padNotes: ['G2', 'D3', 'B3', 'D4'], melodyNotes: ['D5', 'G5', 'B5', 'D6', 'C6', 'B5', 'A5', 'G5'] }
];

const THEME_NOCHE: ChordStep[] = [
  { root: 'Am', bass: 'A2', padNotes: ['A2', 'E3', 'A3', 'C4'], melodyNotes: ['C6', 'B5', 'A5', 'E5', 'A5', 'B5', 'C6', 'E6'] },
  { root: 'F', bass: 'F2', padNotes: ['F2', 'C3', 'A3', 'C4'], melodyNotes: ['A5', 'C6', 'F6', 'E6', 'C6', 'A5', 'G5', 'F5'] },
  { root: 'C', bass: 'C2', padNotes: ['C2', 'G2', 'E3', 'B3'], melodyNotes: ['G5', 'B5', 'E6', 'D6', 'B5', 'G5', 'E5', 'D5'] },
  { root: 'Em', bass: 'E2', padNotes: ['E2', 'B2', 'G3', 'B3'], melodyNotes: ['E5', 'G5', 'B5', 'D6', 'C6', 'B5', 'G5', 'E5'] }
];

export class BackgroundMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentVolume: number = 0.35;
  private trackId: string = 'bosque-magico';
  private timerId: number | null = null;
  private currentStepIndex: number = 0;
  private stepIntervalMs: number = 2200; // Por compás
  private activePadNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  constructor() {
    // Inicialización diferida tras interacción del usuario
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.08);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getTrackId(): string {
    return this.trackId;
  }

  public setTrack(trackId: string) {
    this.trackId = trackId;
    const track = MUSIC_TRACKS.find(t => t.id === trackId);
    if (track) {
      // Ajustar velocidad
      const beatsPerBar = 4;
      const secPerBeat = 60 / track.bpm;
      this.stepIntervalMs = Math.round(beatsPerBar * secPerBeat * 1000);
    }
    this.currentStepIndex = 0;
  }

  public play() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.isPlaying) return;
    this.isPlaying = true;

    // Fade in suave
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, this.ctx.currentTime + 1.2);

    this.runSequencer();
  }

  public pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }

    // Fade out suave de los pads activos
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    }

    this.stopActivePads();
  }

  private stopActivePads() {
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.activePadNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.setTargetAtTime(0.001, now, 0.3);
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
        }, 500);
      } catch {}
    });
    this.activePadNodes = [];
  }

  private getSequence(): ChordStep[] {
    if (this.trackId === 'brisa-madera') return THEME_BRISA;
    if (this.trackId === 'noche-estrellas') return THEME_NOCHE;
    return THEME_BOSQUE;
  }

  private runSequencer = () => {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const sequence = this.getSequence();
    const step = sequence[this.currentStepIndex % sequence.length];
    const barDuration = this.stepIntervalMs / 1000;

    // 1. Tocar Bajo suave
    this.playBassNote(step.bass, barDuration);

    // 2. Tocar Almohadilla ambiental (warm pad chord)
    this.playPadChord(step.padNotes, barDuration);

    // 3. Secuenciar notas de marimba y arpa a lo largo del compás
    const noteCount = step.melodyNotes.length;
    const noteInterval = barDuration / noteCount;

    step.melodyNotes.forEach((noteName, idx) => {
      const delaySec = idx * noteInterval;
      // Probabilidad de variar para que suene orgánico y vivo
      const vel = 0.5 + Math.sin(idx * 1.5) * 0.25;
      this.scheduleMarimbaNote(noteName, delaySec, vel);

      // Si es una nota clave, añadir un destello de arpa / celesta
      if (idx === 0 || idx === 3 || idx === 6) {
        this.scheduleHarpNote(noteName, delaySec + 0.05, 0.35);
      }
    });

    this.currentStepIndex = (this.currentStepIndex + 1) % sequence.length;

    // Próximo compás
    this.timerId = window.setTimeout(this.runSequencer, this.stepIntervalMs);
  };

  /**
   * Nota de bajo cálido (Warm Sub-Bass)
   */
  private playBassNote(noteName: string, durationSec: number) {
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQS[noteName] || 82.41;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec * 0.95);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + durationSec);
    } catch {}
  }

  /**
   * Almohadilla de sintetizador ambiental (Soft Ambient Pad)
   */
  private playPadChord(notes: string[], durationSec: number) {
    if (!this.ctx || !this.masterGain) return;
    this.stopActivePads();

    const now = this.ctx.currentTime;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(540, now);
    filter.Q.setValueAtTime(1.5, now);
    filter.connect(this.masterGain);

    notes.forEach((n, idx) => {
      const freq = NOTE_FREQS[n];
      if (!freq) return;

      try {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        // Ondas triangulares con suave desafinación coral
        osc.type = 'triangle';
        const detuneCents = (idx % 2 === 0 ? 1 : -1) * 4;
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime(detuneCents, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.065, now + 0.8);
        gain.gain.setValueAtTime(0.065, now + durationSec - 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec + 0.3);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now);
        osc.stop(now + durationSec + 0.4);

        this.activePadNodes.push({ osc, gain });
      } catch {}
    });
  }

  /**
   * Nota de Marimba / Kalimba acústica de madera
   */
  private scheduleMarimbaNote(noteName: string, delaySec: number, velocity: number = 0.5) {
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQS[noteName];
    if (!freq) return;

    const start = this.ctx.currentTime + delaySec;

    try {
      // 1. Fundamental
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      const amp = 0.14 * velocity;
      gain.gain.setValueAtTime(amp, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.48);

      osc.connect(gain);
      gain.connect(this.masterGain);

      // 2. Sobretono armónico de madera (segundo armónico)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2.01, start);

      gain2.gain.setValueAtTime(amp * 0.28, start);
      gain2.gain.exponentialRampToValueAtTime(0.0005, start + 0.18);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.5);
      osc2.start(start);
      osc2.stop(start + 0.25);
    } catch {}
  }

  /**
   * Destello de Arpa / Campana de hadas (Sparkle Harp)
   */
  private scheduleHarpNote(noteName: string, delaySec: number, velocity: number = 0.3) {
    if (!this.ctx || !this.masterGain) return;
    const freq = NOTE_FREQS[noteName];
    if (!freq) return;

    const start = this.ctx.currentTime + delaySec;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sonido cristalino
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 2, start); // Octava alta

      const amp = 0.08 * velocity;
      gain.gain.setValueAtTime(amp, start);
      gain.gain.exponentialRampToValueAtTime(0.0005, start + 0.65);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(start);
      osc.stop(start + 0.7);
    } catch {}
  }
}

// Instancia singleton compartida
export const backgroundMusic = new BackgroundMusicEngine();

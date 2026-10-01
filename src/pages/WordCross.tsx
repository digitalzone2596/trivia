/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shuffle,
  Lightbulb,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Radio,
  Tv,
  Settings,
  Link,
  Unlink,
  Sparkles,
  Music,
  Play,
  Pause,
  Copy,
  Check,
} from 'lucide-react';
import { io as socketIOClient } from 'socket.io-client';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

import { ADDITIONAL_100_LEVELS } from './additionalLevels';
import { CHALLENGE_8_LEVELS } from './levels8';
import { backgroundMusic, MUSIC_TRACKS } from './audio/backgroundMusic';
import { CelebrationFireworks, CelebrationBanner } from '../components/CelebrationOverlay';

/* ========================================================
   DEFINICIÓN DE NIVELES (118 NIVELES CON DESAFÍOS DE 8 LETRAS)
   ======================================================== */
export interface WordItem {
  id: number;
  word: string;
  row: number;
  col: number;
  dir: 'H' | 'V';
  hasStars?: boolean;
}

export interface LevelData {
  id: number;
  name: string;
  letters: string[];
  words: WordItem[];
}

const INITIAL_LEVELS: LevelData[] = [
  {
    id: 1,
    name: "Nivel 1 - Bosque de Rosas",
    letters: ["P", "E", "E", "N", "M", "I"],
    words: [
      { id: 1, word: "PEINE", row: 0, col: 2, dir: "V", hasStars: true },
      { id: 2, word: "PIE", row: 0, col: 2, dir: "H" },
      { id: 3, word: "MINE", row: 3, col: 0, dir: "H" },
      { id: 4, word: "PIN", row: 2, col: 1, dir: "V" }
    ]
  },
  {
    id: 2,
    name: "Nivel 2 - Roble Dorado",
    letters: ["C", "A", "R", "T", "A", "S"],
    words: [
      { id: 1, word: "CASA", row: 0, col: 0, dir: "H" },
      { id: 2, word: "CARTA", row: 0, col: 0, dir: "V", hasStars: true },
      { id: 3, word: "TASA", row: 3, col: 0, dir: "H" },
      { id: 4, word: "ACTA", row: 0, col: 3, dir: "V" }
    ]
  },
  {
    id: 3,
    name: "Nivel 3 - Selva Mágica",
    letters: ["F", "L", "O", "R", "E", "S"],
    words: [
      { id: 1, word: "FLOR", row: 0, col: 1, dir: "V", hasStars: true },
      { id: 2, word: "FLORES", row: 1, col: 0, dir: "H" },
      { id: 3, word: "REO", row: 3, col: 1, dir: "H" },
      { id: 4, word: "SER", row: 1, col: 5, dir: "V" }
    ]
  }
];

const buildCombinedLevels = (): LevelData[] => {
  const base = [...INITIAL_LEVELS, ...(ADDITIONAL_100_LEVELS || [])];
  const combined: LevelData[] = [];
  let challengeIdx = 0;
  const challenges = CHALLENGE_8_LEVELS || [];

  for (let i = 0; i < base.length; i++) {
    combined.push(base[i]);
    if ((i + 1) % 6 === 0 && challengeIdx < challenges.length) {
      combined.push(challenges[challengeIdx++]);
    }
  }

  while (challengeIdx < challenges.length) {
    combined.push(challenges[challengeIdx++]);
  }

  return combined.map((lvl, index) => ({
    ...lvl,
    id: index + 1,
    name: lvl.name.includes('Desafío') ? `🔥 ${lvl.name} (8 Letras)` : lvl.name,
    words: lvl.words.map((w, wIdx) => ({
      ...w,
      hasStars: w.hasStars !== undefined ? w.hasStars : (wIdx === 0)
    }))
  }));
};

const LEVELS: LevelData[] = buildCombinedLevels();

export interface MagicParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  color: string;
  type: 'star' | 'sparkle' | 'glow' | 'ring';
  radius?: number;
}

export interface SolveNotification {
  id: string;
  type: 'word' | 'rose' | 'shuffle';
  username: string;
  avatar?: string;
  word?: string;
  letter?: string;
}

export interface SolvedWordMeta {
  wordId: number;
  username: string;
  avatar: string;
}

export const getAvatarUrl = (user: string, avatarUrl?: string): string => {
  if (avatarUrl && (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://'))) {
    return avatarUrl;
  }
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user)}`;
};

const cleanNormalize = (text: string) =>
  (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

/* ========================================================
   FOLLAJE DE ESQUINAS
   ======================================================== */
const CornerFoliage: React.FC<{ position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }> = ({ position }) => {
  const isRight = position.includes('right');
  const isBottom = position.includes('bottom');

  return (
    <div
      className={`absolute z-30 pointer-events-none ${
        isBottom ? '-bottom-2' : '-top-2'
      } ${isRight ? '-right-2' : '-left-2'}`}
      style={{
        transform: `${isRight ? 'scaleX(-1)' : ''} ${isBottom ? 'scaleY(-1)' : ''}`,
        width: '95px',
        height: '95px'
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
        <path d="M 0,0 C 25,5 45,20 50,45 C 30,40 10,25 0,0 Z" fill="#1b4d29" />
        <path d="M 0,0 C 15,30 35,45 60,40 C 45,25 25,10 0,0 Z" fill="#2d6e3c" />
        <path d="M 12,5 C 35,15 55,30 65,55 C 45,50 25,35 12,5 Z" fill="#429a55" />
        <path d="M 5,20 C 25,35 40,60 55,75 C 35,65 20,45 5,20 Z" fill="#358246" />
        <g transform="translate(42, 28) scale(0.9)">
          <circle cx="0" cy="-6" r="4.5" fill="#ffffff" />
          <circle cx="6" cy="-2" r="4.5" fill="#f8fafc" />
          <circle cx="4" cy="5" r="4.5" fill="#f1f5f9" />
          <circle cx="-4" cy="5" r="4.5" fill="#ffffff" />
          <circle cx="-6" cy="-2" r="4.5" fill="#f8fafc" />
          <circle cx="0" cy="0" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
        </g>
        <g transform="translate(25, 48) scale(0.75)">
          <circle cx="0" cy="-6" r="4.5" fill="#ffffff" />
          <circle cx="6" cy="-2" r="4.5" fill="#f8fafc" />
          <circle cx="4" cy="5" r="4.5" fill="#f1f5f9" />
          <circle cx="-4" cy="5" r="4.5" fill="#ffffff" />
          <circle cx="-6" cy="-2" r="4.5" fill="#f8fafc" />
          <circle cx="0" cy="0" r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
};

export default function WordCross() {
  const { user, userProfile } = useAuth();

  const searchParams = new URLSearchParams(window.location.search);
  const obsKey = searchParams.get('key');
  const isDirectObsUrl = searchParams.get('obs') === 'true' || searchParams.get('obs') === '1';
  const urlUser = searchParams.get('user')?.trim().replace(/^@/, '') || '';

  const [obsTikTokUser, setObsTikTokUser] = useState<string>('');
  const targetTikTokUser = userProfile?.tiktokUsername?.trim().replace(/^@/, '') || obsTikTokUser || urlUser;

  // Estados del juego
  const [levelIndex, setLevelIndex] = useState(0);
  const [wheelLetters, setWheelLetters] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [solvedWordIds, setSolvedWordIds] = useState<Set<number>>(new Set());
  const [solvedWordsMeta, setSolvedWordsMeta] = useState<Record<number, SolvedWordMeta>>({});
  const [revealedCellKeys, setRevealedCellKeys] = useState<Set<string>>(new Set());
  const [stars, setStars] = useState(20);
  const [notifications, setNotifications] = useState<SolveNotification[]>([]);
  const [isLevelCleared, setIsLevelCleared] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [roseAnimation, setRoseAnimation] = useState<{ id: string; user: string; avatar?: string } | null>(null);

  // Referencias para evitar Stale Closures en WebSockets
  const solvedWordIdsRef = useRef<Set<number>>(new Set());
  const revealedCellKeysRef = useRef<Set<string>>(new Set());
  const wheelLettersRef = useRef<string[]>([]);
  const selectedIndicesRef = useRef<number[]>([]);

  useEffect(() => {
    solvedWordIdsRef.current = solvedWordIds;
  }, [solvedWordIds]);

  useEffect(() => {
    revealedCellKeysRef.current = revealedCellKeys;
  }, [revealedCellKeys]);

  useEffect(() => {
    wheelLettersRef.current = wheelLetters;
  }, [wheelLetters]);

  useEffect(() => {
    selectedIndicesRef.current = selectedIndices;
  }, [selectedIndices]);

  // Barra de configuración y modo OBS
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isDirectObsUrl);
  const [isOBSMode, setIsOBSMode] = useState(isDirectObsUrl);
  const [copiedObs, setCopiedObs] = useState(false);

  // Conexión con TikTok LIVE
  const [tiktokUsername, setTiktokUsername] = useState(targetTikTokUser);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectedRoom, setConnectedRoom] = useState<string | null>(null);

  // Música ambiental
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(35);
  const [selectedTrack, setSelectedTrack] = useState('bosque-magico');

  // Referencias
  const audioCtxRef = useRef<AudioContext | null>(null);
  const isDraggingRef = useRef(false);
  const lastHoveredIndexRef = useRef<number>(-1);
  const socketRef = useRef<ReturnType<typeof socketIOClient> | null>(null);

  // Referencias partículas
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const boardSectionRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<MagicParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const currentLevel = LEVELS[levelIndex] || LEVELS[0];

  useEffect(() => {
    if (targetTikTokUser && !tiktokUsername) {
      setTiktokUsername(targetTikTokUser);
    }
  }, [targetTikTokUser, tiktokUsername]);

  /* ========================================================
     SISTEMA DE AUDIO
     ======================================================== */
  const initAudio = useCallback(() => {
    if (isMuted) return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, [isMuted]);

  const playMagicSparkleChime = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    const freqs = [1046.50, 1318.51, 1567.98, 2093.00];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.35);
      }, i * 45);
    });
  }, [initAudio]);

  const playWoodTap = useCallback((freq = 420) => {
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {}
  }, [initAudio]);

  const playTileFlip = useCallback((index = 0) => {
    const ctx = initAudio();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      const freq = notes[index % notes.length];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {}
  }, [initAudio]);

  const playRoseChime = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    const freqs = [783.99, 987.77, 1174.66, 1567.98];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.35);
      }, i * 70);
    });
  }, [initAudio]);

  const playSuccessChord = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.4);
      }, i * 65);
    });
  }, [initAudio]);

  const playFanfare = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (!audioCtxRef.current) return;
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.6);
      }, idx * 100);
    });
  }, [initAudio]);

  /* ========================================================
     INICIALIZAR Y CARGAR NIVEL
     ======================================================== */
  const loadLevel = useCallback((idx: number) => {
    const validIdx = ((idx % LEVELS.length) + LEVELS.length) % LEVELS.length;
    setLevelIndex(validIdx);
    setWheelLetters([...LEVELS[validIdx].letters]);
    solvedWordIdsRef.current = new Set();
    revealedCellKeysRef.current = new Set();
    setSolvedWordIds(new Set());
    setSolvedWordsMeta({});
    setRevealedCellKeys(new Set());
    setSelectedIndices([]);
    setIsLevelCleared(false);
  }, []);

  useEffect(() => {
    loadLevel(0);
  }, [loadLevel]);

  /* ========================================================
     ESTRUCTURA DE CELDAS
     ======================================================== */
  interface CellInfo {
    row: number;
    col: number;
    letter: string;
    wordIds: number[];
    isStar: boolean;
  }

  const { gridCells, totalRows, totalCols, minRow, minCol } = React.useMemo(() => {
    const map = new Map<string, CellInfo>();
    let minR = 999, maxR = -999, minC = 999, maxC = -999;

    currentLevel.words.forEach(w => {
      for (let i = 0; i < w.word.length; i++) {
        const r = w.dir === 'H' ? w.row : w.row + i;
        const c = w.dir === 'H' ? w.col + i : w.col;
        const letter = w.word[i].toUpperCase();

        minR = Math.min(minR, r);
        maxR = Math.max(maxR, r);
        minC = Math.min(minC, c);
        maxC = Math.max(maxC, c);

        const key = `${r},${c}`;
        if (!map.has(key)) {
          map.set(key, {
            row: r,
            col: c,
            letter,
            wordIds: [w.id],
            isStar: !!w.hasStars
          });
        } else {
          map.get(key)!.wordIds.push(w.id);
          if (w.hasStars) map.get(key)!.isStar = true;
        }
      }
    });

    const tRows = Math.max(1, maxR - minR + 1);
    const tCols = Math.max(1, maxC - minC + 1);

    return {
      gridCells: map,
      totalRows: tRows,
      totalCols: tCols,
      minRow: minR,
      minCol: minC
    };
  }, [currentLevel]);

  /* ========================================================
     PARTÍCULAS MÁGICAS
     ======================================================== */
  const startParticleLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const render = () => {
      const canvas = particleCanvasRef.current;
      if (!canvas) {
        animFrameRef.current = null;
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animFrameRef.current = null;
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= 0.94;
        p.vy = p.vy * 0.94 + 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.rotation += p.vRot;

        if (p.type === 'ring') p.radius = (p.radius || 10) + 2.5;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

        if (p.type === 'ring') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, 3 * p.alpha);
          ctx.shadowColor = '#ffd700';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius || 10, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'star') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#ffe066';
          ctx.shadowBlur = 9;
          ctx.beginPath();
          const spikes = 4;
          const outerRadius = p.size;
          const innerRadius = p.size * 0.35;
          for (let s = 0; s < spikes * 2; s++) {
            const r = s % 2 === 0 ? outerRadius : innerRadius;
            const angle = (s * Math.PI) / spikes;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'sparkle') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#fff6a9';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.35, 0, 0, Math.PI * 2);
          ctx.ellipse(0, 0, p.size * 0.35, p.size * 1.3, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 7;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      if (particles.length > 0) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  const triggerStarParticleBurst = useCallback((cellKey: string) => {
    const el = document.getElementById(`grid-cell-${cellKey}`);
    const section = boardSectionRef.current;
    const canvas = particleCanvasRef.current;
    if (!el || !section || !canvas) return;

    if (canvas.width !== section.clientWidth || canvas.height !== section.clientHeight) {
      canvas.width = section.clientWidth;
      canvas.height = section.clientHeight;
    }

    const elRect = el.getBoundingClientRect();
    const secRect = section.getBoundingClientRect();
    const cx = elRect.left - secRect.left + elRect.width / 2;
    const cy = elRect.top - secRect.top + elRect.height / 2;

    playMagicSparkleChime();

    const colors = ['#ffffff', '#fff7a9', '#ffe066', '#ffd700', '#f59e0b', '#fbbf24'];

    particlesRef.current.push({
      x: cx,
      y: cy,
      vx: 0,
      vy: 0,
      size: 0,
      alpha: 1,
      decay: 0.032,
      rotation: 0,
      vRot: 0,
      color: '#ffd700',
      type: 'ring',
      radius: 8
    });

    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const speed = 2.8 + Math.random() * 4.6;
      particlesRef.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.4,
        size: 9 + Math.random() * 8,
        alpha: 1,
        decay: 0.016 + Math.random() * 0.015,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'star'
      });
    }

    startParticleLoop();
  }, [playMagicSparkleChime, startParticleLoop]);

  /* ========================================================
     SHUFFLE
     ======================================================== */
  const triggerShuffle = useCallback((triggeredBy = 'Tú') => {
    playWoodTap(480);
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 500);

    setWheelLetters(prev => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
    setSelectedIndices([]);

    const notifId = `${Date.now()}-shuffle`;
    setNotifications(prev => [
      ...prev,
      { id: notifId, type: 'shuffle', username: triggeredBy }
    ]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    }, 2400);
  }, [playWoodTap]);

  /* ========================================================
     PISTA: 1 ROSA = 1 LETRA (SIN STALE CLOSURE)
     ======================================================== */
  const triggerRoseSingleLetterHint = useCallback((user = 'Seguidor', avatar?: string) => {
    const unrevealedKeys: string[] = [];
    gridCells.forEach((cell, key) => {
      const isWordSolved = cell.wordIds.some(wId => solvedWordIdsRef.current.has(wId));
      const isIndividuallyRevealed = revealedCellKeysRef.current.has(key);
      if (!isWordSolved && !isIndividuallyRevealed) {
        unrevealedKeys.push(key);
      }
    });

    if (unrevealedKeys.length === 0) return;

    const chosenKey = unrevealedKeys[Math.floor(Math.random() * unrevealedKeys.length)];
    const chosenCell = gridCells.get(chosenKey);
    if (!chosenCell) return;

    const userAvatar = getAvatarUrl(user, avatar);

    playRoseChime();
    setRoseAnimation({ id: `${Date.now()}`, user, avatar: userAvatar });
    setTimeout(() => setRoseAnimation(null), 2200);

    // Actualizar referencia y estado
    const nextRevealedKeys = new Set(revealedCellKeysRef.current);
    nextRevealedKeys.add(chosenKey);
    revealedCellKeysRef.current = nextRevealedKeys;
    setRevealedCellKeys(nextRevealedKeys);

    if (chosenCell.isStar || currentLevel.words.some(w => w.hasStars && chosenCell.wordIds.includes(w.id))) {
      setTimeout(() => {
        triggerStarParticleBurst(chosenKey);
      }, 80);
    }

    const notifId = `${Date.now()}-rose`;
    setNotifications(prev => [
      ...prev,
      { id: notifId, type: 'rose', username: user, avatar: userAvatar, letter: chosenCell.letter }
    ]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    }, 3200);

    setStars(prev => prev + 5);

    // Comprobar si al revelar la letra se completó alguna palabra
    const nextSolved = new Set(solvedWordIdsRef.current);
    currentLevel.words.forEach(w => {
      if (!nextSolved.has(w.id)) {
        let isComplete = true;
        for (let i = 0; i < w.word.length; i++) {
          const r = w.dir === 'H' ? w.row : w.row + i;
          const c = w.dir === 'H' ? w.col + i : w.col;
          const cellKey = `${r},${c}`;
          const isKeyRevealed = nextRevealedKeys.has(cellKey);
          const isWordInKeySolved = gridCells.get(cellKey)?.wordIds.some(id => nextSolved.has(id));
          if (!isKeyRevealed && !isWordInKeySolved) {
            isComplete = false;
            break;
          }
        }
        if (isComplete) {
          nextSolved.add(w.id);
          setSolvedWordsMeta(prev => ({
            ...prev,
            [w.id]: { wordId: w.id, username: user, avatar: userAvatar }
          }));
        }
      }
    });

    if (nextSolved.size > solvedWordIdsRef.current.size) {
      solvedWordIdsRef.current = nextSolved;
      setSolvedWordIds(nextSolved);
      playSuccessChord();
    }

    if (currentLevel.words.every(w => nextSolved.has(w.id))) {
      setTimeout(() => {
        setIsLevelCleared(true);
        playFanfare();
      }, 700);
    }
  }, [gridCells, currentLevel, playRoseChime, playSuccessChord, playFanfare, triggerStarParticleBurst]);

  /* ========================================================
     ADIVINAR PALABRA DESDE EL CHAT (SIN STALE CLOSURE)
     ======================================================== */
  const guessWord = useCallback((rawWord: string, username = 'Jugador', avatar?: string) => {
    if (!rawWord || typeof rawWord !== 'string') return;
    const cleanWord = cleanNormalize(rawWord);

    if (cleanWord === 'SHUFFLE' || cleanWord === 'MEZCLAR' || cleanWord === 'GIRA') {
      triggerShuffle(username);
      return;
    }

    const targetWord = currentLevel.words.find(w => cleanNormalize(w.word) === cleanWord);
    if (!targetWord || solvedWordIdsRef.current.has(targetWord.id)) {
      setSelectedIndices([]);
      return;
    }

    const userAvatar = getAvatarUrl(username, avatar);

    const nextSolved = new Set(solvedWordIdsRef.current);
    nextSolved.add(targetWord.id);
    solvedWordIdsRef.current = nextSolved;
    setSolvedWordIds(nextSolved);

    setSolvedWordsMeta(prev => ({
      ...prev,
      [targetWord.id]: {
        wordId: targetWord.id,
        username,
        avatar: userAvatar
      }
    }));
    setSelectedIndices([]);

    playSuccessChord();

    for (let i = 0; i < targetWord.word.length; i++) {
      setTimeout(() => playTileFlip(i), i * 90);
    }

    if (targetWord.hasStars) {
      for (let i = 0; i < targetWord.word.length; i++) {
        const r = targetWord.dir === 'H' ? targetWord.row : targetWord.row + i;
        const c = targetWord.dir === 'H' ? targetWord.col + i : targetWord.col;
        const key = `${r},${c}`;
        setTimeout(() => {
          triggerStarParticleBurst(key);
        }, i * 90 + 70);
      }
    }

    setStars(prev => prev + 10);

    const notifId = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [
      ...prev,
      { id: notifId, type: 'word', username, avatar: userAvatar, word: targetWord.word }
    ]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    }, 2800);

    if (currentLevel.words.every(w => nextSolved.has(w.id))) {
      setTimeout(() => {
        setIsLevelCleared(true);
        playFanfare();
      }, 700);
    }
  }, [currentLevel, triggerShuffle, playSuccessChord, playTileFlip, playFanfare, triggerStarParticleBurst]);

  /* ========================================================
     CONEXIÓN SOCKET.IO CON SERVER.JS
     ======================================================== */
  const handleConnectTikTok = useCallback(async (targetHandle?: string) => {
    const handleToConnect = (targetHandle || tiktokUsername || targetTikTokUser).trim().replace(/^@/, '');
    if (!handleToConnect) return;

    setConnectionStatus('connecting');

    if (socketRef.current) {
      socketRef.current.emit('unirseSalaStreamer', { username: handleToConnect });
      socketRef.current.emit('conectarTikTok', { username: handleToConnect });
    }

    try {
      const res = await fetch('/api/tiktok/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: handleToConnect })
      });
      const data = await res.json();
      if (data?.estado === 'conectado') {
        setConnectionStatus('connected');
        setConnectedRoom(handleToConnect);
      } else if (data?.estado === 'error') {
        setConnectionStatus('error');
      }
    } catch {
      // Manejado vía socket
    }
  }, [tiktokUsername, targetTikTokUser]);

  const handleDisconnectTikTok = useCallback(async () => {
    const handle = (connectedRoom || tiktokUsername).trim().replace(/^@/, '');
    if (socketRef.current) {
      socketRef.current.emit('desconectarTikTok', { username: handle });
    }
    try {
      await fetch('/api/tiktok/desconectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: handle })
      });
    } catch {}
    setConnectionStatus('disconnected');
    setConnectedRoom(null);
  }, [connectedRoom, tiktokUsername]);

  useEffect(() => {
    const socket = socketIOClient();
    socketRef.current = socket;

    socket.on('connect', () => {
      const currentHandle = (targetTikTokUser || tiktokUsername).trim().replace(/^@/, '');
      if (currentHandle) {
        socket.emit('unirseSalaStreamer', { username: currentHandle });
      }
    });

    socket.on('tiktokEstado', (data: { estado: 'desconectado' | 'conectando' | 'conectado' | 'error'; username?: string }) => {
      if (data.estado === 'conectado') {
        setConnectionStatus('connected');
        setConnectedRoom(data.username?.replace(/^@/, '') || null);
      } else if (data.estado === 'conectando') {
        setConnectionStatus('connecting');
      } else if (data.estado === 'error') {
        setConnectionStatus('error');
      } else {
        setConnectionStatus('disconnected');
        setConnectedRoom(null);
      }
    });

    const handleIncomingChat = (data: { usuario?: string; user?: string; mensaje?: string; comment?: string; foto?: string; avatar?: string }) => {
      const user = (data.usuario || data.user || '').replace(/^@/, '');
      const comment = (data.mensaje || data.comment || '').trim();
      const avatar = data.foto || data.avatar;

      if (!comment) return;

      if (comment.toLowerCase() === 'shuffle' || comment.toLowerCase() === 'mezclar') {
        triggerShuffle(user);
      } else {
        comment.split(/\s+/).forEach((w: string) => {
          const stripped = w.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
          if (stripped.length >= 2) {
            guessWord(stripped, user, avatar);
          }
        });
      }
    };

    socket.on('tiktokChat', handleIncomingChat);
    socket.on('comentarioTikTokReal', handleIncomingChat);

    const handleIncomingGift = (data: { usuario?: string; user?: string; foto?: string; avatar?: string; regalo?: string; giftName?: string; monedas?: number; cantidad?: number; repeatCount?: number }) => {
      const user = (data.usuario || data.user || '').replace(/^@/, '');
      const avatar = data.foto || data.avatar;
      const giftName = String(data.regalo || data.giftName || '').toLowerCase();
      const count = data.cantidad || data.repeatCount || 1;

      if (giftName.includes('rose') || giftName.includes('rosa') || (data.monedas && data.monedas <= 4)) {
        for (let i = 0; i < Math.min(count, 5); i++) {
          setTimeout(() => {
            triggerRoseSingleLetterHint(user, avatar);
          }, i * 350);
        }
      }
    };

    socket.on('tiktokRegalo', handleIncomingGift);
    socket.on('tiktokDonacion', handleIncomingGift);

    return () => {
      socket.disconnect();
    };
  }, [triggerShuffle, guessWord, triggerRoseSingleLetterHint, targetTikTokUser, tiktokUsername]);

  useEffect(() => {
    if (socketRef.current && targetTikTokUser) {
      socketRef.current.emit('unirseSalaStreamer', { username: targetTikTokUser });
    }
  }, [targetTikTokUser]);

  useEffect(() => {
    if (!obsKey) return;

    let isMounted = true;
    async function syncObsStreamer() {
      try {
        const snap = await getDoc(doc(db, 'users', obsKey!));
        if (snap.exists() && isMounted) {
          const userData = snap.data();
          const handle = (userData?.tiktokUsername || urlUser || '').trim().replace(/^@/, '');
          if (handle) {
            setObsTikTokUser(handle);
            setTiktokUsername(handle);
            setTimeout(() => {
              handleConnectTikTok(handle);
            }, 1200);
          }
        }
      } catch (err) {
        console.error('Error al sincronizar streamer en OBS:', err);
      }
    }

    syncObsStreamer();
    return () => {
      isMounted = false;
    };
  }, [obsKey, urlUser, handleConnectTikTok]);

  const handleCopyObsUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    const activeKey = user?.uid || obsKey;

    if (activeKey) params.set('key', activeKey);
    if (targetTikTokUser) params.set('user', targetTikTokUser);
    params.set('obs', '1');

    const fullUrl = `${origin}/word-cross?${params.toString()}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedObs(true);
      setTimeout(() => setCopiedObs(false), 2200);
    });
  };

  /* ========================================================
     MÚSICA DE FONDO
     ======================================================== */
  const handleToggleMusic = useCallback(() => {
    if (isMusicPlaying) {
      backgroundMusic.pause();
      setIsMusicPlaying(false);
    } else {
      backgroundMusic.setTrack(selectedTrack);
      backgroundMusic.setVolume(musicVolume / 100);
      backgroundMusic.play();
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying, selectedTrack, musicVolume]);

  const handleVolumeChange = useCallback((newVol: number) => {
    setMusicVolume(newVol);
    backgroundMusic.setVolume(newVol / 100);
  }, []);

  const handleSelectTrack = useCallback((trackId: string) => {
    setSelectedTrack(trackId);
    backgroundMusic.setTrack(trackId);
    if (!isMusicPlaying) {
      backgroundMusic.play();
      setIsMusicPlaying(true);
    }
  }, [isMusicPlaying]);

  const letterPositions = React.useMemo(() => {
    const count = wheelLetters.length || 6;
    const centerX = 130;
    const centerY = 130;
    const tileSize = count >= 8 ? 38 : 42;
    const radius = count >= 8 ? 85 : 82;
    const pos: { x: number; y: number }[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      const x = Math.round(centerX + radius * Math.cos(angle) - tileSize / 2);
      const y = Math.round(centerY + radius * Math.sin(angle) - tileSize / 2);
      pos.push({ x, y });
    }
    return pos;
  }, [wheelLetters.length]);

  const handleLetterPointerDown = (idx: number, e: React.PointerEvent) => {
    e.preventDefault();
    initAudio();
    isDraggingRef.current = true;
    lastHoveredIndexRef.current = idx;
    playWoodTap(420);
    setSelectedIndices([idx]);

    const handlePointerMove = (moveEvt: PointerEvent) => {
      if (!isDraggingRef.current) return;
      const el = document.elementFromPoint(moveEvt.clientX, moveEvt.clientY);
      const nodeEl = el?.closest('[data-letter-index]');
      if (nodeEl) {
        const nodeIdx = parseInt(nodeEl.getAttribute('data-letter-index') || '-1', 10);
        if (nodeIdx !== -1 && nodeIdx !== lastHoveredIndexRef.current) {
          lastHoveredIndexRef.current = nodeIdx;
          setSelectedIndices(prev => {
            if (prev.length > 1 && prev[prev.length - 2] === nodeIdx) {
              playWoodTap(340);
              return prev.slice(0, -1);
            }
            if (!prev.includes(nodeIdx)) {
              playWoodTap(380 + (prev.length + 1) * 60);
              return [...prev, nodeIdx];
            }
            return prev;
          });
        }
      }
    };

    const handlePointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      lastHoveredIndexRef.current = -1;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);

      const formedWord = selectedIndicesRef.current.map(i => wheelLettersRef.current[i]).join('');
      setSelectedIndices([]);
      if (formedWord.length >= 2) {
        guessWord(formedWord, 'Tú');
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H' || e.key === 'c' || e.key === 'C') {
        setIsSidebarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="flex h-screen w-screen overflow-hidden font-sans text-neutral-100"
      style={{
        background: isOBSMode && isDirectObsUrl ? 'transparent' : 'radial-gradient(ellipse at 50% 35%, #183e25 0%, #0d2617 45%, #05130b 100%)'
      }}
    >
      {/* ESTILOS NATIVOS 3D PARA ASEGURAR QUE LAS CASILLAS GIREN EN CUALQUIER NAVEGADOR Y OBS */}
      <style>{`
        .wc-card-flip {
          perspective: 1000px;
        }
        .wc-flip-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          -webkit-transform-style: preserve-3d;
        }
        .wc-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .wc-face-back {
          transform: rotateY(180deg);
          -webkit-transform: rotateY(180deg);
        }
      `}</style>

      {/* BARRA DE CONFIGURACIÓN LATERAL */}
      {isSidebarOpen && !isOBSMode && (
        <aside className="w-80 md:w-88 flex-shrink-0 flex flex-col border-r border-emerald-950/80 bg-neutral-900/95 backdrop-blur z-40 overflow-hidden shadow-2xl transition-all">
          <div className="p-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white">Word Cross TikTok</h1>
                <p className="text-[10.5px] text-neutral-400">Control de Transmisión</p>
              </div>
            </div>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-xs font-semibold"
              title="Ocultar barra de configuración (tecla H o C)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Ocultar</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* BOTÓN COPIAR ENLACE OBS */}
            <button
              onClick={handleCopyObsUrl}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              {copiedObs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
              <span>{copiedObs ? '¡Enlace de OBS Copiado!' : 'Copiar URL para OBS / Studio'}</span>
            </button>

            {/* CONEXIÓN CON TIKTOK LIVE */}
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-rose-400" />
                  <span>Conexión TikTok LIVE</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    connectionStatus === 'connected'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : connectionStatus === 'connecting'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : connectionStatus === 'connecting' ? 'bg-amber-400' : 'bg-neutral-500'
                  }`} />
                  {connectionStatus === 'connected' ? 'EN VIVO' : connectionStatus === 'connecting' ? 'CONECTANDO' : 'OFFLINE'}
                </span>
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Usuario de TikTok:
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 font-bold">@</span>
                  <input
                    type="text"
                    value={tiktokUsername}
                    onChange={e => setTiktokUsername(e.target.value)}
                    placeholder="tunombre_live"
                    disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                    className="w-full pl-7 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-neutral-100 text-xs font-semibold focus:outline-none focus:border-amber-500 disabled:opacity-70"
                  />
                </div>
              </div>

              {connectionStatus !== 'connected' ? (
                <button
                  onClick={() => handleConnectTikTok()}
                  disabled={connectionStatus === 'connecting' || !tiktokUsername.trim()}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Conectar a TikTok LIVE</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-[11px]">
                    ✓ Conectado a <strong>@{connectedRoom || tiktokUsername}</strong>
                  </div>
                  <button
                    onClick={handleDisconnectTikTok}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Unlink className="w-3.5 h-3.5" />
                    <span>Desconectar</span>
                  </button>
                </div>
              )}

              <div className="pt-1 text-[10.5px] text-neutral-400 leading-relaxed space-y-1 border-t border-neutral-800/80">
                <p>• <strong>Chat:</strong> Los espectadores adivinan palabras en tiempo real.</p>
                <p>• <strong>Shuffle:</strong> Al comentar "shuffle" se mezclan las letras.</p>
                <p>• <strong>Rosas (🌹):</strong> Cada rosa revela 1 sola letra pista.</p>
              </div>
            </div>

            {/* BOTONES DE PRUEBA MANUAL */}
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 space-y-2.5">
              <span className="font-bold text-neutral-200 block text-xs">Pruebas Manuales (Streamer):</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => triggerRoseSingleLetterHint('Streamer')}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-rose-950 to-rose-900 border border-rose-500/60 text-rose-200 font-bold flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all shadow cursor-pointer text-xs"
                >
                  <span>🌹 Probar Rosa</span>
                </button>

                <button
                  onClick={() => triggerShuffle('Streamer')}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 to-emerald-900 border border-emerald-500/60 text-emerald-200 font-bold flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all shadow cursor-pointer text-xs"
                >
                  <Shuffle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Probar Shuffle</span>
                </button>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-neutral-400 block mb-1">Palabras de este nivel:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentLevel.words.map(w => {
                    const isSolved = solvedWordIds.has(w.id);
                    return (
                      <button
                        key={w.id}
                        onClick={() => guessWord(w.word, 'Streamer')}
                        className={`px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          isSolved
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 opacity-50'
                            : 'bg-amber-950/50 text-amber-300 border border-amber-700/60 hover:bg-amber-900/60'
                        }`}
                      >
                        {isSolved ? `✓ ${w.word}` : w.word}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* MÚSICA AMBIENTAL */}
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5 text-xs">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <span>Música Ambiental</span>
                </span>
              </div>

              <button
                onClick={handleToggleMusic}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  isMusicPlaying
                    ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-neutral-950'
                }`}
              >
                {isMusicPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>Pausar Música</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Reproducir Música</span>
                  </>
                )}
              </button>

              <div className="space-y-1.5 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800/80">
                <div className="flex items-center justify-between text-[11px] text-neutral-300">
                  <span className="flex items-center gap-1 text-neutral-400">
                    {musicVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Volumen:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-300">{musicVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  onChange={e => handleVolumeChange(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] text-neutral-400 block">Estilo de Pista:</label>
                <div className="grid grid-cols-1 gap-1">
                  {(MUSIC_TRACKS || []).map(track => {
                    const isSelected = selectedTrack === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track.id)}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left transition-all text-xs flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-950/80 border border-emerald-500/70 text-emerald-200 font-bold'
                            : 'bg-neutral-900/50 hover:bg-neutral-800/70 text-neutral-400 border border-transparent'
                        }`}
                      >
                        <span>{track.name}</span>
                        {isSelected && isMusicPlaying && (
                          <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-extrabold">Sonando</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SELECTOR DE NIVELES */}
          <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => loadLevel(levelIndex - 1)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Nivel anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => loadLevel(levelIndex + 1)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Siguiente nivel"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <select
              value={levelIndex}
              onChange={e => loadLevel(parseInt(e.target.value, 10))}
              className="max-w-[150px] bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer truncate"
            >
              {LEVELS.map((lvl, idx) => (
                <option key={lvl.id} value={idx} className="bg-neutral-900 text-neutral-200">
                  {lvl.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <button
                onClick={() => loadLevel(levelIndex)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Reiniciar tablero"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ÁREA CENTRAL DEL JUEGO (CABINA 9:16) */}
      <main
        className="flex-1 relative flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none"
        style={{
          background: isOBSMode && isDirectObsUrl ? 'transparent' : 'radial-gradient(ellipse at 50% 35%, #183e25 0%, #0d2617 45%, #05130b 100%)'
        }}
      >
        {!isSidebarOpen && !isOBSMode && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-50 px-3.5 py-2.5 rounded-2xl bg-[#092014]/90 hover:bg-[#0f2e1e] text-emerald-200 border-2 border-emerald-500/40 text-xs font-bold flex items-center gap-2.5 backdrop-blur-md shadow-2xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Mostrar panel de configuración y conexión TikTok LIVE (Tecla H o C)"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>⚙️ Panel TikTok LIVE</span>
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-amber-400 animate-pulse' : 'bg-neutral-500'
            }`} />
          </button>
        )}

        {/* BOTÓN MODO OBS */}
        <button
          onClick={() => setIsOBSMode(!isOBSMode)}
          className="absolute top-4 right-4 z-50 p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 text-xs font-semibold backdrop-blur shadow-lg transition-all cursor-pointer"
          title={isOBSMode ? 'Salir de modo OBS puro' : 'Modo OBS transparente'}
        >
          <Tv className="w-4 h-4" />
        </button>

        {/* CABINA DEL JUEGO (9:16) */}
        <div
          className="relative w-full max-w-[420px] aspect-[9/16] max-h-[860px] rounded-[38px] flex flex-col justify-between overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
          style={{
            padding: '14px',
            background: 'linear-gradient(135deg, #703a16 0%, #4a240d 40%, #2b1306 100%)',
            boxShadow: '0 0 0 4px #8f4d1d, 0 16px 50px rgba(0,0,0,0.95), inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.7)'
          }}
        >
          <CornerFoliage position="top-left" />
          <CornerFoliage position="top-right" />
          <CornerFoliage position="bottom-left" />
          <CornerFoliage position="bottom-right" />

          <div className="relative w-full h-full rounded-[26px] overflow-hidden flex flex-col justify-between border-2 border-amber-900/70 shadow-inner">
            {/* NOTIFICACIONES FLOTANTES CON FOTO Y NOMBRE */}
            <div className="absolute top-14 left-3 right-3 flex flex-col items-center gap-1.5 pointer-events-none z-50">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 shadow-2xl animate-bounce max-w-full ${
                    n.type === 'rose'
                      ? 'bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 border-rose-400 text-rose-100 shadow-rose-900/80'
                      : n.type === 'shuffle'
                      ? 'bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-emerald-400 text-emerald-100'
                      : 'bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-amber-400 text-amber-100'
                  }`}
                >
                  <img
                    src={n.avatar || getAvatarUrl(n.username)}
                    alt={n.username}
                    className="w-6 h-6 rounded-full object-cover border-[1.5px] border-white/80 shadow flex-shrink-0 bg-neutral-900"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(n.username)}`;
                    }}
                  />
                  {n.type === 'rose' ? (
                    <span className="text-base flex-shrink-0">🌹</span>
                  ) : n.type === 'shuffle' ? (
                    <Shuffle className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                  ) : (
                    <span className="text-xs flex-shrink-0">🏆</span>
                  )}
                  <span className="text-[11px] font-bold leading-tight truncate">
                    {n.type === 'rose' ? (
                      <>
                        <span className="text-rose-300 font-extrabold">@{n.username}</span> donó 1 Rosa 🌹 → ¡Letra <strong className="text-white underline">"{n.letter}"</strong> revelada!
                      </>
                    ) : n.type === 'shuffle' ? (
                      <>
                        <span className="text-emerald-300 font-extrabold">@{n.username}</span> escribió "shuffle" → <strong>¡Letras giradas!</strong>
                      </>
                    ) : (
                      <>
                        <span className="text-amber-300 font-extrabold">@{n.username}</span> adivinó <strong className="text-emerald-400 underline">{n.word}</strong>!
                      </>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* ANIMACIÓN DONACIÓN ROSA */}
            {roseAnimation && (
              <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-1.5 px-5 py-4 rounded-3xl bg-neutral-950/92 border-2 border-rose-400 shadow-[0_15px_40px_rgba(244,63,94,0.7)] animate-in zoom-in-75 duration-300">
                  <div className="relative">
                    <img
                      src={roseAnimation.avatar || getAvatarUrl(roseAnimation.user)}
                      alt={roseAnimation.user}
                      className="w-14 h-14 rounded-full object-cover border-2 border-rose-300 shadow-lg bg-neutral-900"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(roseAnimation.user)}`;
                      }}
                    />
                    <span className="absolute -bottom-2 -right-1 text-2xl animate-bounce">🌹</span>
                  </div>
                  <span className="text-xs font-black text-rose-300">@{roseAnimation.user}</span>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/50">
                    ¡Donó 1 Rosa!
                  </span>
                </div>
              </div>
            )}

            {/* 1. SECCIÓN SUPERIOR: CRUCIGRAMA */}
            <div
              ref={boardSectionRef}
              className="relative flex-1 w-full flex flex-col items-center pt-3 pb-2 px-3 overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #d39b56 0%, #c48b45 40%, #b27633 100%)',
                backgroundImage: `
                  repeating-linear-gradient(180deg, transparent 0px, transparent 38px, rgba(80, 40, 12, 0.22) 39px, rgba(255, 235, 190, 0.18) 40px),
                  linear-gradient(180deg, #d39b56 0%, #c48b45 40%, #b27633 100%)
                `
              }}
            >
              <canvas
                ref={particleCanvasRef}
                className="absolute inset-0 pointer-events-none z-30 w-full h-full"
              />

              <div
                className="relative py-1.5 px-4 rounded-full border-2 border-[#7a441a] shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2)] text-center mb-3 z-10"
                style={{
                  background: 'linear-gradient(180deg, #431f0b 0%, #291206 100%)'
                }}
              >
                <h2 className="text-[12px] sm:text-[13px] font-bold text-[#fed989] tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  Escribe una palabra para resolver el tablero
                </h2>
              </div>

              {(() => {
                const maxDim = Math.max(totalRows, totalCols, 1);
                const cellSize = maxDim >= 8 ? 24 : maxDim >= 7 ? 27 : Math.min(35, Math.max(28, Math.floor(215 / maxDim)));
                const gapSize = maxDim >= 8 ? 3 : maxDim >= 6 ? 4 : 5;
                return (
                  <div className="flex-1 flex items-center justify-center w-full">
                    <div
                      className="grid"
                      style={{
                        gridTemplateRows: `repeat(${totalRows}, ${cellSize}px)`,
                        gridTemplateColumns: `repeat(${totalCols}, ${cellSize}px)`,
                        gap: `${gapSize}px`
                      }}
                    >
                      {Array.from({ length: totalRows }).map((_, rIdx) => {
                        const r = minRow + rIdx;
                        return Array.from({ length: totalCols }).map((__, cIdx) => {
                          const c = minCol + cIdx;
                          const key = `${r},${c}`;
                          const cell = gridCells.get(key);

                          if (!cell) {
                            return <div key={key} style={{ width: `${cellSize}px`, height: `${cellSize}px` }} className="invisible" />;
                          }

                          const isRevealed = cell.wordIds.some(wId => solvedWordIds.has(wId)) || revealedCellKeys.has(key);
                          const startingSolvedWords = currentLevel.words.filter(
                            w => w.row === r && w.col === c && solvedWordIds.has(w.id)
                          );

                          return (
                            <div
                              key={key}
                              id={`grid-cell-${key}`}
                              data-cell-key={key}
                              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                              className="relative wc-card-flip"
                            >
                              {startingSolvedWords.length > 0 && (() => {
                                const firstWord = startingSolvedWords[0];
                                const meta = solvedWordsMeta[firstWord.id];
                                const isHoriz = firstWord.dir === 'H';
                                const solverName = meta?.username || 'Jugador';
                                const avatarUrl = meta?.avatar || getAvatarUrl(solverName);

                                return (
                                  <div
                                    className={`absolute z-30 pointer-events-none flex items-center justify-center animate-in zoom-in-50 duration-300 ${
                                      isHoriz ? '-top-2.5 -left-2.5' : '-top-3 left-1/2 -translate-x-1/2'
                                    }`}
                                    title={`Palabra encontrada por @${solverName}`}
                                  >
                                    <div className="relative">
                                      <img
                                        src={avatarUrl}
                                        alt={solverName}
                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border-[1.5px] border-amber-300 ring-1 ring-black shadow-[0_2px_6px_rgba(0,0,0,0.9)] bg-neutral-900"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(solverName)}`;
                                        }}
                                      />
                                      <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* CONTENEDOR 3D FLIP NATIVO */}
                              <div
                                className="wc-flip-inner"
                                style={{
                                  transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                  WebkitTransform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)',
                                }}
                              >
                                {/* LADO FRONTAL: Madera oscura (Sin revelar) */}
                                <div
                                  className="wc-face"
                                  style={{
                                    background: 'linear-gradient(145deg, #44210d 0%, #2c1407 100%)',
                                    boxShadow: 'inset 2.5px 2.5px 5px rgba(0,0,0,0.85), inset -1.5px -1.5px 3px rgba(255,255,255,0.08), 0 2px 4px rgba(0,0,0,0.4)',
                                    border: '1px solid rgba(80, 40, 15, 0.6)'
                                  }}
                                >
                                  {cell.isStar && (
                                    <svg className="w-4 h-4 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]" viewBox="0 0 24 24">
                                      <defs>
                                        <linearGradient id={`starGrad-${key}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                          <stop offset="0%" stopColor="#fff3a1" />
                                          <stop offset="50%" stopColor="#d99824" />
                                          <stop offset="100%" stopColor="#87510b" />
                                        </linearGradient>
                                      </defs>
                                      <path
                                        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                        fill={`url(#starGrad-${key})`}
                                        stroke="#5a3106"
                                        strokeWidth="0.8"
                                      />
                                    </svg>
                                  )}
                                </div>

                                {/* LADO POSTERIOR: Oro pulido con letra (Revelado) */}
                                <div
                                  className="wc-face wc-face-back font-black text-[#2a1305]"
                                  style={{
                                    background: 'linear-gradient(135deg, #fae28c 0%, #d89f38 50%, #996417 100%)',
                                    borderTop: '2px solid #ffffff',
                                    borderBottom: '2.5px solid #6d4207',
                                    boxShadow: '0 3px 8px rgba(0,0,0,0.7), 0 0 10px rgba(255,224,102,0.6)',
                                    fontSize: cellSize <= 25 ? '12px' : cellSize <= 28 ? '14px' : '18px'
                                  }}
                                >
                                  {cell.letter}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* SEPARADOR DE MADERA */}
            <div
              className="w-full h-2.5 z-20 flex-shrink-0"
              style={{
                background: 'linear-gradient(180deg, #6b3514 0%, #301507 100%)',
                borderTop: '1px solid #945226',
                borderBottom: '2px solid #1f0b03',
                boxShadow: '0 2px 6px rgba(0,0,0,0.6)'
              }}
            />

            {/* 2. SECCIÓN INFERIOR: RUEDA DE LETRAS */}
            <div
              className="relative flex-1 w-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'radial-gradient(circle at 50% 50%, #1c5e37 0%, #124326 65%, #082414 100%)',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
              }}
            >
              <div className="absolute top-3 left-4 z-30 flex flex-col items-center">
                <button
                  onClick={() => triggerShuffle('Tú')}
                  className="w-9 h-9 rounded-full flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.7),inset_0_2px_3px_rgba(255,255,255,0.4)] active:scale-95 transition-all cursor-pointer"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #5ce67e 0%, #1e8a3a 60%, #0d4a1c 100%)',
                    border: '2px solid #ffd700'
                  }}
                  title="Mezclar letras ('shuffle')"
                >
                  <Shuffle className={`w-4 h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${isSpinning ? 'animate-spin' : ''}`} />
                </button>
                <div
                  className="mt-0.5 py-0.5 px-2 rounded-full text-[8.5px] font-black uppercase tracking-wider text-amber-200 border border-[#6b3813] shadow"
                  style={{ background: 'linear-gradient(180deg, #3d1b09, #1c0b03)' }}
                >
                  shuffle
                </div>
              </div>

              <div className="absolute top-3 right-4 z-30 flex flex-col items-center">
                <button
                  onClick={() => triggerRoseSingleLetterHint('Tú')}
                  className="relative w-9 h-9 rounded-full flex items-center justify-center shadow-[0_4px_8px_rgba(0,0,0,0.7),inset_0_2px_3px_rgba(255,255,255,0.4)] active:scale-95 transition-all cursor-pointer"
                  style={{
                    background: 'radial-gradient(circle at 35% 35%, #5ce67e 0%, #1e8a3a 60%, #0d4a1c 100%)',
                    border: '2px solid #ffd700'
                  }}
                  title="Cada Rosa revela 1 sola letra"
                >
                  <Lightbulb className="w-4 h-4 text-amber-300 fill-amber-300 drop-shadow-[0_0_4px_rgba(255,215,0,0.8)]" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-rose-950 border border-rose-400 flex items-center justify-center shadow text-[9px]">
                    🌹
                  </div>
                </button>
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {selectedIndices.length > 1 && (
                  <polyline
                    points={selectedIndices
                      .map(idx => {
                        const pos = letterPositions[idx % letterPositions.length];
                        const offset = (wheelLetters.length >= 8 ? 38 : 42) / 2;
                        return `${pos.x + offset},${pos.y + offset}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke="#ffd700"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.9))' }}
                  />
                )}
              </svg>

              <div className="relative w-[260px] h-[260px]">
                {wheelLetters.map((char, idx) => {
                  const pos = letterPositions[idx % letterPositions.length] || { x: 110, y: 110 };
                  const isSelected = selectedIndices.includes(idx);
                  const tileSize = wheelLetters.length >= 8 ? 38 : 42;

                  return (
                    <div
                      key={idx}
                      data-letter-index={idx}
                      onPointerDown={e => handleLetterPointerDown(idx, e)}
                      className={`absolute rounded-xl flex items-center justify-center font-black cursor-pointer select-none transition-all duration-300 ${
                        isSpinning ? 'rotate-[360deg] scale-110' : ''
                      } ${
                        isSelected
                          ? 'scale-110 shadow-[0_0_16px_rgba(255,215,0,0.9)] border-2 border-white'
                          : 'shadow-[0_6px_14px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95'
                      }`}
                      style={{
                        width: `${tileSize}px`,
                        height: `${tileSize}px`,
                        fontSize: tileSize < 40 ? '18px' : '21px',
                        left: `${pos.x}px`,
                        top: `${pos.y}px`,
                        background: 'linear-gradient(145deg, #dcb072 0%, #ba8343 55%, #8c5720 100%)',
                        borderTop: '2px solid #fae5be',
                        borderLeft: '2px solid #ecd39d',
                        borderRight: '2px solid #734215',
                        borderBottom: '3.5px solid #4a270b',
                        color: '#2b1305',
                        textShadow: '0 1px 1px rgba(255,255,255,0.6), 0 -1px 1px rgba(0,0,0,0.4)',
                        fontFamily: "'Outfit', sans-serif"
                      }}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BANNER DE VICTORIA */}
            <CelebrationBanner
              isOpen={isLevelCleared}
              levelName={currentLevel.name}
              levelNumber={levelIndex + 1}
              onNextLevel={() => loadLevel(levelIndex + 1)}
              onReplayLevel={() => loadLevel(levelIndex)}
            />
          </div>
        </div>
      </main>

      {/* FUEGOS ARTIFICIALES */}
      <CelebrationFireworks isOpen={isLevelCleared} isMuted={isMuted} />
    </div>
  );
}

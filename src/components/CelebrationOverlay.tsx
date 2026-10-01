/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Overlay global de fuegos artificiales y confeti 3D para celebración de nivel completado.
 * - CelebrationFireworks: fuegos artificiales y confeti a pantalla completa.
 * - CelebrationBanner: modal de victoria colocado en frente del tablero (dentro del frame 9:16).
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Trophy, ChevronRight, Sparkles, RotateCcw } from 'lucide-react';

interface FireworkRocket {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  flicker: boolean;
  type: 'spark' | 'star' | 'ring';
  radius?: number;
  maxRadius?: number;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  tilt: number;
  vTilt: number;
  width: number;
  height: number;
  color: string;
  shape: 'rect' | 'circle' | 'star';
}

const PALETTE = [
  '#ffd700', // Oro brillante
  '#ffec8b', // Oro pálido
  '#10b981', // Esmeralda
  '#34d399', // Menta
  '#f43f5e', // Rosa fuego
  '#fb7185', // Rosa suave
  '#a855f7', // Amatista
  '#c084fc', // Lavanda
  '#38bdf8', // Celeste cielo
  '#f97316', // Ámbar solar
  '#ffffff'  // Diamante
];

/* ========================================================
   1. CANVAS GLOBAL DE FUEGOS ARTIFICIALES Y CONFETI (PANTALLA COMPLETA)
   ======================================================== */
export const CelebrationFireworks: React.FC<{ isOpen: boolean; isMuted?: boolean }> = ({
  isOpen,
  isMuted = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const rocketsRef = useRef<FireworkRocket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const confettiRef = useRef<ConfettiPiece[]>([]);
  const lastRocketTimeRef = useRef<number>(0);

  const playSound = useCallback((type: 'launch' | 'boom' | 'crackle') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;

      if (type === 'launch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.35);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'boom') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.51);
      } else if (type === 'crackle') {
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            if (!ctx) return;
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = 'sine';
            o.frequency.setValueAtTime(1200 + Math.random() * 800, ctx.currentTime);
            g.gain.setValueAtTime(0.04, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(ctx.currentTime);
            o.stop(ctx.currentTime + 0.1);
          }, i * 40 + Math.random() * 20);
        }
      }
    } catch {}
  }, [isMuted]);

  const createExplosion = useCallback((x: number, y: number, baseColor: string) => {
    playSound('boom');
    playSound('crackle');

    particlesRef.current.push({
      x,
      y,
      vx: 0,
      vy: 0,
      alpha: 1,
      decay: 0.035,
      color: baseColor,
      size: 2,
      flicker: false,
      type: 'ring',
      radius: 4,
      maxRadius: 65 + Math.random() * 35
    });

    const particleCount = 70 + Math.floor(Math.random() * 25);
    const speed = 4 + Math.random() * 4.5;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i * 2 * Math.PI) / particleCount + (Math.random() - 0.5) * 0.3;
      const velocity = speed * (0.35 + Math.random() * 0.75);
      const color = Math.random() > 0.3 ? baseColor : PALETTE[Math.floor(Math.random() * PALETTE.length)];

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        alpha: 1,
        decay: 0.012 + Math.random() * 0.015,
        color,
        size: 2 + Math.random() * 2.8,
        flicker: Math.random() > 0.4,
        type: Math.random() > 0.7 ? 'star' : 'spark'
      });
    }
  }, [playSound]);

  const launchRocket = useCallback((canvasWidth: number, canvasHeight: number) => {
    const x = canvasWidth * 0.15 + Math.random() * (canvasWidth * 0.7);
    const targetY = canvasHeight * 0.15 + Math.random() * (canvasHeight * 0.38);
    const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    const speed = 11 + Math.random() * 4;

    rocketsRef.current.push({
      x,
      y: canvasHeight,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -speed,
      targetY,
      color,
      trail: []
    });

    playSound('launch');
  }, [playSound]);

  const initConfetti = useCallback((canvasWidth: number, canvasHeight: number) => {
    const pieces: ConfettiPiece[] = [];
    const count = 130;

    for (let i = 0; i < count; i++) {
      pieces.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * -canvasHeight * 0.8,
        vx: (Math.random() - 0.5) * 2.5,
        vy: 2 + Math.random() * 3.5,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.08,
        tilt: Math.random() * Math.PI,
        vTilt: (Math.random() - 0.5) * 0.1,
        width: 8 + Math.random() * 8,
        height: 12 + Math.random() * 12,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        shape: Math.random() > 0.25 ? 'rect' : Math.random() > 0.5 ? 'circle' : 'star'
      });
    }
    confettiRef.current = pieces;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      rocketsRef.current = [];
      particlesRef.current = [];
      confettiRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    initConfetti(canvas.width, canvas.height);
    setTimeout(() => launchRocket(canvas.width, canvas.height), 100);
    setTimeout(() => launchRocket(canvas.width, canvas.height), 400);
    setTimeout(() => launchRocket(canvas.width, canvas.height), 800);

    const loop = (currentTime: number) => {
      if (currentTime - lastRocketTimeRef.current > 750 + Math.random() * 450) {
        lastRocketTimeRef.current = currentTime;
        launchRocket(canvas.width, canvas.height);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // COHETES
      for (let i = rocketsRef.current.length - 1; i >= 0; i--) {
        const r = rocketsRef.current[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 0.9 });
        if (r.trail.length > 10) r.trail.shift();

        ctx.save();
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 * (t / r.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = r.color;
          ctx.globalAlpha = (t / r.trail.length) * 0.6;
          ctx.shadowColor = r.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.restore();

        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.05;

        if (r.y <= r.targetY || r.vy >= 0) {
          createExplosion(r.x, r.y, r.color);
          rocketsRef.current.splice(i, 1);
        }
      }

      // CHISPAS
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.vx *= 0.96;
        p.vy = p.vy * 0.96 + 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.type === 'ring' && p.radius !== undefined) {
          p.radius += 3.2;
        }

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        const displayAlpha = p.flicker && Math.random() > 0.4 ? p.alpha * 0.35 : p.alpha;
        ctx.globalAlpha = Math.max(0, Math.min(1, displayAlpha));

        if (p.type === 'ring' && p.radius !== undefined) {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, 3.5 * p.alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'star') {
          ctx.translate(p.x, p.y);
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#fff69b';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          const spikes = 4;
          for (let s = 0; s < spikes * 2; s++) {
            const r = s % 2 === 0 ? p.size : p.size * 0.35;
            const ang = (s * Math.PI) / spikes;
            const px = Math.cos(ang) * r;
            const py = Math.sin(ang) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // CONFETI 3D
      for (let i = 0; i < confettiRef.current.length; i++) {
        const c = confettiRef.current[i];
        c.y += c.vy;
        c.x += c.vx + Math.sin(currentTime * 0.003 + i) * 0.7;
        c.angle += c.vAngle;
        c.tilt += c.vTilt;

        if (c.y > canvas.height + 20) {
          c.y = -20 - Math.random() * 40;
          c.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.angle);

        const scaleY = Math.cos(c.tilt);
        ctx.scale(1, scaleY);

        ctx.fillStyle = c.color;
        ctx.shadowColor = 'rgba(0,0,0,0.25)';
        ctx.shadowBlur = 4;

        if (c.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, c.width * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (c.shape === 'star') {
          ctx.beginPath();
          for (let s = 0; s < 10; s++) {
            const r = s % 2 === 0 ? c.width * 0.6 : c.width * 0.25;
            const a = (s * Math.PI) / 5;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (s === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
        }

        ctx.restore();
      }

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, initConfetti, launchRocket, createExplosion]);

  if (!isOpen) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[80]"
    />
  );
};

/* ========================================================
   2. BANNER DE VICTORIA EN FRENTE DEL TABLERO (AJUSTADO AL TAMAÑO DE LA TRANSMISIÓN)
   ======================================================== */
export const CelebrationBanner: React.FC<{
  isOpen: boolean;
  levelName: string;
  levelNumber: number;
  onNextLevel: () => void;
  onReplayLevel?: () => void;
}> = ({
  isOpen,
  levelName,
  levelNumber,
  onNextLevel,
  onReplayLevel
}) => {
  const [countdown, setCountdown] = useState<number>(12);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onNextLevel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onNextLevel]);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(12);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextLevel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, onNextLevel]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 pointer-events-auto backdrop-blur-[4px] bg-neutral-950/75 rounded-[26px] animate-in fade-in duration-200">
      <div
        className="relative flex flex-col items-center w-full max-w-[325px] p-5 sm:p-6 rounded-[28px] border-[3.5px] border-amber-400 shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_35px_rgba(255,215,0,0.5)] animate-in zoom-in-95 duration-300"
        style={{
          background: 'linear-gradient(180deg, #4f2710 0%, #2f1406 50%, #170902 100%)',
          boxShadow: '0 0 0 2px #fae5be, 0 20px 50px rgba(0,0,0,0.95), inset 0 2px 3px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.8)'
        }}
      >
        {/* Rayos dorados giratorios */}
        <div
          className="absolute -top-12 w-40 h-40 rounded-full pointer-events-none opacity-35 animate-[spin_20s_linear_infinite]"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,215,0,0.6) 20deg, transparent 40deg, rgba(255,215,0,0.6) 60deg, transparent 80deg, rgba(255,215,0,0.6) 100deg, transparent 120deg, rgba(255,215,0,0.6) 140deg, transparent 160deg, rgba(255,215,0,0.6) 180deg, transparent 200deg, rgba(255,215,0,0.6) 220deg, transparent 240deg, rgba(255,215,0,0.6) 260deg, transparent 280deg, rgba(255,215,0,0.6) 300deg, transparent 320deg, rgba(255,215,0,0.6) 340deg, transparent 360deg)'
          }}
        />

        {/* Trofeo dorado */}
        <div className="relative mb-2.5 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-1 shadow-[0_0_25px_rgba(255,215,0,0.8)] animate-bounce">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#4a240d] to-[#1f0b03] flex items-center justify-center border-2 border-amber-300">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300 drop-shadow-[0_2px_6px_rgba(255,215,0,0.9)]" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-600 border border-emerald-300 text-white font-black text-[10px] shadow">
            +10 ⭐
          </div>
        </div>

        {/* Textos */}
        <div className="text-center space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/70 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
            <span>¡NIVEL COMPLETADO!</span>
            <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-amber-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
            {levelName}
          </h3>

          <p className="text-[11px] sm:text-xs font-semibold text-amber-100/90 leading-tight">
            ¡El chat de TikTok LIVE resolvió el crucigrama!
          </p>
        </div>

        {/* Botón Siguiente Nivel */}
        <div className="w-full space-y-2">
          <button
            onClick={onNextLevel}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-600 hover:from-yellow-200 hover:to-amber-500 text-neutral-950 font-black text-xs sm:text-sm tracking-wider shadow-[0_6px_16px_rgba(245,158,11,0.5),inset_0_2px_2px_rgba(255,255,255,0.6)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border-2 border-yellow-100"
          >
            <span>SIGUIENTE NIVEL</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>

          <div className="flex items-center justify-between text-[10px] text-amber-200/80 px-1 pt-0.5 font-semibold">
            {onReplayLevel && (
              <button
                onClick={onReplayLevel}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-amber-300/90"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Repetir</span>
              </button>
            )}
            <span className="ml-auto font-mono text-[9.5px] bg-neutral-950/70 px-2 py-0.5 rounded-full border border-neutral-800">
              Auto en {countdown}s (o Enter)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

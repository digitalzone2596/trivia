import React, { useEffect, useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Music,
  Flame,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Crown,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
  FastForward,
} from 'lucide-react';
import { TriviaQuestion, PlayerScore, WinnerInfo } from '../types/trivia';
import { soundEffects } from '../services/soundEffects';
import { MovingStarsBackground } from './MovingStarsBackground';

interface DonationAlertInfo {
  usuario: string;
  regalo: string;
  accion: '50-50' | 'saltar';
  monedas?: number;
  foto?: string;
}

interface TriviaOverlay916Props {
  questions: TriviaQuestion[];
  topPlayers: PlayerScore[];
  onPlayerScoreUpdate?: (playerId: string, addedPoints: number, won: boolean) => void;
  isObsPureMode?: boolean;
  onOpenGlobalRank?: () => void;
  onOpenQuestionsModal?: () => void;
  timerDuration?: number; // default 15s
  targetPoints?: number;  // points needed to win, e.g. 50
  onResetGame?: () => void;
  tikTokUsername?: string;
  isTikTokConnected?: boolean;
  onNextQuestion?: (nextIdx: number) => void;
}

export const TriviaOverlay916: React.FC<TriviaOverlay916Props> = ({
  questions,
  topPlayers,
  onPlayerScoreUpdate,
  isObsPureMode = false,
  onOpenGlobalRank,
  onOpenQuestionsModal,
  timerDuration = 15,
  targetPoints = 50,
  onResetGame,
  tikTokUsername = '',
  isTikTokConnected = false,
  onNextQuestion,
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(timerDuration);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);
  const [winner, setWinner] = useState<WinnerInfo | null>(null);
  const [winnerCountdown, setWinnerCountdown] = useState<number | null>(null);
  const [isBgmOn, setIsBgmOn] = useState<boolean>(() => {
    return localStorage.getItem('tt_trivia_bgm_on') !== 'false';
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<TriviaQuestion | null>(null);

  // Estados de comodines por donación
  const [eliminatedOptions, setEliminatedOptions] = useState<('A' | 'B' | 'C' | 'D')[]>([]);
  const [donationAlert, setDonationAlert] = useState<DonationAlertInfo | null>(null);
  const [correctPlayersThisRound, setCorrectPlayersThisRound] = useState<PlayerScore[]>([]);

  const activeQuestion = customQuestion || questions[currentIdx] || questions[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextRef = useRef<NodeJS.Timeout | null>(null);
  const winnerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const alertTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isResettingRef = useRef<boolean>(false);

  // Cargar siguiente pregunta y resetear comodines
  const loadNextQuestion = useCallback(() => {
    if (winner) return;
    if (autoNextRef.current) clearInterval(autoNextRef.current);
    setAutoNextCountdown(null);
    setCustomQuestion(null);
    setSelectedOption(null);
    setEliminatedOptions([]); // Limpiar opciones eliminadas para la nueva pregunta (máx 3)
    setCorrectPlayersThisRound([]); // Limpiar acertados para la nueva ronda
    setIsRevealed(false);
    setTimeLeft(timerDuration);
    setIsTimerRunning(true);
    const nextIdx = (currentIdx + 1) % questions.length;
    if (onNextQuestion) onNextQuestion(nextIdx);
    setCurrentIdx(nextIdx);
  }, [currentIdx, questions.length, timerDuration, winner, onNextQuestion]);

  // Restart / Reset tournament
  const handleRestartAll = useCallback(() => {
    isResettingRef.current = true;
    if (winnerTimerRef.current) clearInterval(winnerTimerRef.current);
    if (autoNextRef.current) clearInterval(autoNextRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setWinner(null);
    setWinnerCountdown(null);
    setAutoNextCountdown(null);
    setDonationAlert(null);
    setEliminatedOptions([]);
    setCorrectPlayersThisRound([]);
    setCustomQuestion(null);
    setCurrentIdx(0);
    setTimeLeft(timerDuration);
    setSelectedOption(null);
    setIsRevealed(false);
    setIsTimerRunning(true);
    if (onResetGame) onResetGame();
    setTimeout(() => {
      isResettingRef.current = false;
    }, 1000);
  }, [timerDuration, onResetGame]);

  // COMODÍN 1: Quitar 1 opción incorrecta por cada Rosa (máximo 3 malas eliminadas por pregunta)
  const apply5050 = useCallback((donador = 'Espectador', regalo = 'Rosa 🌹', foto?: string) => {
    if (isRevealed || winner) return;
    if (eliminatedOptions.length >= 3) return; // Máximo 3 opciones erróneas eliminadas

    // Opciones incorrectas que todavía NO se han eliminado
    const remainingWrong = (['A', 'B', 'C', 'D'] as const).filter(
      (id) => id !== activeQuestion.correctAnswer && !eliminatedOptions.includes(id)
    );

    if (remainingWrong.length === 0) return;

    // Seleccionar aleatoriamente una de las opciones equivocadas restantes
    const randomIndex = Math.floor(Math.random() * remainingWrong.length);
    const chosenWrong = remainingWrong[randomIndex];

    const nextEliminated = [...eliminatedOptions, chosenWrong];
    setEliminatedOptions(nextEliminated);

    if (selectedOption === chosenWrong) {
      setSelectedOption(null);
    }

    soundEffects.playPowerUp5050();

    // Obtener foto pasada o buscar en el ranking si ya participó
    const resolvedAvatar =
      foto ||
      topPlayers.find(
        (p) => p.username.toLowerCase().replace(/^@/, '') === donador.toLowerCase().replace(/^@/, '')
      )?.avatarUrl;

    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setDonationAlert({
      usuario: donador,
      regalo,
      accion: '50-50',
      foto: resolvedAvatar,
    });
    alertTimerRef.current = setTimeout(() => {
      setDonationAlert(null);
    }, 3800);
  }, [isRevealed, winner, eliminatedOptions, activeQuestion.correctAnswer, selectedOption, topPlayers]);

  // COMODÍN 2: Saltar la pregunta actual
  const applySkipQuestion = useCallback((donador = 'Espectador', regalo = 'Regalo 5🪙', foto?: string) => {
    if (winner) return;

    soundEffects.playSkip();

    // Obtener foto pasada o buscar en el ranking si ya participó
    const resolvedAvatar =
      foto ||
      topPlayers.find(
        (p) => p.username.toLowerCase().replace(/^@/, '') === donador.toLowerCase().replace(/^@/, '')
      )?.avatarUrl;

    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setDonationAlert({
      usuario: donador,
      regalo,
      accion: 'saltar',
      foto: resolvedAvatar,
    });
    alertTimerRef.current = setTimeout(() => {
      setDonationAlert(null);
    }, 3800);

    setTimeout(() => {
      loadNextQuestion();
    }, 600);
  }, [winner, loadNextQuestion, topPlayers]);

  // Check for winner only when players have score >= targetPoints
  useEffect(() => {
    if (winner || isResettingRef.current) return;
    if (topPlayers.length === 0) return;
    const champion = topPlayers.find((p) => p.score >= targetPoints && p.score > 0);
    if (champion) {
      setWinner({
        username: champion.username,
        avatar: champion.avatar,
        avatarUrl: champion.avatarUrl,
        score: champion.score,
      });
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoNextRef.current) clearInterval(autoNextRef.current);
      soundEffects.playFanfare();
      triggerConfettiMassive();
    }
  }, [topPlayers, targetPoints, winner]);

  // Auto-restart countdown loop when someone wins
  useEffect(() => {
    if (!winner) {
      if (winnerTimerRef.current) clearInterval(winnerTimerRef.current);
      setWinnerCountdown(null);
      return;
    }

    const DURATION = 8;
    setWinnerCountdown(DURATION);
    let count = DURATION;

    if (winnerTimerRef.current) clearInterval(winnerTimerRef.current);
    winnerTimerRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setWinnerCountdown(count);
      } else {
        if (winnerTimerRef.current) clearInterval(winnerTimerRef.current);
        setWinnerCountdown(null);
        handleRestartAll();
      }
    }, 1000);

    return () => {
      if (winnerTimerRef.current) clearInterval(winnerTimerRef.current);
    };
  }, [winner, handleRestartAll]);

  // Trigger auto-advance 5-second countdown entre preguntas
  const startAutoNextTimer = useCallback(() => {
    setAutoNextCountdown(5);
    let count = 5;
    if (autoNextRef.current) clearInterval(autoNextRef.current);

    autoNextRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setAutoNextCountdown(count);
      } else {
        clearInterval(autoNextRef.current!);
        setAutoNextCountdown(null);
        loadNextQuestion();
      }
    }, 1000);
  }, [loadNextQuestion]);

  // Reveal correct answer function
  const handleRevealAnswer = useCallback((overrideCorrect?: 'A' | 'B' | 'C' | 'D') => {
    if (isRevealed) return;
    setIsRevealed(true);
    setIsTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const actualCorrect = overrideCorrect || activeQuestion.correctAnswer;
    const pointsAwarded = 10;

    // Premiar a todos los espectadores reales de TikTok que acertaron
    const correctPlayers = topPlayers.filter((p) => p.lastAnswer === actualCorrect);

    if (correctPlayers.length > 0) {
      soundEffects.playCorrect();
      triggerConfetti();
      setCorrectPlayersThisRound(correctPlayers);
      correctPlayers.forEach((p) => {
        if (onPlayerScoreUpdate) {
          onPlayerScoreUpdate(p.id, pointsAwarded, true);
        }
      });
      // Marcar racha a los que fallaron
      topPlayers
        .filter((p) => p.lastAnswer && p.lastAnswer !== actualCorrect)
        .forEach((p) => {
          if (onPlayerScoreUpdate) {
            onPlayerScoreUpdate(p.id, 0, false);
          }
        });
    } else if (selectedOption === actualCorrect) {
      soundEffects.playCorrect();
      triggerConfetti();
      setCorrectPlayersThisRound([
        {
          id: 'host_player',
          username: tikTokUsername || 'Host',
          avatar: '🎯',
          avatarUrl: '',
          score: pointsAwarded,
          streak: 1,
          lastAnswer: actualCorrect,
        },
      ]);
      if (onPlayerScoreUpdate && topPlayers[0]) {
        onPlayerScoreUpdate(topPlayers[0].id, pointsAwarded, true);
      }
    } else {
      setCorrectPlayersThisRound([]);
      soundEffects.playWrong();
    }

    startAutoNextTimer();
  }, [isRevealed, activeQuestion, selectedOption, onPlayerScoreUpdate, topPlayers, startAutoNextTimer, tikTokUsername]);

  // Timer countdown loop
  useEffect(() => {
    if (!isTimerRunning || isRevealed || winner) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleRevealAnswer();
          return 0;
        }

        const nextVal = prev - 1;
        if (nextVal <= 3 && nextVal > 0) {
          soundEffects.playWarningBeep();
        } else if (nextVal > 3) {
          soundEffects.playTick();
        }
        return nextVal;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isRevealed, winner, handleRevealAnswer]);

  // Option selection (1 solo voto por pregunta)
  const handleSelectOption = (optId: 'A' | 'B' | 'C' | 'D') => {
    if (isRevealed || winner || eliminatedOptions.includes(optId) || selectedOption !== null) return;
    setSelectedOption(optId);
    soundEffects.playSelect();
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#f59e0b', '#fbbf24', '#00f2fe', '#10b981'],
      });
    } catch {}
  };

  const triggerConfettiMassive = () => {
    try {
      const end = Date.now() + 2500;
      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#f59e0b', '#fbbf24', '#00f2fe', '#ec4899', '#ffffff'],
        });
      }, 250);
    } catch {}
  };

  // Iniciar automáticamente la música alegre de fondo con la primera interacción del usuario
  useEffect(() => {
    if (isBgmOn) {
      const handleUserGesture = () => {
        soundEffects.startBgm();
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
        window.removeEventListener('keydown', handleUserGesture);
      };
      window.addEventListener('click', handleUserGesture, { once: true });
      window.addEventListener('touchstart', handleUserGesture, { once: true });
      window.addEventListener('keydown', handleUserGesture, { once: true });
      // Intentar iniciar directamente si el contexto ya está habilitado
      soundEffects.startBgm();
    } else {
      soundEffects.stopBgm();
    }
  }, [isBgmOn]);

  const toggleBgm = () => {
    const next = !isBgmOn;
    setIsBgmOn(next);
    localStorage.setItem('tt_trivia_bgm_on', String(next));
    if (next) {
      soundEffects.startBgm();
    } else {
      soundEffects.stopBgm();
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEffects.setMute(next);
  };

  // Exponer API en window para control externo y donaciones
  useEffect(() => {
    const win = window as unknown as {
      setPregunta?: (titulo: string, opciones: unknown, puntos?: number, categoria?: string) => void;
      marcarCorrecta?: (letra: 'A' | 'B' | 'C' | 'D') => void;
      actualizarTiempo?: (segundos: number) => void;
      declararGanador?: (usuario: string, foto: string, puntos: number) => void;
      reiniciarJuego?: () => void;
      activar5050?: (donador?: string, regalo?: string) => void;
      saltarPregunta?: (donador?: string, regalo?: string) => void;
      donacionTikTok?: (data: DonationAlertInfo) => void;
    };

    win.setPregunta = (titulo: string, opciones: unknown, puntos = 10, categoria = 'Trivia en Vivo 🎮') => {
      let formattedOptions: { id: 'A' | 'B' | 'C' | 'D'; text: string; votes: number }[] = [];
      if (Array.isArray(opciones)) {
        formattedOptions = opciones.map((opt, i) => {
          const letter = (['A', 'B', 'C', 'D'][i] || 'A') as 'A' | 'B' | 'C' | 'D';
          if (typeof opt === 'string') {
            return { id: letter, text: opt, votes: 0 };
          } else if (typeof opt === 'object' && opt !== null) {
            const o = opt as Record<string, unknown>;
            return {
              id: (o.id || letter) as 'A' | 'B' | 'C' | 'D',
              text: String(o.text || o.texto || ''),
              votes: Number(o.votes || o.votos || 0),
            };
          }
          return { id: letter, text: String(opt), votes: 0 };
        });
      }

      setCustomQuestion({
        id: 'external_' + Date.now(),
        category: categoria,
        question: titulo,
        options: formattedOptions,
        correctAnswer: 'A',
        points: puntos,
      });

      setSelectedOption(null);
      setEliminatedOptions([]);
      setIsRevealed(false);
      setTimeLeft(timerDuration);
      setIsTimerRunning(true);
      setAutoNextCountdown(null);
    };

    win.marcarCorrecta = (letra: 'A' | 'B' | 'C' | 'D') => {
      handleRevealAnswer(letra);
    };

    win.actualizarTiempo = (segundos: number) => {
      setTimeLeft(segundos);
    };

    win.declararGanador = (usuario: string, foto: string, puntos: number) => {
      setWinner({
        username: usuario,
        avatar: '👑',
        avatarUrl: foto,
        score: puntos,
      });
      setIsTimerRunning(false);
      soundEffects.playFanfare();
      triggerConfettiMassive();
    };

    win.reiniciarJuego = handleRestartAll;
    win.activar5050 = (donador?: string, regalo?: string, foto?: string) => apply5050(donador, regalo, foto);
    win.saltarPregunta = (donador?: string, regalo?: string, foto?: string) => applySkipQuestion(donador, regalo, foto);
    win.donacionTikTok = (data: DonationAlertInfo) => {
      if (data?.accion === '50-50') {
        apply5050(data.usuario, data.regalo, data.foto);
      } else if (data?.accion === 'saltar') {
        applySkipQuestion(data.usuario, data.regalo, data.foto);
      }
    };

    return () => {
      delete win.setPregunta;
      delete win.marcarCorrecta;
      delete win.actualizarTiempo;
      delete win.declararGanador;
      delete win.reiniciarJuego;
      delete win.activar5050;
      delete win.saltarPregunta;
      delete win.donacionTikTok;
    };
  }, [handleRevealAnswer, timerDuration, handleRestartAll, apply5050, applySkipQuestion]);

  // Clean votes calculation: Only show if votes > 0
  const totalVotes = activeQuestion.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  const progressRatio = Math.max(0, timeLeft / timerDuration);

  return (
    <div
      className={`relative w-full mx-auto flex flex-col justify-between overflow-hidden font-sans select-none transition-all duration-300 ${
        isObsPureMode
          ? 'h-screen max-w-[480px] bg-[#070a14] p-3 rounded-none'
          : 'h-[840px] max-w-[440px] bg-[#070a14] p-3 sm:p-4 rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-950/40 ring-1 ring-white/10'
      }`}
    >
      {/* FONDO DE ESTRELLAS EN MOVIMIENTO (CANVAS GPU ACCELERATED) */}
      <MovingStarsBackground />

      {/* Sutil resplandor de fondo estilo espacio */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-10 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />

      {/* ALERTA FLOTANTE DE DONACIÓN / COMODÍN (GRANDE Y VISIBLE PARA LIVE) */}
      <AnimatePresence>
        {donationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="absolute top-10 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[430px] pointer-events-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.9)]"
          >
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border-2 shadow-2xl flex items-center gap-3.5 backdrop-blur-2xl ${
                donationAlert.accion === '50-50'
                  ? 'bg-[#181105]/95 border-amber-400 text-amber-200 shadow-amber-500/50 ring-2 ring-amber-400/30'
                  : 'bg-[#041624]/95 border-cyan-400 text-cyan-200 shadow-cyan-500/50 ring-2 ring-cyan-400/30'
              }`}
            >
              {/* Foto de perfil del donador con insignia de comodín */}
              <div className="relative shrink-0">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400 shadow-xl overflow-hidden flex items-center justify-center bg-slate-900 ring-2 ring-white/20">
                  {donationAlert.foto ? (
                    <img
                      src={donationAlert.foto}
                      alt={donationAlert.usuario}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-white/40 flex items-center justify-center text-xs shadow-md ${
                    donationAlert.accion === '50-50'
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-cyan-400 text-slate-950 font-black'
                  }`}
                >
                  {donationAlert.accion === '50-50' ? '⚡' : '🚀'}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5 flex-wrap">
                  <span className="text-amber-300 font-black text-sm sm:text-base truncate max-w-[150px]">
                    {donationAlert.usuario}
                  </span>
                  <span className="text-slate-200">
                    donó <strong className="text-white underline decoration-amber-400">{donationAlert.regalo}</strong>
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-black tracking-wide uppercase mt-0.5 text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-400">
                  {donationAlert.accion === '50-50'
                    ? `🌹 ¡OPCIÓN INCORRECTA REMOVIDA! (${eliminatedOptions.length}/3)`
                    : '🚀 ¡SALTANDO PREGUNTA!'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WINNER SHOWCASE MODAL / OVERLAY */}
      {winner && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400 shadow-2xl shadow-amber-500/50 flex items-center justify-center animate-pulse">
              {winner.avatarUrl ? (
                <img
                  src={winner.avatarUrl}
                  alt={winner.username}
                  className="w-full h-full rounded-full object-cover bg-slate-900"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-4xl">{winner.avatar || '👑'}</span>
              )}
            </div>
            <div className="absolute -top-4 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-lg">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
          </div>

          <span className="text-xs font-bold text-amber-400 tracking-widest uppercase mb-1">
            🏆 ¡CAMPEÓN DE LA TRIVIA! 🏆
          </span>
          <h2 className="text-2xl font-black text-white mb-1 drop-shadow-lg">
            {winner.username}
          </h2>
          <div className="text-sm font-bold text-cyan-300 mb-4 font-mono">
            Alcanzó la meta de <span className="text-amber-400 text-base">{winner.score} PUNTOS</span>
          </div>

          {/* Cuenta atrás automática para iniciar sola la siguiente partida */}
          {winnerCountdown !== null && (
            <div className="mb-5 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs font-semibold animate-pulse">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" />
              <span>
                Nueva partida en <strong className="text-amber-400 font-mono text-sm">{winnerCountdown}s</strong>...
              </span>
            </div>
          )}

          <button
            onClick={handleRestartAll}
            className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Iniciar Ahora</span>
          </button>
        </div>
      )}

      {/* PARTE SUPERIOR: MÓDULO COMPACTO DE TRIVIA (INSPIRADO EN LA REFERENCIA) */}
      <div className="relative z-10 flex flex-col gap-2">
        {/* Barra superior de control discreta */}
        <div className="flex items-center justify-between gap-2 pb-0.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isTikTokConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500 animate-pulse'
              }`}
            />
            <span className="text-[11px] font-bold text-slate-300 tracking-wide uppercase truncate max-w-[130px]">
              {isTikTokConnected ? tikTokUsername || 'EN VIVO' : 'CONECTAR TIKTOK'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-mono">
              Meta: {targetPoints}p
            </span>
            <button
              onClick={toggleBgm}
              title={isBgmOn ? 'Desactivar Música Alegre' : 'Activar Música Alegre'}
              className={`px-2 py-0.5 rounded-md border text-xs transition-all flex items-center gap-1 ${
                isBgmOn
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm shadow-amber-500/30 font-bold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Music className={`w-3 h-3 ${isBgmOn ? 'animate-bounce text-amber-400' : ''}`} />
              <span className="text-[10px]">
                {isBgmOn ? 'Música ON' : 'Música OFF'}
              </span>
            </button>
            <button
              onClick={toggleMute}
              title={isMuted ? 'Activar Sonidos' : 'Silenciar'}
              className={`p-1 rounded-md border text-xs transition-colors ${
                !isMuted
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                  : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
            </button>
            {onOpenGlobalRank && (
              <button
                onClick={onOpenGlobalRank}
                title="Ranking Global"
                className="p-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25"
              >
                <Trophy className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO DINÁMICO DE LA TRIVIA CON ANIMACIÓN DE ENTRADA SUAVE (FRAMER-MOTION) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeQuestion.id}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-2 w-full"
          >
            {/* 1. Pill Header Amarillo: VOTACIÓN [segundos] */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: 0.04 }}
              className="flex flex-col items-center justify-center pt-1"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-amber-500/30 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                <span>VOTACIÓN {timeLeft}</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-300 tracking-wide mt-1">
                {isRevealed
                  ? autoNextCountdown !== null
                    ? `Siguiente en ${autoNextCountdown}s...`
                    : 'Respuesta revelada'
                  : eliminatedOptions.length > 0
                  ? '⚡ ¡Comodín 50/50 Activo! Quedan 2 opciones'
                  : 'Se están registrando las respuestas'}
              </span>
            </motion.div>

            {/* 2. Tarjeta Blanca de Pregunta (Estilo Referencia: Ultra-legible) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.08, ease: 'easeOut' }}
              className="bg-[#fffefb] text-slate-900 rounded-2xl p-3 sm:p-4 shadow-xl border border-white/20 text-center flex flex-col items-center justify-center min-h-[76px] transition-all"
            >
              <span className="text-[10px] font-extrabold text-amber-700 tracking-wider uppercase mb-1">
                {activeQuestion.category}
              </span>
              <h2 className="text-sm sm:text-base font-black text-slate-950 leading-snug drop-shadow-xs">
                {activeQuestion.question}
              </h2>
              {isRevealed && activeQuestion.explanation && (
                <p className="mt-1 text-[10px] text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md font-bold">
                  💡 {activeQuestion.explanation}
                </p>
              )}
            </motion.div>

            {/* 3. Opciones en Cuadrícula 2x2 con entrada escalonada */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {activeQuestion.options.map((opt, optIdx) => {
                const hasVotes = totalVotes > 0 && (opt.votes || 0) > 0;
                const votePct = hasVotes ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const isSelected = selectedOption === opt.id;
                const isCorrect = opt.id === activeQuestion.correctAnswer;
                const isEliminated = eliminatedOptions.includes(opt.id);

                // Colores basados en la referencia: azul marino elegante con botón amarillo
                let containerBg = 'bg-[#182947]/90 hover:bg-[#1f365d] border-[#2b4c79]';
                let badgeBg = 'bg-[#f59e0b] text-slate-950';

                if (isSelected && !isRevealed) {
                  containerBg = 'bg-[#1e3a6a] border-cyan-400 ring-1 ring-cyan-400';
                  badgeBg = 'bg-cyan-400 text-slate-950';
                }

                if (isEliminated) {
                  containerBg = 'bg-red-950/20 border-red-500/30 opacity-25 grayscale pointer-events-none scale-95';
                  badgeBg = 'bg-red-900/60 text-red-300';
                }

                if (isRevealed) {
                  if (isCorrect) {
                    containerBg = 'bg-emerald-950/80 border-emerald-400 ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20';
                    badgeBg = 'bg-emerald-400 text-slate-950';
                  } else if (isSelected && !isCorrect) {
                    containerBg = 'bg-rose-950/60 border-rose-500/60 opacity-60';
                    badgeBg = 'bg-rose-500 text-white';
                  } else {
                    containerBg = 'bg-[#101b30]/60 border-slate-800 opacity-50';
                  }
                }

                return (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{
                      opacity: isEliminated ? 0.25 : 1,
                      y: 0,
                      scale: isEliminated ? 0.95 : 1,
                    }}
                    transition={{
                      duration: 0.26,
                      delay: 0.12 + optIdx * 0.05,
                      ease: 'easeOut',
                    }}
                    disabled={isRevealed || !!winner || isEliminated}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`relative overflow-hidden text-left rounded-xl p-2 sm:p-2.5 flex items-center gap-2 border transition-all duration-150 active:scale-[0.98] min-h-[52px] ${containerBg}`}
                  >
                    {/* Relleno de porcentaje de votos: SOLO SE MUESTRA AL REVELAR LA RESPUESTA PARA NO DAR PISTAS */}
                    {isRevealed && hasVotes && !isEliminated && (
                      <div
                        className={`absolute inset-y-0 left-0 pointer-events-none transition-all duration-700 ease-out ${
                          isCorrect ? 'bg-emerald-400/25' : 'bg-amber-400/15'
                        }`}
                        style={{ width: `${votePct}%` }}
                      />
                    )}

                    {/* Letra A, B, C, D en cuadro amarillo estilo Livecade */}
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-sm ${badgeBg}`}
                    >
                      {isEliminated ? '✕' : opt.id}
                    </span>

                    {/* Texto de la opción */}
                    <div className="relative z-10 flex-1 min-w-0 pr-1">
                      <div
                        className={`text-xs sm:text-sm font-bold leading-tight line-clamp-2 ${
                          isEliminated ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {opt.text}
                      </div>
                      {isEliminated ? (
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-tight">
                          Eliminada 🌹
                        </span>
                      ) : isRevealed && hasVotes ? (
                        <div className="text-[11px] font-mono text-amber-300 font-extrabold mt-0.5 animate-fade-in">
                          {votePct}% ({opt.votes} {opt.votes === 1 ? 'voto' : 'votos'})
                        </div>
                      ) : null}
                    </div>

                    {/* Icono de acierto o fallo al revelar */}
                    {isRevealed && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* 4. BLOQUE INFERIOR: COMODINES DURANTE VOTACIÓN vs TARJETA 'ACERTARON' DURANTE LA PAUSA DE 5s */}
            {!isRevealed ? (
              <motion.div
                initial={{ opacity: 0, scaleX: 0.95 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.25, delay: 0.28 }}
                className="w-full pt-1"
              >
                {/* Barra de tiempo horizontal */}
                <div className="w-full h-2 rounded-full bg-slate-900/90 border border-slate-800 overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear shadow-sm ${
                      timeLeft <= 3
                        ? 'bg-rose-500 shadow-rose-500/50'
                        : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-amber-400/50'
                    }`}
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-slate-300 font-bold mt-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Comenta <strong className="text-amber-300 font-black text-sm">A, B, C o D</strong> en el chat</span>
                </div>

                {/* INDICADORES DE COMODINES POR REGALO */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {/* Remover opción incorrecta con Rosa (máximo 3) */}
                  <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent border border-amber-400/60 shadow-lg shadow-amber-500/20 backdrop-blur-md">
                    <span className="text-2xl sm:text-3xl shrink-0 drop-shadow">🌹</span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                          <span>REMOVER OPCIÓN</span>
                        </div>
                        {eliminatedOptions.length > 0 && (
                          <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                            {eliminatedOptions.length}/3
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-slate-200 mt-0.5 leading-tight">
                        Dona <strong className="text-white underline decoration-amber-400">Rosa</strong> (remover opción incorrecta · máx 3)
                      </div>
                    </div>
                  </div>

                  {/* Saltar con cualquier regalo de 5 monedas */}
                  <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-cyan-500/25 via-cyan-500/10 to-transparent border border-cyan-400/60 shadow-lg shadow-cyan-500/20 backdrop-blur-md">
                    <span className="text-2xl sm:text-3xl shrink-0 drop-shadow">🎁</span>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="text-xs sm:text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                        <FastForward className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400 shrink-0" />
                        <span>SALTAR</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-bold text-slate-200 mt-0.5 leading-tight">
                        Dona cualquier regalo de <strong className="text-white underline decoration-cyan-400">5 monedas</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* TARJETA DORADA 'ACERTARON' DURANTE LA PAUSA DE 5 SEGUNDOS (IDÉNTICA A LIVECADE) */
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full bg-[#f6ba33] text-slate-950 rounded-2xl p-3 shadow-2xl border-2 border-amber-300 mt-1"
              >
                {/* Título ACERTARON */}
                <div className="text-center font-black tracking-widest text-sm sm:text-base uppercase text-slate-950">
                  ACERTARON
                </div>

                {/* Sub-barra: Pastilla negra con Respuesta Correcta y Conteo */}
                <div className="flex items-center justify-between mt-1 mb-2 px-0.5">
                  <div className="bg-slate-950 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-black shadow-sm flex items-center gap-1">
                    <span>Respuesta correcta: {activeQuestion.correctAnswer}</span>
                  </div>
                  <div className="text-slate-950 font-black text-xs flex items-center gap-1">
                    <span>
                      {correctPlayersThisRound.length} {correctPlayersThisRound.length === 1 ? 'acertó' : 'acertaron'}
                    </span>
                    {autoNextCountdown !== null && (
                      <span className="bg-slate-950/15 px-1.5 py-0.5 rounded-full font-mono text-[10px]">
                        ({autoNextCountdown}s)
                      </span>
                    )}
                  </div>
                </div>

                {/* Grilla 2 columnas de los que acertaron */}
                {correctPlayersThisRound.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5 max-h-[140px] sm:max-h-[160px] overflow-y-auto pr-0.5">
                    {correctPlayersThisRound.map((player) => (
                      <div
                        key={player.id}
                        className="bg-white/95 rounded-xl p-1.5 px-2 flex items-center justify-between gap-1 shadow-sm border border-slate-900/10"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            {player.avatarUrl ? (
                              <img
                                src={player.avatarUrl}
                                alt={player.username}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span className="text-[11px] flex items-center justify-center h-full">👤</span>
                            )}
                          </div>
                          <span className="text-xs font-black text-slate-900 truncate max-w-[70px] sm:max-w-[85px]">
                            {player.username.replace(/^@/, '')}
                          </span>
                          {player.streak > 1 && (
                            <span className="text-[10px]" title={`Racha de ${player.streak}`}>🔥</span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-emerald-600 font-mono">+10</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-xl p-2.5 text-center text-xs font-black text-slate-800 shadow-sm">
                    😅 ¡Nadie acertó esta pregunta! Siguiente en {autoNextCountdown ?? 5}s...
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* PARTE INFERIOR: ESPACIO LIBRE PARA COMENTARIOS + MINI PODIUM COMPACTO + COMODINES */}
      <div className="relative z-10 flex flex-col gap-1.5 mt-auto">
        {/* Ticker / Mini Podio de Top Jugadores en una barra horizontal compacta */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 backdrop-blur-md">
          <div className="flex items-center justify-between mb-1 pb-0.5 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-wide">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>PODIO EN VIVO</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Ronda {currentIdx + 1}/{questions.length}
            </span>
          </div>

          {topPlayers.length === 0 ? (
            <div className="py-1 px-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
              <span>Esperando que los espectadores voten...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 pt-0.5">
              {topPlayers.slice(0, 3).map((player, idx) => {
                const medals = ['🥇', '🥈', '🥉'];
                const cardColors = [
                  'bg-amber-500/10 border-amber-500/30 text-amber-300',
                  'bg-slate-400/10 border-slate-400/30 text-slate-300',
                  'bg-amber-700/10 border-amber-700/30 text-amber-500',
                ];

                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-1.5 p-1 rounded-lg border text-[11px] min-w-0 ${cardColors[idx]}`}
                  >
                    <span className="text-xs shrink-0">{medals[idx]}</span>
                    <div className="w-4 h-4 rounded-full overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                      {player.avatarUrl ? (
                        <img
                          src={player.avatarUrl}
                          alt={player.username}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-[8px] flex items-center justify-center w-full h-full">👤</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-bold text-white truncate leading-tight">
                        {player.username}
                      </div>
                      <div className="text-[9px] font-mono font-extrabold text-amber-400">
                        {player.score}p
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones de Comodines y Control del Streamer */}
        <div className="flex items-center gap-1.5 pt-0.5">
          {/* Botón rápido comodín 50/50 */}
          <button
            onClick={() => apply5050('Streamer', 'Manual')}
            disabled={isRevealed || eliminatedOptions.length >= 2}
            title="Eliminar 2 opciones incorrectas (Comodín 50/50)"
            className={`py-1 px-2 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
              eliminatedOptions.length >= 2 || isRevealed
                ? 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-500/20 active:scale-95'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>50/50</span>
          </button>

          {/* Botón rápido comodín Saltar */}
          <button
            onClick={() => applySkipQuestion('Streamer', 'Manual')}
            disabled={winner !== null}
            title="Saltar pregunta inmediatamente"
            className="py-1 px-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all shadow-sm shadow-cyan-500/20 active:scale-95"
          >
            <FastForward className="w-3 h-3 text-cyan-400" />
            <span>Saltar</span>
          </button>

          {/* Botón Reiniciar */}
          <button
            onClick={handleRestartAll}
            className="py-1 px-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reiniciar</span>
          </button>

          {/* Botón Revelar / Siguiente */}
          <button
            onClick={() => {
              if (!isRevealed) {
                handleRevealAnswer();
              } else {
                loadNextQuestion();
              }
            }}
            className="flex-1 py-1 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <span>{!isRevealed ? 'Revelar' : 'Siguiente'}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

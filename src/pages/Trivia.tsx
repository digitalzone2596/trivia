import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  INITIAL_QUESTIONS,
  INITIAL_TOP_PLAYERS,
  INITIAL_GLOBAL_RANKINGS,
  getShuffledQuestions,
} from '../data/initialQuestions';
import { TriviaQuestion, PlayerScore, GlobalRankEntry } from '../types/trivia';
import { TriviaOverlay916 } from '../components/TriviaOverlay916';
import { GlobalRankingModal } from '../components/GlobalRankingModal';
import { QuestionsManagerModal } from '../components/QuestionsManagerModal';
import { TikTokConnectionBar, TikTokStatus } from '../components/TikTokConnectionBar';
import {
  Settings,
  ChevronDown,
  ChevronUp,
  Trophy,
  HelpCircle,
  Layers,
  RotateCcw,
  Sliders,
  Radio,
  Target,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { io as socketIOClient } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Trivia() {
  const { user, userProfile, isAdmin } = useAuth();

  // Parámetros de URL
  const searchParams = new URLSearchParams(window.location.search);
  const obsKey = searchParams.get('key');
  const isDirectObsUrl = searchParams.get('obs') === 'true' || searchParams.get('obs') === '1';
  const urlUser = searchParams.get('user')?.trim().replace(/^@/, '') || '';

  // Estado para el usuario obtenido por Key en OBS
  const [obsTikTokUser, setObsTikTokUser] = useState<string>('');

  // Usuario definitivo asignado
  const targetTikTokUser =
    userProfile?.tiktokUsername?.trim().replace(/^@/, '') ||
    obsTikTokUser ||
    urlUser;

  const [isObsMode, setIsObsMode] = useState<boolean>(isDirectObsUrl);
  const [isTransparentBg, setIsTransparentBg] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(15);
  const [targetPoints, setTargetPoints] = useState<number>(50);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [copiedObs, setCopiedObs] = useState<boolean>(false);

  // TikTok connection status inicializado con su usuario bloqueado
  const [tikTokStatus, setTikTokStatus] = useState<TikTokStatus>({
    estado: 'desconectado',
    username: targetTikTokUser ? `@${targetTikTokUser}` : '',
    mensaje: targetTikTokUser
      ? `Cuenta autorizada: @${targetTikTokUser}. Pulsa Conectar.`
      : 'Ingresa tu usuario de TikTok y pulsa Conectar',
    viewerCount: 0,
    roomId: null,
  });

  // Data states
  const [questions, setQuestions] = useState<TriviaQuestion[]>(() => {
    try {
      localStorage.removeItem('tt_trivia_questions');
      localStorage.removeItem('tt_trivia_questions_v2');
      return getShuffledQuestions(INITIAL_QUESTIONS);
    } catch {
      return getShuffledQuestions(INITIAL_QUESTIONS);
    }
  });

  const [topPlayers, setTopPlayers] = useState<PlayerScore[]>(() => {
    try {
      localStorage.removeItem('tt_trivia_players');
      const saved = localStorage.getItem('tt_trivia_players_real');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p) =>
              p.username &&
              !p.username.includes('neontiger') &&
              !p.username.includes('sofia_gamer') &&
              !p.username.includes('esperando_jugadores') &&
              !p.username.includes('shadow_ninja')
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [globalRankings, setGlobalRankings] = useState<GlobalRankEntry[]>(() => {
    try {
      localStorage.removeItem('tt_trivia_global_rank');
      return [];
    } catch {
      return [];
    }
  });

  const [isGlobalRankOpen, setIsGlobalRankOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);

  // Generador y copiador del enlace seguro para OBS
  const handleCopyObsUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();

    const activeKey = user?.uid || obsKey;
    if (activeKey) params.set('key', activeKey);
    if (targetTikTokUser) params.set('user', targetTikTokUser);
    params.set('obs', '1');

    const fullUrl = `${origin}/trivia?${params.toString()}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedObs(true);
      setTimeout(() => setCopiedObs(false), 2200);
    });
  };

  // Actualizar estado si el perfil de Firebase termina de cargar en el navegador
  useEffect(() => {
    if (targetTikTokUser && tikTokStatus.estado === 'desconectado' && !tikTokStatus.username) {
      setTikTokStatus((prev) => ({
        ...prev,
        username: `@${targetTikTokUser}`,
        mensaje: `Cuenta autorizada: @${targetTikTokUser}. Pulsa Conectar.`,
      }));
    }
  }, [targetTikTokUser, tikTokStatus.estado, tikTokStatus.username]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tt_trivia_questions_v2', JSON.stringify(questions));
    } catch {}
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem('tt_trivia_players_real', JSON.stringify(topPlayers));
    } catch {}
  }, [topPlayers]);

  useEffect(() => {
    try {
      localStorage.setItem('tt_trivia_global_rank', JSON.stringify(globalRankings));
    } catch {}
  }, [globalRankings]);

  const handlePlayerScoreUpdate = (playerId: string, addedPoints: number, won: boolean) => {
    setTopPlayers((prev) => {
      const updated = prev.map((p) => {
        if (p.id === playerId) {
          return {
            ...p,
            score: won ? p.score + addedPoints : p.score,
            streak: won ? p.streak + 1 : 0,
            isCorrect: won,
          };
        }
        return p;
      });
      return updated.sort((a, b) => b.score - a.score);
    });
  };

  const handleAddQuestion = (q: TriviaQuestion) => {
    setQuestions((prev) => [...prev, q]);
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleResetQuestions = () => {
    setQuestions(INITIAL_QUESTIONS);
  };

  const handleAddGlobalScore = (
    username: string,
    score: number,
    accuracy: number,
    streak: number
  ) => {
    const newEntry: GlobalRankEntry = {
      id: 'g_' + Date.now(),
      username,
      score,
      accuracy,
      streak,
      date: 'Hoy',
    };
    setGlobalRankings((prev) => [newEntry, ...prev]);
  };

  const handleResetTournament = () => {
    try {
      localStorage.removeItem('tt_trivia_players_real');
    } catch {}
    currentQuestionVotersRef.current.clear();
    setTopPlayers([]);
    setQuestions(getShuffledQuestions(INITIAL_QUESTIONS));
    currentQuestionIdxRef.current = 0;
  };

  const currentQuestionIdxRef = useRef<number>(0);
  const currentQuestionVotersRef = useRef<Set<string>>(new Set());

  const handleQuestionAdvance = (nextIdx: number) => {
    currentQuestionIdxRef.current = nextIdx;
    currentQuestionVotersRef.current.clear();
    setTopPlayers((prev) => prev.map((p) => ({ ...p, lastAnswer: undefined })));

    setQuestions((prev) => {
      if (nextIdx >= prev.length) {
        return getShuffledQuestions(INITIAL_QUESTIONS);
      }
      const clone = [...prev];
      if (clone[nextIdx]) {
        clone[nextIdx] = {
          ...clone[nextIdx],
          options: clone[nextIdx].options.map((opt) => ({ ...opt, votes: 0 })),
        };
      }
      return clone;
    });
  };

  const handleRealTikTokVote = useCallback((usuario: string, foto: string, respuesta: 'A' | 'B' | 'C' | 'D') => {
    const cleanUser = (usuario || '').toLowerCase().trim().replace(/^@/, '');
    if (!cleanUser) return;

    if (currentQuestionVotersRef.current.has(cleanUser)) {
      return;
    }
    currentQuestionVotersRef.current.add(cleanUser);

    const formattedUsername = usuario.startsWith('@') ? usuario : `@${usuario}`;

    setTopPlayers((prev) => {
      const existingIdx = prev.findIndex((p) => p.username.toLowerCase().replace(/^@/, '') === cleanUser);
      if (existingIdx !== -1) {
        const clone = [...prev];
        clone[existingIdx] = {
          ...clone[existingIdx],
          avatarUrl: foto || clone[existingIdx].avatarUrl,
          lastAnswer: respuesta,
        };
        return clone;
      } else {
        const newPlayer: PlayerScore = {
          id: 'tt_' + Date.now() + Math.random().toString(36).substring(2, 6),
          username: formattedUsername,
          avatar: '👤',
          avatarUrl: foto,
          score: 0,
          streak: 0,
          lastAnswer: respuesta,
        };
        return [...prev, newPlayer];
      }
    });

    const activeIdx = currentQuestionIdxRef.current;
    setQuestions((prev) => {
      if (prev.length === 0 || !prev[activeIdx]) return prev;
      const clone = [...prev];
      const q = { ...clone[activeIdx] };
      q.options = q.options.map((opt) => {
        if (opt.id === respuesta) {
          return { ...opt, votes: (opt.votes || 0) + 1 };
        }
        return opt;
      });
      clone[activeIdx] = q;
      return clone;
    });
  }, []);

  // Función de conexión con verificación de cuenta autorizada
  const handleConnectTikTok = useCallback(async (inputUsername: string) => {
    const cleanInput = (inputUsername || '').trim().replace(/^@/, '').toLowerCase();
    const cleanTarget = targetTikTokUser.toLowerCase();

    if (!isAdmin && cleanTarget && cleanInput !== cleanTarget && !obsKey) {
      alert(`Tu cuenta está vinculada a @${targetTikTokUser}. No puedes conectar cuentas ajenas.`);
      return;
    }

    const finalUsername = (!isAdmin && cleanTarget) ? targetTikTokUser : (cleanInput || cleanTarget);

    if (!finalUsername) {
      alert('Ingresa un usuario de TikTok válido.');
      return;
    }

    setTikTokStatus({
      estado: 'conectando',
      username: `@${finalUsername}`,
      mensaje: `Conectando con TikTok...`,
      viewerCount: 0,
      roomId: null,
    });

    try {
      const res = await fetch('/api/tiktok/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: finalUsername }),
      });
      const data = await res.json();
      if (data && data.estado) {
        setTikTokStatus(data);
      }
    } catch {
      const win = window as unknown as { socket?: { emit: (e: string, d: unknown) => void } };
      if (win.socket) {
        win.socket.emit('conectarTikTok', { username: finalUsername });
      }
    }
  }, [isAdmin, targetTikTokUser, obsKey]);

  const handleDisconnectTikTok = async () => {
    try {
      const res = await fetch('/api/tiktok/desconectar', { method: 'POST' });
      const data = await res.json();
      if (data) setTikTokStatus(data);
    } catch {
      setTikTokStatus({
        estado: 'desconectado',
        username: targetTikTokUser ? `@${targetTikTokUser}` : '',
        mensaje: 'Desconectado del directo.',
        viewerCount: 0,
        roomId: null,
      });
    }
  };

  // Autoconectar en OBS mediante la Llave (?key=...)
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
            setTikTokStatus((prev) => ({
              ...prev,
              username: `@${handle}`,
              mensaje: `Conectando automáticamente a @${handle}...`,
            }));

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

  // Listener de Socket.IO para eventos en vivo
  useEffect(() => {
    let socket: ReturnType<typeof socketIOClient> | null = null;
    try {
      socket = socketIOClient();

      socket.on('tiktokEstado', (data: TikTokStatus) => {
        if (data && data.estado) {
          setTikTokStatus(data);
        }
      });

      socket.on('tiktokEspectadores', (count: number) => {
        setTikTokStatus((prev) => ({ ...prev, viewerCount: count }));
      });

      socket.on('comentarioTikTokReal', (data: { usuario: string; foto: string; respuesta?: 'A' | 'B' | 'C' | 'D' }) => {
        if (data && data.respuesta) {
          handleRealTikTokVote(data.usuario, data.foto, data.respuesta);
        }
      });

      socket.on('tiktokDonacion', (data: { usuario: string; foto?: string; regalo: string; accion: '50-50' | 'saltar'; monedas?: number }) => {
        const win = window as unknown as { donacionTikTok?: (d: unknown) => void };
        if (win.donacionTikTok) {
          win.donacionTikTok(data);
        }
      });

      socket.on('accionComodin', (data: { tipo: '50-50' | 'saltar'; usuario?: string; regalo?: string; foto?: string }) => {
        const win = window as unknown as { activar5050?: (u?: string, r?: string, f?: string) => void; saltarPregunta?: (u?: string, r?: string, f?: string) => void };
        if (data?.tipo === '50-50' && win.activar5050) {
          win.activar5050(data.usuario, data.regalo, data.foto);
        } else if (data?.tipo === 'saltar' && win.saltarPregunta) {
          win.saltarPregunta(data.usuario, data.regalo, data.foto);
        }
      });
    } catch {}

    fetch('/api/tiktok/estado')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.estado) setTikTokStatus(data);
      })
      .catch(() => {});

    return () => {
      if (socket) socket.disconnect();
    };
  }, [handleRealTikTokVote]);

  // Vista limpia para OBS (Sin menús ni barras de control)
  if (isObsMode && isDirectObsUrl) {
    return (
      <div
        className={`w-screen h-screen flex items-center justify-center overflow-hidden ${
          isTransparentBg ? 'bg-transparent' : 'bg-[#06080e]'
        }`}
      >
        <TriviaOverlay916
          questions={questions}
          topPlayers={topPlayers}
          onPlayerScoreUpdate={handlePlayerScoreUpdate}
          isObsPureMode={true}
          timerDuration={timerDuration}
          targetPoints={targetPoints}
          onResetGame={handleResetTournament}
          tikTokUsername={tikTokStatus.username}
          isTikTokConnected={tikTokStatus.estado === 'conectado'}
          onNextQuestion={handleQuestionAdvance}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <a href="/" className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
            <span>Volver al inicio</span>
          </a>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setIsQuestionsModalOpen(true)}
            className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Banco de Preguntas ({questions.length})</span>
          </button>
          <button
            onClick={() => setIsGlobalRankOpen(true)}
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranking Global</span>
          </button>
        </nav>

        {/* Zona de Botones Superiores: Incluye el nuevo botón de Copiar URL OBS */}
        <div className="flex items-center gap-2.5">
          {/* BOTÓN NUEVO: Copiar URL para OBS directamente desde el juego */}
          <button
            type="button"
            onClick={handleCopyObsUrl}
            title="Copiar enlace directo con tu clave para OBS o TikTok Live Studio"
            className="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 transition-all active:scale-95 cursor-pointer shadow-sm shadow-cyan-500/10"
          >
            {copiedObs ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡URL Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Copiar URL OBS</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all ${
              isConfigOpen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:border-slate-500'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configuración</span>
            {isConfigOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsObsMode(!isObsMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              isObsMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isObsMode ? 'Vista Normal' : 'Modo OBS 9:16'}
          </button>
        </div>
      </header>

      {/* BARRA DE CONEXIÓN CON CANDADO ACTIVO */}
      <TikTokConnectionBar
        status={tikTokStatus}
        onConnect={handleConnectTikTok}
        onDisconnect={handleDisconnectTikTok}
        isLocked={!isAdmin && !!targetTikTokUser}
      />

      {/* CONFIGURACIÓN DESPLEGABLE */}
      {isConfigOpen && (
        <div className="bg-slate-900/95 border-b border-cyan-500/30 backdrop-blur-xl px-6 py-5 z-30 animate-fade-in shadow-2xl">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-slate-300">
            {/* Meta de Puntos */}
            <div className="space-y-2">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Puntos para Ganar</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Puntos que un jugador debe alcanzar para ganar el torneo:
              </p>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[30, 50, 80, 100].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => setTargetPoints(pts)}
                    className={`py-1.5 rounded-lg font-mono font-bold border transition-all ${
                      targetPoints === pts
                        ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pts}
                  </button>
                ))}
              </div>
            </div>

            {/* Tiempo de Pregunta */}
            <div className="space-y-2">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Tiempo por Pregunta</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Segundos de cuenta regresiva (cambio en 3s):
              </p>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setTimerDuration(sec)}
                    className={`py-1.5 rounded-lg font-mono font-bold border transition-all ${
                      timerDuration === sec
                        ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>

            {/* Estilo OBS y Transparencia */}
            <div className="space-y-2">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-pink-400" />
                <span>Visualización en OBS</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Fondo transparente para sobreponer en tu cámara o juego:
              </p>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 mt-1">
                <span>Fondo Transparente</span>
                <button
                  onClick={() => setIsTransparentBg(!isTransparentBg)}
                  className={`w-10 h-5 rounded-full transition-colors relative p-0.5 ${
                    isTransparentBg ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isTransparentBg ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Comodines por Donación */}
            <div className="space-y-2 p-3 rounded-2xl bg-slate-950/70 border border-amber-500/20">
              <label className="font-bold text-amber-300 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <span>🎁 Comodines por Donación</span>
              </label>
              <div className="text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base">🌹</span>
                  <span><strong>Rosa / 1-4 monedas:</strong> Remover opción incorrecta (máx 3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🎁</span>
                  <span><strong>Regalo 5+ monedas:</strong> Salta la pregunta</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const win = window as unknown as { activar5050?: (u?: string, r?: string, f?: string) => void };
                    if (win.activar5050)
                      win.activar5050(
                        'Donador_Demo',
                        'Rosa 🌹',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
                      );
                  }}
                  className="py-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>🌹 Probar Remover Opción</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const win = window as unknown as { saltarPregunta?: (u?: string, r?: string, f?: string) => void };
                    if (win.saltarPregunta)
                      win.saltarPregunta(
                        'Donador_Demo',
                        'Regalo 5🪙',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
                      );
                  }}
                  className="py-1 px-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span>🎁 Probar Saltar (5🪙)</span>
                </button>
              </div>
            </div>

            {/* Acciones y Gestión */}
            <div className="space-y-2">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Acciones del Torneo</span>
              </label>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleResetTournament}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restablecer Puntuaciones</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsQuestionsModalOpen(true);
                      setIsConfigOpen(false);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-center"
                  >
                    Preguntas
                  </button>
                  <button
                    onClick={() => {
                      setIsGlobalRankOpen(true);
                      setIsConfigOpen(false);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-center"
                  >
                    Ranking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[480px] flex flex-col items-center">
          <TriviaOverlay916
            questions={questions}
            topPlayers={topPlayers}
            onPlayerScoreUpdate={handlePlayerScoreUpdate}
            isObsPureMode={isObsMode}
            onOpenGlobalRank={() => setIsGlobalRankOpen(true)}
            onOpenQuestionsModal={() => setIsQuestionsModalOpen(true)}
            timerDuration={timerDuration}
            targetPoints={targetPoints}
            onResetGame={handleResetTournament}
            tikTokUsername={tikTokStatus.username}
            isTikTokConnected={tikTokStatus.estado === 'conectado'}
            onNextQuestion={handleQuestionAdvance}
          />
        </div>
      </main>

      {/* Modals */}
      <GlobalRankingModal
        isOpen={isGlobalRankOpen}
        onClose={() => setIsGlobalRankOpen(false)}
        rankings={globalRankings}
        onAddScore={handleAddGlobalScore}
      />

      <QuestionsManagerModal
        isOpen={isQuestionsModalOpen}
        onClose={() => setIsQuestionsModalOpen(false)}
        questions={questions}
        onAddQuestion={handleAddQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onResetQuestions={handleResetQuestions}
      />
    </div>
  );
}

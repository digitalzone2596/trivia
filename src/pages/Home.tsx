import React, { useState, useId, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  HelpCircle,
  Flame,
  Dices,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Monitor,
  Radio,
  ShieldCheck,
  Shield,
  BellRing,
  LogIn,
  LogOut,
  User,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  Save,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../context/AuthContext";

interface GameCard {
  id: string;
  title: string;
  status: 'ACTIVE' | 'SOON';
  badgeText: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  route?: string;
  accentColor: 'cyan' | 'pink' | 'violet' | 'amber';
}

const GAMES: GameCard[] = [
  {
    id: 'trivia',
    title: 'Trivia en Vivo',
    status: 'ACTIVE',
    badgeText: 'DISPONIBLE AHORA',
    description:
      'Preguntas interactivas proyectadas en tu directo. Los espectadores responden con A, B, C o D directamente en el chat y acumulan puntos en tiempo real.',
    icon: HelpCircle,
    tags: ['Lector de chat', 'Podio automático', 'Vertical & Horizontal'],
    route: '/trivia',
    accentColor: 'cyan',
  },
  {
    id: 'word-guess',
    title: 'Adivina la Palabra',
    status: 'SOON',
    badgeText: 'PRÓXIMAMENTE',
    description:
      'Minijuego de palabras ocultas y pistas progresivas. El chat intenta descifrar la palabra secreta antes de que el temporizador llegue a cero.',
    icon: Dices,
    tags: ['Efectos sonoros', 'Pistas dinámicas', 'Anti-spam inteligente'],
    accentColor: 'pink',
  },
  {
    id: 'team-war',
    title: 'Guerra de Equipos / Likes',
    status: 'SOON',
    badgeText: 'PRÓXIMAMENTE',
    description:
      'Divide tu chat en dos facciones rivales. Los taps a la pantalla (likes) y los regalos mueven una barra de choque en vivo tipo tira y afloja.',
    icon: Flame,
    tags: ['Contador de Likes', 'Tug-of-war visual', 'Boost por regalos'],
    accentColor: 'amber',
  },
  {
    id: 'penalty-roulette',
    title: 'Ruleta de Castigos',
    status: 'SOON',
    badgeText: 'PRÓXIMAMENTE',
    description:
      'Ruleta de penitencias, retos o premios para el streamer. Se acciona automáticamente con donaciones específicas de regalos o monedas.',
    icon: RefreshCw,
    tags: ['Física 3D realista', 'Reglas editables', 'Activación por regalos'],
    accentColor: 'violet',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, isActive, loginWithGoogle, logout, updateTikTokHandle } = useAuth();

  const [username, setUsername] = useState('');
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [isSavingTikTok, setIsSavingTikTok] = useState(false);

  const inputId = useId();

  // Sincronizar el usuario guardado en el perfil de Firebase
  useEffect(() => {
    if (userProfile?.tiktokUsername) {
      setUsername(userProfile.tiktokUsername);
    }
  }, [userProfile?.tiktokUsername]);

  const cleanUsername = username.trim().replace(/^@+/, '');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Función para guardar y asociar el @ de TikTok a la cuenta en Firestore
  const handleSaveTikTokHandle = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!cleanUsername) {
      showToast('Por favor escribe tu usuario de TikTok');
      return;
    }

    try {
      setIsSavingTikTok(true);
      if (updateTikTokHandle) {
        await updateTikTokHandle(cleanUsername);
      }
      showToast(`¡Usuario @${cleanUsername} asociado exitosamente a tu cuenta!`);
    } catch (e) {
      console.error('Error guardando tiktok handle:', e);
      showToast('No se pudo guardar el usuario. Intenta de nuevo.');
    } finally {
      setIsSavingTikTok(false);
    }
  };

  const getGameUrl = (baseRoute: string = '/trivia') => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const targetUser = cleanUsername || userProfile?.tiktokUsername || '';
    const params = targetUser ? `?user=${encodeURIComponent(targetUser)}` : '';
    return `${origin}${baseRoute}${params}`;
  };

  const handleLaunchGame = async (route: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!isActive && !isAdmin) {
      setShowPendingModal(true);
      return;
    }

    // Auto-guardar el usuario si se modificó antes de entrar
    if (cleanUsername && cleanUsername !== userProfile?.tiktokUsername) {
      try {
        if (updateTikTokHandle) await updateTikTokHandle(cleanUsername);
      } catch (e) {
        console.warn('Could not persist tiktok handle', e);
      }
    }

    const targetUser = cleanUsername || userProfile?.tiktokUsername || '';
    const destination = targetUser ? `${route}?user=${encodeURIComponent(targetUser)}` : route;
    navigate(destination);
  };

  const handleCopyObsUrl = (route: string = '/trivia') => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!isActive && !isAdmin) {
      setShowPendingModal(true);
      return;
    }

    const url = getGameUrl(route);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast('¡Enlace de Fuente de Navegador copiado al portapapeles!');
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const handleNotifyMe = (gameTitle: string) => {
    showToast(`¡Anotado! Te avisaremos cuando "${gameTitle}" esté disponible.`);
  };

  const handleGoogleLogin = async () => {
    try {
      setAuthActionLoading(true);
      await loginWithGoogle();
      setShowAuthModal(false);
      showToast('¡Inicio de sesión exitoso!');
    } catch (error) {
      console.error(error);
      showToast('No se pudo completar el inicio de sesión. Inténtalo de nuevo.');
    } finally {
      setAuthActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200 relative overflow-hidden font-sans">
      {/* Background Ambient Glows & Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute -top-40 -left-40 w-96 md:w-[36rem] h-96 md:h-[36rem] rounded-full blur-[140px] opacity-20"
          style={{ background: 'radial-gradient(circle, #00F2FE 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/4 -right-40 w-96 md:w-[38rem] h-96 md:h-[38rem] rounded-full blur-[150px] opacity-20"
          style={{ background: 'radial-gradient(circle, #FE2C55 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full blur-[130px] opacity-15"
          style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Toast Notification Floating Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl backdrop-blur-md text-sm text-zinc-200"
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar (Header) */}
      <header className="w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/60 shadow-inner group">
              <Gamepad2 className="w-5 h-5 text-cyan-400 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-zinc-950" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              STREAM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-rose-500">PLAY</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                LIVE
              </span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            <a href="#catalogo" className="hover:text-white transition-colors">
              Catálogo
            </a>
            <a href="#instrucciones" className="hover:text-white transition-colors">
              Cómo funciona
            </a>
            <a href="#obs-guia" className="hover:text-white transition-colors">
              Guía OBS & Studio
            </a>
          </nav>

          {/* Actions & Auth */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="px-3.5 py-2 text-xs sm:text-sm font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 rounded-xl transition-all duration-150 flex items-center gap-2 active:scale-95 shadow-md shadow-rose-950/30"
              >
                <Shield className="w-4 h-4 text-rose-400" />
                <span>Panel Admin</span>
              </button>
            )}

            {!user ? (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-zinc-950 bg-gradient-to-r from-cyan-400 to-rose-500 hover:brightness-110 rounded-xl transition-all duration-150 flex items-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                {!isAdmin && (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono">
                    {isActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400">Activo</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-amber-400">Pendiente</span>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 pl-1">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuario'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-700/80"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-semibold text-zinc-200 truncate max-w-[120px]">
                    {user.displayName?.split(' ')[0]}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => logout()}
                  title="Cerrar Sesión"
                  className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col gap-16 md:gap-24 w-full">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center max-w-4xl mx-auto relative pt-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.12] text-balance">
            Lleva tus directos de{' '}
            <span className="relative whitespace-nowrap">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-rose-500">
                TikTok LIVE
              </span>
            </span>{' '}
            al siguiente nivel
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed text-balance">
            Vincula tu cuenta de TikTok, elige un juego y proyecta en directo. Tus espectadores juegan escribiendo en el chat en tiempo real.
          </p>

          {/* VINCULACIÓN DE CUENTA DE TIKTOK */}
          <div className="w-full max-w-xl p-5 sm:p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between mb-3 text-left">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Tu Perfil de Streamer
                </span>
                <h3 className="text-sm font-bold text-white">Vincula tu cuenta de TikTok</h3>
              </div>

              {userProfile?.tiktokUsername && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Vinculado</span>
                </div>
              )}
            </div>

            {/* Input + Botón de Guardar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
              <div className="relative flex-1 w-full flex items-center">
                <label htmlFor={inputId} className="sr-only">
                  Usuario de TikTok
                </label>
                <div className="absolute left-3.5 text-cyan-400 font-bold text-base select-none pointer-events-none">
                  @
                </div>
                <input
                  id={inputId}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="tu_usuario_de_tiktok"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
              </div>

              {/* Botón para guardar/asociar a la cuenta */}
              <button
                type="button"
                disabled={isSavingTikTok}
                onClick={handleSaveTikTokHandle}
                className="px-5 py-3 rounded-xl font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {isSavingTikTok ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSavingTikTok ? 'Guardando...' : 'Guardar y Asociar'}</span>
              </button>
            </div>

            {/* Botones de acción rápida: Probar Trivia y Copiar OBS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={() => handleLaunchGame('/trivia')}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-rose-500 text-zinc-950 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10"
              >
                <span>Probar Trivia en Directo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleCopyObsUrl('/trivia')}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{copied ? '¡Copiado!' : 'Copiar URL OBS'}</span>
              </button>
            </div>

            {/* Estado del usuario */}
            <div className="mt-3 text-left">
              {userProfile?.tiktokUsername ? (
                <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Cuenta autorizada para directos:{' '}
                  <strong className="text-white">@{userProfile.tiktokUsername}</strong>
                </p>
              ) : (
                <p className="text-[11px] text-zinc-500 font-mono">
                  💡 Escribe tu @ de TikTok y pulsa <strong>"Guardar y Asociar"</strong> para registrar tu canal.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* GAMES CATALOG SECTION */}
        <section id="catalogo" className="w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-1">
                Lobby interactivo
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Catálogo de Juegos
              </h2>
            </div>
            <p className="text-sm text-zinc-400 max-w-md">
              Selecciona una dinámica para proyectar en tu software de transmisión. La sincronización se realiza mediante WebSocket en milisegundos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GAMES.map((game) => {
              const Icon = game.icon;
              const isActiveCard = game.status === 'ACTIVE';

              return (
                <div
                  key={game.id}
                  className={`group relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 border ${
                    isActiveCard
                      ? 'bg-zinc-900/90 border-cyan-500/40 hover:border-cyan-400 shadow-xl shadow-cyan-950/20'
                      : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700/80 opacity-90'
                  }`}
                >
                  {isActiveCard && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-rose-500 to-violet-500 rounded-t-2xl" />
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-transform duration-200 group-hover:scale-105 ${
                          isActiveCard
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10'
                            : 'bg-zinc-800/50 border-zinc-700/40 text-zinc-400'
                        }`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>

                      {isActiveCard ? (
                        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                          <span className="tracking-wide uppercase font-mono">{game.badgeText}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                          <span className="tracking-wide uppercase">{game.badgeText}</span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {game.title}
                    </h3>

                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                      {game.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-zinc-400 mb-8 pt-3 border-t border-zinc-800/60 font-mono">
                      {game.tags.map((tag, idx) => (
                        <React.Fragment key={tag}>
                          <span>{tag}</span>
                          {idx < game.tags.length - 1 && (
                            <span className="text-zinc-600" aria-hidden="true">
                              /
                            </span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {isActiveCard ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleLaunchGame(game.route || '/trivia')}
                          className="flex-1 px-5 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-zinc-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
                        >
                          <span>Jugar ahora</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyObsUrl(game.route || '/trivia')}
                          title="Copiar URL directa para pegar en OBS"
                          className="px-4 py-3 rounded-xl text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                        >
                          <Copy className="w-4 h-4 text-cyan-400" />
                          <span className="sm:hidden lg:inline">Copiar URL OBS</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNotifyMe(game.title)}
                        className="w-full px-5 py-3 rounded-xl font-medium text-sm bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700/40 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <BellRing className="w-4 h-4 text-zinc-500" />
                        <span>Avisarme cuando esté disponible</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3-STEP QUICK SETUP INSTRUCTIONS */}
        <section id="instrucciones" className="w-full pt-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-mono uppercase tracking-wider text-rose-500 mb-1">
              Guía de inicio rápido
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
              ¿Cómo funciona en 3 sencillos pasos?
            </h2>
            <p className="text-sm text-zinc-400">
              No necesitas instalar programas externos. Funciona como una página web transparente superpuesta en tu transmisión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-cyan-400">01</span>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-cyan-400">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Selecciona el juego</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Elige la dinámica que mejor se adapte a tu stream (ej: Trivia en Vivo). Puedes configurar temas, preguntas y modo de puntuación.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/50 text-xs text-zinc-500 font-mono">
                Paso 1 de 3 · Catálogo web
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-rose-500">02</span>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-rose-500">
                    <Radio className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Conecta tu LIVE</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Inicia sesión y escribe tu usuario de TikTok. El sistema sincroniza automáticamente los comentarios, respuestas y likes de tu público sin pedir claves.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/50 text-xs text-zinc-500 font-mono">
                Paso 2 de 3 · Cuenta de Streamer
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-violet-400">03</span>
                  <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center text-violet-400">
                    <Monitor className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Añádelo a OBS / Studio</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Crea una nueva fuente de tipo <strong>Navegador (Browser Source)</strong>, pega el enlace generado y ajusta la resolución (1080x1920 o 1920x1080).
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/50 text-xs text-zinc-500 font-mono">
                Paso 3 de 3 · Browser Source
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE OBS SIMULATOR BAR */}
        <section id="obs-guia" className="w-full rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 uppercase mb-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Compatible con OBS Studio, TikTok Live Studio & Streamlabs</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Tu enlace de Browser Source listo para emitir
              </h3>
              <p className="text-sm text-zinc-400">
                Pega este enlace exacto en la propiedad de URL de tu fuente de navegador. El fondo es transparente por defecto.
              </p>
            </div>

            <div className="flex-1 max-w-md w-full">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3 font-mono text-xs text-zinc-300">
                <div className="truncate text-cyan-300 select-all">
                  {getGameUrl('/trivia')}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyObsUrl('/trivia')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-sans text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <div className="mt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Resolución sugerida: 1080 x 1920 (9:16)</span>
                <span>FPS: 30 o 60</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL: LOGIN REQUIRED */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
                <LogIn className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-extrabold text-white mb-2">
                Iniciar Sesión Requerido
              </h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Para vincular tu cuenta de TikTok y proyectar juegos en directo, debes iniciar sesión con tu cuenta de Google.
              </p>

              <button
                type="button"
                disabled={authActionLoading}
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm flex items-center justify-center gap-3 transition-colors shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{authActionLoading ? 'Conectando...' : 'Continuar con Google'}</span>
              </button>

              <div className="mt-4 text-center">
                <span className="text-xs text-zinc-500">
                  Tu cuenta será activada por el administrador para habilitar tus emisiones.
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: PENDING APPROVAL NOTIFICATION */}
      <AnimatePresence>
        {showPendingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setShowPendingModal(false)}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Registro Pendiente
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-white mb-2">
                Cuenta en espera de activación
              </h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                ¡Hola <strong>{user?.displayName}</strong>! Tu registro se ha completado correctamente, pero tu cuenta debe ser activada por el administrador en el panel antes de poder emitir los juegos en directo.
              </p>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 mb-5 font-mono space-y-1">
                <div>Correo: <span className="text-zinc-200">{user?.email}</span></div>
                <div>Estado: <span className="text-amber-400">Esperando aprobación del admin</span></div>
              </div>

              {/* Botón de WhatsApp para activación */}
              <a
                href={`https://wa.me/573504454869?text=${encodeURIComponent(
                  `Hola, me acabo de registrar en TikTok LIVE Games con el correo ${user?.email || ''} y solicito la activación de mi cuenta para iniciar mis directos.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 mb-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29" />
                </svg>
                <span>Solicitar Activación por WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setShowPendingModal(false)}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">STREAMPLAY LIVE</span>
            <span aria-hidden="true">·</span>
            <span>Juegos interactivos para TikTok LIVE</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>Sin instalación de plugins</span>
            <span aria-hidden="true">·</span>
            <span>OBS Ready</span>
            <span aria-hidden="true">·</span>
            <span>Actualizado 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
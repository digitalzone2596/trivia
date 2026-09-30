import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Trophy,
  Clock,
  MessageSquare,
  Radio,
  Lock,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import TriviaWheelLogo from './components/TriviaWheelLogo';

export default function TriviaPreview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userProfile, isAdmin, isActive, loginWithGoogle } = useAuth();

  const streamerHandle =
    searchParams.get('user') ||
    userProfile?.tiktokUsername ||
    user?.displayName?.replace(/\s+/g, '_').toLowerCase() ||
    'streamer';

  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mockVotes, setMockVotes] = useState({ A: 14, B: 42, C: 8, D: 19 });
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 15));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setLoginLoading(false);
    }
  };

  // If unauthenticated: require login
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Inicio de Sesión Requerido</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          Para proyectar la Trivia interactiva en directo y conectar el chat de TikTok LIVE, debes iniciar sesión con tu cuenta de streamer.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            disabled={loginLoading}
            onClick={handleLogin}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-rose-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{loginLoading ? 'Conectando...' : 'Iniciar Sesión con Google'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm font-semibold text-zinc-300 transition-colors"
          >
            Volver al Lobby
          </button>
        </div>
      </div>
    );
  }

  // If authenticated but not activated yet by admin
  if (!isActive) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>
        <div className="inline-block text-xs font-mono uppercase px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
          Cuenta en espera de aprobación
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Tu cuenta aún no está activa</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          Hola <strong>{user.displayName}</strong>, el administrador debe activar tu registro en el panel de control antes de que puedas usar los juegos en directo.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href={`https://wa.me/573504454869?text=${encodeURIComponent(
              `Hola, me acabo de registrar en TikTok LIVE Games con el correo ${user?.email || ''} y solicito la activación de mi cuenta para iniciar mis directos.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29" />
            </svg>
            <span>Solicitar Activación por WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm font-semibold text-zinc-300 transition-colors cursor-pointer"
          >
            Volver al Lobby
          </button>
        </div>
      </div>
    );
  }

  // Authorized user view (Live Game Overlay)
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-between p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Top Bar Navigation */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Lobby</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="text-zinc-400">Streamer:</span>
          <span className="text-cyan-400 font-bold">@{streamerHandle}</span>
          {isAdmin && (
            <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Simulated Stream Overlay Container (OBS Browser Source View) */}
      <div className="w-full max-w-lg my-8 rounded-3xl bg-zinc-900/90 border-2 border-cyan-500/40 p-6 shadow-2xl shadow-cyan-950/40 backdrop-blur-xl relative">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <TriviaWheelLogo size={36} className="rounded-xl shadow-md border border-purple-400/40" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Trivia TikTok LIVE · Ronda 3/10
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-xs font-mono text-zinc-200">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            <span className={timer <= 5 ? 'text-rose-400 font-bold animate-pulse' : ''}>
              00:{timer < 10 ? `0${timer}` : timer}
            </span>
          </div>
        </div>

        {/* Trivia Question */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-white text-balance leading-snug">
            ¿Cuál es el planeta más grande de nuestro Sistema Solar?
          </h2>
          <p className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
            <span>Chat: Escribe <b>A</b>, <b>B</b>, <b>C</b> o <b>D</b> para participar</span>
          </p>
        </div>

        {/* Options Grid */}
        <div className="space-y-2.5 mb-6">
          {[
            { key: 'A', text: 'Marte', votes: mockVotes.A },
            { key: 'B', text: 'Júpiter', votes: mockVotes.B, isCorrect: true },
            { key: 'C', text: 'Saturno', votes: mockVotes.C },
            { key: 'D', text: 'Neptuno', votes: mockVotes.D },
          ].map((opt) => {
            const total = mockVotes.A + mockVotes.B + mockVotes.C + mockVotes.D;
            const pct = Math.round((opt.votes / total) * 100);

            return (
              <button
                key={opt.key}
                onClick={() => setSelectedOption(opt.key)}
                className={`w-full relative overflow-hidden rounded-xl p-3.5 text-left border transition-all cursor-pointer ${
                  selectedOption === opt.key
                    ? 'border-cyan-400 bg-cyan-950/40 text-white'
                    : 'border-zinc-800 bg-zinc-950/60 text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {/* Voting Bar Progress Fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-cyan-500/10 pointer-events-none transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />

                <div className="relative flex items-center justify-between z-10 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-zinc-800 text-cyan-400 font-bold flex items-center justify-center text-xs">
                      {opt.key}
                    </span>
                    <span className="font-semibold">{opt.text}</span>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">
                    {pct}% ({opt.votes})
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Leaderboard / Engagement Banner */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>83 respuestas registradas</span>
          </div>
          <div className="text-cyan-400 font-semibold">
            Top 1: @lucas_gamer (450 pts)
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-xs text-zinc-500 text-center max-w-md">
        Esta pantalla simula cómo se visualiza el overlay transparente dentro de OBS Studio o TikTok Live Studio.
      </div>
    </div>
  );
}

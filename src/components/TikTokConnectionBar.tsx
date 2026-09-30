import React, { useState, useEffect } from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronRight,
} from 'lucide-react';

export interface TikTokStatus {
  estado: 'desconectado' | 'conectando' | 'conectado' | 'error';
  username: string;
  mensaje: string;
  viewerCount: number;
  roomId: string | null;
}

interface TikTokConnectionBarProps {
  status: TikTokStatus;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
}

export const TikTokConnectionBar: React.FC<TikTokConnectionBarProps> = ({
  status,
  onConnect,
  onDisconnect,
}) => {
  const [inputUser, setInputUser] = useState<string>(() => {
    return localStorage.getItem('tt_saved_username') || '';
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUser.trim()) return;
    localStorage.setItem('tt_saved_username', inputUser.trim());
    onConnect(inputUser.trim());
  };

  const isConnected = status.estado === 'conectado';
  const isConnecting = status.estado === 'conectando';
  const isError = status.estado === 'error';

  return (
    <div className="bg-slate-900/90 border-b border-cyan-500/20 px-4 py-2.5 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Input & Connect Form */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 font-bold text-slate-300 shrink-0">
            <Radio className={`w-4 h-4 ${isConnected ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
            <span>TikTok Live:</span>
          </div>

          <div className="relative flex-1 sm:w-56">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
            <input
              type="text"
              value={inputUser.replace(/^@/, '')}
              onChange={(e) => setInputUser(e.target.value)}
              placeholder="tu_usuario_de_tiktok"
              disabled={isConnecting || isConnected}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 disabled:opacity-60"
            />
          </div>

          {isConnected ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="py-1.5 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isConnecting || !inputUser.trim()}
              className="py-1.5 px-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50 shrink-0 active:scale-95"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Conectar al Directo</span>
                </>
              )}
            </button>
          )}
        </form>

        {/* Right: Real-time Connection Status Indicator */}
        <div className="flex items-center gap-2 text-[11px] w-full sm:w-auto justify-between sm:justify-end">
          {isConnected && (
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <strong className="text-white">EN VIVO:</strong>
              <span>{status.username}</span>
              {status.viewerCount > 0 && (
                <span className="flex items-center gap-1 text-slate-300 pl-1 border-l border-emerald-500/30 font-mono">
                  <Users className="w-3 h-3 text-cyan-400" />
                  {status.viewerCount}
                </span>
              )}
            </div>
          )}

          {isConnecting && (
            <div className="flex items-center gap-2 bg-amber-950/60 border border-amber-500/40 px-3 py-1 rounded-full text-amber-300 animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Verificando transmisión en vivo de {status.username}...</span>
            </div>
          )}

          {isError && (
            <div className="flex items-center gap-2 bg-rose-950/60 border border-rose-500/40 px-3 py-1 rounded-full text-rose-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-xs">{status.mensaje}</span>
            </div>
          )}

          {status.estado === 'desconectado' && (
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              <span>Estado: <strong>Desconectado</strong> (inicia tu directo en TikTok y pulsa Conectar)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

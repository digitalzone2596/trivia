import React, { useState, useEffect } from 'react';
import { Radio, Wifi, WifiOff, RefreshCw, Lock } from 'lucide-react';

export interface TikTokStatus {
  estado: 'desconectado' | 'conectando' | 'conectado' | 'error';
  username: string;
  mensaje: string;
  viewerCount: number;
  roomId: string | null;
}

export interface TikTokConnectionBarProps {
  status: TikTokStatus;
  onConnect: (username: string) => void;
  onDisconnect: () => void;
  isLocked?: boolean; // Propiedad de bloqueo
}

export function TikTokConnectionBar({
  status,
  onConnect,
  onDisconnect,
  isLocked = false,
}: TikTokConnectionBarProps) {
  const [inputUser, setInputUser] = useState(status.username.replace(/^@/, ''));

  useEffect(() => {
    if (status.username) {
      setInputUser(status.username.replace(/^@/, ''));
    }
  }, [status.username]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status.estado === 'conectado') {
      onDisconnect();
    } else {
      onConnect(inputUser);
    }
  };

  const isConnected = status.estado === 'conectado';
  const isConnecting = status.estado === 'conectando';

  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400 font-semibold">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>TikTok Live:</span>
        </div>

        <div className="relative flex items-center">
          <span className="absolute left-3 text-slate-500 font-bold select-none">@</span>
          <input
            type="text"
            value={inputUser}
            onChange={(e) => {
              if (!isLocked) setInputUser(e.target.value.replace(/^@/, ''));
            }}
            readOnly={isLocked}
            disabled={isConnected || isConnecting}
            placeholder="tu_usuario"
            className={`bg-slate-950 border border-slate-700/80 rounded-xl pl-7 ${
              isLocked ? 'pr-8 cursor-not-allowed opacity-85 select-none' : 'pr-3'
            } py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors w-40 sm:w-52`}
          />

          {isLocked && (
            <span
              title="Cuenta vinculada con licencia oficial"
              className="absolute right-2.5 text-amber-400 select-none cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" />
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isConnecting}
          className={`px-4 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50 ${
            isConnected
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
          }`}
        >
          {isConnecting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Conectando...</span>
            </>
          ) : isConnected ? (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Desconectar</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Conectar al Directo</span>
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-2 text-slate-400">
        <span
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? 'bg-emerald-400 animate-pulse'
              : isConnecting
              ? 'bg-amber-400 animate-pulse'
              : 'bg-slate-600'
          }`}
        />
        <span className="font-mono text-[11px]">{status.mensaje}</span>
        {isConnected && status.viewerCount > 0 && (
          <span className="ml-2 font-mono text-cyan-400 font-bold">
            ({status.viewerCount} espectadores)
          </span>
        )}
      </div>
    </div>
  );
}
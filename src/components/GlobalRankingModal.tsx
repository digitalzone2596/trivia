import React, { useState } from 'react';
import { Trophy, X, Search, Flame, Target, Calendar, UserPlus } from 'lucide-react';
import { GlobalRankEntry } from '../types/trivia';

interface GlobalRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: GlobalRankEntry[];
  onAddScore: (username: string, score: number, accuracy: number, streak: number) => void;
}

export const GlobalRankingModal: React.FC<GlobalRankingModalProps> = ({
  isOpen,
  onClose,
  rankings,
  onAddScore,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'ALL' | 'TODAY'>('ALL');
  const [newUsername, setNewUsername] = useState('');
  const [newScore, setNewScore] = useState('4500');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const filteredRankings = rankings
    .filter((entry) => {
      const matchSearch = entry.username.toLowerCase().includes(searchTerm.toLowerCase());
      if (filterPeriod === 'TODAY') {
        return matchSearch && (entry.date.toLowerCase() === 'hoy' || entry.date.toLowerCase() === 'today');
      }
      return matchSearch;
    })
    .sort((a, b) => b.score - a.score);

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    const formattedUser = newUsername.startsWith('@') ? newUsername : `@${newUsername}`;
    onAddScore(
      formattedUser,
      parseInt(newScore, 10) || 1000,
      Math.floor(Math.random() * 20) + 80,
      Math.floor(Math.random() * 8) + 3
    );
    setNewUsername('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Ranking Global de Jugadores
              </h2>
              <p className="text-xs text-slate-400">
                Comparativa de puntuaciones y rachas en directos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Actions Bar */}
        <div className="p-4 border-b border-slate-800/80 space-y-3 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por @usuario..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Time Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setFilterPeriod('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterPeriod === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Histórico
              </button>
              <button
                onClick={() => setFilterPeriod('TODAY')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterPeriod === 'TODAY'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hoy
              </button>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/5"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Registrar</span>
            </button>
          </div>

          {/* New Score Quick Form */}
          {showAddForm && (
            <form onSubmit={handleSubmitScore} className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 flex items-center gap-2">
              <input
                type="text"
                placeholder="@usuario"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                className="flex-1 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="number"
                placeholder="Puntos"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                required
                className="w-24 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Guardar
              </button>
            </form>
          )}
        </div>

        {/* Rankings Table / List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredRankings.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No se encontraron jugadores que coincidan con la búsqueda.
            </div>
          ) : (
            filteredRankings.map((entry, index) => {
              const isTop3 = index < 3;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    index === 0
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-md shadow-amber-950/20'
                      : index === 1
                      ? 'bg-slate-400/10 border-slate-400/25'
                      : index === 2
                      ? 'bg-amber-800/10 border-amber-700/25'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono font-bold text-sm text-slate-300">
                      {isTop3 ? medals[index] : `#${index + 1}`}
                    </span>
                    <div>
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        <span>{entry.username}</span>
                        {index === 0 && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                            LÍDER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5 text-emerald-400">
                          <Target className="w-3 h-3" /> {entry.accuracy}% acierto
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 text-amber-400">
                          <Flame className="w-3 h-3" /> Racha: {entry.streak}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-cyan-300">
                      {entry.score.toLocaleString()} PTS
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>{entry.date}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>Total jugadores registrados: <strong className="text-white">{rankings.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

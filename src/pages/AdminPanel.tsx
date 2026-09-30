import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  Shield,
  ShieldCheck,
  Users,
  UserCheck,
  Clock,
  Search,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { useAuth, UserProfile } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../firebase';

export default function AdminPanel() {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as UserProfile);
        });
        setUsersList(items);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'users');
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  const handleUpdateStatus = async (targetUid: string, newStatus: 'active' | 'pending' | 'suspended', name: string) => {
    try {
      setActionLoadingId(targetUid);
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      showToast(
        newStatus === 'active'
          ? `¡Cuenta de ${name} activada con éxito!`
          : `Estado de ${name} cambiado a ${newStatus}.`
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Acceso Restringido</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6">
          Esta sección es exclusiva para el administrador de la plataforma. Inicia sesión con la cuenta autorizada para acceder a la gestión de registros.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-white transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // Metrics
  const totalCount = usersList.length;
  const pendingCount = usersList.filter((u) => u.status === 'pending').length;
  const activeCount = usersList.filter((u) => u.status === 'active').length;

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'pending' ? u.status === 'pending' : u.status === 'active';
    const queryLower = searchQuery.toLowerCase();
    const matchesSearch =
      u.displayName.toLowerCase().includes(queryLower) ||
      u.email.toLowerCase().includes(queryLower) ||
      (u.tiktokUsername && u.tiktokUsername.toLowerCase().includes(queryLower));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 border border-cyan-500/50 shadow-2xl text-sm text-cyan-300 backdrop-blur-md">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al Lobby</span>
            </button>

            <div className="h-6 w-px bg-zinc-800" />

            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Panel de Administración
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    Super Admin
                  </span>
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-white">{userProfile?.displayName || user?.displayName}</span>
              <span className="text-[11px] font-mono text-zinc-400">{user?.email}</span>
            </div>
            <button
              onClick={() => logout()}
              title="Cerrar Sesión"
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-zinc-400 uppercase mb-1">Total Registros</div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">{totalCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-amber-500/30 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-amber-500/80" />
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Pendientes de Aprobación
              </div>
              <div className="text-3xl font-extrabold text-amber-300 font-mono tabular-nums">{pendingCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500/80" />
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Cuentas Activas
              </div>
              <div className="text-3xl font-extrabold text-emerald-300 font-mono tabular-nums">{activeCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Management Controls: Filter Tabs + Search */}
        <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'all' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({totalCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                filter === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Pendientes</span>
              {pendingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Activos ({activeCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, email o @..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </section>

        {/* Users Table / List */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-zinc-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Gestión de Cuentas de Streamers</h2>
              <p className="text-xs text-zinc-400">
                Aprueba el acceso para que los streamers registrados puedan lanzar y proyectar los juegos en directo.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              Mostrando {filteredUsers.length} resultado(s)
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
              <span className="text-xs">Cargando registros de usuarios...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm font-medium text-zinc-400">No se encontraron usuarios</p>
              <p className="text-xs text-zinc-600 mt-1">Prueba cambiando los filtros o el término de búsqueda.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/70">
              {filteredUsers.map((item) => {
                const isPending = item.status === 'pending';
                const isActive = item.status === 'active';
                const isItemAdmin = item.role === 'admin';
                const isActionLoading = actionLoadingId === item.uid;

                return (
                  <div
                    key={item.uid}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-850/40 transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3.5">
                      {item.photoURL ? (
                        <img
                          src={item.photoURL}
                          alt={item.displayName}
                          referrerPolicy="no-referrer"
                          className="w-11 h-11 rounded-xl object-cover border border-zinc-700/60"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 font-bold text-sm">
                          {item.displayName?.charAt(0) || 'U'}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{item.displayName}</span>
                          {isItemAdmin && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono">{item.email}</div>
                        <div className="text-xs text-cyan-400 mt-0.5">
                          {item.tiktokUsername ? `@${item.tiktokUsername}` : <span className="text-zinc-500 italic">Sin usuario de TikTok aún</span>}
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-wrap items-center gap-3 self-end md:self-center">
                      {/* Current Status Pill */}
                      <div className="mr-2">
                        {isPending ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <span>Pendiente de activación</span>
                          </div>
                        ) : isActive ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Activo / Autorizado</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono bg-zinc-800 px-2.5 py-1 rounded-lg">
                            <span>Suspendido</span>
                          </div>
                        )}
                      </div>

                      {/* Activation Action Button */}
                      {isPending && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleUpdateStatus(item.uid, 'active', item.displayName)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-zinc-950 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isActionLoading ? 'Activando...' : 'Activar Cuenta'}</span>
                        </button>
                      )}

                      {isActive && !isItemAdmin && (
                        <button
                          type="button"
                          disabled={isActionLoading}
                          onClick={() => handleUpdateStatus(item.uid, 'pending', item.displayName)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pausar</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

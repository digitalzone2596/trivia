import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Trivia from './pages/Trivia';
import AdminPanel from './pages/AdminPanel';
import { Lock, MessageCircle, ArrowLeft } from 'lucide-react';

// Componente guardián que protege los juegos
function ProtectedGameRoute({ children }: { children: React.JSX.Element }) {
  const { user, isActive, isAdmin, loading } = useAuth();

  // 1. Mientras Firebase verifica si hay sesión abierta
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-zinc-400">Verificando suscripción y licencia...</p>
        </div>
      </div>
    );
  }

  // 2. Si NO ha iniciado sesión con Google -> Lo mandamos al Lobby principal
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. Si inició sesión pero NO está activo (y no es admin) -> Pantalla de bloqueo
  if (!isActive && !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/5">
          <Lock className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-2">Acceso Pendiente de Activación</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          Hola <strong className="text-white">{user.displayName}</strong>. Tu cuenta aún no tiene una licencia activa para proyectar este juego en directo. Contacta con nosotros por WhatsApp para habilitar tu acceso.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Cambia TU_NUMERO por tu WhatsApp con código de país (ej: 584120000000) */}
          <a
            href={`https://wa.me/573504454869?text=Hola,%20solicito%20activacion%20para%20TikTok%20Live%20Games.%20Mi%20correo%20es:%20${user.email}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4 fill-zinc-950" />
            <span>Solicitar Activación por WhatsApp</span>
          </a>

          <a
            href="/"
            className="px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </a>
        </div>
      </div>
    );
  }

  // 4. Si tiene sesión y está activo -> ¡Juega!
  return children;
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Lobby principal abierto a todos */}
          <Route path="/" element={<Home />} />

          {/* Juego de Trivia BLINDADO */}
          <Route
            path="/trivia"
            element={
              <ProtectedGameRoute>
                <Trivia />
              </ProtectedGameRoute>
            }
          />

          {/* Panel de administración */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

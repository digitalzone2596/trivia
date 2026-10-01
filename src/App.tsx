import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Trivia from './pages/Trivia';
import WordCross from './pages/WordCross';
import AdminPanel from './pages/AdminPanel';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Lock, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';

// Guardián inteligente: Permite acceso por Sesión de Google O por Llave de OBS (?key=...)
function ProtectedGameRoute({ children }: { children: React.JSX.Element }) {
  const { user, isActive, isAdmin, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const obsKey = searchParams.get('key');

  const [obsStatus, setObsStatus] = useState<'checking' | 'valid' | 'invalid'>(
    obsKey ? 'checking' : 'invalid'
  );

  // Validación de la clave en OBS consultando Firestore
  useEffect(() => {
    if (!obsKey) return;

    let isMounted = true;
    async function verifyObsKey() {
      try {
        const userDocRef = doc(db, 'users', obsKey!);
        const snapshot = await getDoc(userDocRef);

        if (isMounted) {
          if (snapshot.exists() && (snapshot.data()?.status === 'active' || snapshot.data()?.role === 'admin')) {
            setObsStatus('valid');
          } else {
            setObsStatus('invalid');
          }
        }
      } catch (err) {
        console.error('Error al validar la clave de OBS:', err);
        if (isMounted) setObsStatus('invalid');
      }
    }

    verifyObsKey();
    return () => {
      isMounted = false;
    };
  }, [obsKey]);

  // CASO 1: Si viene desde OBS Studio / TikTok Live Studio con ?key=...
  if (obsKey) {
    if (obsStatus === 'checking') {
      return (
        <div className="w-screen h-screen bg-transparent flex flex-col items-center justify-center font-sans">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-2" />
          <span className="text-xs text-cyan-400 font-mono">Validando licencia de emisión...</span>
        </div>
      );
    }

    if (obsStatus === 'valid') {
      return children; // Acceso autorizado a OBS
    }

    return (
      <div className="w-screen h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center font-sans text-white">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-1">Licencia de OBS no autorizada</h2>
        <p className="text-xs text-zinc-400 max-w-sm">
          La clave proporcionada no es válida o tu suscripción se encuentra pausada. Verifica tu estado en la plataforma.
        </p>
      </div>
    );
  }

  // CASO 2: Si el usuario entra de forma normal desde su navegador
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  // No ha iniciado sesión en Google
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Cuenta pendiente de activación en el AdminPanel
  if (!isActive && !isAdmin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black mb-2">Acceso Pendiente de Activación</h1>
        <p className="text-sm text-zinc-400 max-w-md mb-6 leading-relaxed">
          Hola <strong>{user.displayName}</strong>. Tu cuenta aún no tiene los permisos activos para emitir los juegos. Comunícate con el administrador para autorizar tu licencia.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-semibold text-zinc-300 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </button>
      </div>
    );
  }

  return children;
}

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          
          {/* JUEGO 1: TRIVIA */}
          <Route
            path="/trivia"
            element={
              <ProtectedGameRoute>
                <Trivia />
              </ProtectedGameRoute>
            }
          />

          {/* JUEGO 2: WORD CROSS (CRUCIGRAMA) */}
          <Route
            path="/word-cross"
            element={
              <ProtectedGameRoute>
                <WordCross />
              </ProtectedGameRoute>
            }
          />

          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

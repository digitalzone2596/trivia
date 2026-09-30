import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Trivia from './pages/Trivia';
import AdminPanel from './pages/AdminPanel'; // <-- ESTA LÍNEA ES LA QUE QUITA EL ERROR

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Lobby principal */}
          <Route path="/" element={<Home />} />

          {/* Juego de Trivia */}
          <Route path="/trivia" element={<Trivia />} />

          {/* Panel de administración */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

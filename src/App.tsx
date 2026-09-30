import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Trivia from './pages/Trivia';

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pantalla principal / Catálogo con login */}
          <Route path="/" element={<Home />} />

          {/* Tu juego real de trivia conectado a TikTok */}
          <Route path="/trivia" element={<Trivia />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
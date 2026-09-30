import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prevenir caídas por errores no controlados en librerías externas
process.on('uncaughtException', (err) => {
  console.warn('[Advertencia - UncaughtException]:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Advertencia - UnhandledRejection]:', reason);
});

// Importar la clase nativa y moderna de TikTokLiveConnection (v2.5+)
let TikTokLiveConnectionClass = null;
try {
  const mod = await import('tiktok-live-connector');
  TikTokLiveConnectionClass = mod.TikTokLiveConnection || mod.default;
} catch (e) {
  console.error('[Error Crítico]: No se pudo cargar tiktok-live-connector:', e.message);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(__dirname));

// Estado global de conexión de TikTok Live
let tiktokLiveConnection = null;
let currentTikTokUser = '';
let connectionStatus = {
  estado: 'desconectado',
  username: '',
  mensaje: 'Ingresa tu usuario de TikTok y pulsa Conectar',
  viewerCount: 0,
  roomId: null,
};

// Función para procesar un comentario recibido
function procesarMensajeChat(data) {
  if (!data) return;

  // 1. Extraer texto del comentario (compatible con protobuf v2.5 y plano)
  const rawText = (
    data.content ||
    data.comment ||
    data.text ||
    data.message ||
    data.commentText ||
    ''
  ).toString().trim();

  if (!rawText) return;

  // 2. Extraer nombre de usuario de TikTok (displayId es el @usuario real en protobuf)
  const username = (
    data.user?.displayId ||
    data.user?.uniqueId ||
    data.uniqueId ||
    data.user?.nickname ||
    data.nickname ||
    data.author?.uniqueId ||
    'espectador'
  ).toString().replace(/^@/, '');

  // 3. Extraer avatar del usuario
  let userAvatar = '';
  if (data.profilePictureUrl) {
    userAvatar = data.profilePictureUrl;
  } else if (data.user?.avatarThumb?.urlList?.[0]) {
    userAvatar = data.user.avatarThumb.urlList[0];
  } else if (data.user?.avatarMedium?.urlList?.[0]) {
    userAvatar = data.user.avatarMedium.urlList[0];
  } else if (data.user?.avatarLarge?.urlList?.[0]) {
    userAvatar = data.user.avatarLarge.urlList[0];
  }

  // 4. Analizar si es un voto para la trivia (A, B, C o D)
  const upper = rawText.toUpperCase();
  let detectedAnswer = null;

  // Coincidencia directa (ej: "A", "b", "A.", "B)", "#C", " D ")
  const matchDirect = upper.match(/^[#]?[ ]*([ABCD])[ .),!?-]*$/);
  if (matchDirect) {
    detectedAnswer = matchDirect[1];
  } else {
    // Coincidencia con frases (ej: "opción A", "la B", "es C", "voto D")
    const matchWord = upper.match(/\b([ABCD])\b/);
    if (matchWord) {
      detectedAnswer = matchWord[1];
    }
  }

  // Log visible y limpio en consola
  if (detectedAnswer) {
    console.log(`[VOTO EN VIVO] @${username} votó por la opción [${detectedAnswer}]`);
  } else {
    console.log(`[Chat TikTok] @${username}: "${rawText}"`);
  }

  // Emitir evento al juego en OBS y navegador
  io.emit('comentarioTikTokReal', {
    usuario: `@${username}`,
    foto: userAvatar,
    mensaje: rawText,
    respuesta: detectedAnswer,
    timestamp: Date.now(),
  });

  if (detectedAnswer) {
    io.emit('voto', detectedAnswer);
  }
}

// Procesar regalo o donación en vivo de TikTok
function procesarRegaloDonacion(data) {
  if (!data) return;

  // 1. Extraer donador
  const username = (
    data.user?.displayId ||
    data.user?.uniqueId ||
    data.uniqueId ||
    data.user?.nickname ||
    data.nickname ||
    data.author?.uniqueId ||
    'donador'
  ).toString().replace(/^@/, '');

  let userAvatar = '';
  if (data.profilePictureUrl) {
    userAvatar = data.profilePictureUrl;
  } else if (data.user?.avatarThumb?.urlList?.[0]) {
    userAvatar = data.user.avatarThumb.urlList[0];
  } else if (data.user?.avatarMedium?.urlList?.[0]) {
    userAvatar = data.user.avatarMedium.urlList[0];
  }

  // 2. Extraer nombre del regalo y valor en monedas/diamantes
  const giftName = (
    data.extendedGiftInfo?.name ||
    data.gift?.name ||
    data.giftName ||
    (data.giftId ? `Regalo #${data.giftId}` : 'Regalo')
  );
  const diamonds = Number(data.extendedGiftInfo?.diamond_count || data.gift?.diamondCount || data.diamondCount || 1);
  const repeatCount = Number(data.comboCount || data.repeatCount || 1);
  const totalCost = diamonds * repeatCount;

  // 3. Lógica de comodines según el regalo donado:
  // - Si el regalo vale 5 o más monedas (o regalos medianos/grandes como Donut, Corgi, Gorra) -> 'saltar'
  // - Si vale de 1 a 4 monedas (como Rosa, Corazón, GG, Panda) -> '50-50' (elimina 2 opciones erróneas)
  const accion = totalCost >= 5 ? 'saltar' : '50-50';

  console.log(`\n🎁 [DONACIÓN TIKTOK] @${username} donó [${giftName} x${repeatCount}] (${totalCost} monedas) -> ACCIÓN: ${accion.toUpperCase()}`);

  io.emit('tiktokDonacion', {
    usuario: `@${username}`,
    foto: userAvatar,
    regalo: giftName,
    monedas: totalCost,
    cantidad: repeatCount,
    accion,
    timestamp: Date.now(),
  });
}

// Conectar a TikTok Live
async function conectarTikTokLive(rawUsername) {
  if (!rawUsername || !rawUsername.trim()) {
    connectionStatus = {
      estado: 'error',
      username: '',
      mensaje: 'Por favor ingresa un nombre de usuario válido de TikTok.',
      viewerCount: 0,
      roomId: null,
    };
    io.emit('tiktokEstado', connectionStatus);
    return connectionStatus;
  }

  if (!TikTokLiveConnectionClass) {
    connectionStatus = {
      estado: 'error',
      username: rawUsername,
      mensaje: 'El módulo tiktok-live-connector no está disponible.',
      viewerCount: 0,
      roomId: null,
    };
    io.emit('tiktokEstado', connectionStatus);
    return connectionStatus;
  }

  const cleanUser = rawUsername.trim().replace(/^@/, '');
  currentTikTokUser = cleanUser;

  // Desconectar sesión previa
  if (tiktokLiveConnection) {
    try {
      tiktokLiveConnection.disconnect();
    } catch {}
    tiktokLiveConnection = null;
  }

  connectionStatus = {
    estado: 'conectando',
    username: `@${cleanUser}`,
    mensaje: `Buscando y conectando al directo de @${cleanUser}...`,
    viewerCount: 0,
    roomId: null,
  };
  io.emit('tiktokEstado', connectionStatus);

  try {
    // Usamos TikTokLiveConnection nativa con opciones estables
    tiktokLiveConnection = new TikTokLiveConnectionClass(cleanUser, {
      processInitialData: false,
      enableExtendedGiftInfo: false,
      enableWebsocketUpgrade: true,
      requestPollingIntervalMs: 1000,
    });

    const state = await tiktokLiveConnection.connect();

    const viewers = state?.roomInfo?.viewer_count || tiktokLiveConnection?.roomInfo?.viewer_count || 0;
    const room = state?.roomId || tiktokLiveConnection?.roomId || null;

    connectionStatus = {
      estado: 'conectado',
      username: `@${cleanUser}`,
      mensaje: `¡Conectado exitosamente al directo de @${cleanUser}!`,
      viewerCount: viewers,
      roomId: room,
    };
    console.log(`\n>>> [TikTok Live] CONECTADO A @${cleanUser} (RoomId: ${room}) <<<`);
    console.log(`>>> Esperando comentarios de la audiencia en vivo... <<<\n`);
    io.emit('tiktokEstado', connectionStatus);

    // 1. Escuchar evento oficial 'chat'
    tiktokLiveConnection.on('chat', (data) => {
      try {
        procesarMensajeChat(data);
      } catch (err) {
        console.error('Error procesando chat:', err.message);
      }
    });

    // 2. Escuchar evento oficial 'gift' (Donaciones en vivo de TikTok)
    tiktokLiveConnection.on('gift', (data) => {
      try {
        procesarRegaloDonacion(data);
      } catch (err) {
        console.error('Error procesando regalo:', err.message);
      }
    });

    // 3. Escuchar evento de respaldo 'decodedData'
    tiktokLiveConnection.on('decodedData', (method, decodedData) => {
      try {
        if (method === 'WebcastChatMessage' && decodedData?.data) {
          procesarMensajeChat(decodedData.data);
        } else if (method === 'WebcastGiftMessage' && decodedData?.data) {
          procesarRegaloDonacion(decodedData.data);
        }
      } catch {}
    });

    // 4. Escuchar recuento de espectadores
    tiktokLiveConnection.on('roomUser', (data) => {
      const count = data?.viewerCount !== undefined ? data.viewerCount : 0;
      if (count > 0) {
        connectionStatus.viewerCount = count;
        io.emit('tiktokEspectadores', count);
      }
    });

    // 5. Desconexión
    tiktokLiveConnection.on('disconnected', () => {
      connectionStatus = {
        estado: 'desconectado',
        username: `@${cleanUser}`,
        mensaje: `El directo de @${cleanUser} se ha desconectado o ha finalizado.`,
        viewerCount: 0,
        roomId: null,
      };
      console.log(`[TikTok Live] @${cleanUser} desconectado.`);
      io.emit('tiktokEstado', connectionStatus);
    });

    // 6. Errores no fatales
    tiktokLiveConnection.on('error', (err) => {
      console.warn(`[TikTok Live Aviso]:`, err?.info || err?.message || err);
    });

    return connectionStatus;
  } catch (err) {
    console.error(`[TikTok Live Falló al conectar con @${cleanUser}]:`, err?.message || err);
    connectionStatus = {
      estado: 'error',
      username: `@${cleanUser}`,
      mensaje: `No se pudo conectar a @${cleanUser}. Asegúrate de que la cuenta esté transmitiendo EN VIVO en este momento.`,
      viewerCount: 0,
      roomId: null,
    };
    io.emit('tiktokEstado', connectionStatus);
    return connectionStatus;
  }
}

// Desconectar TikTok
function desconectarTikTokLive() {
  if (tiktokLiveConnection) {
    try {
      tiktokLiveConnection.disconnect();
    } catch {}
    tiktokLiveConnection = null;
  }
  connectionStatus = {
    estado: 'desconectado',
    username: '',
    mensaje: 'Desconectado del directo.',
    viewerCount: 0,
    roomId: null,
  };
  io.emit('tiktokEstado', connectionStatus);
  return connectionStatus;
}

// Rutas API REST
app.get('/api/tiktok/estado', (req, res) => {
  res.json(connectionStatus);
});

app.post('/api/tiktok/conectar', async (req, res) => {
  const { username } = req.body;
  const status = await conectarTikTokLive(username);
  res.json(status);
});

app.post('/api/tiktok/desconectar', (req, res) => {
  const status = desconectarTikTokLive();
  res.json(status);
});

// Socket.io eventos
io.on('connection', (socket) => {
  socket.emit('tiktokEstado', connectionStatus);

  socket.on('conectarTikTok', async (data) => {
    await conectarTikTokLive(data?.username);
  });

  socket.on('desconectarTikTok', () => {
    desconectarTikTokLive();
  });

  socket.on('emitirPregunta', (data) => {
    io.emit('estadoJuego', data);
  });

  socket.on('emitirCorrecta', (letra) => {
    io.emit('marcarCorrecta', letra);
  });

  socket.on('emitirVoto', (letra) => {
    io.emit('voto', letra);
  });

  socket.on('simularDonacion', (data) => {
    io.emit('tiktokDonacion', data);
  });

  socket.on('activar5050', (data) => {
    io.emit('accionComodin', { tipo: '50-50', ...data });
  });

  socket.on('activarSaltar', (data) => {
    io.emit('accionComodin', { tipo: 'saltar', ...data });
  });
});

// Enrutamiento SPA para Render (sirve index.html en cualquier ruta cliente)
app.get('*', (req, res) => {
  const distPath = path.join(__dirname, 'dist', 'index.html');
  res.sendFile(distPath, (err) => {
    if (err) {
      res.sendFile(path.join(__dirname, 'index.html'));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(` Servidor TikTok Live Trivia Arena Activo`);
  console.log(` Escuchando en: http://0.0.0.0:${PORT}`);
  console.log(` Conector TikTok Live: Listo (v2.5)`);
  console.log(`========================================\n`);
});

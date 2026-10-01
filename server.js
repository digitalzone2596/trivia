import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prevenir caídas del proceso por excepciones externas
process.on('uncaughtException', (err) => {
  console.warn('[Advertencia - UncaughtException]:', err?.message || err);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Advertencia - UnhandledRejection]:', reason);
});

// API Key de Euler Stream
const EULER_API_KEY = process.env.EULER_API_KEY || 'euler_NTE1MWIwYmUzY2ExZmYyMDMyNjVhY2E3OTkwMTU4MTU4ZmJkYjhkZTM0Y2Y0MjQwOTA0Zjhi';

// Importar conector moderno de TikTok Live y configurar clave de firmas
let TikTokLiveConnectionClass = null;
try {
  const mod = await import('tiktok-live-connector');
  TikTokLiveConnectionClass = mod.TikTokLiveConnection || mod.default;
  if (mod.SignConfig) {
    mod.SignConfig.apiKey = EULER_API_KEY;
  }
} catch (e) {
  console.error('[Error Crítico]: No se pudo cargar tiktok-live-connector:', e.message);
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(express.json());

// Servir estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(__dirname));

/**
 * GESTOR DE CONEXIONES ACTIVAS
 * Estructura: Map<username, { connection, status, roomId, viewerCount } >
 */
const activeStreams = new Map();

// Caché de deduplicación para regalos (evita retransmisiones duplicadas de TikTok)
const processedGifts = new Set();

// Helper: Extraer información del usuario emisor
function extraerUsuario(data) {
  const username = (
    data.user?.displayId ||
    data.user?.uniqueId ||
    data.uniqueId ||
    data.user?.nickname ||
    data.nickname ||
    data.author?.uniqueId ||
    'espectador'
  ).toString().replace(/^@/, '');

  let foto = '';
  if (data.profilePictureUrl) {
    foto = data.profilePictureUrl;
  } else if (data.user?.avatarThumb?.urlList?.[0]) {
    foto = data.user.avatarThumb.urlList[0];
  } else if (data.user?.avatarMedium?.urlList?.[0]) {
    foto = data.user.avatarMedium.urlList[0];
  } else if (data.user?.avatarLarge?.urlList?.[0]) {
    foto = data.user.avatarLarge.urlList[0];
  }

  const nombreVisible = (data.user?.nickname || data.nickname || username).toString();

  return { username, nombreVisible, foto };
}

// Helper: Extraer texto del comentario
function extraerTextoComentario(data) {
  return (
    data.content ||
    data.comment ||
    data.text ||
    data.message ||
    data.commentText ||
    ''
  ).toString().trim();
}

/**
 * 1. PROCESAMIENTO UNIVERSAL DE CHAT
 */
function procesarChat(streamer, data) {
  if (!data) return;

  const rawText = extraerTextoComentario(data);
  if (!rawText) return;

  const { username, nombreVisible, foto } = extraerUsuario(data);
  const room = `streamer_${streamer}`;

  // Detección de voto para Trivia (A, B, C o D)
  const upper = rawText.toUpperCase();
  let detectedAnswer = null;
  const matchDirect = upper.match(/^[#]?[ ]*([ABCD])[ .),!?-]*$/);
  if (matchDirect) {
    detectedAnswer = matchDirect[1];
  } else {
    const matchWord = upper.match(/\b([ABCD])\b/);
    if (matchWord) {
      detectedAnswer = matchWord[1];
    }
  }

  const payloadUniversal = {
    streamer,
    usuario: `@${username}`,
    nombre: nombreVisible,
    foto,
    mensaje: rawText,
    timestamp: Date.now(),
  };

  // Evento universal para Word Cross y otros juegos
  io.to(room).emit('tiktokChat', payloadUniversal);

  // Retrocompatibilidad con Trivia
  const payloadTrivia = {
    ...payloadUniversal,
    respuesta: detectedAnswer,
  };
  io.to(room).emit('comentarioTikTokReal', payloadTrivia);
  // Respaldo para clientes que no se unieron a la sala
  io.except(room).emit('comentarioTikTokReal', payloadTrivia);

  if (detectedAnswer) {
    io.to(room).emit('voto', detectedAnswer);
    io.except(room).emit('voto', detectedAnswer);
    console.log(`[${streamer}] [VOTO TRIVIA] @${username} eligió [${detectedAnswer}]`);
  } else {
    console.log(`[${streamer}] [Chat] @${username}: "${rawText}"`);
  }
}

/**
 * 2. PROCESAMIENTO UNIVERSAL DE DONACIONES Y REGALOS
 */
function procesarRegalo(streamer, data) {
  if (!data) return;

  // 1. FILTRO ANTI-DUPLICADOS DE RÁFAGA (COMBOS DE ROSAS):
  // En TikTok Live, los regalos streakable (como las Rosas, giftType === 1) envían un evento
  // por cada pulsación. Solo se procesa cuando la ráfaga concluye (repeatEnd === true).
  if (data.giftType === 1 && !data.repeatEnd) {
    return;
  }

  // 2. FILTRO DE IDENTIFICADOR ÚNICO (Evita retransmisiones automáticas de red)
  const giftUniqueKey = `${streamer}_${data.user?.uniqueId || data.userId || 'user'}_${data.giftId}_${data.comboCount || data.repeatCount || 1}`;
  if (processedGifts.has(giftUniqueKey)) {
    return;
  }
  processedGifts.add(giftUniqueKey);
  setTimeout(() => processedGifts.delete(giftUniqueKey), 3500);

  const { username, nombreVisible, foto } = extraerUsuario(data);
  const room = `streamer_${streamer}`;

  const giftName = (
    data.extendedGiftInfo?.name ||
    data.gift?.name ||
    data.giftName ||
    (data.giftId ? `Regalo #${data.giftId}` : 'Regalo')
  );

  const diamonds = Number(data.extendedGiftInfo?.diamond_count || data.gift?.diamondCount || data.diamondCount || 1);
  const repeatCount = Number(data.comboCount || data.repeatCount || 1);
  const totalCost = diamonds * repeatCount;

  // Lógica de comodines de Trivia (Rosa/1-4 monedas = 50-50, 5+ = saltar)
  const accionTrivia = totalCost >= 5 ? 'saltar' : '50-50';

  console.log(`\n🎁 [${streamer}] [DONACIÓN] @${username} donó [${giftName} x${repeatCount}] (${totalCost} monedas)`);

  const payloadRegalo = {
    streamer,
    usuario: `@${username}`,
    nombre: nombreVisible,
    foto,
    regalo: giftName,
    regaloId: data.giftId,
    monedas: totalCost,
    diamantesUnitarios: diamonds,
    cantidad: repeatCount,
    accion: accionTrivia,
    timestamp: Date.now(),
  };

  // Emitir a la sala privada del streamer
  io.to(room).emit('tiktokRegalo', payloadRegalo);
  io.to(room).emit('tiktokDonacion', payloadRegalo);

  // Respaldo para clientes antiguos que no se unieron a la sala
  io.except(room).emit('tiktokDonacion', payloadRegalo);
}

/**
 * 3. PROCESAMIENTO DE LIKES / TAPS
 */
function procesarLikes(streamer, data) {
  if (!data) return;
  const { username, nombreVisible, foto } = extraerUsuario(data);
  const room = `streamer_${streamer}`;

  const payloadLikes = {
    streamer,
    usuario: `@${username}`,
    nombre: nombreVisible,
    foto,
    likesTotales: data.totalLikeCount || 0,
    likesEnviados: data.likeCount || 1,
    timestamp: Date.now(),
  };

  io.to(room).emit('tiktokLike', payloadLikes);
  io.except(room).emit('tiktokLike', payloadLikes);
}

/**
 * CONEXIÓN AL DIRECTO DE TIKTOK
 */
async function conectarTikTok(rawUsername, socketId = null) {
  const cleanUser = (rawUsername || '').trim().replace(/^@/, '').toLowerCase();

  if (!cleanUser) {
    const errorStatus = {
      estado: 'error',
      username: '',
      mensaje: 'Por favor ingresa un nombre de usuario de TikTok válido.',
      viewerCount: 0,
      roomId: null,
    };
    return errorStatus;
  }

  // Si ya está conectado este streamer, retornamos su estado activo
  if (activeStreams.has(cleanUser)) {
    const existing = activeStreams.get(cleanUser);
    if (existing.status.estado === 'conectado') {
      return existing.status;
    }
  }

  const room = `streamer_${cleanUser}`;

  const statusInicial = {
    estado: 'conectando',
    username: `@${cleanUser}`,
    mensaje: `Conectando con el directo de @${cleanUser}...`,
    viewerCount: 0,
    roomId: null,
  };

  io.to(room).emit('tiktokEstado', statusInicial);
  io.except(room).emit('tiktokEstado', statusInicial);

  try {
    const ttConn = new TikTokLiveConnectionClass(cleanUser, {
      processInitialData: false,
      enableExtendedGiftInfo: false,
      enableWebsocketUpgrade: true,
      requestPollingIntervalMs: 1000,
      signApiKey: EULER_API_KEY,
    });

    const state = await ttConn.connect();
    const viewers = state?.roomInfo?.viewer_count || ttConn?.roomInfo?.viewer_count || 0;
    const roomId = state?.roomId || ttConn?.roomId || null;

    const statusConectado = {
      estado: 'conectado',
      username: `@${cleanUser}`,
      mensaje: `¡Conectado exitosamente al directo de @${cleanUser}!`,
      viewerCount: viewers,
      roomId,
    };

    activeStreams.set(cleanUser, {
      connection: ttConn,
      status: statusConectado,
      roomId,
      viewerCount: viewers,
    });

    console.log(`\n>>> [TikTok Live Hub] EN VIVO CON @${cleanUser} (Room: ${roomId}) <<<`);
    io.to(room).emit('tiktokEstado', statusConectado);
    io.except(room).emit('tiktokEstado', statusConectado);

    // 1. CHAT (Manejador único oficial)
    ttConn.on('chat', (data) => procesarChat(cleanUser, data));

    // 2. REGALOS (Manejador único oficial)
    ttConn.on('gift', (data) => procesarRegalo(cleanUser, data));

    // 3. LIKES / TAPS
    ttConn.on('like', (data) => procesarLikes(cleanUser, data));

    // 4. ESPECTADORES
    ttConn.on('roomUser', (data) => {
      const count = data?.viewerCount ?? 0;
      if (count > 0) {
        const streamData = activeStreams.get(cleanUser);
        if (streamData) streamData.status.viewerCount = count;
        io.to(room).emit('tiktokEspectadores', count);
        io.except(room).emit('tiktokEspectadores', count);
      }
    });

    // 5. DESCONEXIÓN
    ttConn.on('disconnected', () => {
      desconectarTikTok(cleanUser);
    });

    ttConn.on('streamEnd', () => {
      desconectarTikTok(cleanUser);
    });

    ttConn.on('error', (err) => {
      console.warn(`[Aviso TikTok @${cleanUser}]:`, err?.info || err?.message || err);
    });

    return statusConectado;
  } catch (err) {
    console.error(`[Fallo de conexión @${cleanUser}]:`, err?.message || err);
    const statusError = {
      estado: 'error',
      username: `@${cleanUser}`,
      mensaje: `No se pudo conectar a @${cleanUser}. Asegúrate de que esté transmitiendo EN VIVO.`,
      viewerCount: 0,
      roomId: null,
    };
    activeStreams.delete(cleanUser);
    io.to(room).emit('tiktokEstado', statusError);
    io.except(room).emit('tiktokEstado', statusError);
    return statusError;
  }
}

/**
 * DESCONEXIÓN DE STREAMER
 */
function desconectarTikTok(rawUsername) {
  const cleanUser = (rawUsername || '').trim().replace(/^@/, '').toLowerCase();
  const room = `streamer_${cleanUser}`;

  if (activeStreams.has(cleanUser)) {
    try {
      activeStreams.get(cleanUser).connection.disconnect();
    } catch {}
    activeStreams.delete(cleanUser);
  }

  const statusDesconectado = {
    estado: 'desconectado',
    username: cleanUser ? `@${cleanUser}` : '',
    mensaje: 'Desconectado del directo.',
    viewerCount: 0,
    roomId: null,
  };

  io.to(room).emit('tiktokEstado', statusDesconectado);
  io.except(room).emit('tiktokEstado', statusDesconectado);
  return statusDesconectado;
}

// -------------------------------------------------------------
// ENDPOINTS REST
// -------------------------------------------------------------

app.get('/api/tiktok/estado', (req, res) => {
  const queryUser = (req.query.username || '').toLowerCase().replace(/^@/, '');
  if (queryUser && activeStreams.has(queryUser)) {
    return res.json(activeStreams.get(queryUser).status);
  }

  const firstActive = activeStreams.values().next().value;
  res.json(
    firstActive
      ? firstActive.status
      : {
          estado: 'desconectado',
          username: '',
          mensaje: 'Ingresa tu usuario de TikTok y pulsa Conectar',
          viewerCount: 0,
          roomId: null,
        }
  );
});

app.post('/api/tiktok/conectar', async (req, res) => {
  const { username } = req.body;
  const status = await conectarTikTok(username);
  res.json(status);
});

app.post('/api/tiktok/desconectar', (req, res) => {
  const { username } = req.body;
  const status = desconectarTikTok(username);
  res.json(status);
});

app.get('/api/tiktok/activos', (req, res) => {
  const activos = Array.from(activeStreams.keys()).map((user) => ({
    username: `@${user}`,
    viewerCount: activeStreams.get(user).status.viewerCount,
    roomId: activeStreams.get(user).roomId,
  }));
  res.json({ total: activos.length, streams: activos });
});

// -------------------------------------------------------------
// SOCKET.IO: SALAS Y CONTROL DE EVENTOS
// -------------------------------------------------------------
io.on('connection', (socket) => {
  socket.on('unirseSalaStreamer', ({ username }) => {
    if (!username) return;
    const cleanUser = username.toLowerCase().replace(/^@/, '');
    const room = `streamer_${cleanUser}`;
    socket.join(room);

    if (activeStreams.has(cleanUser)) {
      socket.emit('tiktokEstado', activeStreams.get(cleanUser).status);
    }
  });

  socket.on('conectarTikTok', async (data) => {
    const cleanUser = (data?.username || '').toLowerCase().replace(/^@/, '');
    if (cleanUser) socket.join(`streamer_${cleanUser}`);
    await conectarTikTok(data?.username, socket.id);
  });

  socket.on('desconectarTikTok', (data) => {
    desconectarTikTok(data?.username);
  });

  socket.on('emitirPregunta', (data) => io.emit('estadoJuego', data));
  socket.on('emitirCorrecta', (letra) => io.emit('marcarCorrecta', letra));
  socket.on('emitirVoto', (letra) => io.emit('voto', letra));
  socket.on('simularDonacion', (data) => io.emit('tiktokDonacion', data));
  socket.on('activar5050', (data) => io.emit('accionComodin', { tipo: '50-50', ...data }));
  socket.on('activarSaltar', (data) => io.emit('accionComodin', { tipo: 'saltar', ...data }));
});

// Servir frontend en cualquier ruta (SPA)
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
  console.log(` Servidor TikTok LIVE Game Hub Activo`);
  console.log(` Puerto: http://0.0.0.0:${PORT}`);
  console.log(` Euler Stream: Activo con API Key`);
  console.log(`========================================\n`);
});

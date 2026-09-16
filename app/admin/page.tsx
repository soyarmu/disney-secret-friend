'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticipantAdminInfo {
  nombre: string;
  email: string;
  sexo?: string;
  personaje: string;
  avatar: string;
  regalos: string[];
  amigoSecreto: string | null;
  amigoSecretoAvatar: string | null;
  amigoSecretoNombre: string | null;
}

interface DrawState {
  totalParticipants: number;
  drawCompleted: boolean;
  canDraw: boolean;
  participants?: ParticipantAdminInfo[];
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isFixingAvatars, setIsFixingAvatars] = useState(false);
  const [isFixingCharacters, setIsFixingCharacters] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtro y búsqueda de personajes
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'assigned' | 'pending'>('all');

  // Cargar estado inicial
  useEffect(() => {
    if (isAuthenticated) {
      fetchDrawState();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setLoginError('');
      } else {
        setLoginError(data.error || 'Credenciales incorrectas');
      }
    } catch (error) {
      setLoginError('Error de conexión');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchDrawState = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/draw');
      const data = await response.json();

      if (response.ok) {
        setDrawState(data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al cargar el estado' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDraw = async () => {
    if (!confirm('¿Estás seguro de realizar el sorteo? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsDrawing(true);
    setMessage(null);

    try {
      const response = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `✨ ${data.message} Se asignaron ${data.data.assignments} amigos secretos.`,
        });
        await fetchDrawState();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error al realizar el sorteo',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión al realizar el sorteo',
      });
    } finally {
      setIsDrawing(false);
    }
  };

  const handleFixAvatars = async () => {
    if (!confirm('¿Actualizar los avatares de todos los participantes a su imagen real de Disney?')) {
      return;
    }

    setIsFixingAvatars(true);
    setMessage(null);

    try {
      const response = await fetch('/api/fix-avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `✨ ${data.message}`,
        });
        await fetchDrawState();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error al actualizar los avatares',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión al actualizar los avatares',
      });
    } finally {
      setIsFixingAvatars(false);
    }
  };

  const handleFixCharacters = async () => {
    if (!confirm('¿Reasignar personajes duplicados y corregir géneros a personajes Disney únicos? El sorteo actual NO se alterará.')) {
      return;
    }

    setIsFixingCharacters(true);
    setMessage(null);

    try {
      const response = await fetch('/api/fix-characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `✨ ${data.message}`,
        });
        await fetchDrawState();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error al corregir personajes',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión al corregir personajes',
      });
    } finally {
      setIsFixingCharacters(false);
    }
  };

  const handleReset = async (action: 'reset-draw' | 'clear-all') => {
    const messages = {
      'reset-draw': '¿Quieres resetear el sorteo? Esto borrará las asignaciones pero mantendrá a los participantes registrados.',
      'clear-all': '⚠️ ¿Estás SEGURO de borrar TODO? Esto eliminará todos los participantes y el sorteo. Esta acción NO se puede deshacer.',
    };

    if (!confirm(messages[action])) {
      return;
    }

    setIsResetting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message,
        });
        await fetchDrawState();
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Error al resetear',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error de conexión al resetear',
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Filtrado de participantes
  const participants = drawState?.participants || [];
  const assignedCount = participants.filter(p => Boolean(p.amigoSecreto)).length;
  const pendingCount = participants.filter(p => !p.amigoSecreto).length;

  const filteredParticipants = participants.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      p.nombre.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.personaje.toLowerCase().includes(term) ||
      (p.amigoSecreto && p.amigoSecreto.toLowerCase().includes(term)) ||
      (p.amigoSecretoNombre && p.amigoSecretoNombre.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (filterStatus === 'assigned') {
      return Boolean(p.amigoSecreto);
    }
    if (filterStatus === 'pending') {
      return !p.amigoSecreto;
    }
    return true;
  });

  const getGenderBadge = (sexo?: string) => {
    const s = (sexo || '').trim().toUpperCase();
    if (s === 'M') return <span className="bg-blue-500/30 text-blue-300 border border-blue-400/40 text-xs px-2 py-0.5 rounded-full">👨 Masculino</span>;
    if (s === 'F') return <span className="bg-pink-500/30 text-pink-300 border border-pink-400/40 text-xs px-2 py-0.5 rounded-full">👩 Femenino</span>;
    return <span className="bg-purple-500/30 text-purple-300 border border-purple-400/40 text-xs px-2 py-0.5 rounded-full">🌈 Otro</span>;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Estrellas de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className={`w-full ${isAuthenticated ? 'max-w-6xl' : 'max-w-3xl'} relative z-10 transition-all duration-300`}>
        {!isAuthenticated ? (
          // FORMULARIO DE LOGIN
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl rounded-3xl p-10 magical-shadow border border-purple-500/30"
          >
            {/* Título */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center mb-10"
            >
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-disney-gold via-yellow-300 to-disney-gold animate-sparkle mb-4">
                🔐 Acceso Restringido
              </h1>
              <p className="text-purple-200 text-xl">
                Solo el administrador puede acceder
              </p>
            </motion.div>

            {/* Formulario de Login */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-disney-gold font-semibold mb-2 text-sm">
                  Email del Administrador
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label className="block text-disney-gold font-semibold mb-2 text-sm">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              {/* Error */}
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                >
                  ⚠️ {loginError}
                </motion.div>
              )}

              {/* Botón de login */}
              <motion.button
                type="submit"
                disabled={isLoggingIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  isLoggingIn
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-disney-gold to-yellow-500 text-disney-blue magical-shadow hover:shadow-2xl'
                }`}
              >
                {isLoggingIn ? 'Verificando...' : '🔓 Iniciar Sesión'}
              </motion.button>
            </form>

            {/* Link para volver */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <a
                href="/"
                className="inline-block px-6 py-3 bg-disney-blue/50 hover:bg-disney-blue/70 text-disney-gold font-semibold rounded-xl border border-disney-gold/30 transition-all"
              >
                ← Volver a la página de registro
              </a>
            </motion.div>
          </motion.div>
        ) : (
          // PANEL DE ADMINISTRACIÓN
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl rounded-3xl p-6 sm:p-10 magical-shadow border border-purple-500/30"
          >
            {/* Título */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-disney-gold via-yellow-300 to-disney-gold animate-sparkle mb-3">
                🎩 Panel de Administración 🎩
              </h1>
              <p className="text-purple-200 text-lg sm:text-xl">
                Gestiona el sorteo y consulta los personajes y amigos secretos asignados
              </p>
            </motion.div>

            {/* Estado de carga */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 border-4 border-disney-gold border-t-transparent rounded-full"
                />
                <p className="text-purple-300 mt-4 font-medium">Cargando información mágica...</p>
              </div>
            ) : drawState ? (
              <>
                {/* Estadísticas */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8"
                >
                  {/* Total de participantes */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 text-sm font-semibold mb-1">
                          Participantes
                        </p>
                        <p className="text-4xl font-bold text-disney-gold">
                          {drawState.totalParticipants}
                        </p>
                      </div>
                      <div className="text-4xl">👥</div>
                    </div>
                  </div>

                  {/* Estado del sorteo */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-300 text-sm font-semibold mb-1">
                          Estado Sorteo
                        </p>
                        <p className={`text-2xl sm:text-3xl font-bold ${drawState.drawCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                          {drawState.drawCompleted ? '✓ Completado' : '○ Pendiente'}
                        </p>
                      </div>
                      <div className="text-4xl">
                        {drawState.drawCompleted ? '🎉' : '⏳'}
                      </div>
                    </div>
                  </div>

                  {/* Asignaciones */}
                  <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-2xl p-6 border border-yellow-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-300 text-sm font-semibold mb-1">
                          Amigos Asignados
                        </p>
                        <p className="text-4xl font-bold text-yellow-300">
                          {assignedCount} / {drawState.totalParticipants}
                        </p>
                      </div>
                      <div className="text-4xl">🎁</div>
                    </div>
                  </div>
                </motion.div>

                {/* Mensaje de respuesta */}
                {message && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mb-6 p-6 rounded-2xl border-2 ${
                      message.type === 'success'
                        ? 'bg-green-500/20 border-green-400/50 text-green-200'
                        : 'bg-red-500/20 border-red-400/50 text-red-200'
                    }`}
                  >
                    <p className="text-lg font-semibold">{message.text}</p>
                  </motion.div>
                )}

                {/* SECCIÓN DE PERSONAJES Y ASIGNACIONES */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-10 bg-black/20 rounded-3xl p-6 sm:p-8 border border-purple-500/30 backdrop-blur-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-disney-gold flex items-center gap-3">
                        <span>🎭</span> Personajes y Amigos Secretos
                      </h2>
                      <p className="text-purple-300 text-sm mt-1">
                        Todos los personajes jugando con sus avatares y su asignación de regalo
                      </p>
                    </div>

                    {/* Filtros rápidos */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterStatus === 'all'
                            ? 'bg-disney-gold text-disney-blue font-bold shadow-md'
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                      >
                        Todos ({participants.length})
                      </button>
                      <button
                        onClick={() => setFilterStatus('assigned')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterStatus === 'assigned'
                            ? 'bg-green-500 text-white font-bold shadow-md'
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                      >
                        Asignados ({assignedCount})
                      </button>
                      <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          filterStatus === 'pending'
                            ? 'bg-yellow-500 text-disney-blue font-bold shadow-md'
                            : 'bg-white/10 text-purple-200 hover:bg-white/20'
                        }`}
                      >
                        Pendientes ({pendingCount})
                      </button>
                    </div>
                  </div>

                  {/* Barra de búsqueda */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="🔍 Buscar por personaje, nombre de participante o email..."
                        className="w-full px-4 py-3 pl-11 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold text-sm transition-all"
                      />
                      <span className="absolute left-4 top-3.5 text-purple-300 text-sm">
                        🔍
                      </span>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-4 top-3 text-xs text-purple-300 hover:text-white bg-purple-700/50 px-2 py-1 rounded"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid de Personajes */}
                  {filteredParticipants.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredParticipants.map((p, idx) => (
                        <motion.div
                          key={p.personaje || idx}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: idx * 0.03 }}
                          className="bg-gradient-to-br from-purple-950/60 to-blue-950/60 border border-purple-400/20 hover:border-disney-gold/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
                        >
                          <div>
                            {/* Cabecera del Participante */}
                            <div className="flex items-start gap-4">
                              {/* Avatar del Jugador */}
                              <div className="relative flex-shrink-0">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-disney-gold to-yellow-500 p-0.5 magical-shadow">
                                  <div className="w-full h-full rounded-2xl bg-disney-blue/80 overflow-hidden flex items-center justify-center">
                                    {p.avatar ? (
                                      <img
                                        src={p.avatar}
                                        alt={p.personaje}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          // Fallback si la imagen falla
                                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.personaje)}`;
                                        }}
                                      />
                                    ) : (
                                      <span className="text-3xl">🎭</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Info del Personaje y Participante */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h3 className="text-lg sm:text-xl font-bold text-disney-gold truncate">
                                    {p.personaje}
                                  </h3>
                                  {getGenderBadge(p.sexo)}
                                </div>

                                <p className="text-sm font-semibold text-purple-100 truncate flex items-center gap-1.5">
                                  <span>👤</span> {p.nombre}
                                </p>
                                <p className="text-xs text-purple-300/80 truncate flex items-center gap-1.5">
                                  <span>✉️</span> {p.email}
                                </p>
                              </div>
                            </div>

                            {/* Deseos de regalo */}
                            {p.regalos && p.regalos.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-purple-500/20">
                                <p className="text-xs font-semibold text-disney-gold mb-1 flex items-center gap-1">
                                  <span>🎁</span> Deseos de regalo:
                                </p>
                                <div className="space-y-1">
                                  {p.regalos.map((r, rIdx) => (
                                    <p key={rIdx} className="text-xs text-purple-200/90 pl-3 border-l-2 border-purple-400/30 truncate">
                                      {rIdx + 1}. {r}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Asignación de Amigo Secreto */}
                          <div className="mt-4 pt-3 border-t border-purple-500/30 bg-purple-900/30 -mx-5 -mb-5 p-4 rounded-b-2xl">
                            {p.amigoSecreto ? (
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="text-xl text-yellow-400 flex-shrink-0 animate-pulse">
                                    ➔
                                  </div>
                                  <div className="w-11 h-11 rounded-xl bg-pink-500/20 border border-pink-400/40 p-0.5 flex-shrink-0 overflow-hidden">
                                    {p.amigoSecretoAvatar ? (
                                      <img
                                        src={p.amigoSecretoAvatar}
                                        alt={p.amigoSecreto}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-lg">
                                        🎁
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs text-pink-300 font-semibold">
                                      Le regala a:
                                    </p>
                                    <p className="text-sm font-bold text-white truncate">
                                      {p.amigoSecreto}
                                    </p>
                                    {p.amigoSecretoNombre && (
                                      <p className="text-xs text-purple-300 truncate">
                                        ({p.amigoSecretoNombre})
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="bg-green-500/20 text-green-300 border border-green-500/40 text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0">
                                  ✓ Asignado
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-yellow-300/80 flex items-center gap-1.5">
                                  <span>⏳</span> Sorteo pendiente por realizar
                                </p>
                                <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                                  Sin asignar
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-purple-300">
                      {participants.length === 0 ? (
                        <div>
                          <p className="text-4xl mb-2">👥</p>
                          <p className="text-lg font-semibold text-purple-200">No hay participantes registrados aún</p>
                          <p className="text-sm text-purple-300 mt-1">Los participantes que se registren aparecerán aquí con sus personajes y avatares.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-4xl mb-2">🔍</p>
                          <p className="text-lg font-semibold text-purple-200">No se encontraron participantes</p>
                          <p className="text-sm text-purple-300 mt-1">Intenta con otro término de búsqueda o cambia el filtro.</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Botón de sorteo */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  {drawState.canDraw ? (
                    <>
                      <motion.button
                        onClick={handleDraw}
                        disabled={isDrawing}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-5 rounded-2xl font-bold text-xl sm:text-2xl transition-all ${
                          isDrawing
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white magical-shadow hover:shadow-2xl'
                        }`}
                      >
                        {isDrawing ? (
                          <span className="flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-6 h-6 border-3 border-white border-t-transparent rounded-full mr-3"
                            />
                            Realizando la magia...
                          </span>
                        ) : (
                          '✨ Hacer Magia y Sortear Amigos Secretos ✨'
                        )}
                      </motion.button>
                      <p className="text-center text-purple-300 text-sm">
                        Al hacer clic, se asignará aleatoriamente un amigo secreto a cada participante en un círculo perfecto
                      </p>
                    </>
                  ) : drawState.drawCompleted ? (
                    <div className="bg-green-500/20 border-2 border-green-400/50 rounded-2xl p-6 text-center">
                      <p className="text-2xl font-bold text-green-300 mb-2">
                        ✓ El sorteo ya fue realizado
                      </p>
                      <p className="text-green-200 text-sm">
                        Todos los participantes ya tienen su amigo secreto asignado. Puedes revisar la lista detallada arriba.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-2xl p-6 text-center">
                      <p className="text-2xl font-bold text-yellow-300 mb-2">
                        ⚠️ Se necesitan al menos 2 participantes
                      </p>
                      <p className="text-yellow-200 text-sm">
                        Actualmente hay {drawState.totalParticipants} participante(s) registrado(s)
                      </p>
                    </div>
                  )}
                </motion.div>

                {/* Botón para volver al registro */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <a
                    href="/"
                    className="inline-block px-6 py-3 bg-disney-blue/50 hover:bg-disney-blue/70 text-disney-gold font-semibold rounded-xl border border-disney-gold/30 transition-all"
                  >
                    ← Volver a la página de registro
                  </a>
                </motion.div>

                {/* Información adicional */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-8 p-6 bg-blue-900/30 rounded-xl border border-blue-500/20"
                >
                  <h3 className="text-disney-gold font-bold text-lg mb-3">
                    📋 Información importante:
                  </h3>
                  <ul className="text-purple-200 space-y-2 text-sm">
                    <li>• El sorteo crea un ciclo perfecto: cada persona da y recibe un regalo</li>
                    <li>• Nadie se regala a sí mismo</li>
                    <li>• El sorteo solo se puede realizar una vez (o tras resetearlo)</li>
                    <li>• Todos los datos se guardan y sincronizan en Google Sheets de forma segura</li>
                  </ul>
                </motion.div>

                {/* Zona de administración avanzada */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 p-6 bg-red-900/20 rounded-xl border border-red-500/30"
                >
                  <h3 className="text-red-400 font-bold text-lg mb-3 flex items-center gap-2">
                    ⚠️ Zona de Administración Avanzada
                  </h3>
                  <p className="text-red-200 text-sm mb-4">
                    Usa estas opciones con precaución. Algunas acciones no se pueden deshacer.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Botón para corregir personajes y géneros */}
                    <button
                      onClick={handleFixCharacters}
                      disabled={isFixingCharacters}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        isFixingCharacters
                          ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                          : 'bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/50'
                      }`}
                    >
                      {isFixingCharacters ? '⏳ Corrigiendo...' : '🎭 Corregir Duplicados y Géneros Disney'}
                    </button>

                    {/* Botón para actualizar avatares */}
                    <button
                      onClick={handleFixAvatars}
                      disabled={isFixingAvatars}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        isFixingAvatars
                          ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                          : 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/50'
                      }`}
                    >
                      {isFixingAvatars ? '⏳ Actualizando...' : '🖼️ Actualizar Avatares Disney'}
                    </button>

                    {/* Botón para resetear el sorteo */}
                    <button
                      onClick={() => handleReset('reset-draw')}
                      disabled={isResetting}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        isResetting
                          ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                          : 'bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-200 border border-yellow-500/50'
                      }`}
                    >
                      {isResetting ? '⏳ Procesando...' : '🔄 Resetear Solo el Sorteo'}
                    </button>

                    {/* Botón para limpiar todo */}
                    <button
                      onClick={() => handleReset('clear-all')}
                      disabled={isResetting}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                        isResetting
                          ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                          : 'bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/50'
                      }`}
                    >
                      {isResetting ? '⏳ Procesando...' : '🗑️ Borrar Todo (Participantes + Sorteo)'}
                    </button>
                  </div>

                  <div className="mt-4 text-xs text-red-300 space-y-1">
                    <p>• <strong>Corregir Duplicados y Géneros:</strong> Reasigna personajes a únicos y acordes a su género, preservando 100% el sorteo</p>
                    <p>• <strong>Actualizar Avatares:</strong> Reemplaza los avatares genéricos por la imagen real de cada personaje Disney</p>
                    <p>• <strong>Resetear Sorteo:</strong> Borra las asignaciones pero mantiene los participantes registrados</p>
                    <p>• <strong>Borrar Todo:</strong> Elimina todos los participantes y sus datos (empezar desde cero)</p>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="text-center py-12 text-red-300">
                <p className="text-xl">Error al cargar la información</p>
                <button
                  onClick={fetchDrawState}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Reintentar
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

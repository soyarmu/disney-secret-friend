'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DrawState {
  totalParticipants: number;
  drawCompleted: boolean;
  canDraw: boolean;
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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `✨ ${data.message} Se asignaron ${data.data.assignments} amigos secretos.`,
        });
        // Actualizar el estado
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
        // Actualizar el estado
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
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

      <div className="w-full max-w-3xl relative z-10">
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
                🎩 Panel de Administración 🎩
              </h1>
              <p className="text-purple-200 text-xl">
                Gestiona el sorteo del Amigo Secreto Disney Bailarín
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
                <p className="text-purple-300 mt-4">Cargando información...</p>
              </div>
            ) : drawState ? (
              <>
                {/* Estadísticas */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
                >
                  {/* Total de participantes */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 text-sm font-semibold mb-1">
                          Participantes Registrados
                        </p>
                        <p className="text-5xl font-bold text-disney-gold">
                          {drawState.totalParticipants}
                        </p>
                      </div>
                      <div className="text-5xl">👥</div>
                    </div>
                  </div>

                  {/* Estado del sorteo */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-400/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-300 text-sm font-semibold mb-1">
                          Estado del Sorteo
                        </p>
                        <p className={`text-3xl font-bold ${drawState.drawCompleted ? 'text-green-400' : 'text-yellow-400'}`}>
                          {drawState.drawCompleted ? '✓ Completado' : '○ Pendiente'}
                        </p>
                      </div>
                      <div className="text-5xl">
                        {drawState.drawCompleted ? '🎉' : '⏳'}
                      </div>
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-6 rounded-2xl font-bold text-2xl transition-all ${
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
                          '✨ Hacer Magia y Sortear ✨'
                        )}
                      </motion.button>
                      <p className="text-center text-purple-300 text-sm">
                        Al hacer clic, se asignará aleatoriamente un amigo secreto a cada participante
                      </p>
                    </>
                  ) : drawState.drawCompleted ? (
                    <div className="bg-green-500/20 border-2 border-green-400/50 rounded-2xl p-6 text-center">
                      <p className="text-2xl font-bold text-green-300 mb-2">
                        ✓ El sorteo ya fue realizado
                      </p>
                      <p className="text-green-200">
                        Todos los participantes ya tienen su amigo secreto asignado
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-2xl p-6 text-center">
                      <p className="text-2xl font-bold text-yellow-300 mb-2">
                        ⚠️ Se necesitan al menos 2 participantes
                      </p>
                      <p className="text-yellow-200">
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
                    <li>• El sorteo solo se puede realizar una vez</li>
                    <li>• Todos los datos se guardan en Google Sheets</li>
                  </ul>
                </motion.div>

                {/* Zona de reseteo */}
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

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GeminiApiKeyModal from '@/components/GeminiApiKeyModal';

interface FormData {
  nombre: string;
  email: string;
  password: string;
  regalo1: string;
  regalo2: string;
  regalo3: string;
}

interface AssignedCharacter {
  personaje: string;
  avatar: string;
  nombre: string;
  estilo: string;
}

interface AmigoSecretoData {
  tuPersonaje: string;
  tuAvatar: string;
  amigoSecreto: {
    personaje: string;
    avatar: string;
    regalos: {
      opcion1: string;
      opcion2: string;
      opcion3: string;
    };
  };
}

type ViewMode = 'registro' | 'login';
type ResultMode = 'none' | 'registrado' | 'esperando' | 'revelado';

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('registro');
  const [resultMode, setResultMode] = useState<ResultMode>('none');
  
  // Estados para Registro
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    password: '',
    regalo1: '',
    regalo2: '',
    regalo3: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedCharacter, setAssignedCharacter] = useState<AssignedCharacter | null>(null);
  const [error, setError] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showGeminiModal, setShowGeminiModal] = useState(false);

  // Estados para Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [amigoSecretoData, setAmigoSecretoData] = useState<AmigoSecretoData | null>(null);
  const [tuPersonajeInfo, setTuPersonajeInfo] = useState<{ personaje: string; avatar: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      setAssignedCharacter(data.data);
      setResultMode('registrado');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    setAmigoSecretoData(null);
    setTuPersonajeInfo(null);

    try {
      const response = await fetch('/api/login-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      if (!data.sorteoRealizado) {
        // Sorteo no realizado
        setTuPersonajeInfo({
          personaje: data.tuPersonaje,
          avatar: data.tuAvatar,
        });
        setResultMode('esperando');
      } else {
        // Sorteo realizado - mostrar amigo secreto
        setAmigoSecretoData(data);
        setResultMode('revelado');
      }
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const resetView = () => {
    setResultMode('none');
    setAssignedCharacter(null);
    setAmigoSecretoData(null);
    setTuPersonajeInfo(null);
    setLoginEmail('');
    setLoginPassword('');
    setFormData({
      nombre: '',
      email: '',
      password: '',
      regalo1: '',
      regalo2: '',
      regalo3: '',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Estrellas de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <AnimatePresence mode="wait">
          {resultMode === 'none' ? (
            // VISTA PRINCIPAL CON TABS
            <motion.div
              key="main-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-3xl p-8 magical-shadow border border-purple-500/20"
            >
              {/* Título mágico */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center mb-8"
              >
                <h1 className="text-5xl font-bold text-golden mb-6 animate-sparkle leading-tight py-2">
                  ✨ Amigo Secreto ✨
                </h1>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 leading-tight">
                  Disney Bailarín
                </h2>
              </motion.div>

              {/* Tabs de navegación */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => {
                    setViewMode('registro');
                    setError('');
                    setLoginError('');
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    viewMode === 'registro'
                      ? 'bg-gradient-to-r from-disney-gold to-yellow-500 text-disney-blue'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  📝 Registrarse
                </button>
                <button
                  onClick={() => {
                    setViewMode('login');
                    setError('');
                    setLoginError('');
                  }}
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                    viewMode === 'login'
                      ? 'bg-gradient-to-r from-disney-gold to-yellow-500 text-disney-blue'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  🎁 Descubrir mi Amigo Secreto
                </button>
              </div>

              {/* Contenido según el tab seleccionado */}
              <AnimatePresence mode="wait">
                {viewMode === 'registro' ? (
                  // FORMULARIO DE REGISTRO
                  <motion.div
                    key="registro-form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-purple-200 text-center mb-6">
                      Registra tus datos y descubre tu identidad mágica
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-disney-gold font-semibold mb-2 text-sm">
                          Tu Nombre Real
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="Ej: María González"
                        />
                      </div>

                      <div>
                        <label className="block text-disney-gold font-semibold mb-2 text-sm">
                          Tu Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-disney-gold font-semibold mb-2 text-sm">
                          Crea tu Contraseña
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <p className="text-xs text-purple-300 mt-1">
                          🔒 Necesitarás esta contraseña para ver tu amigo secreto
                        </p>
                      </div>

                      {/* Opción de API Key de Gemini */}
                      {/* <div className="border border-purple-500/30 rounded-xl p-4 bg-purple-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-yellow-300 font-semibold text-sm flex items-center gap-2">
                            ✨ Avatar Personalizado con IA (Opcional)
                            <button
                              type="button"
                              onClick={() => setShowGeminiModal(true)}
                              className="text-xs bg-yellow-500 text-disney-blue px-2 py-1 rounded-full hover:bg-yellow-400 transition-colors"
                            >
                              ❓ ¿Cómo?
                            </button>
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                            className="text-xs text-purple-300 hover:text-purple-200 underline"
                          >
                            {showApiKeyInput ? 'Ocultar' : 'Activar'}
                          </button>
                        </div>
                        
                        {showApiKeyInput ? (
                          <>
                            <input
                              type="password"
                              value={geminiApiKey}
                              onChange={(e) => setGeminiApiKey(e.target.value)}
                              placeholder="Tu Gemini API Key (opcional)"
                              className="w-full px-4 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all text-sm mb-2"
                            />
                            <p className="text-xs text-purple-300 leading-relaxed">
                              🎨 Con tu API Key de Gemini, generaremos un avatar único con IA.
                            </p>
                            <p className="text-xs text-green-300 mt-1">
                              ✅ Tu API Key solo se usa en TU navegador. Nunca la guardamos.
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-purple-300">
                            Por defecto usaremos avatares gratuitos. Si quieres uno personalizado con IA, activa esta opción.
                          </p>
                        )}
                      </div> */}

                      <div className="space-y-3">
                        <label className="block text-disney-gold font-semibold mb-2 text-sm">
                          3 Opciones de Regalo que te gustarían recibir
                        </label>
                        
                        <input
                          type="text"
                          name="regalo1"
                          value={formData.regalo1}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="Opción 1: Ej. Un libro de fantasía"
                        />
                        
                        <input
                          type="text"
                          name="regalo2"
                          value={formData.regalo2}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="Opción 2: Ej. Audífonos inalámbricos"
                        />
                        
                        <input
                          type="text"
                          name="regalo3"
                          value={formData.regalo3}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="Opción 3: Ej. Set de skincare"
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                        >
                          ⚠️ {error}
                        </motion.div>
                      )}

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                          isSubmitting
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-disney-gold to-yellow-500 text-disney-blue magical-shadow hover:shadow-2xl'
                        }`}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Creando tu identidad mágica...
                          </span>
                        ) : (
                          '🎭 Registrarme y Descubrir Mi Identidad'
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  // FORMULARIO DE LOGIN
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-purple-200 text-center mb-6">
                      Ingresa tu correo para descubrir a quién le toca regalarle
                    </p>

                    <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                        <label className="block text-disney-gold font-semibold mb-2 text-sm">
                          Tu Email Registrado
                        </label>
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => {
                            setLoginEmail(e.target.value);
                            setLoginError('');
                          }}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-disney-gold font-semibold mb-2 text-sm">
                          Tu Contraseña
                        </label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => {
                            setLoginPassword(e.target.value);
                            setLoginError('');
                          }}
                          required
                          className="w-full px-4 py-3 bg-white/10 border border-purple-400/30 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-disney-gold focus:border-transparent transition-all"
                          placeholder="Ingresa tu contraseña"
                        />
                      </div>

                      {loginError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm"
                        >
                          ⚠️ {loginError}
                        </motion.div>
                      )}

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
                        {isLoggingIn ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Buscando tu destino mágico...
                          </span>
                        ) : (
                          '🔍 Descubrir Mi Amigo Secreto'
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : resultMode === 'registrado' && assignedCharacter ? (
            // TARJETA DE IDENTIDAD DESPUÉS DEL REGISTRO
            <motion.div
              key="character-card"
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', duration: 1 }}
              className="bg-gradient-to-br from-yellow-500/20 via-purple-600/30 to-pink-600/20 backdrop-blur-xl rounded-3xl p-10 magical-shadow border-4 border-disney-gold"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold text-disney-gold mb-6 animate-sparkle">
                  🎉 ¡Felicidades! 🎉
                </h2>
                
                <p className="text-2xl text-purple-200 mb-8">
                  Tu identidad mágica ha sido revelada:
                </p>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="mb-8 flex justify-center"
                >
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-disney-gold to-yellow-300 p-2 magical-shadow">
                    <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <img
                        src={assignedCharacter.avatar}
                        alt={assignedCharacter.personaje}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-4"
                >
                  <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-disney-gold via-yellow-300 to-disney-gold animate-sparkle">
                    {assignedCharacter.personaje}
                  </h1>
                  
                  <div className="flex items-center justify-center gap-4 text-xl text-purple-200">
                    <span className="bg-purple-500/30 px-4 py-2 rounded-full border border-purple-400/50">
                      🎭 {assignedCharacter.nombre}
                    </span>
                    <span className="bg-pink-500/30 px-4 py-2 rounded-full border border-pink-400/50">
                      💃 {assignedCharacter.estilo}
                    </span>
                  </div>

                  <p className="text-lg text-purple-300 mt-6 max-w-lg mx-auto">
                    Esta es tu identidad secreta en el juego. Cuando el administrador 
                    realice el sorteo, vuelve aquí para descubrir a quién le toca regalarle.
                  </p>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  onClick={resetView}
                  className="mt-8 px-6 py-3 bg-disney-blue/50 hover:bg-disney-blue/70 text-disney-gold font-semibold rounded-xl border border-disney-gold/30 transition-all"
                >
                  ← Volver al inicio
                </motion.button>
              </motion.div>
            </motion.div>
          ) : resultMode === 'esperando' && tuPersonajeInfo ? (
            // PANTALLA DE ESPERA (Sorteo no realizado)
            <motion.div
              key="waiting-card"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-3xl p-10 magical-shadow border-2 border-purple-500/50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-8xl mb-6"
                >
                  ⏳
                </motion.div>

                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-6">
                  Paciencia...
                </h2>

                <p className="text-3xl text-purple-200 mb-8">
                  La magia del sorteo aún no ocurre
                </p>

                <div className="mb-8 flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-2">
                    <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <img
                        src={tuPersonajeInfo.avatar}
                        alt={tuPersonajeInfo.personaje}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <p className="text-xl text-purple-300 mb-4">
                  Tu personaje: <span className="text-disney-gold font-bold">{tuPersonajeInfo.personaje}</span>
                </p>

                <p className="text-lg text-purple-300 max-w-md mx-auto mb-8">
                  El administrador aún no ha realizado el sorteo mágico. 
                  Vuelve más tarde para descubrir a quién le vas a regalar. 🎁
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetView}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all magical-shadow"
                >
                  ← Volver al inicio
                </motion.button>
              </motion.div>
            </motion.div>
          ) : resultMode === 'revelado' && amigoSecretoData ? (
            // PANTALLA DE REVELACIÓN (Sorteo realizado)
            <motion.div
              key="reveal-card"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 1 }}
              className="bg-gradient-to-br from-pink-500/20 via-purple-600/30 to-yellow-500/20 backdrop-blur-xl rounded-3xl p-10 magical-shadow border-4 border-disney-gold relative overflow-hidden"
            >
              {/* Confeti animado */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: -20,
                    backgroundColor: ['#ffd700', '#ff69b4', '#9370db', '#ff6347'][Math.floor(Math.random() * 4)],
                  }}
                  animate={{
                    y: [0, 800],
                    rotate: [0, 360],
                    opacity: [1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
                className="text-center relative z-10"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-6xl mb-6"
                >
                  🎁✨
                </motion.div>

                <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-disney-gold via-yellow-300 to-disney-gold mb-4 animate-sparkle">
                  ¡Es tu turno de dar magia!
                </h2>

                <p className="text-2xl text-purple-200 mb-8">
                  Te tocó regalarle a:
                </p>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="mb-8 flex justify-center"
                >
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-disney-gold to-yellow-300 p-3 magical-shadow">
                    <div className="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                      <img
                        src={amigoSecretoData.amigoSecreto.avatar}
                        alt={amigoSecretoData.amigoSecreto.personaje}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 mb-8"
                >
                  {amigoSecretoData.amigoSecreto.personaje}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-disney-gold/30 mb-8"
                >
                  <h3 className="text-2xl font-bold text-disney-gold mb-4">
                    🎁 Sus opciones de regalo:
                  </h3>
                  <div className="space-y-3 text-left max-w-md mx-auto">
                    <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-400/30">
                      <span className="font-bold text-disney-gold">Opción 1:</span>
                      <p className="text-white text-lg">{amigoSecretoData.amigoSecreto.regalos.opcion1}</p>
                    </div>
                    <div className="bg-pink-500/20 rounded-xl p-4 border border-pink-400/30">
                      <span className="font-bold text-disney-gold">Opción 2:</span>
                      <p className="text-white text-lg">{amigoSecretoData.amigoSecreto.regalos.opcion2}</p>
                    </div>
                    <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-400/30">
                      <span className="font-bold text-disney-gold">Opción 3:</span>
                      <p className="text-white text-lg">{amigoSecretoData.amigoSecreto.regalos.opcion3}</p>
                    </div>
                  </div>
                </motion.div>

                <p className="text-purple-300 text-lg mb-6">
                  Recuerda: ¡Elige uno de estos regalos para hacer magia! 🌟
                </p>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetView}
                  className="px-8 py-4 bg-gradient-to-r from-disney-gold to-yellow-500 hover:from-yellow-500 hover:to-disney-gold text-disney-blue font-bold rounded-xl transition-all magical-shadow text-lg"
                >
                  ← Volver al inicio
                </motion.button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Modal de instrucciones de Gemini */}
      <GeminiApiKeyModal 
        isOpen={showGeminiModal} 
        onClose={() => setShowGeminiModal(false)} 
      />
    </div>
  );
}

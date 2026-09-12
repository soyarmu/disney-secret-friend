'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface GeminiApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GeminiApiKeyModal({ isOpen, onClose }: GeminiApiKeyModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-8 max-w-2xl w-full border-2 border-disney-gold shadow-2xl">
              {/* Título */}
              <h2 className="text-3xl font-bold text-disney-gold mb-4 text-center">
                🎨 Avatares Personalizados con IA
              </h2>

              <p className="text-purple-200 mb-6 text-center">
                Genera un avatar único usando Inteligencia Artificial de Google Gemini
              </p>

              {/* Instrucciones */}
              <div className="bg-white/10 rounded-xl p-6 mb-6 space-y-4">
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  📋 Cómo obtener tu API Key (Gratis):
                </h3>

                <ol className="space-y-3 text-purple-100">
                  <li className="flex gap-3">
                    <span className="text-disney-gold font-bold">1.</span>
                    <span>
                      Ve a{' '}
                      <a
                        href="https://makersuite.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 underline font-semibold"
                      >
                        Google AI Studio
                      </a>
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-disney-gold font-bold">2.</span>
                    <span>Inicia sesión con tu cuenta de Google</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-disney-gold font-bold">3.</span>
                    <span>Haz clic en "Get API Key" o "Create API Key"</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-disney-gold font-bold">4.</span>
                    <span>Copia la API Key generada</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-disney-gold font-bold">5.</span>
                    <span>Pégala en el campo del formulario de registro</span>
                  </li>
                </ol>
              </div>

              {/* Notas de seguridad */}
              <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-6">
                <h4 className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                  ✅ Seguridad y Privacidad
                </h4>
                <ul className="text-green-100 text-sm space-y-2">
                  <li>• Tu API Key se usa solo en TU navegador</li>
                  <li>• NUNCA guardamos tu API Key en nuestro servidor</li>
                  <li>• Los créditos de Gemini se cobran a TU cuenta, no a la nuestra</li>
                  <li>• Google ofrece créditos gratuitos para empezar</li>
                </ul>
              </div>

              {/* Alternativa */}
              <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-4 mb-6">
                <h4 className="text-purple-300 font-semibold mb-2">
                  💡 ¿No quieres usar Gemini?
                </h4>
                <p className="text-purple-100 text-sm">
                  No hay problema. Si no ingresas una API Key, generaremos automáticamente 
                  un avatar colorido y divertido de forma 100% gratuita usando DiceBear.
                </p>
              </div>

              {/* Botón de cerrar */}
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-disney-gold to-yellow-500 hover:from-yellow-500 hover:to-disney-gold text-disney-blue font-bold rounded-xl transition-all"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

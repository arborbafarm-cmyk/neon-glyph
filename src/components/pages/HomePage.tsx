import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [name, setName] = useState('');
  const [showIntro, setShowIntro] = useState(false);

  // 🔥 LOAD SESSION
  useEffect(() => {
    const savedLogin = localStorage.getItem('isLogged');
    const savedName = localStorage.getItem('playerName');
    const introSeen = localStorage.getItem('hasSeenIntro');

    if (savedLogin === 'true' && savedName) {
      setIsLogged(true);
      window.location.href = '/star-map';
    }

    if (introSeen === 'true') {
      setHasSeenIntro(true);
    } else {
      setShowIntro(true);
    }
  }, []);

  // 🔥 FINALIZA INTRO
  const finishIntro = () => {
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
    setHasSeenIntro(true);
  };

  // 🔥 LOGIN
  const handleLogin = () => {
    const player = name || 'Jogador';

    localStorage.setItem('playerName', player);
    localStorage.setItem('isLogged', 'true');

    window.location.href = '/star-map';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">

      {/* 🔥 BACKGROUND CINEMÁTICO */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,69,0,0.2),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1508057198894-247b23fe5ade')] bg-cover bg-center opacity-20"></div>
      </div>

      {/* 🔥 INTRO CINEMÁTICA */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ duration: 2 }}
              className="text-center"
            >
              <motion.h1
                className="text-6xl font-black text-orange-500 mb-4"
                animate={{
                  textShadow: [
                    '0 0 10px #ff4500',
                    '0 0 40px #ff0000',
                    '0 0 10px #ff4500',
                  ],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                DOMÍNIO DO COMANDO
              </motion.h1>

              <motion.p
                className="text-gray-300 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                O poder não se pede...
                <br />
                <span className="text-orange-400">se toma.</span>
              </motion.p>

              <motion.button
                onClick={finishIntro}
                className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-bold text-lg shadow-[0_0_20px_rgba(255,69,0,0.8)]"
                whileHover={{ scale: 1.1 }}
              >
                ENTRAR NO MUNDO
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 LOGIN */}
      {hasSeenIntro && (
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">

          {/* LOGO */}
          <motion.h1
            className="text-5xl font-black text-orange-500 mb-8"
            animate={{
              textShadow: [
                '0 0 10px #ff4500',
                '0 0 30px #ff0000',
                '0 0 10px #ff4500',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            DOMÍNIO DO COMANDO
          </motion.h1>

          {/* INPUT */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome no comando"
            className="px-6 py-3 rounded-lg text-black mb-4 w-72 text-center font-bold"
          />

          {/* BOTÃO */}
          <motion.button
            onClick={handleLogin}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg font-bold text-lg shadow-[0_0_25px_rgba(255,0,0,0.8)]"
          >
            ENTRAR
          </motion.button>

          {/* FRASE DE IMPACTO */}
          <p className="mt-6 text-gray-400 text-sm">
            Seu império começa agora.
          </p>
        </div>
      )}
    </div>
  );
}

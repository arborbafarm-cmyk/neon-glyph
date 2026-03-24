import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CinematicIntro from '@/components/CinematicIntro';
import { useMember } from '@/integrations';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useMember();
  const [showCinematicIntro, setShowCinematicIntro] = useState(true);
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/star-map');
    }
  }, [isAuthenticated, navigate]);

  const handleIntroComplete = () => {
    setShowCinematicIntro(false);
    setTimeout(() => setShowLoginOptions(true), 500);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <AnimatePresence mode="wait">
        {showCinematicIntro ? (
          <motion.div
            key="cinematic"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CinematicIntro />
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7 }}
              onClick={handleIntroComplete}
              className="absolute bottom-8 right-8 z-50 px-6 py-2 bg-subtitle-neon-blue/20 border border-subtitle-neon-blue text-subtitle-neon-blue font-paragraph text-sm rounded hover:bg-subtitle-neon-blue/30 transition-all"
            >
              Pular Intro
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-black via-black to-black"
          >
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{
                  background: [
                    'radial-gradient(circle at 20% 50%, rgba(255,69,0,0.1), transparent)',
                    'radial-gradient(circle at 80% 50%, rgba(0,234,255,0.1), transparent)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0"
              />
            </div>

            {/* Content */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative z-20 text-center"
            >
              <motion.h1
                animate={{
                  textShadow: [
                    '0 0 10px #FFD700, 0 0 20px #FFD700',
                    '0 0 20px #FFD700, 0 0 40px #FFD700',
                    '0 0 10px #FFD700, 0 0 20px #FFD700',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-heading text-6xl md:text-7xl font-black mb-8"
                style={{
                  color: '#FFD700',
                  letterSpacing: '0.1em',
                }}
              >
                Dominio do Comando
              </motion.h1>

              <p className="text-subtitle-neon-blue font-paragraph text-lg mb-12">
                Bem-vindo ao jogo mais perigoso da cidade
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';

export default function Luxo1Page() {
  const [showPaymentAnimation, setShowPaymentAnimation] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const playerName = useGameStore((state) => state.playerName);

  const handleBuyClick = () => {
    setShowPaymentAnimation(true);
    setPaymentComplete(false);
  };

  useEffect(() => {
    if (showPaymentAnimation) {
      const timer = setTimeout(() => {
        setPaymentComplete(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [showPaymentAnimation]);

  const handleCloseAnimation = () => {
    setShowPaymentAnimation(false);
    setPaymentComplete(false);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://static.wixstatic.com/media/50f4bf_ee701d9f8c20484698e5df1171cc5c37~mv2.png"
        alt="Luxo 1 Background"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="font-heading text-6xl md:text-7xl font-bold text-white mb-4">
            Luxo 1
          </h1>
          <p className="font-paragraph text-xl md:text-2xl text-secondary mb-12">
            Adquira este item exclusivo
          </p>

          {/* Buy Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBuyClick}
            disabled={showPaymentAnimation}
            className="px-8 py-4 bg-primary hover:bg-orange-600 text-white font-heading text-xl md:text-2xl rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Comprar por R$100,00
          </motion.button>
        </motion.div>
      </div>

      {/* Payment Animation Overlay */}
      <AnimatePresence>
        {showPaymentAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={handleCloseAnimation}
          >
            <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {/* Card Machine */}
              <motion.div
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute left-1/4 transform -translate-x-1/2"
              >
                <div className="w-32 h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-2xl border-4 border-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-secondary text-sm font-bold mb-2">MÁQUINA</div>
                    <div className="w-20 h-12 bg-black rounded border-2 border-secondary flex items-center justify-center">
                      <span className="text-secondary text-xs">CARTÃO</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Animated Card */}
              <motion.div
                initial={{ x: 200, rotateY: 0, opacity: 0 }}
                animate={{
                  x: -50,
                  rotateY: [0, 15, 0],
                  opacity: 1,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                }}
                className="absolute right-1/4 transform translate-x-1/2"
              >
                <div className="w-32 h-52 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Card Chip */}
                  <div className="w-12 h-10 bg-yellow-400 rounded-lg shadow-lg" />

                  {/* Player Name */}
                  <div className="text-white font-heading text-sm uppercase tracking-wider">
                    {playerName || 'JOGADOR'}
                  </div>

                  {/* Card Number */}
                  <div className="text-white font-mono text-lg tracking-widest">
                    •••• •••• •••• 4242
                  </div>

                  {/* Hologram Effect */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                    className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white to-transparent rounded-full blur-xl"
                  />
                </div>
              </motion.div>

              {/* Completion Message */}
              <AnimatePresence>
                {paymentComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: 2,
                      }}
                      className="text-center"
                    >
                      <div className="text-6xl mb-4">✓</div>
                      <h2 className="font-heading text-4xl text-secondary mb-2">
                        Compra Realizada!
                      </h2>
                      <p className="font-paragraph text-white text-lg">
                        Bem-vindo ao Luxo 1, {playerName || 'Jogador'}!
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Close Button */}
              {paymentComplete && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleCloseAnimation}
                  className="absolute bottom-8 px-6 py-3 bg-primary hover:bg-orange-600 text-white font-heading rounded-lg transition-all"
                >
                  Fechar
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

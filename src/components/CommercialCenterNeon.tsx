import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface NeonSignProps {
  name: string;
  emoji: string;
  isActive?: boolean;
}

export function NeonSign({ name, emoji, isActive = true }: NeonSignProps) {
  return (
    <motion.div
      className="relative h-32 flex items-center justify-center"
      animate={isActive ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.3 }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {/* Outer glow */}
      <motion.div
        className="absolute inset-0 rounded-lg blur-2xl"
        style={{
          background: isActive
            ? 'radial-gradient(circle, rgba(0, 234, 255, 0.4) 0%, transparent 70%)'
            : 'rgba(100, 100, 100, 0.1)',
        }}
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Sign border */}
      <div
        className={`relative z-10 px-6 py-4 rounded-lg border-2 backdrop-blur-sm ${
          isActive
            ? 'border-subtitle-neon-blue bg-slate-900/60 shadow-lg shadow-subtitle-neon-blue/50'
            : 'border-slate-600 bg-slate-900/30'
        }`}
      >
        <div className="text-center">
          <div className="text-4xl mb-2">{emoji}</div>
          <div
            className={`font-heading text-sm font-bold tracking-wider ${
              isActive ? 'text-subtitle-neon-blue' : 'text-slate-500'
            }`}
          >
            {name}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface CountdownTimerProps {
  endTime: number;
  onComplete?: () => void;
}

export function CountdownTimer({ endTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);

      if (remaining === 0) {
        setTimeLeft('Completo!');
        setIsComplete(true);
        onComplete?.();
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

        setTimeLeft(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  return (
    <motion.div
      className={`font-heading text-2xl font-bold tracking-wider ${
        isComplete ? 'text-green-400' : 'text-subtitle-neon-blue'
      }`}
      animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
    >
      {timeLeft}
    </motion.div>
  );
}

interface CinematicBackgroundProps {
  children: React.ReactNode;
}

export function CinematicBackground({ children }: CinematicBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Cinematic background with multiple layers */}
      <div className="fixed inset-0 -z-50">
        {/* Dark base */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />

        {/* Animated grid overlay */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(0, 234, 255, 0.05) 25%, rgba(0, 234, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 234, 255, 0.05) 75%, rgba(0, 234, 255, 0.05) 76%, transparent 77%, transparent),
                             linear-gradient(90deg, transparent 24%, rgba(0, 234, 255, 0.05) 25%, rgba(0, 234, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 234, 255, 0.05) 75%, rgba(0, 234, 255, 0.05) 76%, transparent 77%, transparent)`,
            backgroundSize: '50px 50px',
          }}
          animate={{ y: [0, 50] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />

        {/* Ambient light effects */}
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

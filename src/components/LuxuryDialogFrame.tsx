import { motion } from 'framer-motion';

interface LuxuryDialogFrameProps {
  title: string;
  message: string;
  isVisible: boolean;
  theme: {
    accent: string;
    accentSoft: string;
    accentStrong: string;
    cardMetal: string;
    aura: string;
  };
  onClose?: () => void;
  onAction?: () => void;
}

export default function LuxuryDialogFrame({
  title,
  message,
  isVisible,
  theme,
  onClose,
  onAction,
}: LuxuryDialogFrameProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: -20, y: 10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full max-w-[420px] overflow-hidden"
    >
      {/* ORNATE FRAME BORDER - INSPIRED BY LUXURY FRAME */}
      <div
        className="relative rounded-[32px] overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,15,.96), rgba(0,0,0,.98))',
          boxShadow: `
            0 0 60px ${theme.accentSoft},
            0 0 120px rgba(255,215,0,0.15),
            inset 0 0 40px rgba(255,215,0,0.08),
            0 20px 80px rgba(0,0,0,.6)
          `,
          border: '3px solid',
          borderImage: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentStrong} 50%, ${theme.accent} 100%) 1`,
        }}
      >
        {/* DECORATIVE CORNER DIAMONDS */}
        {[
          { top: '-12px', left: '-12px' },
          { top: '-12px', right: '-12px' },
          { bottom: '-12px', left: '-12px' },
          { bottom: '-12px', right: '-12px' },
        ].map((pos, i) => (
          <div
            key={`corner-${i}`}
            className="absolute w-12 h-12 pointer-events-none"
            style={{
              ...pos,
              background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 30%, #e8e8e8 60%, #f5f5f5 100%)',
              clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
              boxShadow: `
                0 0 30px rgba(255,255,255,0.9),
                0 0 60px ${theme.accent},
                inset -3px -3px 10px rgba(0,0,0,0.4)
              `,
            }}
          />
        ))}

        {/* TOP ORNAMENTAL ARCH */}
        <div className="relative h-20 bg-gradient-to-b from-yellow-400/40 to-transparent border-b border-yellow-500/30 flex items-center justify-center overflow-hidden">
          {/* Crown-like decoration */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-32 h-12 rounded-t-full"
              style={{
                background: `linear-gradient(180deg, ${theme.accent}, ${theme.accentStrong})`,
                boxShadow: `0 0 30px ${theme.accent}`,
              }}
            />
          </div>

          {/* Hanging crystals */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`crystal-${i}`}
              className="absolute w-2 h-6 rounded-full"
              style={{
                left: `${15 + i * 18}%`,
                top: '50%',
                background: 'linear-gradient(135deg, #e0b0ff 0%, #a855f7 100%)',
                boxShadow: `0 0 12px rgba(168,85,247,0.8)`,
              }}
            />
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="relative p-8 md:p-10">
          {/* Background glow */}
          <motion.div
            className="absolute -inset-8 blur-2xl pointer-events-none"
            animate={{ opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{ background: `radial-gradient(circle, ${theme.aura}, transparent 60%)` }}
          />

          {/* Text content */}
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-semibold">
              Atendimento Privado
            </p>
            <h2
              className="mt-3 text-2xl md:text-3xl font-black text-white leading-tight"
              style={{
                textShadow: `0 0 20px ${theme.accentSoft}`,
              }}
            >
              {title}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/85 font-paragraph">
              {message}
            </p>
          </div>

          {/* BUTTONS */}
          <div className="relative z-10 mt-8 flex flex-col gap-3">
            {onAction && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAction}
                className="w-full py-4 px-6 rounded-2xl font-heading font-black text-sm uppercase tracking-[0.2em] text-black transition-all duration-300"
                style={{
                  background: theme.cardMetal,
                  boxShadow: `0 12px 40px ${theme.accentSoft}`,
                }}
              >
                Ver Coleção
              </motion.button>
            )}
            {onClose && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl font-heading font-bold text-sm uppercase tracking-[0.2em] text-white border border-white/20 bg-white/5 hover:bg-white/10 transition-all duration-300"
              >
                Ouvir Mais
              </motion.button>
            )}
          </div>
        </div>

        {/* BOTTOM ORNAMENTAL ACCENT */}
        <div
          className="h-1 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent"
          style={{
            boxShadow: `0 0 20px ${theme.accent}`,
          }}
        />
      </div>
    </motion.div>
  );
}

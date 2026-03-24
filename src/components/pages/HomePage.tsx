import { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SkipForward, Play, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';

const INTRO_VIDEO_URL = 'https://video.wixstatic.com/video/50f4bf_570bf5fe87734b1cb3523fd958acce0e/720p/mp4/file.mp4'; 
// Substitua por um vídeo real de ação (car chase + helicopter + gunfire + money) quando possível — Pixabay/Storyblocks têm ótimos gratuitos.

export default function HomePage() {
  const navigate = useNavigate();
  const { actions, member } = useMember();
  const { setPlayerId, setPlayerName, setIsGuest, setLevel } = usePlayerStore();

  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [introStep, setIntroStep] = useState(0);
  const [bulletHoles, setBulletHoles] = useState<Array<{ id: number; x: number; y: number; rotation: number }>>([]);
  const [crackLevel, setCrackLevel] = useState(0); // 0 a 4 (nível de rachadura no "vidro" da tela)

  // Persistência
  useEffect(() => {
    const logged = localStorage.getItem('playerLoggedIn') === 'true';
    setAlreadyLogged(logged);
  }, []);

  // Timeline cinematográfica com efeitos de tiro
  useEffect(() => {
    if (!showIntro) return;

    const timeline = [
      { step: 1, delay: 800 },
      { step: 2, delay: 2600 },
      { step: 3, delay: 4800 },
    ];

    const timers = timeline.map(t => 
      setTimeout(() => {
        setIntroStep(t.step);
        
        // Dispara marcas de tiro nos passos 2 e 3
        if (t.step >= 2) {
          for (let i = 0; i < (t.step === 2 ? 4 : 7); i++) {
            setTimeout(() => {
              const newHole = {
                id: Date.now() + i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                rotation: Math.random() * 40 - 20,
              };
              setBulletHoles(prev => [...prev.slice(-12), newHole]); // máximo 13 buracos
              
              // Aumenta rachadura
              setCrackLevel(prev => Math.min(4, prev + 1));
            }, i * 180);
          }
        }
      }, t.delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [showIntro]);

  const finishIntro = useCallback(() => {
    setShowIntro(false);
    setShowAccessPanel(true);
  }, []);

  const skipIntro = () => finishIntro();

  // ... (suas funções de login e savePlayerData permanecem iguais)

  const introText = useMemo(() => {
    const texts = [
      'LOCALIZANDO FREQUÊNCIAS... SÃO PAULO',
      'ALVO IDENTIFICADO: O COMPLEXO',
      'ESTRATÉGIA: DOMINAÇÃO TOTAL',
      'CONEXÃO ESTABELECIDA — OPERAÇÃO INICIADA'
    ];
    return texts[introStep] || texts[0];
  }, [introStep]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-sans">
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .scanline {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 40%,
            rgba(255,255,255,0.15) 50%,
            transparent 60%
          );
          animation: scanline 6s linear infinite;
          pointer-events: none;
          z-index: 10;
        }
        .bullet-hole {
          position: absolute;
          width: 42px;
          height: 42px;
          background: radial-gradient(circle, rgba(0,0,0,0.9) 40%, transparent 70%);
          border: 3px solid #ddd;
          border-radius: 50%;
          box-shadow: inset 0 0 12px rgba(255,255,255,0.6),
                      0 0 20px rgba(255, 80, 0, 0.8);
          pointer-events: none;
          z-index: 30;
          opacity: 0.95;
        }
        .cracked-glass {
          position: absolute;
          inset: 0;
          background: url('https://i.ibb.co/0jKzZ3K/cracked-glass-overlay.png') repeat;
          background-size: 300%;
          mix-blend-mode: screen;
          opacity: 0;
          pointer-events: none;
          z-index: 25;
          transition: opacity 0.6s ease-out;
        }
        .glitch {
          animation: glitch 0.4s linear infinite;
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-3px, 3px); }
          40% { transform: translate(-3px, -3px); }
          60% { transform: translate(3px, 3px); }
          80% { transform: translate(3px, -3px); }
          100% { transform: translate(0); }
        }
      `}</style>

      {/* BACKGROUND VIDEO — Perseguição cinematográfica */}
      <div className="fixed inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="h-full w-full object-cover scale-110 brightness-75 contrast-125"
        >
          <source src={INTRO_VIDEO_URL} type="video/mp4" />
        </video>

        {/* Overlay de chuva + neon reflexos */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#00000088_30%,transparent_80%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
      </div>

      {/* EFEITOS ESPECIAIS */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        <div className="scanline" />

        {/* Marcas de tiro */}
        <AnimatePresence>
          {bulletHoles.map(hole => (
            <motion.div
              key={hole.id}
              className="bullet-hole"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.95 }}
              exit={{ opacity: 0 }}
              style={{
                left: `${hole.x}%`,
                top: `${hole.y}%`,
                transform: `rotate(${hole.rotation}deg)`,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Vidro rachando */}
        <div 
          className="cracked-glass" 
          style={{ opacity: crackLevel * 0.25 }} 
        />

        {/* Lens flare sutil no canto */}
        <div className="absolute top-12 right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* HUD CINEMATOGRÁFICO */}
      <div className="pointer-events-none fixed inset-0 z-40 p-8 flex flex-col justify-between border border-white/10">
        <div className="flex justify-between items-start text-[10px] tracking-[0.125em] uppercase opacity-70">
          <div>
            <p>SATELLITE LINK • ACTIVE</p>
            <p>ENCRYPTED • 0xF9A2 • RIO-SÃO PAULO</p>
          </div>
          <div className="flex items-center gap-2 text-red-500">
            <Radio className="h-4 w-4 animate-pulse" />
            <span>LIVE FEED // THREAT LEVEL: CRITICAL</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div
            key="intro"
            exit={{ opacity: 0, filter: 'blur(30px)', scale: 1.08 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="relative z-50 flex h-screen items-center justify-center bg-black/40 backdrop-blur-[2px]"
          >
            <button
              onClick={skipIntro}
              className="absolute right-10 top-10 flex items-center gap-3 text-xs tracking-[0.2em] uppercase hover:text-red-400 transition-colors z-50"
            >
              PULAR INTRO <SkipForward size={16} />
            </button>

            <div className="text-center px-6">
              <motion.div
                key={introStep}
                initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -40 }}
                className="mb-10 text-sm md:text-base font-mono tracking-[0.4em] text-red-400/90"
              >
                {introText}
              </motion.div>

              {introStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h1 
                    className={`text-7xl md:text-[10rem] font-black italic tracking-[-0.04em] leading-none glitch-text ${introStep === 3 ? 'glitch' : ''}`}
                    style={{ textShadow: '0 0 40px #ff0000, 0 0 80px #00ffff' }}
                  >
                    DOMÍNIO<span className="text-red-600 drop-shadow-[0_0_30px_#ff0000]">DO</span>COMANDO
                  </h1>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={finishIntro}
                    className="mt-16 group relative px-16 py-6 bg-gradient-to-r from-red-700 to-red-600 overflow-hidden border border-red-400/50 text-lg font-black tracking-widest uppercase"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-all duration-300" />
                    <span className="relative flex items-center justify-center gap-4">
                      INICIAR OPERAÇÃO <Play size={22} fill="white" />
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Painel de acesso (mantido igual, com leve upgrade visual) */}
        {showAccessPanel && (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-50 flex h-screen items-center justify-center p-6"
          >
            {/* seu painel de login aqui — pode adicionar mais bordas vermelhas e glow se quiser */}
            {/* ... (código do painel permanece o mesmo) */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

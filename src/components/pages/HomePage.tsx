import { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome, Facebook, UserCircle2, SkipForward, Play, ShieldAlert, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';

const INTRO_VIDEO_URL = 'https://video.wixstatic.com/video/50f4bf_570bf5fe87734b1cb3523fd958acce0e/720p/mp4/file.mp4';

export default function HomePage() {
  const navigate = useNavigate();
  const { actions, member } = useMember();
  const { setPlayerId, setPlayerName, setIsGuest, setLevel } = usePlayerStore();

  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [introStep, setIntroStep] = useState(0);

  // --- LÓGICA DE PERSISTÊNCIA ---
  useEffect(() => {
    const logged = localStorage.getItem('playerLoggedIn') === 'true';
    setAlreadyLogged(logged);
  }, []);

  // --- TIMELINE CINEMATOGRÁFICA ---
  useEffect(() => {
    if (!showIntro) return;

    const timeline = [
      { step: 1, delay: 1200 },
      { step: 2, delay: 2800 },
      { step: 3, delay: 4500 },
    ];

    const timers = timeline.map(t => setTimeout(() => setIntroStep(t.step), t.delay));
    return () => timers.forEach(clearTimeout);
  }, [showIntro]);

  // --- FUNÇÕES DE AÇÃO ---
  const finishIntro = useCallback(() => {
    setShowIntro(false);
    setShowAccessPanel(true);
  }, []);

  const skipIntro = () => finishIntro();

  const handleNavigation = useCallback(() => {
    navigate('/star-map');
  }, [navigate]);

  // --- SINCRONIZAÇÃO DE DADOS ---
  const savePlayerData = async (memberId: string, playerNameValue: string, isGuest = false) => {
    try {
      const existingPlayers = await BaseCrudService.getAll<any>('players');
      const existingPlayer = existingPlayers.items?.find((p: any) => p.memberId === memberId);

      const playerData = {
        memberId,
        playerName: playerNameValue,
        isOnline: true,
        isGuest,
        lastSeen: new Date().toISOString(),
      };

      if (existingPlayer) {
        await BaseCrudService.update('players', { ...playerData, _id: existingPlayer._id });
      } else {
        await BaseCrudService.create('players', {
          ...playerData,
          _id: crypto.randomUUID(),
          cleanMoney: 0,
          dirtyMoney: 0,
          level: 1,
          progress: 0,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  useEffect(() => {
    if (!member) return;
    
    const setupMember = async () => {
      const name = member.profile?.nickname || member.contact?.firstName || 'COMANDANTE';
      setPlayerName(name);
      setPlayerId(member._id || '');
      setIsGuest(false);
      
      localStorage.setItem('playerLoggedIn', 'true');
      await savePlayerData(member._id || '', name, false);
      
      // Só navega se o painel já estiver aberto (evita quebrar a intro)
      if (showAccessPanel) handleNavigation();
    };

    setupMember();
  }, [member, showAccessPanel]);

  const handleGuestLogin = async () => {
    setIsLoading('guest');
    const guestId = `guest_${crypto.randomUUID()}`;
    const guestName = `OPERADOR_${Math.floor(1000 + Math.random() * 9000)}`;
    
    setPlayerName(guestName);
    setIsGuest(true);
    localStorage.setItem('playerLoggedIn', 'true');
    
    await savePlayerData(guestId, guestName, true);
    handleNavigation();
  };

  const introText = useMemo(() => {
    const texts = [
      'LOCALIZANDO FREQUÊNCIAS... RIO DE JANEIRO',
      'ALVO IDENTIFICADO: O COMPLEXO',
      'ESTRATÉGIA: DOMINAÇÃO TOTAL',
      'CONEXÃO ESTABELECIDA'
    ];
    return texts[introStep] || texts[0];
  }, [introStep]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white font-sans">
      <style>{`
        @keyframes scanline { 0% { bottom: 100%; } 100% { bottom: -100%; } }
        .scanline { position: absolute; width: 100%; height: 10px; background: rgba(255,255,255,0.05); animation: scanline 8s linear infinite; }
        .glitch-text { text-shadow: 2px 0 #ff0000, -2px 0 #00ffeb; }
      `}</style>

      {/* BACKGROUND VIDEO & EFFECTS */}
      <div className="fixed inset-0 z-0 scale-110">
        <video autoPlay muted loop playsInline className="h-full w-full object-cover opacity-60">
          <source src={INTRO_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        <div className="scanline" />
      </div>

      {/* UI OVERLAY ESTÁTICA */}
      <div className="pointer-events-none fixed inset-0 z-50 p-6 flex flex-col justify-between border-[1px] border-white/5">
        <div className="flex justify-between items-start opacity-40">
          <div className="text-[10px] tracking-widest uppercase">
            <p>Sat_Link: Active</p>
            <p>Encrypted_Channel: 0x8821</p>
          </div>
          <div className="flex items-center gap-2 text-yellow-500">
            <Radio className="h-3 w-3 animate-pulse" />
            <span className="text-[10px] tracking-tighter font-bold">LIVE FEED // REC</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showIntro && (
          <motion.div 
            key="intro-screen"
            exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
            className="relative z-40 flex h-screen items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <button onClick={skipIntro} className="absolute right-10 top-10 flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase hover:text-yellow-500 transition-colors">
              Pular <SkipForward size={14} />
            </button>

            <div className="text-center">
              <motion.div
                key={introStep}
                initial={{ opacity: 0, letterSpacing: '1em' }}
                animate={{ opacity: 1, letterSpacing: '0.4em' }}
                exit={{ opacity: 0 }}
                className="mb-8 text-xs md:text-sm text-yellow-500/80 font-mono"
              >
                {introText}
              </motion.div>

              {introStep >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter glitch-text">
                    DOMÍNIO<span className="text-red-600">DO</span>COMANDO
                  </h1>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={finishIntro}
                    className="mt-12 group relative px-12 py-4 bg-red-600 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                    <span className="relative flex items-center gap-3 font-black tracking-[0.3em] uppercase text-sm">
                      Iniciar Operação <Play size={16} fill="white" />
                    </span>
                  </motion.button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {showAccessPanel && (
          <motion.div 
            key="login-panel"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-40 flex h-screen items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-zinc-950/90 border border-white/10 p-8 rounded-sm shadow-2xl backdrop-blur-xl">
               <div className="mb-8 border-l-4 border-red-600 pl-4">
                  <h2 className="text-2xl font-black tracking-tighter uppercase">Identificação de Agente</h2>
                  <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Protocolo de segurança nível 5</p>
               </div>

               <div className="space-y-4">
                 {alreadyLogged ? (
                   <button 
                    onClick={handleNavigation}
                    className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors"
                   >
                     Retomar Comando
                   </button>
                 ) : (
                   <>
                     <LoginButton icon={<Chrome size={18}/>} label="Google" onClick={() => actions.login()} loading={isLoading === 'google'} />
                     <LoginButton icon={<Facebook size={18}/>} label="Facebook" color="bg-blue-600" onClick={() => actions.login()} />
                     <div className="relative py-4 flex items-center">
                        <div className="flex-grow border-t border-white/5"></div>
                        <span className="px-3 text-[10px] text-zinc-600 uppercase">Ou</span>
                        <div className="flex-grow border-t border-white/5"></div>
                     </div>
                     <button 
                      onClick={handleGuestLogin}
                      className="w-full py-3 border border-white/10 text-white/60 text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                     >
                       Entrar como Infiltrado
                     </button>
                   </>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoginButton({ icon, label, onClick, color = "bg-zinc-800", loading }: any) {
  return (
    <motion.button
      whileHover={{ x: 5 }}
      onClick={onClick}
      className={`flex items-center gap-4 w-full p-4 ${color} rounded-sm transition-all group overflow-hidden relative`}
    >
      <div className="absolute right-0 top-0 opacity-10 group-hover:scale-150 transition-transform">{icon}</div>
      {icon}
      <span className="font-bold uppercase tracking-tighter text-sm">{loading ? 'Verificando...' : `Acessar via ${label}`}</span>
    </motion.button>
  );
}

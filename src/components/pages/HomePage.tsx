import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Chrome, Facebook, UserCircle2, SkipForward, Play, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMember } from '@/integrations';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';

const INTRO_VIDEO_URL =
  'https://video.wixstatic.com/video/50f4bf_570bf5fe87734b1cb3523fd958acce0e/720p/mp4/file.mp4';

export default function HomePage() {
  const navigate = useNavigate();
  const { actions, member } = useMember();

  const { setPlayerId, setPlayerName, setIsGuest, setLevel } = usePlayerStore();

  const [alreadyLogged, setAlreadyLogged] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showAccessPanel, setShowAccessPanel] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [introStep, setIntroStep] = useState(0);

  useEffect(() => {
    const logged = localStorage.getItem('playerLoggedIn') === 'true';
    setAlreadyLogged(logged);
    setShowIntro(true);
    setShowAccessPanel(false);
  }, []);

  useEffect(() => {
    if (!showIntro) return;

    const t1 = setTimeout(() => setIntroStep(1), 700);
    const t2 = setTimeout(() => setIntroStep(2), 2100);
    const t3 = setTimeout(() => setIntroStep(3), 3800);
    const t4 = setTimeout(() => {
      setShowIntro(false);
      setShowAccessPanel(true);
    }, 6200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [showIntro]);

  useEffect(() => {
    if (!member) return;

    const memberNickname =
      member.profile?.nickname ||
      member.contact?.firstName ||
      member.loginEmail?.split('@')[0] ||
      'COMANDANTE';

    setPlayerName(memberNickname);
    setPlayerId(member._id || '');
    setIsGuest(false);
    setLevel(1);

    localStorage.setItem('playerLoggedIn', 'true');
    localStorage.setItem('playerName', memberNickname);
    localStorage.setItem('memberId', member._id || '');
    localStorage.setItem('isGuest', 'false');

    savePlayerData(member._id || '', memberNickname, false).finally(() => {
      navigate('/star-map');
    });
  }, [member, navigate, setIsGuest, setLevel, setPlayerId, setPlayerName]);

  const savePlayerData = async (memberId: string, playerNameValue: string, isGuest = false) => {
    try {
      const existingPlayers = await BaseCrudService.getAll<any>('players');
      const existingPlayer = existingPlayers.items?.find((p: any) => p.memberId === memberId);

      if (existingPlayer) {
        await BaseCrudService.update('players', {
          _id: existingPlayer._id,
          memberId,
          playerName: playerNameValue,
          lastSeen: new Date().toISOString(),
          isOnline: true,
          isGuest,
        });
      } else {
        await BaseCrudService.create('players', {
          _id: crypto.randomUUID(),
          memberId,
          playerName: playerNameValue,
          cleanMoney: 0,
          dirtyMoney: 0,
          level: 1,
          progress: 0,
          isGuest,
          isOnline: true,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Erro ao salvar jogador:', error);
    }
  };

  const handleMemberLogin = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(provider);
      await actions.login();
    } catch (error) {
      console.error(`Falha no login ${provider}:`, error);
      setIsLoading(null);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setIsLoading('guest');

      const guestName = `CONVIDADO_${Math.floor(Math.random() * 999999)}`;
      const guestId = `guest_${crypto.randomUUID()}`;

      setPlayerName(guestName);
      setPlayerId(guestId);
      setIsGuest(true);
      setLevel(1);

      localStorage.setItem('playerLoggedIn', 'true');
      localStorage.setItem('playerName', guestName);
      localStorage.setItem('memberId', guestId);
      localStorage.setItem('isGuest', 'true');

      await savePlayerData(guestId, guestName, true);
      navigate('/star-map');
    } catch (error) {
      console.error('Falha no login visitante:', error);
      setIsLoading(null);
    }
  };

  const skipIntro = () => {
    setShowIntro(false);
    setShowAccessPanel(true);
  };

  const introText = useMemo(() => {
    if (introStep === 0) return 'RIO DE JANEIRO // SÃO PAULO';
    if (introStep === 1) return 'POLÍCIA, PERSEGUIÇÃO, OSTENTAÇÃO';
    if (introStep === 2) return 'QUEM CONTROLA O COMPLEXO, CONTROLA A CIDADE';
    return 'DOMÍNIO DO COMANDO';
  }, [introStep]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <style>{`
        .cinema-vignette {
          background:
            radial-gradient(circle at center, transparent 18%, rgba(0,0,0,0.30) 56%, rgba(0,0,0,0.84) 100%);
        }
        .gold-logo {
          text-shadow:
            0 0 14px rgba(255,215,0,0.35),
            0 0 34px rgba(255,160,0,0.48),
            0 0 70px rgba(255,60,0,0.18);
        }
        .red-logo {
          text-shadow:
            0 0 12px rgba(255,0,0,0.32),
            0 0 28px rgba(255,70,0,0.42);
        }
        .glass-panel {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
      `}</style>

      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover object-center scale-[1.04]"
        >
          <source src={INTRO_VIDEO_URL} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 cinema-vignette" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_78%,rgba(255,0,0,0.18),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(255,180,0,0.16),transparent_22%)]" />

        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.08, 0.22, 0.08] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{
            background:
              'radial-gradient(circle at 10% 70%, rgba(255,0,0,0.24), transparent 16%), radial-gradient(circle at 88% 18%, rgba(0,110,255,0.18), transparent 14%)',
          }}
        />

        <motion.div
          className="absolute -left-1/3 top-0 h-full w-2/3 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl"
          animate={{ x: ['-20%', '180%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="pointer-events-none fixed inset-0 z-10 p-5 md:p-7 flex flex-col justify-between">
        <div className="flex items-start justify-between text-[10px] md:text-xs uppercase tracking-[0.26em] text-white/55">
          <div className="space-y-1">
            <div>SISTEMA MULTIPLAYER</div>
            <div>BRASIL // FACÇÕES // OPERAÇÃO ATIVA</div>
          </div>
          <div className="flex items-center gap-2 text-yellow-400/80">
            <ShieldAlert className="h-3.5 w-3.5" />
            ACESSO RESTRITO
          </div>
        </div>

        <div className="text-center text-[10px] md:text-xs uppercase tracking-[0.24em] text-white/28">
          Domcomando // introdução cinematográfica
        </div>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/18" />

            <button
              onClick={skipIntro}
              className="absolute right-5 top-5 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/80 transition hover:bg-black/65"
            >
              <SkipForward className="h-4 w-4" />
              Pular intro
            </button>

            <div className="relative flex min-h-screen items-center justify-center px-6">
              <div className="max-w-6xl text-center">
                <motion.p
                  key={introText}
                  initial={{ opacity: 0, y: 16, letterSpacing: '0.5em' }}
                  animate={{ opacity: 1, y: 0, letterSpacing: '0.28em' }}
                  transition={{ duration: 0.7 }}
                  className="text-[11px] md:text-sm uppercase tracking-[0.28em] text-white/70"
                >
                  {introText}
                </motion.p>

                <AnimatePresence>
                  {introStep >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 28, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <h1 className="gold-logo mt-10 text-5xl md:text-8xl font-black uppercase tracking-[0.18em] text-yellow-400">
                        DOMÍNIO
                      </h1>
                      <h2 className="red-logo mt-3 text-3xl md:text-6xl font-black uppercase tracking-[0.24em] text-red-500">
                        DO COMANDO
                      </h2>

                      <div className="mt-10 flex justify-center">
                        <button
                          onClick={finishIntro}
                          className="flex items-center gap-3 rounded-2xl border border-yellow-500/40 bg-gradient-to-r from-yellow-700 via-yellow-500 to-orange-600 px-10 py-4 font-black uppercase tracking-[0.24em] text-black shadow-[0_0_30px_rgba(212,175,55,0.18)] transition hover:scale-[1.03]"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          Acessar operação
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAccessPanel && !showIntro && (
          <motion.div
            className="relative z-30 flex min-h-screen items-end justify-center px-4 pb-12 pt-24 md:items-center md:pb-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-[720px]">
              <div className="glass-panel rounded-[32px] border border-yellow-500/28 bg-black/62 p-8 md:p-10 shadow-[0_0_40px_rgba(212,175,55,0.10)]">
                <div className="text-center">
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.42em] text-white/42">
                    Acesso ao sistema
                  </p>

                  <h1 className="gold-logo mt-4 text-3xl md:text-5xl font-black uppercase tracking-[0.16em] text-yellow-400">
                    DOMÍNIO DO COMANDO
                  </h1>

                  <p className="mt-5 text-xs md:text-sm uppercase tracking-[0.22em] text-white/52">
                    {alreadyLogged
                      ? 'Sessão encontrada. Continue sua operação.'
                      : 'Escolha sua entrada no sistema.'}
                  </p>
                </div>

                {alreadyLogged ? (
                  <div className="mt-10">
                    <motion.button
                      whileHover={{ scale: 1.012, x: 2 }}
                      whileTap={{ scale: 0.988 }}
                      onClick={() => navigate('/star-map')}
                      className="w-full rounded-2xl border border-yellow-500/35 bg-gradient-to-r from-yellow-700 via-yellow-500 to-orange-600 px-6 py-5 text-black font-black uppercase tracking-[0.18em]"
                    >
                      Continuar no jogo
                    </motion.button>
                  </div>
                ) : (
                  <div className="mt-10 grid gap-4">
                    <motion.button
                      whileHover={{ scale: 1.012, x: 2 }}
                      whileTap={{ scale: 0.988 }}
                      onClick={() => handleMemberLogin('google')}
                      disabled={!!isLoading}
                      className="flex w-full items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-5 text-white transition hover:bg-white/10 disabled:opacity-50"
                    >
                      <Chrome className="h-5 w-5" />
                      <span className="font-black uppercase tracking-[0.18em]">
                        {isLoading === 'google' ? 'Conectando...' : 'Entrar com Google'}
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.012, x: 2 }}
                      whileTap={{ scale: 0.988 }}
                      onClick={() => handleMemberLogin('facebook')}
                      disabled={!!isLoading}
                      className="flex w-full items-center justify-center gap-4 rounded-2xl border border-blue-500/24 bg-blue-500/10 px-6 py-5 text-white transition hover:bg-blue-500/18 disabled:opacity-50"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="font-black uppercase tracking-[0.18em]">
                        {isLoading === 'facebook' ? 'Conectando...' : 'Entrar com Facebook'}
                      </span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.012, x: 2 }}
                      whileTap={{ scale: 0.988 }}
                      onClick={handleGuestLogin}
                      disabled={!!isLoading}
                      className="flex w-full items-center justify-center gap-4 rounded-2xl border border-red-500/24 bg-red-500/10 px-6 py-5 text-white transition hover:bg-red-500/18 disabled:opacity-50"
                    >
                      <UserCircle2 className="h-5 w-5" />
                      <span className="font-black uppercase tracking-[0.18em]">
                        {isLoading === 'guest' ? 'Entrando...' : 'Entrar como Visitante'}
                      </span>
                    </motion.button>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.22em] text-white/38">
                    A intro continua visível mesmo com sessão salva, até você decidir seguir.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

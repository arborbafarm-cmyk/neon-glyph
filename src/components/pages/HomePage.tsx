import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chrome, Facebook, UserCircle, ShieldAlert, Terminal } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { useMember } from '@/integrations';
import { usePlayerStore } from '@/store/playerStore';
import { BaseCrudService } from '@/integrations';
import { useNavigate } from 'react-router-dom';
import Footer from '@/components/Footer';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [systemTime, setSystemTime] = useState('');
  const [showIntro, setShowIntro] = useState(false);
  const [introFinished, setIntroFinished] = useState(false);

  const { actions, member } = useMember();
  const navigate = useNavigate();
  const { setPlayerId, setPlayerName, setIsGuest, setLevel } = usePlayerStore();

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

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(
        `${now.getHours().toString().padStart(2, '0')}:${now
          .getMinutes()
          .toString()
          .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} BRT`,
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const alreadyLogged = localStorage.getItem('playerLoggedIn') === 'true';
    const seenIntro = localStorage.getItem('hasSeenHomeIntro') === 'true';

    if (alreadyLogged) {
      navigate('/star-map');
      return;
    }

    if (seenIntro) {
      setIntroFinished(true);
      setShowIntro(false);
    } else {
      setShowIntro(true);
      setIntroFinished(false);
    }
  }, [navigate]);

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

  const finishIntro = () => {
    localStorage.setItem('hasSeenHomeIntro', 'true');
    setShowIntro(false);
    setTimeout(() => setIntroFinished(true), 250);
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white selection:bg-yellow-600 selection:text-black">
      <style>{`
        .crt-scanlines {
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.16) 50%, rgba(0,0,0,0.16));
          background-size: 100% 4px;
          pointer-events: none;
        }
        .vignette-heavy {
          background: radial-gradient(circle at center, transparent 18%, rgba(0,0,0,0.78) 78%, #000 100%);
        }
        .gold-glow {
          box-shadow: 0 0 30px rgba(212,175,55,0.22), inset 0 0 20px rgba(212,175,55,0.06);
        }
      `}</style>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="https://static.wixstatic.com/media/50f4bf_6d38f59b693c45f78b1d3c8d16ab413b~mv2.png"
          alt="Favela cinematográfica"
          className="w-full h-full object-cover object-center"
          width={1920}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="absolute inset-0 vignette-heavy" />
        <div className="absolute inset-0 crt-scanlines opacity-45" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,0,0,0.16),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,170,0,0.16),transparent_25%),radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_30%)]" />
      </div>

      <div className="fixed inset-0 z-10 pointer-events-none p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start font-paragraph text-xs text-white/60 tracking-widest uppercase">
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <Terminal className="w-3 h-3" />
              SYS.OP // SECURE
            </span>
            <span>LOC // BRASIL // RIO_SP</span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span>{systemTime}</span>
            <span className="text-red-500 animate-pulse">REC // ACTIVE</span>
          </div>
        </div>

        <div className="flex justify-between items-end font-paragraph text-[10px] text-white/30 tracking-widest uppercase">
          <span>DOMCOM // BUILD ALPHA</span>
          <span className="flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            MULTIPLAYER ACCESS
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 bg-black flex items-center justify-center px-6"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-4xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.h1
                  className="text-5xl md:text-7xl font-black uppercase tracking-[0.18em] text-yellow-400"
                  animate={{
                    textShadow: [
                      '0 0 14px rgba(212,175,55,0.35)',
                      '0 0 36px rgba(212,175,55,0.8)',
                      '0 0 14px rgba(212,175,55,0.35)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.4 }}
                >
                  DOMÍNIO
                </motion.h1>

                <motion.h2
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.8 }}
                  className="mt-2 text-3xl md:text-5xl font-black uppercase tracking-[0.24em] text-red-500"
                >
                  DO COMANDO
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="mt-8 text-white/70 text-sm md:text-base tracking-[0.18em] uppercase"
                >
                  Favela. Ostentação. Perseguição. Poder.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                  className="mt-3 text-white/50 text-xs md:text-sm tracking-[0.22em] uppercase"
                >
                  Quem controla o complexo, controla tudo.
                </motion.p>

                <motion.button
                  onClick={finishIntro}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-12 px-10 py-4 rounded-xl border border-yellow-500/50 bg-gradient-to-r from-yellow-700 to-orange-600 text-black font-black uppercase tracking-[0.22em] gold-glow"
                >
                  Entrar no sistema
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {introFinished && (
        <div className="relative z-20 min-h-screen flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[560px] relative"
          >
            <div className="absolute inset-0 bg-yellow-500/10 blur-[90px] rounded-full pointer-events-none" />

            <div className="relative rounded-[28px] border border-yellow-500/30 bg-black/70 backdrop-blur-xl p-8 md:p-10 gold-glow">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.18em] text-yellow-400">
                  DOMÍNIO DO COMANDO
                </h1>
                <p className="mt-4 text-white/60 text-sm uppercase tracking-[0.2em]">
                  Escolha sua entrada no sistema
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleMemberLogin('google')}
                  disabled={!!isLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-6 py-4 text-white font-black uppercase tracking-[0.16em] transition-all disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5" />
                  {isLoading === 'google' ? 'Conectando...' : 'Entrar com Google'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => handleMemberLogin('facebook')}
                  disabled={!!isLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-6 py-4 text-white font-black uppercase tracking-[0.16em] transition-all disabled:opacity-50"
                >
                  <Facebook className="w-5 h-5" />
                  {isLoading === 'facebook' ? 'Conectando...' : 'Entrar com Facebook'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={handleGuestLogin}
                  disabled={!!isLoading}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 px-6 py-4 text-white font-black uppercase tracking-[0.16em] transition-all disabled:opacity-50"
                >
                  <UserCircle className="w-5 h-5" />
                  {isLoading === 'guest' ? 'Entrando...' : 'Entrar como Visitante'}
                </motion.button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-white/40 text-xs uppercase tracking-[0.18em]">
                  Seu progresso fica salvo no dispositivo até logout
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

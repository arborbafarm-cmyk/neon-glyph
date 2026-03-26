import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '@/store/playerStore';
import { executeSpin } from '@/services/spinsService';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const SLOT_SYMBOLS = ['💎', '💵', '🔫', '🚔', '🔥', '🏆'];

type SpinResult = {
  reels?: string[];
  rewardText?: string;
  rewardAmount?: number;
  player?: any;
};

function getRandomSymbol() {
  return SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
}

function buildFakeRoll() {
  return [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
}

export default function SlotMachine() {
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const [isSpinning, setIsSpinning] = useState(false);
  const [error, setError] = useState('');
  const [resultText, setResultText] = useState('');
  const [rewardAmount, setRewardAmount] = useState<number>(0);
  const [reels, setReels] = useState<string[]>(['💎', '💵', '🔫']);

  const playerId = player?._id;
  const spins = player?.spins ?? 0;
  const dirtyMoney = player?.dirtyMoney ?? 0;
  const cleanMoney = player?.cleanMoney ?? 0;
  const playerName = player?.playerName ?? 'Jogador';

  const canSpin = useMemo(() => {
    return !!playerId && !isSpinning && spins > 0;
  }, [playerId, isSpinning, spins]);

  const animateFakeRoll = async () => {
    for (let i = 0; i < 12; i++) {
      setReels(buildFakeRoll());
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
  };

  const handleSpin = async () => {
    if (!playerId) {
      setError('Jogador não carregado.');
      return;
    }

    if (spins <= 0) {
      setError('Você está sem giros.');
      return;
    }

    try {
      setError('');
      setResultText('');
      setRewardAmount(0);
      setIsSpinning(true);

      await animateFakeRoll();

      const result = (await executeSpin(playerId)) as SpinResult;

      if (result?.reels && result.reels.length === 3) {
        setReels(result.reels);
      } else {
        setReels(buildFakeRoll());
      }

      if (result?.player) {
        setPlayer(result.player);
      }

      if (typeof result?.rewardAmount === 'number') {
        setRewardAmount(result.rewardAmount);
      }

      if (result?.rewardText) {
        setResultText(result.rewardText);
      } else {
        setResultText('Giro concluído.');
      }
    } catch (err: any) {
      console.error('Slot spin error:', err);
      setError(err?.message || 'Erro ao girar a máquina.');
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-yellow-500/30 bg-black/80 p-5 shadow-[0_0_30px_rgba(255,180,0,0.15)]">
        <div className="mb-5 text-center">
          <h2 className="text-2xl font-black tracking-tight text-yellow-400">
            GIRO NO ASFALTO
          </h2>
          <p className="text-sm text-zinc-400">
            Jogador: <span className="text-white font-semibold">{playerName}</span>
          </p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Giros</div>
            <div className="text-xl font-black text-cyan-400">{spins}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Sujo</div>
            <div className="text-xl font-black text-green-400">
              {dirtyMoney.toLocaleString('pt-BR')}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-3">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Limpo</div>
            <div className="text-xl font-black text-emerald-300">
              {cleanMoney.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-b from-zinc-950 to-black p-4">
          <div className="grid grid-cols-3 gap-3">
            {reels.map((symbol, index) => (
              <motion.div
                key={`${symbol}-${index}-${isSpinning}`}
                initial={{ scale: 0.9, opacity: 0.8 }}
                animate={{ scale: isSpinning ? [1, 1.08, 1] : 1, opacity: 1 }}
                transition={{ duration: 0.18 }}
                className="flex h-24 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-4xl shadow-inner"
              >
                {symbol}
              </motion.div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-900/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {(resultText || rewardAmount > 0) && !error && (
          <div className="mb-4 rounded-lg border border-cyan-500/30 bg-cyan-900/10 p-3 text-center">
            <div className="text-sm font-semibold text-cyan-300">{resultText}</div>
            {rewardAmount > 0 && (
              <div className="mt-1 text-lg font-black text-yellow-400">
                + {rewardAmount.toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}

        <Button
          onClick={handleSpin}
          disabled={!canSpin}
          className="w-full h-14 text-lg font-black bg-yellow-500 text-black hover:bg-yellow-400 disabled:opacity-50"
        >
          {isSpinning ? (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              <span>Girando...</span>
            </div>
          ) : (
            '🎰 GIRAR'
          )}
        </Button>

        <p className="mt-3 text-center text-xs text-zinc-500">
          O giro desconta do player salvo e atualiza a sessão com o retorno do service.
        </p>
      </div>
    </div>
  );
}
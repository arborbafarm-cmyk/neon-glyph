import React, { useState, useEffect } from 'react';
import { Image } from '@/components/ui/image';
import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';

const SLOT_ITEMS = [
  {
    id: 'pistol',
    name: 'Pistola',
    emoji: '🔫',
    image: 'https://static.wixstatic.com/media/50f4bf_7ceb0938617b41bbb7a55bb15b81510b~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'money',
    name: 'Dinheiro',
    emoji: '💰',
    image: 'https://static.wixstatic.com/media/50f4bf_c9d630f7a9084448858f4688d5fd2422~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'bank',
    name: 'Prédio de Banco',
    emoji: '🏢',
    image: 'https://static.wixstatic.com/media/50f4bf_cdd14c9f000248668e089d213a781cc9~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'diamond',
    name: 'Diamante',
    emoji: '💎',
    image: 'https://static.wixstatic.com/media/50f4bf_6def4b759743405d9569d1492b237a35~mv2.png?originWidth=384&originHeight=384'
  },
  {
    id: 'police',
    name: 'Viatura de Polícia',
    emoji: '🚔',
    image: 'https://static.wixstatic.com/media/50f4bf_c23536e6564e4839a021f9beee0bf22c~mv2.png?originWidth=384&originHeight=384'
  }
];

const MULTIPLIERS = [2, 5, 10, 100, 250, 1000];

export default function SlotMachine() {
  const { spins, dirtMoney, multiplier, isSpinning, hasInitialized, setSpins, setDirtMoney, setMultiplier, setHasInitialized, setIsSpinning, addDirtMoney, subtractSpins } = useGameStore();
  const [slots, setSlots] = useState<number[]>([0, 1, 2]);
  const [selectedMultiplier, setSelectedMultiplier] = useState<number>(1);
  const [showPrisonModal, setShowPrisonModal] = useState(false);
  const [spinningIndices, setSpinningIndices] = useState<boolean[]>([false, false, false]);
  const [resultMessage, setResultMessage] = useState('');

  // Initialize game on first load
  useEffect(() => {
    if (!hasInitialized) {
      setSpins(1000);
      setDirtMoney(0);
      setMultiplier(1);
      setHasInitialized(true);
    }
  }, [hasInitialized, setSpins, setDirtMoney, setMultiplier, setHasInitialized]);

  const spinSlots = async (multiplierValue: number) => {
    if (spins <= 0 || isSpinning) return;

    setIsSpinning(true);
    setSpinningIndices([true, true, true]);
    setResultMessage('');
    subtractSpins(1);

    // Animate spinning
    const spinDuration = 0.5;
    const spinInterval = setInterval(() => {
      setSlots([
        Math.floor(Math.random() * SLOT_ITEMS.length),
        Math.floor(Math.random() * SLOT_ITEMS.length),
        Math.floor(Math.random() * SLOT_ITEMS.length)
      ]);
    }, 50);

    setTimeout(() => {
      clearInterval(spinInterval);
      
      // Generate final result
      const finalSlots = [
        Math.floor(Math.random() * SLOT_ITEMS.length),
        Math.floor(Math.random() * SLOT_ITEMS.length),
        Math.floor(Math.random() * SLOT_ITEMS.length)
      ];
      setSlots(finalSlots);
      setSpinningIndices([false, false, false]);

      // Check results
      const slotIds = finalSlots.map(i => SLOT_ITEMS[i].id);
      const allSame = slotIds[0] === slotIds[1] && slotIds[1] === slotIds[2];

      if (allSame && slotIds[0] === 'police') {
        // Prison - lose 30% of money
        const lostMoney = Math.floor(dirtMoney * 0.3);
        setDirtMoney(Math.max(0, dirtMoney - lostMoney));
        setShowPrisonModal(true);
        setResultMessage(`🚔 PRESO! Perdeu R$ ${lostMoney}`);
      } else if (allSame) {
        // Three of a kind bonus
        let bonus = 0;
        if (slotIds[0] === 'diamond') {
          setMultiplier(multiplier + 1);
          setResultMessage(`💎 BÔNUS! +1x multiplicador (agora ${multiplier + 1}x)`);
        } else if (slotIds[0] === 'pistol') {
          bonus = 1000 * multiplierValue;
          addDirtMoney(bonus);
          setResultMessage(`🔫 BÔNUS! +R$ ${bonus}`);
        } else if (slotIds[0] === 'bank') {
          bonus = 500;
          addDirtMoney(bonus);
          setResultMessage(`🏢 BÔNUS! +R$ ${bonus}`);
        }
      } else {
        // Regular money from 💰
        const moneyCount = slotIds.filter(id => id === 'money').length;
        if (moneyCount > 0) {
          const earned = 100 * multiplierValue * moneyCount;
          addDirtMoney(earned);
          setResultMessage(`💰 Ganhou R$ ${earned}`);
        } else {
          setResultMessage('Nenhum prêmio');
        }
      }

      setIsSpinning(false);
    }, spinDuration * 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Slot Machine Container */}
      <div className="from-gray-900 to-black border-secondary rounded-lg p-3 shadow-2xl border border-none bg-transparent">
        {/* Slot Display - 3 slots centered */}
        {/* Slot Item Labels */}
        <div className="flex gap-2 justify-center mt-2 text-secondary text-xs font-heading">
          {slots.map((slotIndex, position) => (
            <div key={position} className="w-20 text-center truncate text-[10px]">
              {SLOT_ITEMS[slotIndex].name}
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-center items-center">
          {slots.map((slotIndex, position) => (
            <motion.div
              key={position}
              className="w-20 h-24 bg-gradient-to-b from-gray-800 to-black border-2 border-secondary rounded-lg flex items-center justify-center overflow-hidden shadow-inner"
              animate={spinningIndices[position] ? { y: [0, -10, 0] } : {}}
              transition={spinningIndices[position] ? { duration: 0.1, repeat: Infinity } : {}}
            >
              <Image
                src={SLOT_ITEMS[slotIndex].image}
                alt={SLOT_ITEMS[slotIndex].name}
                width={60}
                height={60}
                className="object-contain"
              />
            </motion.div>
          ))}
        </div>

        {/* Result Message */}
        {resultMessage && (
          <div className="text-center mt-3 text-secondary font-heading text-sm">
            {resultMessage}
          </div>
        )}

        {/* Game Stats */}
        <div className="flex justify-center gap-8 mt-4 text-white font-paragraph text-sm">
          <div className="text-center">
            <div className="text-xs text-secondary">GIROS</div>
            <div className="text-lg font-bold">{spins}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-secondary">MULTIPLICADOR</div>
            <div className="text-lg font-bold">{multiplier}x</div>
          </div>
        </div>
      </div>

      {/* Controls Container */}
      <div className="w-full max-w-2xl bg-gradient-to-b from-gray-900/50 to-black/50 border-2 border-secondary rounded-lg p-6 shadow-2xl">
        {/* Multiplier Selection */}
        <div className="mb-6">
          <div className="text-center text-secondary font-heading text-sm mb-3">ESCOLHA O MULTIPLICADOR</div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {MULTIPLIERS.map((mult) => (
              <button
                key={mult}
                onClick={() => setSelectedMultiplier(mult)}
                disabled={isSpinning || spins <= 0}
                className={`py-2 px-3 rounded font-heading text-sm font-bold transition-all duration-300 ${
                  selectedMultiplier === mult
                    ? 'bg-secondary text-black border-2 border-secondary'
                    : 'bg-transparent border-2 border-secondary text-secondary hover:bg-secondary/20'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {mult}x
              </button>
            ))}
          </div>
        </div>

        {/* Spin Button */}
        <div className="text-center">
          <button
            onClick={() => spinSlots(selectedMultiplier)}
            disabled={isSpinning || spins <= 0}
            className="px-8 py-3 bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end text-white font-heading text-lg font-bold rounded-lg hover:brightness-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(255,69,0,0.6))'
            }}
          >
            {isSpinning ? 'GIRANDO...' : 'GIRAR'}
          </button>
        </div>

        {spins <= 0 && (
          <div className="text-center mt-4 text-red-500 font-heading font-bold">
            SEM GIROS DISPONÍVEIS
          </div>
        )}
      </div>

      {/* Prison Modal */}
      {showPrisonModal && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowPrisonModal(false)}
        >
          <motion.div
            className="bg-gradient-to-b from-red-900 to-black border-4 border-red-500 rounded-lg p-8 text-center max-w-md"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255,0,0,0.8))'
            }}
          >
            <div className="text-6xl mb-4 animate-pulse">🚔</div>
            <h2 className="text-3xl font-heading font-bold text-red-500 mb-2">PRESO!</h2>
            <p className="text-white font-paragraph mb-4">Você foi preso pela polícia!</p>
            <p className="text-red-300 font-paragraph mb-6">Perdeu 30% do seu dinheiro sujo</p>
            <button
              onClick={() => setShowPrisonModal(false)}
              className="px-6 py-2 bg-red-600 text-white font-heading font-bold rounded hover:bg-red-700 transition-all"
            >
              FECHAR
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { useIntelligenceSkillTreeStore } from '@/store/intelligenceSkillTreeStore';
import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';
import { useVigorSkillTreeStore } from '@/store/vigorSkillTreeStore';
import {
  useCommercialCenterStore,
  BUSINESSES,
  RISK_FAILURE_CHANCE,
  LaunderingOperation,
  BusinessType,
} from '@/store/commercialCenterStore';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, DollarSign, Zap, Percent, ChevronRight } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { Players } from '@/entities';
import { CountdownTimer, CinematicBackground } from '@/components/CommercialCenterNeon';
import { Image } from '@/components/ui/image';

export default function CommercialCenterPage() {
  const playerStore = usePlayerStore();
  const intelligenceStore = useIntelligenceSkillTreeStore();
  const respeitStore = useRespeitSkillTreeStore();
  const vigorStore = useVigorSkillTreeStore();
  const commercialStore = useCommercialCenterStore();

  const [dirtyMoney, setDirtyMoney] = useState(playerStore.dirtyMoney || 0);
  const [cleanMoney, setCleanMoney] = useState(playerStore.cleanMoney || 0);
  const [inputAmount, setInputAmount] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessType>('pizzaria-mama');
  const [isProcessing, setIsProcessing] = useState(false);
  const [operations, setOperations] = useState(commercialStore.getActiveOperations());
  const [completedOperations, setCompletedOperations] = useState(
    commercialStore.getCompletedOperations()
  );
  const [timeRemaining, setTimeRemaining] = useState<Record<string, number>>({});

  // Get skill bonuses
  const intelligenceLevel = intelligenceStore.totalLevel || 0;
  const respeitLevel = respeitStore.totalLevel || 0;

  // Calculate risk reduction from intelligence (1% per level)
  const riskReduction = intelligenceLevel * 0.01;

  // Get upgrades from store
  const upgrades = commercialStore.upgrades;

  // Count active operations per business
  const getActiveOperationsForBusiness = (businessType: BusinessType): number => {
    return commercialStore.getActiveOperations().filter(op => op.businessType === businessType).length;
  };

  // Load player data on mount
  useEffect(() => {
    const loadPlayerData = async () => {
      try {
        const playerId = playerStore.playerId;
        if (playerId) {
          const player = await BaseCrudService.getById<Players>('players', playerId);
          if (player) {
            setDirtyMoney(player.dirtyMoney || 0);
            setCleanMoney(player.cleanMoney || 0);
          }
        }
      } catch (error) {
        console.error('Error loading player data:', error);
      }
    };

    loadPlayerData();
  }, [playerStore.playerId]);

  // Update operations from store
  useEffect(() => {
    setOperations(commercialStore.getActiveOperations());
    setCompletedOperations(commercialStore.getCompletedOperations());
  }, [commercialStore.operations]);

  // Timer for operations
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const newTimeRemaining: Record<string, number> = {};
      let operationsUpdated = false;

      operations.forEach((op) => {
        const remaining = Math.max(0, op.endTime - now);
        newTimeRemaining[op.id] = remaining;

        if (remaining === 0 && op.status === 'running') {
          commercialStore.updateOperation(op.id, { status: 'completed' });
          operationsUpdated = true;
        }
      });

      setTimeRemaining(newTimeRemaining);

      if (operationsUpdated) {
        setOperations(commercialStore.getActiveOperations());
        setCompletedOperations(commercialStore.getCompletedOperations());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [operations, commercialStore]);

  const getAdjustedRiskChance = (baseRisk: number): number => {
    return Math.max(0, baseRisk - riskReduction);
  };

  const handleLaunderMoney = async () => {
    const amount = parseFloat(inputAmount);

    if (!amount || amount <= 0) {
      alert('Digite um valor válido');
      return;
    }

    if (amount > dirtyMoney) {
      alert('Você não tem dinheiro sujo suficiente');
      return;
    }

    setIsProcessing(true);

    try {
      const business = BUSINESSES[selectedBusiness];

      // Calculate effective conversion with upgrades
      const effectiveConversion = business.baseConversion + (upgrades.conversionBonus / 100);
      const returnAmount = amount * effectiveConversion;

      // Calculate effective tax
      const effectiveTax = Math.max(0, business.baseTax - (upgrades.taxReduction / 100));
      const taxAmount = returnAmount * effectiveTax;
      const finalReturn = returnAmount - taxAmount;

      const operation: LaunderingOperation = {
        id: crypto.randomUUID(),
        businessType: selectedBusiness,
        amount,
        returnAmount: finalReturn,
        startTime: Date.now(),
        endTime: Date.now() + business.time,
        risk: business.risk,
        status: 'running',
        date: commercialStore.getTodayDate(),
        businessId: selectedBusiness,
      };

      // Optimistic update
      const newDirtyMoney = dirtyMoney - amount;
      setDirtyMoney(newDirtyMoney);
      setInputAmount('');
      commercialStore.addOperation(operation);

      // Update player in database
      const playerId = playerStore.playerId;
      if (playerId) {
        await BaseCrudService.update<Players>('players', {
          _id: playerId,
          dirtyMoney: newDirtyMoney,
        });
      }
    } catch (error) {
      console.error('Error creating operation:', error);
      // Revert on error
      setDirtyMoney(dirtyMoney);
      alert('Erro ao criar operação');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCollectReward = async (operation: LaunderingOperation) => {
    try {
      const riskChance = getAdjustedRiskChance(RISK_FAILURE_CHANCE[operation.risk]);
      const isFailed = Math.random() < riskChance;

      let reward = 0;
      if (isFailed) {
        reward = operation.amount * 0.5; // 50% of invested amount
      } else {
        reward = operation.returnAmount;
      }

      // Optimistic update
      const newCleanMoney = cleanMoney + reward;
      setCleanMoney(newCleanMoney);
      commercialStore.removeOperation(operation.id);

      // Update player in database
      const playerId = playerStore.playerId;
      if (playerId) {
        await BaseCrudService.update<Players>('players', {
          _id: playerId,
          cleanMoney: newCleanMoney,
        });
      }

      // Show result
      if (isFailed) {
        alert(`Operação falhou! Você recebeu apenas $${reward.toFixed(2)}`);
      } else {
        alert(`Operação bem-sucedida! Você recebeu $${reward.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error collecting reward:', error);
      alert('Erro ao coletar recompensa');
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const isBusinessUnlocked = (business: BusinessType): boolean => {
    return true; // All businesses are now unlocked
  };

  return (
    <CinematicBackground>
      <div className="min-h-screen text-white p-6">
        {/* Header with balances */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto mb-12"
        >
          <h1 className="font-heading text-6xl mb-2 text-center bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end bg-clip-text text-transparent">
            CENTRO COMERCIAL DO VALE
          </h1>
          <p className="text-center text-subtitle-neon-blue font-paragraph text-lg mb-8">
            Transforme dinheiro sujo em receita legítima através de nossos comércios
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Dirty Money */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-900/40 to-red-950/40 border-2 border-red-500/60 rounded-lg p-6 backdrop-blur-md shadow-lg shadow-red-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 text-sm font-paragraph mb-2">DINHEIRO SUJO</p>
                  <p className="font-heading text-4xl text-red-400">
                    ${dirtyMoney.toFixed(2)}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <DollarSign className="w-16 h-16 text-red-500/60" />
                </motion.div>
              </div>
            </motion.div>

            {/* Clean Money */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-900/40 to-green-950/40 border-2 border-green-500/60 rounded-lg p-6 backdrop-blur-md shadow-lg shadow-green-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-paragraph mb-2">DINHEIRO LIMPO</p>
                  <p className="font-heading text-4xl text-green-400">
                    ${cleanMoney.toFixed(2)}
                  </p>
                </div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <TrendingUp className="w-16 h-16 text-green-500/60" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Skill Bonuses Info */}
          <div className="bg-slate-800/50 border border-subtitle-neon-blue/30 rounded-lg p-4 mb-8 backdrop-blur-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-paragraph">
              <div>
                <span className="text-blue-400 block text-xs mb-1">INTELIGÊNCIA</span>
                <span className="text-slate-300">-{(riskReduction * 100).toFixed(0)}% risco</span>
              </div>
              <div>
                <span className="text-purple-400 block text-xs mb-1">RESPEITO</span>
                <span className="text-slate-300">Nível {respeitLevel}</span>
              </div>
              <div>
                <span className="text-yellow-400 block text-xs mb-1">OPERAÇÕES ATIVAS</span>
                <span className="text-slate-300">{operations.length}</span>
              </div>
              <div>
                <span className="text-green-400 block text-xs mb-1">UPGRADES</span>
                <span className="text-slate-300">Taxa: -{(upgrades.taxReduction).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Commercial Center Building with Storefronts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="font-heading text-3xl mb-12 text-center text-subtitle-neon-blue">
            COMÉRCIOS DISPONÍVEIS
          </h2>

          {/* Building Container */}
          <div className="relative max-w-6xl mx-auto mb-12">
            {/* Background Building Image */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-orange-500/30 border-2 border-orange-500/40">
              <Image
                src="https://static.wixstatic.com/media/50f4bf_1452b172deb341eba2b065aa044ee8ce~mv2.png"
                alt="Centro Comercial do Vale - Fachada Principal"
                width={1200}
                height={600}
                className="w-full h-auto object-cover"
              />

              {/* Storefronts Overlay Grid */}
              <div className="absolute inset-0 grid grid-cols-5 gap-2 p-8 pointer-events-none">
                {(Object.entries(BUSINESSES) as [BusinessType, typeof BUSINESSES[BusinessType]][]).map(
                  ([key, business], index) => {
                    const isSelected = selectedBusiness === key;
                    const activeOpsCount = getActiveOperationsForBusiness(key);

                    return (
                      <motion.div
                        key={key}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => setSelectedBusiness(key)}
                        className="pointer-events-auto cursor-pointer h-full flex flex-col"
                      >
                        {/* Storefront Card */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`relative flex-1 rounded-lg border-2 transition-all backdrop-blur-sm overflow-hidden group ${
                            isSelected
                              ? 'border-logo-gradient-start bg-gradient-to-b from-orange-900/80 to-red-900/80 shadow-lg shadow-orange-500/60'
                              : 'border-slate-600/60 bg-gradient-to-b from-slate-800/60 to-slate-900/60 hover:border-orange-500/80 shadow-lg shadow-slate-900/40'
                          }`}
                        >
                          {/* Storefront Header - Sign */}
                          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-3 py-2 text-center border-b-2 border-orange-400/50">
                            <h3 className="font-heading text-sm text-white truncate">
                              {business.name}
                            </h3>
                          </div>

                          {/* Storefront Content */}
                          <div className="flex-1 p-3 flex flex-col justify-between">
                            {/* Tagline */}
                            <p className="text-xs text-slate-200 font-paragraph italic text-center mb-2 line-clamp-2">
                              {business.tagline}
                            </p>

                            {/* Business Stats */}
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">Taxa:</span>
                                <span className="text-red-300 font-heading">
                                  {(business.baseTax * 100).toFixed(0)}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">Tempo:</span>
                                <span className="text-purple-300 font-heading">
                                  {Math.floor(business.time / (60 * 60 * 1000))}h
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">Risco:</span>
                                <span className={`font-heading ${
                                  business.risk === 'low'
                                    ? 'text-green-300'
                                    : business.risk === 'medium'
                                      ? 'text-yellow-300'
                                      : 'text-red-300'
                                }`}>
                                  {business.risk === 'low'
                                    ? 'Baixo'
                                    : business.risk === 'medium'
                                      ? 'Médio'
                                      : 'Alto'}
                                </span>
                              </div>
                            </div>

                            {/* Active Operations Badge */}
                            {activeOpsCount > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-600/50">
                                <span className="text-xs text-blue-300 font-heading block text-center">
                                  {activeOpsCount} ativa{activeOpsCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Storefront Door Indicator */}
                          <div className={`h-1 transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end'
                              : 'bg-slate-600/40'
                          }`} />
                        </motion.div>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Input and Launch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/60 border-2 border-subtitle-neon-blue/40 rounded-lg p-8 backdrop-blur-md max-w-2xl mx-auto"
          >
            <h3 className="font-heading text-2xl mb-6 text-subtitle-neon-blue">
              INICIAR OPERAÇÃO
            </h3>

            {selectedBusiness && (
              <div className="mb-6 p-4 bg-slate-900/50 rounded border border-slate-700/50">
                <p className="text-sm text-slate-300 mb-2">Comércio selecionado:</p>
                <p className="font-heading text-lg text-subtitle-neon-blue">
                  {BUSINESSES[selectedBusiness].name}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-paragraph">
                  VALOR A LAVAR
                </label>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Digite o valor"
                  className="w-full bg-slate-700/50 border border-subtitle-neon-blue/40 rounded px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-subtitle-neon-blue focus:ring-1 focus:ring-subtitle-neon-blue/50"
                  disabled={isProcessing}
                />
              </div>

              <button
                onClick={handleLaunderMoney}
                disabled={isProcessing || !inputAmount}
                className="w-full bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
              >
                {isProcessing ? 'PROCESSANDO...' : 'LAVAR DINHEIRO'}
                {!isProcessing && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Active Operations */}
        {operations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="font-heading text-3xl mb-8 text-center text-subtitle-neon-blue">
              OPERAÇÕES EM ANDAMENTO
            </h2>

            <div className="space-y-6">
              {operations.map((op) => {
                const business = BUSINESSES[op.businessType as BusinessType];
                const remaining = timeRemaining[op.id] || 0;
                const progress = ((op.endTime - Date.now()) / (op.endTime - op.startTime)) * 100;

                return (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-800/60 border-2 border-subtitle-neon-blue/40 rounded-lg p-6 backdrop-blur-md overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-heading text-xl text-subtitle-neon-blue">
                          {business.name}
                        </h4>
                        <p className="text-slate-400 text-sm font-paragraph mt-1">
                          Investido: <span className="text-red-400 font-heading">${op.amount.toFixed(2)}</span>
                          {' '} → Retorno: <span className="text-green-400 font-heading">${op.returnAmount.toFixed(2)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <CountdownTimer
                          endTime={op.endTime}
                          onComplete={() => {
                            setOperations(commercialStore.getActiveOperations());
                            setCompletedOperations(commercialStore.getCompletedOperations());
                          }}
                        />
                      </div>
                    </div>

                    <div className="w-full bg-slate-700/50 rounded-full h-3 mb-4 overflow-hidden border border-slate-600/50">
                      <motion.div
                        className="bg-gradient-to-r from-logo-gradient-start to-logo-gradient-end h-full shadow-lg shadow-logo-gradient-start/50"
                        initial={{ width: '100%' }}
                        animate={{ width: `${Math.max(0, progress)}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>

                    {remaining === 0 && (
                      <button
                        onClick={() => handleCollectReward(op)}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-heading py-3 rounded transition-all flex items-center justify-center gap-2 group"
                      >
                        COLETAR RECOMPENSA
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Completed Operations */}
        {completedOperations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="font-heading text-3xl mb-8 text-center text-subtitle-neon-blue">
              OPERAÇÕES CONCLUÍDAS
            </h2>

            <div className="space-y-3 max-w-2xl mx-auto">
              {completedOperations.slice(0, 5).map((op) => {
                const business = BUSINESSES[op.businessType as BusinessType];

                return (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800/40 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm hover:border-green-500/60 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-paragraph flex items-center gap-2">
                        {business.name}
                      </span>
                      <span className="text-green-400 font-heading text-lg">
                        +${op.returnAmount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </CinematicBackground>
  );
}

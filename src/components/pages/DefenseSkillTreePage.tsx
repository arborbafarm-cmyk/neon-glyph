import { useEffect, useState } from 'react';
import { useDefenseSkillTreeStore, type Skill } from '@/store/defenseSkillTreeStore';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { ChevronRight, Lock, Zap } from 'lucide-react';

export default function DefenseSkillTreePage() {
  const {
    skills,
    playerMoney,
    initializeSkills,
    startUpgrade,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getUpgradeCost,
    getUpgradeDuration,
    getDefenseBonus,
    updatePlayerMoney,
  } = useDefenseSkillTreeStore();

  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [upgradeTimers, setUpgradeTimers] = useState<Record<string, number>>({});

  // Initialize skills on mount
  useEffect(() => {
    initializeSkills();
  }, [initializeSkills]);

  // Update timers for upgrading skills
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      Object.values(skills).forEach((skill) => {
        if (skill.upgrading) {
          const remaining = getRemainingTime(skill.id);
          newTimers[skill.id] = remaining;

          // Auto-finalize when time is up
          if (remaining <= 0) {
            finalizeUpgrade(skill.id);
          }
        }
      });
      setUpgradeTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [skills, getRemainingTime, finalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = startUpgrade(skillId, playerMoney);
    if (result.success) {
      setSelectedSkill(skillId);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const skillOrder = ['defesa_1', 'defesa_2', 'defesa_3', 'defesa_4', 'defesa_5'];
  const orderedSkills = skillOrder.map((id) => skills[id]).filter(Boolean);

  const defenseBonus = getDefenseBonus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="font-heading text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            Árvore de Defesa
          </h1>
          <p className="text-lg text-slate-300 mb-6">
            Proteja suas operações e aumente sua resiliência no crime organizado
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-slate-700/50 rounded-lg p-4 border border-blue-500/30">
              <p className="text-slate-400 text-sm">Dinheiro Disponível</p>
              <p className="text-2xl font-bold text-blue-400">
                ${playerMoney.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-cyan-500/30">
              <p className="text-slate-400 text-sm">Bônus de Defesa</p>
              <p className="text-2xl font-bold text-cyan-400">
                +{(defenseBonus * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30">
              <p className="text-slate-400 text-sm">Skills Desbloqueados</p>
              <p className="text-2xl font-bold text-purple-400">
                {Object.values(skills).filter((s) => s.level > 0).length}/5
              </p>
            </div>
          </div>
        </motion.div>

        {/* Skills Tree */}
        <div className="space-y-6">
          {orderedSkills.map((skill, index) => {
            const isLocked =
              skill.requires && skill.requires.length > 0
                ? skill.requires.some((reqId) => {
                    const reqSkill = skills[reqId];
                    let requiredLevel = 0;
                    if (reqId === 'defesa_1' && skill.id === 'defesa_2') requiredLevel = 10;
                    if (reqId === 'defesa_2' && skill.id === 'defesa_3') requiredLevel = 15;
                    if (reqId === 'defesa_3' && skill.id === 'defesa_4') requiredLevel = 20;
                    if (reqId === 'defesa_4' && skill.id === 'defesa_5') requiredLevel = 25;
                    return reqSkill.level < requiredLevel;
                  })
                : false;

            const canUpgradeSkill = canUpgrade(skill.id, playerMoney);
            const upgradeCost = getUpgradeCost(skill.id);
            const upgradeDuration = getUpgradeDuration(skill.id);
            const remainingTime = upgradeTimers[skill.id] || 0;

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection Line */}
                {index < orderedSkills.length - 1 && (
                  <div className="absolute left-8 top-full w-1 h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
                )}

                <div
                  onClick={() => setSelectedSkill(skill.id)}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedSkill === skill.id ? 'scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div
                    className={`relative bg-gradient-to-r rounded-lg p-6 border-2 transition-all duration-300 ${
                      isLocked
                        ? 'from-slate-700 to-slate-800 border-slate-600 opacity-50'
                        : skill.upgrading
                          ? 'from-yellow-900/30 to-orange-900/30 border-yellow-500/50'
                          : skill.level >= skill.maxLevel
                            ? 'from-green-900/30 to-emerald-900/30 border-green-500/50'
                            : 'from-blue-900/30 to-cyan-900/30 border-blue-500/50'
                    }`}
                  >
                    {/* Locked Badge */}
                    {isLocked && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-5 h-5 text-slate-500" />
                      </div>
                    )}

                    {/* Upgrading Badge */}
                    {skill.upgrading && (
                      <div className="absolute top-4 right-4">
                        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-heading text-2xl font-bold text-white mb-2">
                          {skill.name}
                        </h3>
                        <p className="text-slate-300 text-sm">
                          Nível {skill.level} / {skill.maxLevel}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-400">
                          {skill.level}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(skill.level / skill.maxLevel) * 100}%`,
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Skill Description */}
                    <p className="text-slate-300 text-sm mb-4">
                      {getSkillDescription(skill.id)}
                    </p>

                    {/* Upgrade Info */}
                    {!isLocked && skill.level < skill.maxLevel && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-slate-800/50 rounded p-3">
                          <p className="text-slate-400 text-xs">Próximo Custo</p>
                          <p className="text-lg font-bold text-yellow-400">
                            ${upgradeCost.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-slate-800/50 rounded p-3">
                          <p className="text-slate-400 text-xs">Tempo de Upgrade</p>
                          <p className="text-lg font-bold text-purple-400">
                            {formatTime(upgradeDuration)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Upgrading Progress */}
                    {skill.upgrading && (
                      <div className="mb-4">
                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-400"
                            initial={{ width: '100%' }}
                            animate={{ width: `${(remainingTime / upgradeDuration) * 100}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                        <p className="text-center text-yellow-400 text-sm mt-2">
                          Tempo restante: {formatTime(remainingTime)}
                        </p>
                      </div>
                    )}

                    {/* Requirements */}
                    {skill.requires && skill.requires.length > 0 && (
                      <div className="mb-4 p-3 bg-slate-800/50 rounded">
                        <p className="text-slate-400 text-xs mb-2">Requisitos:</p>
                        {skill.requires.map((reqId) => {
                          const reqSkill = skills[reqId];
                          let requiredLevel = 0;
                          if (reqId === 'defesa_1' && skill.id === 'defesa_2')
                            requiredLevel = 10;
                          if (reqId === 'defesa_2' && skill.id === 'defesa_3')
                            requiredLevel = 15;
                          if (reqId === 'defesa_3' && skill.id === 'defesa_4')
                            requiredLevel = 20;
                          if (reqId === 'defesa_4' && skill.id === 'defesa_5')
                            requiredLevel = 25;

                          const isMet = reqSkill.level >= requiredLevel;
                          return (
                            <p
                              key={reqId}
                              className={`text-sm ${
                                isMet ? 'text-green-400' : 'text-red-400'
                              }`}
                            >
                              {reqSkill.name}: Nível {requiredLevel} {isMet ? '✓' : '✗'}
                            </p>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex gap-3">
                      {isLocked ? (
                        <button
                          disabled
                          className="flex-1 py-3 px-4 rounded-lg bg-slate-700 text-slate-500 font-bold cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          Bloqueado
                        </button>
                      ) : skill.upgrading ? (
                        <button
                          disabled
                          className="flex-1 py-3 px-4 rounded-lg bg-yellow-600 text-white font-bold cursor-not-allowed"
                        >
                          Atualizando...
                        </button>
                      ) : skill.level >= skill.maxLevel ? (
                        <button
                          disabled
                          className="flex-1 py-3 px-4 rounded-lg bg-green-600 text-white font-bold cursor-not-allowed"
                        >
                          Máximo Atingido
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartUpgrade(skill.id)}
                          disabled={!canUpgradeSkill}
                          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                            canUpgradeSkill
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/50'
                              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <ChevronRight className="w-4 h-4" />
                          Atualizar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-slate-800/50 rounded-lg p-6 border border-slate-700"
        >
          <h2 className="font-heading text-2xl font-bold text-white mb-4">
            Sobre a Árvore de Defesa
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-slate-300">
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">Efeitos Principais:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Esquema de Fuga: Reduz perdas em falhas</li>
                <li>• Caixa Blindado: Protege seu dinheiro</li>
                <li>• Proteção de Território: Reduz dano em conflitos</li>
                <li>• Segurança Avançada: Aumenta resistência geral</li>
                <li>• Blindagem Total: Proteção massiva</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-blue-400 mb-2">Dicas:</h3>
              <ul className="space-y-2 text-sm">
                <li>• Comece com Esquema de Fuga para base sólida</li>
                <li>• Cada skill desbloqueia a próxima</li>
                <li>• Custos aumentam exponencialmente</li>
                <li>• Planeje sua progressão com cuidado</li>
                <li>• Defesa é essencial para sobrevivência</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function getSkillDescription(skillId: string): string {
  const descriptions: Record<string, string> = {
    defesa_1:
      'Aprenda técnicas de fuga rápida para minimizar perdas quando as operações falham. Cada nível reduz perdas em 1%.',
    defesa_2:
      'Invista em cofres blindados para proteger seu dinheiro. Cada nível aumenta proteção em 1.5%.',
    defesa_3:
      'Fortifique seu território contra invasões. Cada nível reduz dano recebido em 1.5%.',
    defesa_4:
      'Implemente sistemas de segurança avançados. Cada nível aumenta resistência geral em 1%.',
    defesa_5:
      'Alcance o pico da proteção com blindagem total. Cada nível fornece bônus massivo de 5%.',
  };
  return descriptions[skillId] || '';
}

import { useEffect, useState } from 'react';
import { useRespeitSkillTreeStore } from '@/store/respeitSkillTreeStore';
import { usePlayerStore } from '@/store/playerStore';
import { useCleanMoneyStore } from '@/store/cleanMoneyStore';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { AlertCircle, Zap, Clock, DollarSign, Lock, CheckCircle } from 'lucide-react';

export default function RespeitSkillTreePage() {
  const {
    skills,
    startUpgrade,
    finalizeUpgrade,
    canUpgrade,
    getRemainingTime,
    getRespectBonus,
    getSkillProgress,
  } = useRespeitSkillTreeStore();

  const { money } = useCleanMoneyStore();
  const { player } = usePlayerStore();
  const [upgrading, setUpgrading] = useState<string | null>(null);
  const [timers, setTimers] = useState<Record<string, number>>({});

  // Timer para upgrades em andamento
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: Record<string, number> = {};
      Object.values(skills).forEach((skill) => {
        if (skill.upgrading) {
          const remaining = getRemainingTime(skill.id);
          newTimers[skill.id] = remaining;

          // Finalizar upgrade automaticamente quando o tempo acabar
          if (remaining <= 0) {
            finalizeUpgrade(skill.id);
          }
        }
      });
      setTimers(newTimers);
    }, 100);

    return () => clearInterval(interval);
  }, [skills, getRemainingTime, finalizeUpgrade]);

  const handleStartUpgrade = (skillId: string) => {
    const result = startUpgrade(skillId, money);
    if (result.success) {
      setUpgrading(skillId);
    } else {
      alert(result.message);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const skillOrder = ['respeito_1', 'respeito_2', 'respeito_3', 'respeito_4', 'respeito_5'];

  const getSkillRequirementStatus = (skillId: string) => {
    const skill = skills[skillId];
    if (!skill || !skill.requires || skill.requires.length === 0) {
      return { met: true, message: '' };
    }

    for (const requiredSkillId of skill.requires) {
      const requiredSkill = skills[requiredSkillId];
      if (!requiredSkill) continue;

      const requiredLevel = requiredSkillId === 'respeito_1' ? 10 : 
                           requiredSkillId === 'respeito_2' ? 15 :
                           requiredSkillId === 'respeito_3' ? 20 :
                           requiredSkillId === 'respeito_4' ? 25 : 0;

      if (requiredSkill.level < requiredLevel) {
        return {
          met: false,
          message: `Requer ${requiredSkill.name} nível ${requiredLevel}`,
        };
      }
    }

    return { met: true, message: '' };
  };

  const calculateCost = (skillId: string) => {
    const skill = skills[skillId];
    if (!skill) return 0;
    return Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));
  };

  const calculateDuration = (skillId: string) => {
    const skill = skills[skillId];
    if (!skill) return 0;
    return Math.ceil(skill.baseTime * Math.pow(skill.level + 1, 1.5));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Header />

      <main className="max-w-[100rem] mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h1 className="font-heading text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-4">
              Árvore de Respeito
            </h1>
            <p className="font-paragraph text-lg text-cyan-400 mb-6">
              Construa sua reputação e influência no crime organizado
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-slate-700/50 border border-cyan-500/30 rounded-lg p-4"
              >
                <div className="text-cyan-400 text-sm font-paragraph mb-2">Respeito Total</div>
                <div className="text-3xl font-bold text-cyan-400">{getRespectBonus()}</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-slate-700/50 border border-orange-500/30 rounded-lg p-4"
              >
                <div className="text-orange-400 text-sm font-paragraph mb-2">Dinheiro</div>
                <div className="text-3xl font-bold text-orange-400">{formatCurrency(money)}</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-slate-700/50 border border-red-500/30 rounded-lg p-4"
              >
                <div className="text-red-400 text-sm font-paragraph mb-2">Nível do Jogador</div>
                <div className="text-3xl font-bold text-red-400">{player?.level || 0}</div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {skillOrder.map((skillId, index) => {
            const skill = skills[skillId];
            if (!skill) return null;

            const cost = calculateCost(skillId);
            const duration = calculateDuration(skillId);
            const canUpgradeSkill = canUpgrade(skillId, money);
            const requirementStatus = getSkillRequirementStatus(skillId);
            const progress = getSkillProgress(skillId);
            const remainingTime = timers[skillId] || 0;

            return (
              <motion.div
                key={skillId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/50 transition-all"
              >
                {/* Skill Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-cyan-400 mb-2">
                      {skill.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>
                        Nível {skill.level} / {skill.maxLevel}
                      </span>
                    </div>
                  </div>

                  {skill.level >= skill.maxLevel && (
                    <div className="bg-green-500/20 border border-green-500 rounded-full p-2">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                  )}
                </div>

                {/* Skill Description */}
                <div className="mb-4 p-3 bg-slate-800/50 rounded border border-slate-600/50">
                  <p className="font-paragraph text-sm text-slate-300">
                    {skill.id === 'respeito_1' &&
                      'Desbloqueia áreas iniciais e pequenos bônus de influência'}
                    {skill.id === 'respeito_2' &&
                      'Libera NPCs locais e missões básicas'}
                    {skill.id === 'respeito_3' &&
                      'Acesso a contatos estratégicos e operações melhores'}
                    {skill.id === 'respeito_4' &&
                      'Libera novas regiões do mapa e bônus de autoridade'}
                    {skill.id === 'respeito_5' &&
                      'Desbloqueio global de conteúdo avançado e bônus massivo de influência'}
                  </p>
                </div>

                {/* Progress Bar */}
                {skill.upgrading && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-cyan-400 font-paragraph">Progresso</span>
                      <span className="text-xs text-cyan-400 font-paragraph">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </div>
                )}

                {/* Requirements */}
                {!requirementStatus.met && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded flex items-start gap-2">
                    <Lock className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-300 font-paragraph">
                      {requirementStatus.message}
                    </span>
                  </div>
                )}

                {/* Cost and Time */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/50 rounded p-3 border border-orange-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-slate-400 font-paragraph">Custo</span>
                    </div>
                    <div className="text-lg font-bold text-orange-400">
                      {formatCurrency(cost)}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded p-3 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-xs text-slate-400 font-paragraph">Tempo</span>
                    </div>
                    <div className="text-lg font-bold text-blue-400">
                      {formatTime(duration)}
                    </div>
                  </div>
                </div>

                {/* Upgrade Status */}
                {skill.upgrading && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-sm text-blue-300 font-paragraph">
                      Tempo restante: {formatTime(remainingTime)}
                    </span>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={() => handleStartUpgrade(skillId)}
                  disabled={
                    !canUpgradeSkill ||
                    skill.upgrading ||
                    skill.level >= skill.maxLevel ||
                    !requirementStatus.met
                  }
                  className={`w-full py-3 rounded font-heading font-bold transition-all ${
                    skill.level >= skill.maxLevel
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50 cursor-default'
                      : canUpgradeSkill && !skill.upgrading
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  {skill.level >= skill.maxLevel
                    ? 'Máximo Atingido'
                    : skill.upgrading
                    ? 'Atualizando...'
                    : !requirementStatus.met
                    ? 'Bloqueado'
                    : money < cost
                    ? 'Dinheiro Insuficiente'
                    : 'Iniciar Upgrade'}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-700/30 border border-cyan-500/20 rounded-lg p-6 mb-12"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
            <h3 className="font-heading text-xl font-bold text-cyan-400">
              Sistema de Progressão
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-paragraph text-sm text-slate-300">
            <div>
              <p className="mb-2">
                <span className="text-cyan-400 font-bold">Custo Exponencial:</span> Cada nível
                custa progressivamente mais dinheiro
              </p>
              <p className="mb-2">
                <span className="text-cyan-400 font-bold">Tempo Exponencial:</span> Cada nível
                leva mais tempo para ser concluído
              </p>
              <p>
                <span className="text-cyan-400 font-bold">Requisitos:</span> Desbloqueie skills
                anteriores para acessar as próximas
              </p>
            </div>

            <div>
              <p className="mb-2">
                <span className="text-cyan-400 font-bold">Impacto no Jogo:</span> Respeito
                desbloqueia áreas, NPCs e missões
              </p>
              <p className="mb-2">
                <span className="text-cyan-400 font-bold">Progressão:</span> Aproximadamente 4
                meses de gameplay para completar
              </p>
              <p>
                <span className="text-cyan-400 font-bold">Persistência:</span> Seu progresso é
                salvo automaticamente
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

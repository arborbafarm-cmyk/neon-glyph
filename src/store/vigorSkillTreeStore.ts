import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: 'vigor';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
};

type VigorStats = {
  maxEnergy: number;
  regenRate: number;
  consumptionReduction: number;
};

type VigorSkillTreeState = {
  skills: Record<string, Skill>;
  initializeSkills: () => void;
  startUpgrade: (skillId: string, playerMoney: number) => { success: boolean; error?: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; error?: string };
  canUpgrade: (skillId: string, playerMoney: number) => boolean;
  getRemainingTime: (skillId: string) => number;
  getVigorStats: () => VigorStats;
  getSkillByLevel: (level: number) => Skill | null;
  isSkillUnlocked: (skillId: string) => boolean;
  getUpgradeCost: (skillId: string) => number;
  getUpgradeDuration: (skillId: string) => number;
};

const INITIAL_SKILLS: Record<string, Skill> = {
  vigor_1: {
    id: 'vigor_1',
    name: 'Fôlego de Rua I',
    category: 'vigor',
    level: 0,
    maxLevel: 20,
    baseCost: 600,
    baseTime: 300000, // 5 minutos
    requires: [],
    upgrading: false,
  },
  vigor_2: {
    id: 'vigor_2',
    name: 'Resistência Física II',
    category: 'vigor',
    level: 0,
    maxLevel: 25,
    baseCost: 900,
    baseTime: 600000, // 10 minutos
    requires: ['vigor_1'],
    upgrading: false,
  },
  vigor_3: {
    id: 'vigor_3',
    name: 'Ritmo de Operação III',
    category: 'vigor',
    level: 0,
    maxLevel: 30,
    baseCost: 1300,
    baseTime: 1200000, // 20 minutos
    requires: ['vigor_2'],
    upgrading: false,
  },
  vigor_4: {
    id: 'vigor_4',
    name: 'Recuperação Acelerada IV',
    category: 'vigor',
    level: 0,
    maxLevel: 40,
    baseCost: 2200,
    baseTime: 2400000, // 40 minutos
    requires: ['vigor_3'],
    upgrading: false,
  },
  vigor_5: {
    id: 'vigor_5',
    name: 'Energia Inquebrável V',
    category: 'vigor',
    level: 0,
    maxLevel: 50,
    baseCost: 5500,
    baseTime: 3600000, // 1 hora
    requires: ['vigor_4'],
    upgrading: false,
  },
};

export const useVigorSkillTreeStore = create<VigorSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,

      initializeSkills: () => {
        set({ skills: INITIAL_SKILLS });
      },

      getUpgradeCost: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill) return 0;
        return Math.floor(skill.baseCost * Math.pow(skill.level + 1, 1.8));
      },

      getUpgradeDuration: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill) return 0;
        return Math.floor(skill.baseTime * Math.pow(skill.level + 1, 1.5));
      },

      isSkillUnlocked: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill || !skill.requires || skill.requires.length === 0) return true;

        return skill.requires.every((requiredSkillId) => {
          const requiredSkill = get().skills[requiredSkillId];
          if (requiredSkillId === 'vigor_1') return requiredSkill?.level >= 10;
          if (requiredSkillId === 'vigor_2') return requiredSkill?.level >= 15;
          if (requiredSkillId === 'vigor_3') return requiredSkill?.level >= 20;
          if (requiredSkillId === 'vigor_4') return requiredSkill?.level >= 25;
          return false;
        });
      },

      canUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().skills[skillId];
        if (!skill) return false;
        if (skill.upgrading) return false;
        if (skill.level >= skill.maxLevel) return false;
        if (!get().isSkillUnlocked(skillId)) return false;

        const cost = get().getUpgradeCost(skillId);
        if (playerMoney < cost) return false;

        return true;
      },

      startUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (skill.upgrading) {
          return { success: false, error: 'Skill já está sendo atualizada' };
        }

        if (skill.level >= skill.maxLevel) {
          return { success: false, error: 'Nível máximo atingido' };
        }

        if (!get().isSkillUnlocked(skillId)) {
          return { success: false, error: 'Skill não desbloqueada' };
        }

        const cost = get().getUpgradeCost(skillId);
        if (playerMoney < cost) {
          return { success: false, error: 'Dinheiro insuficiente' };
        }

        const duration = get().getUpgradeDuration(skillId);
        const now = Date.now();

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...state.skills[skillId],
              upgrading: true,
              startTime: now,
              endTime: now + duration,
            },
          },
        }));

        return { success: true };
      },

      finalizeUpgrade: (skillId: string) => {
        const skill = get().skills[skillId];

        if (!skill) {
          return { success: false, error: 'Skill não encontrada' };
        }

        if (!skill.upgrading || !skill.endTime) {
          return { success: false, error: 'Upgrade não está em progresso' };
        }

        if (Date.now() < skill.endTime) {
          return { success: false, error: 'Upgrade ainda não foi concluído' };
        }

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...state.skills[skillId],
              level: state.skills[skillId].level + 1,
              upgrading: false,
              startTime: undefined,
              endTime: undefined,
            },
          },
        }));

        return { success: true };
      },

      getRemainingTime: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill || !skill.endTime) return 0;
        const remaining = skill.endTime - Date.now();
        return remaining > 0 ? remaining : 0;
      },

      getVigorStats: () => {
        const skills = get().skills;
        
        // Fôlego de Rua: +1% energia máxima por nível
        const maxEnergyBonus = skills.vigor_1.level * 1;
        
        // Resistência Física: -1% consumo de energia por ação
        const consumptionReduction = skills.vigor_2.level * 1;
        
        // Recuperação Acelerada: +1% regeneração de energia por nível
        const regenRate = skills.vigor_4.level * 1;

        return {
          maxEnergy: 100 + maxEnergyBonus,
          regenRate: 1 + (regenRate / 100),
          consumptionReduction: consumptionReduction / 100,
        };
      },

      getSkillByLevel: (level: number) => {
        const skills = get().skills;
        const skillArray = Object.values(skills).sort((a, b) => {
          const levelOrder = { vigor_1: 1, vigor_2: 2, vigor_3: 3, vigor_4: 4, vigor_5: 5 };
          return (levelOrder[a.id as keyof typeof levelOrder] || 0) - (levelOrder[b.id as keyof typeof levelOrder] || 0);
        });
        return skillArray[level] || null;
      },
    }),
    {
      name: 'vigor-skill-tree-storage',
      version: 1,
    }
  )
);

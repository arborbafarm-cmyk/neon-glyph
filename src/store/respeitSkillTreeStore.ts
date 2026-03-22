import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: 'respeito';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
};

interface RespeitSkillTreeState {
  skills: Record<string, Skill>;
  totalRespect: number;
  initializeSkills: () => void;
  startUpgrade: (skillId: string, playerMoney: number) => { success: boolean; message: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; message: string };
  canUpgrade: (skillId: string, playerMoney: number) => boolean;
  getRemainingTime: (skillId: string) => number;
  getRespectBonus: () => number;
  getSkillProgress: (skillId: string) => number;
  resetAllSkills: () => void;
}

const INITIAL_SKILLS: Record<string, Skill> = {
  respeito_1: {
    id: 'respeito_1',
    name: 'Nome na Quebrada I',
    category: 'respeito',
    level: 0,
    maxLevel: 20,
    baseCost: 700,
    baseTime: 300000, // 5 minutos
    requires: [],
    upgrading: false,
  },
  respeito_2: {
    id: 'respeito_2',
    name: 'Influência Local II',
    category: 'respeito',
    level: 0,
    maxLevel: 25,
    baseCost: 1000,
    baseTime: 600000, // 10 minutos
    requires: ['respeito_1'],
    upgrading: false,
  },
  respeito_3: {
    id: 'respeito_3',
    name: 'Rede de Contatos III',
    category: 'respeito',
    level: 0,
    maxLevel: 30,
    baseCost: 1500,
    baseTime: 1200000, // 20 minutos
    requires: ['respeito_2'],
    upgrading: false,
  },
  respeito_4: {
    id: 'respeito_4',
    name: 'Domínio Regional IV',
    category: 'respeito',
    level: 0,
    maxLevel: 40,
    baseCost: 2500,
    baseTime: 2400000, // 40 minutos
    requires: ['respeito_3'],
    upgrading: false,
  },
  respeito_5: {
    id: 'respeito_5',
    name: 'Império do Comando V',
    category: 'respeito',
    level: 0,
    maxLevel: 50,
    baseCost: 6000,
    baseTime: 3600000, // 1 hora
    requires: ['respeito_4'],
    upgrading: false,
  },
};

export const useRespeitSkillTreeStore = create<RespeitSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,
      totalRespect: 0,

      initializeSkills: () => {
        set({ skills: INITIAL_SKILLS, totalRespect: 0 });
      },

      startUpgrade: (skillId: string, playerMoney: number) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { success: false, message: 'Skill não encontrada' };
        }

        if (skill.upgrading) {
          return { success: false, message: 'Skill já está em upgrade' };
        }

        if (skill.level >= skill.maxLevel) {
          return { success: false, message: 'Skill já atingiu o nível máximo' };
        }

        // Verificar requisitos
        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = state.skills[requiredSkillId];
            if (!requiredSkill) continue;

            const requiredLevel = requiredSkillId === 'respeito_1' ? 10 : 
                                 requiredSkillId === 'respeito_2' ? 15 :
                                 requiredSkillId === 'respeito_3' ? 20 :
                                 requiredSkillId === 'respeito_4' ? 25 : 0;

            if (requiredSkill.level < requiredLevel) {
              return { 
                success: false, 
                message: `Requer ${requiredSkill.name} nível ${requiredLevel}` 
              };
            }
          }
        }

        // Calcular custo
        const cost = Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));

        if (playerMoney < cost) {
          return { success: false, message: `Dinheiro insuficiente. Necessário: $${cost}` };
        }

        // Calcular duração
        const duration = Math.ceil(skill.baseTime * Math.pow(skill.level + 1, 1.5));
        const now = Date.now();

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              upgrading: true,
              startTime: now,
              endTime: now + duration,
            },
          },
        }));

        return { success: true, message: `Upgrade iniciado. Custo: $${cost}` };
      },

      finalizeUpgrade: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) {
          return { success: false, message: 'Skill não encontrada' };
        }

        if (!skill.upgrading) {
          return { success: false, message: 'Skill não está em upgrade' };
        }

        if (!skill.endTime || Date.now() < skill.endTime) {
          return { success: false, message: 'Upgrade ainda não foi concluído' };
        }

        set((state) => ({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              level: skill.level + 1,
              upgrading: false,
              startTime: undefined,
              endTime: undefined,
            },
          },
          totalRespect: state.totalRespect + 1,
        }));

        return { success: true, message: `${skill.name} foi atualizado para nível ${skill.level + 1}` };
      },

      canUpgrade: (skillId: string, playerMoney: number) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return false;
        if (skill.upgrading) return false;
        if (skill.level >= skill.maxLevel) return false;

        const cost = Math.ceil(skill.baseCost * Math.pow(skill.level + 1, 1.8));
        if (playerMoney < cost) return false;

        // Verificar requisitos
        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = state.skills[requiredSkillId];
            if (!requiredSkill) continue;

            const requiredLevel = requiredSkillId === 'respeito_1' ? 10 : 
                                 requiredSkillId === 'respeito_2' ? 15 :
                                 requiredSkillId === 'respeito_3' ? 20 :
                                 requiredSkillId === 'respeito_4' ? 25 : 0;

            if (requiredSkill.level < requiredLevel) return false;
          }
        }

        return true;
      },

      getRemainingTime: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill || !skill.endTime) return 0;

        const remaining = skill.endTime - Date.now();
        return remaining > 0 ? remaining : 0;
      },

      getRespectBonus: () => {
        const state = get();
        return Object.values(state.skills).reduce((total, skill) => total + skill.level, 0);
      },

      getSkillProgress: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill || !skill.upgrading || !skill.startTime || !skill.endTime) return 0;

        const elapsed = Date.now() - skill.startTime;
        const total = skill.endTime - skill.startTime;
        return Math.min((elapsed / total) * 100, 100);
      },

      resetAllSkills: () => {
        set({ skills: INITIAL_SKILLS, totalRespect: 0 });
      },
    }),
    {
      name: 'respeito-skill-tree-storage',
    }
  )
);

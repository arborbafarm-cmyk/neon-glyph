import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: 'defesa';
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
};

export type DefenseSkillTreeState = {
  skills: Record<string, Skill>;
  playerMoney: number;
  
  // Initialization
  initializeSkills: () => void;
  
  // Upgrade management
  startUpgrade: (skillId: string, playerMoney: number) => { success: boolean; error?: string };
  finalizeUpgrade: (skillId: string) => { success: boolean; error?: string };
  canUpgrade: (skillId: string, playerMoney: number) => boolean;
  
  // Getters
  getSkill: (skillId: string) => Skill | undefined;
  getRemainingTime: (skillId: string) => number;
  getDefenseBonus: () => number;
  getUpgradeCost: (skillId: string) => number;
  getUpgradeDuration: (skillId: string) => number;
  
  // Utility
  updatePlayerMoney: (amount: number) => void;
  resetAllSkills: () => void;
};

const INITIAL_SKILLS: Record<string, Skill> = {
  defesa_1: {
    id: 'defesa_1',
    name: 'Esquema de Fuga I',
    category: 'defesa',
    level: 0,
    maxLevel: 20,
    baseCost: 550,
    baseTime: 300000, // 5 minutos
    requires: [],
    upgrading: false,
  },
  defesa_2: {
    id: 'defesa_2',
    name: 'Caixa Blindado II',
    category: 'defesa',
    level: 0,
    maxLevel: 25,
    baseCost: 850,
    baseTime: 600000, // 10 minutos
    requires: ['defesa_1'],
    upgrading: false,
  },
  defesa_3: {
    id: 'defesa_3',
    name: 'Proteção de Território III',
    category: 'defesa',
    level: 0,
    maxLevel: 30,
    baseCost: 1250,
    baseTime: 1200000, // 20 minutos
    requires: ['defesa_2'],
    upgrading: false,
  },
  defesa_4: {
    id: 'defesa_4',
    name: 'Segurança Avançada IV',
    category: 'defesa',
    level: 0,
    maxLevel: 40,
    baseCost: 2100,
    baseTime: 2400000, // 40 minutos
    requires: ['defesa_3'],
    upgrading: false,
  },
  defesa_5: {
    id: 'defesa_5',
    name: 'Blindagem Total V',
    category: 'defesa',
    level: 0,
    maxLevel: 50,
    baseCost: 5200,
    baseTime: 3600000, // 1 hora
    requires: ['defesa_4'],
    upgrading: false,
  },
};

export const useDefenseSkillTreeStore = create<DefenseSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: { ...INITIAL_SKILLS },
      playerMoney: 0,

      initializeSkills: () => {
        set({ skills: { ...INITIAL_SKILLS } });
      },

      getSkill: (skillId: string) => {
        return get().skills[skillId];
      },

      getUpgradeCost: (skillId: string) => {
        const skill = get().getSkill(skillId);
        if (!skill) return 0;
        return Math.floor(skill.baseCost * Math.pow(skill.level + 1, 1.8));
      },

      getUpgradeDuration: (skillId: string) => {
        const skill = get().getSkill(skillId);
        if (!skill) return 0;
        return Math.floor(skill.baseTime * Math.pow(skill.level + 1, 1.5));
      },

      canUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().getSkill(skillId);
        if (!skill) return false;

        // Check if already upgrading
        if (skill.upgrading) return false;

        // Check if reached max level
        if (skill.level >= skill.maxLevel) return false;

        // Check requirements
        if (skill.requires && skill.requires.length > 0) {
          for (const requiredSkillId of skill.requires) {
            const requiredSkill = get().getSkill(requiredSkillId);
            if (!requiredSkill) return false;

            // Determine required level based on skill
            let requiredLevel = 0;
            if (requiredSkillId === 'defesa_1' && skillId === 'defesa_2') requiredLevel = 10;
            if (requiredSkillId === 'defesa_2' && skillId === 'defesa_3') requiredLevel = 15;
            if (requiredSkillId === 'defesa_3' && skillId === 'defesa_4') requiredLevel = 20;
            if (requiredSkillId === 'defesa_4' && skillId === 'defesa_5') requiredLevel = 25;

            if (requiredSkill.level < requiredLevel) return false;
          }
        }

        // Check if player has enough money
        const cost = get().getUpgradeCost(skillId);
        if (playerMoney < cost) return false;

        return true;
      },

      getRemainingTime: (skillId: string) => {
        const skill = get().getSkill(skillId);
        if (!skill || !skill.endTime) return 0;

        const remaining = skill.endTime - Date.now();
        return remaining > 0 ? remaining : 0;
      },

      startUpgrade: (skillId: string, playerMoney: number) => {
        const skill = get().getSkill(skillId);

        if (!skill) {
          return { success: false, error: 'Skill not found' };
        }

        if (!get().canUpgrade(skillId, playerMoney)) {
          return { success: false, error: 'Cannot upgrade this skill' };
        }

        const cost = get().getUpgradeCost(skillId);
        const duration = get().getUpgradeDuration(skillId);
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
          playerMoney: playerMoney - cost,
        }));

        return { success: true };
      },

      finalizeUpgrade: (skillId: string) => {
        const skill = get().getSkill(skillId);

        if (!skill) {
          return { success: false, error: 'Skill not found' };
        }

        if (!skill.upgrading || !skill.endTime) {
          return { success: false, error: 'Skill is not upgrading' };
        }

        if (Date.now() < skill.endTime) {
          return { success: false, error: 'Upgrade not yet complete' };
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
        }));

        return { success: true };
      },

      getDefenseBonus: () => {
        const skills = get().skills;
        let totalBonus = 0;

        // Esquema de Fuga: -1% perdas em falhas por nível
        totalBonus += (skills.defesa_1.level * 1) / 100;

        // Caixa Blindado: +1.5% proteção de dinheiro
        totalBonus += (skills.defesa_2.level * 1.5) / 100;

        // Proteção de Território: -1.5% dano recebido
        totalBonus += (skills.defesa_3.level * 1.5) / 100;

        // Segurança Avançada: +1% resistência geral
        totalBonus += (skills.defesa_4.level * 1) / 100;

        // Blindagem Total: bônus massivo (5% por nível)
        totalBonus += (skills.defesa_5.level * 5) / 100;

        return totalBonus;
      },

      updatePlayerMoney: (amount: number) => {
        set((state) => ({
          playerMoney: Math.max(0, state.playerMoney + amount),
        }));
      },

      resetAllSkills: () => {
        set({
          skills: { ...INITIAL_SKILLS },
          playerMoney: 0,
        });
      },
    }),
    {
      name: 'defense-skill-tree-store',
      version: 1,
    }
  )
);

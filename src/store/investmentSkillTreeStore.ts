import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  baseTime: number;
  requires?: string[];
  upgrading: boolean;
  startTime?: number;
  endTime?: number;
  description?: string;
  effect?: string;
  isUnlocked?: boolean;
};

type InvestmentSkillTreeState = {
  skills: Record<string, Skill>;
  dirtyMoney: number;
  setDirtyMoney: (amount: number) => void;
  upgradeSkill: (skillId: string) => boolean;
  finalizeUpgrade: (skillId: string) => void;
  canUpgrade: (skillId: string) => boolean;
  getRemainingTime: (skill: Skill) => number;
  getSkill: (skillId: string) => Skill | undefined;
  updateSkillLevel: (skillId: string, level: number) => void;
  resetAllSkills: () => void;
  isSkillUnlocked: (skillId: string) => boolean;
};

const INITIAL_SKILLS: Record<string, Skill> = {
  // INTELIGÊNCIA
  'intel-1': {
    id: 'intel-1',
    name: 'Informante da Quebrada',
    category: 'Inteligência',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Recrute informantes locais',
    effect: '+1% lucro',
    isUnlocked: true,
  },
  'intel-2': {
    id: 'intel-2',
    name: 'Escuta Policial',
    category: 'Inteligência',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Monitore comunicações policiais',
    effect: '-0.5% falha',
    isUnlocked: true,
  },
  'intel-3': {
    id: 'intel-3',
    name: 'Infiltração Digital',
    category: 'Inteligência',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Acesse sistemas digitais',
    effect: '+2% eficiência',
    isUnlocked: false,
  },
  'intel-4': {
    id: 'intel-4',
    name: 'Rede de Dados',
    category: 'Inteligência',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Construa rede de informações',
    effect: '+1.5% lucro global',
    isUnlocked: false,
  },
  'intel-5': {
    id: 'intel-5',
    name: 'Inteligência Estratégica',
    category: 'Inteligência',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Planeje operações estratégicas',
    effect: 'Bônus global',
    isUnlocked: false,
  },

  // AGILIDADE
  'agility-1': {
    id: 'agility-1',
    name: 'Fuga de Viela',
    category: 'Agilidade',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Domine fugas rápidas',
    effect: '-1% tempo',
    isUnlocked: true,
  },
  'agility-2': {
    id: 'agility-2',
    name: 'Direção Perigosa',
    category: 'Agilidade',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Manobras de risco',
    effect: '+0.5% fuga',
    isUnlocked: true,
  },
  'agility-3': {
    id: 'agility-3',
    name: 'Reflexo de Rua',
    category: 'Agilidade',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Reações instantâneas',
    effect: '-1.5% cooldown',
    isUnlocked: false,
  },
  'agility-4': {
    id: 'agility-4',
    name: 'Mobilidade Tática',
    category: 'Agilidade',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Movimento estratégico',
    effect: '+1% velocidade',
    isUnlocked: false,
  },
  'agility-5': {
    id: 'agility-5',
    name: 'Velocidade Estratégica',
    category: 'Agilidade',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Velocidade máxima',
    effect: 'Bônus global',
    isUnlocked: false,
  },

  // ATAQUE
  'attack-1': {
    id: 'attack-1',
    name: 'Abordagem Rápida',
    category: 'Ataque',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Ataques rápidos',
    effect: '+1% sucesso',
    isUnlocked: true,
  },
  'attack-2': {
    id: 'attack-2',
    name: 'Domínio de Território',
    category: 'Ataque',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Controle territorial',
    effect: '+1.5% ganho',
    isUnlocked: true,
  },
  'attack-3': {
    id: 'attack-3',
    name: 'Pressão Armada',
    category: 'Ataque',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Força bruta coordenada',
    effect: '+2% eficiência',
    isUnlocked: true,
  },
  'attack-4': {
    id: 'attack-4',
    name: 'Ataque Coordenado',
    category: 'Ataque',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Operações sincronizadas',
    effect: '+1% ataque',
    isUnlocked: false,
  },
  'attack-5': {
    id: 'attack-5',
    name: 'Poder Ofensivo',
    category: 'Ataque',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Poder máximo',
    effect: 'Bônus ofensivo',
    isUnlocked: false,
  },

  // DEFESA
  'defense-1': {
    id: 'defense-1',
    name: 'Esquema de Fuga',
    category: 'Defesa',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Planos de escape',
    effect: '-1% perdas',
    isUnlocked: true,
  },
  'defense-2': {
    id: 'defense-2',
    name: 'Caixa Blindado',
    category: 'Defesa',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Proteção de bens',
    effect: '+1.5% proteção',
    isUnlocked: true,
  },
  'defense-3': {
    id: 'defense-3',
    name: 'Proteção de Território',
    category: 'Defesa',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Defesa territorial',
    effect: '-1.5% dano',
    isUnlocked: false,
  },
  'defense-4': {
    id: 'defense-4',
    name: 'Segurança Avançada',
    category: 'Defesa',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Sistemas avançados',
    effect: '+1% resistência',
    isUnlocked: false,
  },
  'defense-5': {
    id: 'defense-5',
    name: 'Blindagem Total',
    category: 'Defesa',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Proteção total',
    effect: 'Bônus global defesa',
    isUnlocked: false,
  },

  // RESPEITO
  'respect-1': {
    id: 'respect-1',
    name: 'Nome na Quebrada',
    category: 'Respeito',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Construa reputação',
    effect: 'Desbloqueios iniciais',
    isUnlocked: true,
  },
  'respect-2': {
    id: 'respect-2',
    name: 'Influência Local',
    category: 'Respeito',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Influencie NPCs',
    effect: 'Acesso NPCs',
    isUnlocked: true,
  },
  'respect-3': {
    id: 'respect-3',
    name: 'Rede de Contatos',
    category: 'Respeito',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Expanda contatos',
    effect: 'Operações',
    isUnlocked: false,
  },
  'respect-4': {
    id: 'respect-4',
    name: 'Domínio Regional',
    category: 'Respeito',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Controle regional',
    effect: 'Acesso mapa',
    isUnlocked: false,
  },
  'respect-5': {
    id: 'respect-5',
    name: 'Império do Comando',
    category: 'Respeito',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Poder supremo',
    effect: 'Conteúdo global',
    isUnlocked: false,
  },

  // VIGOR
  'vigor-1': {
    id: 'vigor-1',
    name: 'Fôlego de Rua',
    category: 'Vigor',
    level: 0,
    maxLevel: 20,
    baseCost: 5000,
    baseTime: 3600,
    requires: [],
    upgrading: false,
    description: 'Aumente resistência',
    effect: '+energia',
    isUnlocked: true,
  },
  'vigor-2': {
    id: 'vigor-2',
    name: 'Resistência Física',
    category: 'Vigor',
    level: 0,
    maxLevel: 25,
    baseCost: 7500,
    baseTime: 5400,
    requires: [],
    upgrading: false,
    description: 'Força física',
    effect: '-energia',
    isUnlocked: true,
  },
  'vigor-3': {
    id: 'vigor-3',
    name: 'Ritmo de Operação',
    category: 'Vigor',
    level: 0,
    maxLevel: 30,
    baseCost: 10000,
    baseTime: 7200,
    requires: [],
    upgrading: false,
    description: 'Aumente ações',
    effect: '+ações',
    isUnlocked: false,
  },
  'vigor-4': {
    id: 'vigor-4',
    name: 'Recuperação Acelerada',
    category: 'Vigor',
    level: 0,
    maxLevel: 40,
    baseCost: 15000,
    baseTime: 10800,
    requires: [],
    upgrading: false,
    description: 'Regeneração rápida',
    effect: '+regen',
    isUnlocked: false,
  },
  'vigor-5': {
    id: 'vigor-5',
    name: 'Energia Inquebrável',
    category: 'Vigor',
    level: 0,
    maxLevel: 50,
    baseCost: 25000,
    baseTime: 14400,
    requires: [],
    upgrading: false,
    description: 'Energia infinita',
    effect: 'Bônus stamina',
    isUnlocked: false,
  },
};

export const useInvestmentSkillTreeStore = create<InvestmentSkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,
      dirtyMoney: 50000,

      setDirtyMoney: (amount) => set({ dirtyMoney: amount }),

      getSkill: (skillId) => {
        const state = get();
        return state.skills[skillId];
      },

      getRemainingTime: (skill) => {
        if (!skill.upgrading || !skill.endTime) return 0;
        const remaining = skill.endTime - Date.now();
        return Math.max(0, remaining);
      },

      canUpgrade: (skillId) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return false;
        if (skill.upgrading) return false;
        if (skill.level >= skill.maxLevel) return false;

        // Check if any skill is currently upgrading (only one upgrade at a time)
        for (const s of Object.values(state.skills)) {
          if (s.upgrading) return false;
        }

        // Check money
        const cost = skill.baseCost * Math.pow(skill.level + 1, 1.8);
        if (state.dirtyMoney < cost) return false;

        // Check if skill is unlocked
        if (!skill.isUnlocked) return false;

        return true;
      },

      upgradeSkill: (skillId) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!state.canUpgrade(skillId)) return false;

        const cost = skill.baseCost * Math.pow(skill.level + 1, 1.8);
        const duration = skill.baseTime * Math.pow(skill.level + 1, 1.5);

        set({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              upgrading: true,
              startTime: Date.now(),
              endTime: Date.now() + duration,
            },
          },
          dirtyMoney: state.dirtyMoney - cost,
        });

        return true;
      },

      finalizeUpgrade: (skillId) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill || !skill.upgrading) return;

        // Determine the next skill to unlock in the same investment chain
        // Extract the base name and current level from the skill ID
        const skillIdParts = skillId.split('-');
        const skillBase = skillIdParts[0]; // e.g., 'intel', 'attack', 'agility'
        const currentLevelNum = parseInt(skillIdParts[1]); // e.g., 1, 2, 3
        
        // The next skill in the chain has the same base but level + 1
        const nextSkillId = `${skillBase}-${currentLevelNum + 1}`;
        const nextSkill = state.skills[nextSkillId];

        // Update current skill
        const updatedSkills = {
          ...state.skills,
          [skillId]: {
            ...skill,
            level: skill.level + 1,
            upgrading: false,
            startTime: undefined,
            endTime: undefined,
          },
        };

        // Unlock next skill in the chain if it exists
        if (nextSkill) {
          updatedSkills[nextSkillId] = {
            ...nextSkill,
            isUnlocked: true,
          };
        }

        set({ skills: updatedSkills });
      },

      updateSkillLevel: (skillId, level) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return;

        set({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              level: Math.min(level, skill.maxLevel),
            },
          },
        });
      },

      resetAllSkills: () => {
        set({
          skills: INITIAL_SKILLS,
          dirtyMoney: 0,
        });
      },

      isSkillUnlocked: (skillId) => {
        const state = get();
        const skill = state.skills[skillId];
        return skill?.isUnlocked ?? false;
      },
    }),
    {
      name: 'investment-skill-tree-store',
      version: 1,
    }
  )
);

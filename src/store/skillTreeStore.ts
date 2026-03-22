import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SkillNode {
  id: string;
  name: string;
  tree: 'inteligencia' | 'agilidade' | 'ataque' | 'defesa' | 'respeito' | 'vigor';
  level: number;
  maxLevel: number;
  baseCost: number;
  description: string;
  icon: string;
  requires?: string[];
  effects: string[];
  position?: { x: number; y: number };
}

export interface SkillTreeState {
  skills: Record<string, SkillNode>;
  playerMoney: number;
  isUpgrading: boolean;
  
  // Actions
  initializeSkills: () => void;
  upgradeSkill: (skillId: string) => boolean;
  setPlayerMoney: (money: number) => void;
  getSkillLevel: (skillId: string) => number;
  canUpgradeSkill: (skillId: string) => boolean;
  getUpgradeCost: (skillId: string) => number;
  getSkillsByTree: (tree: string) => SkillNode[];
  resetSkills: () => void;
}

const INITIAL_SKILLS: Record<string, SkillNode> = {
  // INTELIGÊNCIA
  inteligencia_1: {
    id: 'inteligencia_1',
    name: 'Informante da Quebrada I',
    tree: 'inteligencia',
    level: 0,
    maxLevel: 10,
    baseCost: 500,
    description: 'Aumenta lucro em investimentos em 5%',
    icon: 'Brain',
    effects: ['lucro_investimento_5'],
    position: { x: 0, y: 0 },
  },
  inteligencia_2: {
    id: 'inteligencia_2',
    name: 'Escuta Policial II',
    tree: 'inteligencia',
    level: 0,
    maxLevel: 10,
    baseCost: 1000,
    description: 'Reduz chance de falha em 10%',
    icon: 'Ear',
    requires: ['inteligencia_1'],
    effects: ['reduz_falha_10'],
    position: { x: 0, y: 1 },
  },
  inteligencia_3: {
    id: 'inteligencia_3',
    name: 'Infiltração Digital III',
    tree: 'inteligencia',
    level: 0,
    maxLevel: 10,
    baseCost: 2000,
    description: 'Desbloqueia golpes mais complexos',
    icon: 'Cpu',
    requires: ['inteligencia_2'],
    effects: ['desbloqueia_golpes_complexos'],
    position: { x: 0, y: 2 },
  },

  // AGILIDADE
  agilidade_1: {
    id: 'agilidade_1',
    name: 'Fuga de Viela I',
    tree: 'agilidade',
    level: 0,
    maxLevel: 10,
    baseCost: 500,
    description: 'Reduz tempo de ações em 5%',
    icon: 'Zap',
    effects: ['reduz_tempo_5'],
    position: { x: 1, y: 0 },
  },
  agilidade_2: {
    id: 'agilidade_2',
    name: 'Direção Perigosa II',
    tree: 'agilidade',
    level: 0,
    maxLevel: 10,
    baseCost: 1000,
    description: 'Reduz cooldown em 10%',
    icon: 'Gauge',
    requires: ['agilidade_1'],
    effects: ['reduz_cooldown_10'],
    position: { x: 1, y: 1 },
  },
  agilidade_3: {
    id: 'agilidade_3',
    name: 'Reflexo de Rua III',
    tree: 'agilidade',
    level: 0,
    maxLevel: 10,
    baseCost: 2000,
    description: 'Melhora fuga em 20%',
    icon: 'Zap',
    requires: ['agilidade_2'],
    effects: ['melhora_fuga_20'],
    position: { x: 1, y: 2 },
  },

  // ATAQUE
  ataque_1: {
    id: 'ataque_1',
    name: 'Abordagem Rápida I',
    tree: 'ataque',
    level: 0,
    maxLevel: 10,
    baseCost: 500,
    description: 'Aumenta sucesso em golpes em 5%',
    icon: 'Sword',
    effects: ['sucesso_golpes_5'],
    position: { x: 2, y: 0 },
  },
  ataque_2: {
    id: 'ataque_2',
    name: 'Domínio de Território II',
    tree: 'ataque',
    level: 0,
    maxLevel: 10,
    baseCost: 1000,
    description: 'Aumenta dano em conflitos em 10%',
    icon: 'Flame',
    requires: ['ataque_1'],
    effects: ['dano_conflitos_10'],
    position: { x: 2, y: 1 },
  },
  ataque_3: {
    id: 'ataque_3',
    name: 'Execução Tática III',
    tree: 'ataque',
    level: 0,
    maxLevel: 10,
    baseCost: 2000,
    description: 'Desbloqueia ataques especiais',
    icon: 'Target',
    requires: ['ataque_2'],
    effects: ['desbloqueia_ataques_especiais'],
    position: { x: 2, y: 2 },
  },

  // DEFESA
  defesa_1: {
    id: 'defesa_1',
    name: 'Esquema de Fuga I',
    tree: 'defesa',
    level: 0,
    maxLevel: 10,
    baseCost: 500,
    description: 'Reduz perdas em falha em 5%',
    icon: 'Shield',
    effects: ['reduz_perdas_5'],
    position: { x: 3, y: 0 },
  },
  defesa_2: {
    id: 'defesa_2',
    name: 'Caixa Blindado II',
    tree: 'defesa',
    level: 0,
    maxLevel: 10,
    baseCost: 1000,
    description: 'Protege dinheiro em 10%',
    icon: 'Lock',
    requires: ['defesa_1'],
    effects: ['protege_dinheiro_10'],
    position: { x: 3, y: 1 },
  },
  defesa_3: {
    id: 'defesa_3',
    name: 'Defesa de Base III',
    tree: 'defesa',
    level: 0,
    maxLevel: 10,
    baseCost: 2000,
    description: 'Protege ativos em 20%',
    icon: 'Shield',
    requires: ['defesa_2'],
    effects: ['protege_ativos_20'],
    position: { x: 3, y: 2 },
  },

  // RESPEITO
  respeito_1: {
    id: 'respeito_1',
    name: 'Nome na Quebrada I',
    tree: 'respeito',
    level: 0,
    maxLevel: 10,
    baseCost: 500,
    description: 'Desbloqueia áreas iniciais',
    icon: 'Crown',
    effects: ['desbloqueia_areas_iniciais'],
    position: { x: 4, y: 0 },
  },
  respeito_2: {
    id: 'respeito_2',
    name: 'Influência Local II',
    tree: 'respeito',
    level: 0,
    maxLevel: 10,
    baseCost: 1000,
    description: 'Libera NPCs especiais',
    icon: 'Users',
    requires: ['respeito_1'],
    effects: ['libera_npcs_especiais'],
    position: { x: 4, y: 1 },
  },
  respeito_3: {
    id: 'respeito_3',
    name: 'Domínio Regional III',
    tree: 'respeito',
    level: 0,
    maxLevel: 10,
    baseCost: 2000,
    description: 'Aumenta autoridade em 20%',
    icon: 'Zap',
    requires: ['respeito_2'],
    effects: ['autoridade_20'],
    position: { x: 4, y: 2 },
  },

  // VIGOR
  vigor_1: {
    id: 'vigor_1',
    name: 'Fôlego de Rua I',
    tree: 'vigor',
    level: 0,
    maxLevel: 10,
    baseCost: 500,
    description: 'Aumenta capacidade de ações em 5%',
    icon: 'Heart',
    effects: ['capacidade_acoes_5'],
    position: { x: 5, y: 0 },
  },
  vigor_2: {
    id: 'vigor_2',
    name: 'Casca Grossa II',
    tree: 'vigor',
    level: 0,
    maxLevel: 10,
    baseCost: 1000,
    description: 'Reduz penalidades em 10%',
    icon: 'Heart',
    requires: ['vigor_1'],
    effects: ['reduz_penalidades_10'],
    position: { x: 5, y: 1 },
  },
  vigor_3: {
    id: 'vigor_3',
    name: 'Resistência de Guerra III',
    tree: 'vigor',
    level: 0,
    maxLevel: 10,
    baseCost: 2000,
    description: 'Melhora recuperação em 20%',
    icon: 'Zap',
    requires: ['vigor_2'],
    effects: ['melhora_recuperacao_20'],
    position: { x: 5, y: 2 },
  },
};

export const useSkillTreeStore = create<SkillTreeState>()(
  persist(
    (set, get) => ({
      skills: INITIAL_SKILLS,
      playerMoney: 50000,
      isUpgrading: false,

      initializeSkills: () => {
        set({ skills: INITIAL_SKILLS, playerMoney: 50000 });
      },

      setPlayerMoney: (money: number) => {
        set({ playerMoney: Math.max(0, money) });
      },

      getSkillLevel: (skillId: string) => {
        const skill = get().skills[skillId];
        return skill?.level ?? 0;
      },

      getUpgradeCost: (skillId: string) => {
        const skill = get().skills[skillId];
        if (!skill) return 0;
        return skill.baseCost * (skill.level + 1);
      },

      canUpgradeSkill: (skillId: string) => {
        const state = get();
        const skill = state.skills[skillId];

        if (!skill) return false;
        if (skill.level >= skill.maxLevel) return false;

        // Check if requirements are met - only need level > 0, not maxLevel
        if (skill.requires && skill.requires.length > 0) {
          const allRequirementsMet = skill.requires.every((reqId) => {
            const reqSkill = state.skills[reqId];
            return reqSkill && reqSkill.level > 0;
          });
          if (!allRequirementsMet) return false;
        }

        // Check if player has enough money
        const cost = state.getUpgradeCost(skillId);
        return state.playerMoney >= cost;
      },

      upgradeSkill: (skillId: string) => {
        const state = get();

        if (!state.canUpgradeSkill(skillId)) {
          return false;
        }

        if (state.isUpgrading) {
          return false;
        }

        set({ isUpgrading: true });

        const skill = state.skills[skillId];
        const cost = state.getUpgradeCost(skillId);

        // Update skill level
        set({
          skills: {
            ...state.skills,
            [skillId]: {
              ...skill,
              level: skill.level + 1,
            },
          },
          playerMoney: state.playerMoney - cost,
          isUpgrading: false,
        });

        return true;
      },

      getSkillsByTree: (tree: string) => {
        return Object.values(get().skills).filter((skill) => skill.tree === tree);
      },

      resetSkills: () => {
        set({ skills: INITIAL_SKILLS, playerMoney: 50000 });
      },
    }),
    {
      name: 'skill-tree-storage',
    }
  )
);

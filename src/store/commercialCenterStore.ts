import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LaunderingOperation = {
  id: string;
  businessType: string;
  amount: number;
  returnAmount: number;
  startTime: number;
  endTime: number;
  risk: 'low' | 'medium' | 'high';
  status: 'running' | 'completed';
  date: string; // YYYY-MM-DD
  businessId?: string; // Identificador único do comércio para operações independentes
};

export type BusinessType = 'pizzaria-mama' | 'lavanderia-povao' | 'restaurante-fino' | 'boate-luxo' | 'consultoria-elite';

export const BUSINESSES = {
  'pizzaria-mama': {
    name: 'Pizzaria da Mama',
    tagline: 'A melhor pizza do Complexo',
    risk: 'low' as const,
    baseTax: 0.40, // 40% taxa
    baseConversion: 0.60,
    time: 6 * 60 * 60 * 1000, // 6 hours
    description: 'Transforme dinheiro sujo em receita de pizza',
    minRespect: 0,
    emoji: '🍕',
    operationsPerDay: 1,
    minValue: 1000,
  },
  'lavanderia-povao': {
    name: 'Lavanderia Povão',
    tagline: 'Lavamos tudo rápido',
    risk: 'low' as const,
    baseTax: 0.50, // 50% taxa
    baseConversion: 0.50,
    time: 5 * 60 * 60 * 1000, // 5 hours
    description: 'Roupas limpas, dinheiro mais limpo ainda',
    minRespect: 0,
    emoji: '🧺',
    operationsPerDay: 1,
    minValue: 5000,
  },
  'restaurante-fino': {
    name: 'Restaurante Fino',
    tagline: 'Culinária de classe alta',
    risk: 'medium' as const,
    baseTax: 0.35, // 35% taxa
    baseConversion: 0.65,
    time: 8 * 60 * 60 * 1000, // 8 hours
    description: 'Receitas sofisticadas para dinheiro sofisticado',
    minRespect: 0,
    emoji: '🍽️',
    operationsPerDay: 1,
    minValue: 8000,
  },
  'boate-luxo': {
    name: 'Boate Luxo',
    tagline: 'Diversão de primeira classe',
    risk: 'medium' as const,
    baseTax: 0.45, // 45% taxa
    baseConversion: 0.55,
    time: 7 * 60 * 60 * 1000, // 7 hours
    description: 'Bebidas premium, dinheiro limpo',
    minRespect: 0,
    emoji: '🎭',
    operationsPerDay: 1,
    minValue: 10000,
  },
  'consultoria-elite': {
    name: 'Consultoria Elite',
    tagline: 'Assessoria para grandes negócios',
    risk: 'high' as const,
    baseTax: 0.30, // 30% taxa
    baseConversion: 0.70,
    time: 10 * 60 * 60 * 1000, // 10 hours
    description: 'Consultoria corporativa de alto nível',
    minRespect: 0,
    emoji: '💼',
    operationsPerDay: 1,
    minValue: 15000,
  },
};

export const RISK_FAILURE_CHANCE = {
  low: 0.05,
  medium: 0.15,
  high: 0.3,
};

interface CommercialCenterUpgrades {
  taxReduction: number; // Reduz taxa em %
  conversionBonus: number; // Aumenta conversão em %
  operationsPerDay: number; // Operações por dia (começa em 1)
}

interface CommercialCenterState {
  operations: LaunderingOperation[];
  upgrades: CommercialCenterUpgrades;
  addOperation: (operation: LaunderingOperation) => void;
  removeOperation: (id: string) => void;
  updateOperation: (id: string, updates: Partial<LaunderingOperation>) => void;
  getActiveOperations: () => LaunderingOperation[];
  getCompletedOperations: () => LaunderingOperation[];
  getOperationsToday: () => LaunderingOperation[];
  clearOperations: () => void;
  upgradeTaxReduction: (amount: number) => void;
  upgradeConversionBonus: (amount: number) => void;
  upgradeOperationsPerDay: (amount: number) => void;
  getTodayDate: () => string;
}

export const useCommercialCenterStore = create<CommercialCenterState>()(
  persist(
    (set, get) => ({
      operations: [],
      upgrades: {
        taxReduction: 0,
        conversionBonus: 0,
        operationsPerDay: 1,
      },
      
      getTodayDate: () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      },

      addOperation: (operation) =>
        set((state) => ({
          operations: [...state.operations, operation],
        })),
      
      removeOperation: (id) =>
        set((state) => ({
          operations: state.operations.filter((op) => op.id !== id),
        })),
      
      updateOperation: (id, updates) =>
        set((state) => ({
          operations: state.operations.map((op) =>
            op.id === id ? { ...op, ...updates } : op
          ),
        })),
      
      getActiveOperations: () =>
        get().operations.filter((op) => op.status === 'running'),
      
      getCompletedOperations: () =>
        get().operations.filter((op) => op.status === 'completed'),
      
      getOperationsToday: () => {
        const today = get().getTodayDate();
        return get().operations.filter((op) => op.date === today && op.status === 'completed');
      },
      
      clearOperations: () => set({ operations: [] }),
      
      upgradeTaxReduction: (amount) =>
        set((state) => ({
          upgrades: {
            ...state.upgrades,
            taxReduction: state.upgrades.taxReduction + amount,
          },
        })),
      
      upgradeConversionBonus: (amount) =>
        set((state) => ({
          upgrades: {
            ...state.upgrades,
            conversionBonus: state.upgrades.conversionBonus + amount,
          },
        })),
      
      upgradeOperationsPerDay: (amount) =>
        set((state) => ({
          upgrades: {
            ...state.upgrades,
            operationsPerDay: state.upgrades.operationsPerDay + amount,
          },
        })),
    }),
    {
      name: 'commercial-center-store',
    }
  )
);

import { create } from 'zustand';

export const useCleanMoneyStore = create((set) => ({
  cleanMoney: 1000000000,
  addCleanMoney: (amount: number) => set((state) => ({ cleanMoney: state.cleanMoney + amount })),
  removeCleanMoney: (amount: number) => set((state) => ({ cleanMoney: Math.max(0, state.cleanMoney - amount) })),
  resetCleanMoney: () => set({ cleanMoney: 0 }),
  setCleanMoney: (amount: number) => set({ cleanMoney: amount }),
}));

import { create } from 'zustand';

export const useDirtyMoneyStore = create((set) => ({
  dirtyMoney: 0,
  addDirtyMoney: (amount: number) => set((state) => ({ dirtyMoney: state.dirtyMoney + amount })),
  removeDirtyMoney: (amount: number) => set((state) => ({ dirtyMoney: Math.max(0, state.dirtyMoney - amount) })),
  resetDirtyMoney: () => set({ dirtyMoney: 0 }),
  setDirtyMoney: (amount: number) => set({ dirtyMoney: amount }),
}));

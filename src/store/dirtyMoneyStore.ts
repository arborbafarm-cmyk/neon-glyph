import { create } from 'zustand';

interface DirtyMoneyStore {
  dirtyMoney: number;
  addDirtyMoney: (amount: number) => void;
  resetDirtyMoney: () => void;
  setDirtyMoney: (amount: number) => void;
}

export const useDirtyMoneyStore = create<DirtyMoneyStore>((set) => ({
  dirtyMoney: 0,
  addDirtyMoney: (amount: number) => set((state) => ({ dirtyMoney: state.dirtyMoney + amount })),
  resetDirtyMoney: () => set({ dirtyMoney: 0 }),
  setDirtyMoney: (amount: number) => set({ dirtyMoney: amount }),
}));

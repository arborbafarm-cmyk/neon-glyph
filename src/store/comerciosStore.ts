import { create } from 'zustand';
import { Comercios, ComercioKey, getInitialComercioData } from '@/types/comercios';

interface ComerciosState {
  comercios: Comercios | null;
  setComercios: (comercios: Comercios) => void;
  updateComercio: (key: ComercioKey, data: Partial<Comercios[ComercioKey]>) => void;
  resetComercios: () => void;
}

export const useComerciosStore = create<ComerciosState>((set) => ({
  comercios: null,
  setComercios: (comercios) => set({ comercios }),
  updateComercio: (key, data) =>
    set((state) => {
      if (!state.comercios) return state;
      return {
        comercios: {
          ...state.comercios,
          [key]: {
            ...state.comercios[key],
            ...data,
          },
        },
      };
    }),
  resetComercios: () => set({ comercios: getInitialComercioData() }),
}));

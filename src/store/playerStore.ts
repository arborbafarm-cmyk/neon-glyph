import { create } from 'zustand';
import { Players } from '@/entities';

interface PlayerState {
  player: Players | null;
  setPlayer: (player: Players | null) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  player: null,
  setPlayer: (player) => set({ player }),
  reset: () => set({ player: null }),
}));
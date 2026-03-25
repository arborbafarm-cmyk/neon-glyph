import { create } from 'zustand';

interface PlayerState {
  playerId: string | null;
  playerName: string;
  level: number;
  progress: number;
  isGuest: boolean;
  profilePicture: string | null;
  barracoLevel: number;

  setPlayerId: (id: string) => void;
  setPlayerName: (name: string) => void;
  setLevel: (level: number) => void;
  setProgress: (progress: number) => void;
  setIsGuest: (isGuest: boolean) => void;
  setProfilePicture: (url: string | null) => void;
  setBarracoLevel: (level: number) => void;

  loadPlayerData: (data: Partial<PlayerState>) => void;
  resetPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  playerId: null,
  playerName: 'COMANDANTE',
  level: 10,
  progress: 0,
  isGuest: false,
  profilePicture: null,
  barracoLevel: 1,

  setPlayerId: (id) => set({ playerId: id }),
  setPlayerName: (name) => set({ playerName: name }),
  setLevel: (level) => set({ level: Math.min(100, Math.max(1, level)) }),
  setProgress: (progress) => set({ progress }),
  setIsGuest: (isGuest) => set({ isGuest }),
  setProfilePicture: (url) => set({ profilePicture: url }),
  setBarracoLevel: (level) => set({ barracoLevel: Math.max(1, level) }),

  loadPlayerData: (data) => set(data),

  resetPlayer: () =>
    set({
      playerId: null,
      playerName: 'COMANDANTE',
      level: 1,
      progress: 0,
      isGuest: false,
      profilePicture: null,
      barracoLevel: 1,
    }),
}));
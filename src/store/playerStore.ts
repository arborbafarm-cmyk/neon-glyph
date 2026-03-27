import { create } from 'zustand';
import { Players } from '@/entities';

interface PlayerData {
  playerId?: string | null;
  playerName?: string | null;
  level?: number;
  progress?: number;
  isGuest?: boolean;
  profilePicture?: string | null;
  cleanMoney?: number;
  dirtyMoney?: number;
  barracoLevel?: number;
  spins?: number;
}

interface PlayerState {
  // State
  player: Players | null;
  
  // Derived selectors (safe access even when player is null)
  playerId: string | null;
  playerName: string | null;
  level: number;
  dirtyMoney: number;
  cleanMoney: number;
  barracoLevel: number;
  spins: number;
  isGuest: boolean;
  profilePicture: string | null;
  
  // Actions
  setPlayer: (player: Players | null) => void;
  loadPlayerData: (data: PlayerData) => void;
  updatePlayer: (updates: Partial<Players>) => void;
  reset: () => void;
  resetPlayer: () => void;
  setLevel: (level: number) => void;
  setBarracoLevel: (level: number) => void;
  setDirtyMoney: (amount: number) => void;
  setCleanMoney: (amount: number) => void;
  addDirtyMoney: (amount: number) => void;
  removeDirtyMoney: (amount: number) => void;
  addCleanMoney: (amount: number) => void;
  removeCleanMoney: (amount: number) => void;
  setSpins: (spins: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  // State
  player: null,
  
  // Derived selectors
  get playerId() {
    return get().player?.playerId || null;
  },
  get playerName() {
    return get().player?.playerName || null;
  },
  get level() {
    return get().player?.level || 1;
  },
  get dirtyMoney() {
    return get().player?.dirtyMoney || 0;
  },
  get cleanMoney() {
    return get().player?.cleanMoney || 0;
  },
  get barracoLevel() {
    return get().player?.barracoLevel || 1;
  },
  get spins() {
    return get().player?.spins || 0;
  },
  get isGuest() {
    return get().player?.isGuest ?? false;
  },
  get profilePicture() {
    return get().player?.profilePicture || null;
  },
  
  // Actions
  setPlayer: (player) => set({ player }),
  
  // 🔥 CRÍTICO: Carregar dados do player a partir de um objeto parcial
  // Usado após login/registro para popular o store com dados do jogador
  loadPlayerData: (data) => {
    const current = get().player;
    if (!current) {
      // Se não há player atual, criar um novo com dados mínimos
      set({
        player: {
          _id: data.playerId || crypto.randomUUID(),
          playerId: data.playerId || null,
          playerName: data.playerName || 'Player',
          level: data.level || 1,
          progress: data.progress || 0,
          isGuest: data.isGuest || false,
          profilePicture: data.profilePicture || '',
          cleanMoney: data.cleanMoney || 0,
          dirtyMoney: data.dirtyMoney || 0,
          barracoLevel: data.barracoLevel || 1,
          spins: data.spins || 0,
          email: '',
          inventory: '[]',
          skillTrees: '{}',
          ownedLuxuryItems: '[]',
          investments: '{}',
          comercios: '{}',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        } as Players,
      });
    } else {
      // Atualizar player existente com novos dados
      set({
        player: {
          ...current,
          playerId: data.playerId !== undefined ? data.playerId : current.playerId,
          playerName: data.playerName !== undefined ? data.playerName : current.playerName,
          level: data.level !== undefined ? data.level : current.level,
          progress: data.progress !== undefined ? data.progress : current.progress,
          isGuest: data.isGuest !== undefined ? data.isGuest : current.isGuest,
          profilePicture: data.profilePicture !== undefined ? data.profilePicture : current.profilePicture,
          cleanMoney: data.cleanMoney !== undefined ? data.cleanMoney : current.cleanMoney,
          dirtyMoney: data.dirtyMoney !== undefined ? data.dirtyMoney : current.dirtyMoney,
          barracoLevel: data.barracoLevel !== undefined ? data.barracoLevel : current.barracoLevel,
          spins: data.spins !== undefined ? data.spins : current.spins,
        },
      });
    }
  },
  
  updatePlayer: (updates) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, ...updates } });
  },
  
  reset: () => set({ player: null }),
  
  resetPlayer: () => set({ player: null }),
  
  setLevel: (level) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, level } });
  },
  
  setBarracoLevel: (barracoLevel) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, barracoLevel } });
  },
  
  setDirtyMoney: (dirtyMoney) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, dirtyMoney } });
  },
  
  setCleanMoney: (cleanMoney) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, cleanMoney } });
  },
  
  addDirtyMoney: (amount) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, dirtyMoney: (current.dirtyMoney || 0) + amount } });
  },
  
  removeDirtyMoney: (amount) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, dirtyMoney: Math.max(0, (current.dirtyMoney || 0) - amount) } });
  },
  
  addCleanMoney: (amount) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, cleanMoney: (current.cleanMoney || 0) + amount } });
  },
  
  removeCleanMoney: (amount) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, cleanMoney: Math.max(0, (current.cleanMoney || 0) - amount) } });
  },
  
  setSpins: (spins) => {
    const current = get().player;
    if (!current) return;
    set({ player: { ...current, spins } });
  },
}));